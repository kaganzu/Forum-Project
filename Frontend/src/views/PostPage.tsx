import { FormEvent, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../state/auth';

type Comment = { id: number; content: string; userId?: number; author?: { userName: string }; user?: { userName: string }; userName?: string };
type Category = { id: number; name: string };
type Post = {
  id: number;
  title: string;
  content: string;
  description?: string;
  userId?: number;
  user?: { userName: string };
  categories?: Category[];
  comments?: Comment[];
  likes?: any[];
};

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userId, isAdmin } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userLikeId, setUserLikeId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const resPost = await api.get<Post>(`/api/Post/${id}`);
        let comments: Comment[] = [];
        let likes: any[] = [];
        try {
          const resComments = await api.get<Comment[]>(`/api/Post/${id}/comments`);
          comments = resComments.data;
        } catch {}
        try {
          const resLikes = await api.get<any[]>(`/api/Post/${id}/likes`);
          likes = resLikes.data || [];
          setLikeCount(likes.length);
          if (userId) {
            const userLike = likes.find(l => l.userId === userId || l.user?.id === userId);
            if (userLike) {
              setLiked(true);
              setUserLikeId(userLike.id);
            }
          }
        } catch {}
        setPost({ ...resPost.data, comments, likes });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, userId]);

  const handleLike = async () => {
    if (!isAuthenticated || !id) return;
    try {
      if (liked && userLikeId) {
        await api.delete(`/api/Like/${userLikeId}`);
        setLiked(false);
        setLikeCount(prev => prev - 1);
        setUserLikeId(null);
      } else {
        const res = await api.post('/api/Like', { postId: parseInt(id) });
        setLiked(true);
        setLikeCount(prev => prev + 1);
        if (res.data?.id) setUserLikeId(res.data.id);
      }
    } catch (e: any) {
      console.error(e);
      if (e?.response?.data?.message?.includes('already liked')) {
        // Try to find and delete existing like
        try {
          const allLikes = await api.get(`/api/Like`);
          const existing = allLikes.data.find((l: any) => l.postId === parseInt(id) && (l.userId === userId || l.user?.id === userId));
          if (existing) {
            await api.delete(`/api/Like/${existing.id}`);
            setLiked(false);
            setLikeCount(prev => Math.max(0, prev - 1));
            setUserLikeId(null);
          }
        } catch {}
      }
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/api/Comment/${commentId}`);
      // Refresh
      const resPost = await api.get<Post>(`/api/Post/${id}`);
      let comments: Comment[] = [];
      try {
        const resComments = await api.get<Comment[]>(`/api/Post/${id}/comments`);
        comments = resComments.data;
      } catch {}
      setPost({ ...resPost.data, comments });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/api/Post/${id}`);
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading…</div>;
  if (!post) return <div className="text-neutral-500">Post not found.</div>;

  const authorName = (c: Comment) => c.user?.userName ?? c.author?.userName ?? c.userName ?? 'Anonymous';
  const canDeleteComment = (c: Comment) => isAdmin || (userId && c.userId === userId);
  const canDeletePost = isAdmin || (userId && post.userId === userId);

  return (
    <div className="space-y-6">
      <article className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            {post.categories && post.categories.length > 0 && (
              <div className="flex gap-2 mt-2">
                {post.categories.map(cat => (
                  <span key={cat.id} className="text-xs rounded-full bg-brand-100 text-brand-800 px-2 py-1">{cat.name}</span>
                ))}
              </div>
            )}
          </div>
          {canDeletePost && (
            <button className="btn" onClick={handleDeletePost}>Delete Post</button>
          )}
        </div>
        <p className="mt-3 whitespace-pre-wrap leading-7 text-neutral-800">{post.content}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            {post.user?.userName || 'Anonymous'}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={`flex items-center gap-2 ${liked ? 'text-brand-600' : 'text-neutral-500'}`}
            >
              <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </article>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Comments</h2>
        <div className="mt-4 space-y-4">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map(c => (
              <div key={c.id} className="rounded-xl border border-purple-100 p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-neutral-600">{authorName(c)}</div>
                  <div className="mt-1">{c.content}</div>
                </div>
                {canDeleteComment(c) && (
                  <button className="btn text-red-600 hover:text-red-700 ml-2" onClick={() => handleDeleteComment(c.id)}>Delete</button>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-neutral-500">No comments yet.</div>
          )}
        </div>
        <div className="mt-6">
          {isAuthenticated ? (
            <form
              onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                if (!id || !comment.trim()) return;
                setSending(true);
                try {
                  await api.post(`/api/Comment/${id}`, { content: comment });
                  setComment('');
                  // refresh post and comments
                  const resPost = await api.get<Post>(`/api/Post/${id}`);
                  let comments: Comment[] = [];
                  try {
                    const resComments = await api.get<Comment[]>(`/api/Post/${id}/comments`);
                    comments = resComments.data;
                  } catch {}
                  setPost({ ...resPost.data, comments });
                } finally {
                  setSending(false);
                }
              }}
              className="space-y-3"
            >
              <textarea
                className="input min-h-[90px]"
                placeholder="Write a comment…"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <button className="btn btn-primary" disabled={sending || !comment.trim()}>{sending ? 'Posting…' : 'Post Comment'}</button>
            </form>
          ) : (
            <div className="text-sm text-neutral-600">Log in to write a comment.</div>
          )}
        </div>
      </section>
    </div>
  );
}
