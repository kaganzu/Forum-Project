import { FormEvent, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../state/auth";

type Comment = {
  id: number;
  content: string;
  userId?: number;
  user?: { username?: string; userName?: string };
};

type Category = { id: number; name?: string; Name?: string };

type Post = {
  id: number;
  title: string;
  description?: string;
  content?: string;
  userId?: number;
  user?: { username?: string; userName?: string };
  username?: string;
  userName?: string;
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
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userLikeId, setUserLikeId] = useState<number | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const res = await api.get<Post>(`/api/Post/${id}`);
        const commentsRes = await api.get<Comment[]>(
          `/api/Post/${id}/comments`
        );
        const likesRes = await api.get<any[]>(`/api/Post/${id}/likes`);

        const likes = likesRes.data || [];
        setLikeCount(likes.length);

        if (userId) {
          const userLike = likes.find(
            (l) => l.userId === userId || l.user?.id === userId
          );
          if (userLike) {
            setLiked(true);
            setUserLikeId(userLike.id);
          }
        }

        setPost({ ...res.data, comments: commentsRes.data, likes });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadPost();
  }, [id, userId]);

  const handleLike = async () => {
    if (!isAuthenticated || !id) return;
    try {
      if (liked && userLikeId) {
        await api.delete(`/api/Like/${userLikeId}`);
        setLiked(false);
        setLikeCount((p) => p - 1);
        setUserLikeId(null);
      } else {
        const res = await api.post("/api/Like", { postId: parseInt(id) });
        setLiked(true);
        setLikeCount((p) => p + 1);
        if (res.data?.id) setUserLikeId(res.data.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/api/Post/${id}`);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/api/Comment/${commentId}`);
      const resComments = await api.get<Comment[]>(`/api/Post/${id}/comments`);
      setPost((prev) =>
        prev ? { ...prev, comments: resComments.data } : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading post…</div>;
  if (!post) return <div className="text-neutral-500">Post not found.</div>;

  const author =
    post.user?.username ||
    post.user?.userName ||
    post.username ||
    post.userName ||
    "Anonymous";

 const categories =
  post.categories && post.categories.length > 0
    ? (typeof post.categories[0] === "string"
        ? post.categories
        : post.categories.map((cat) => (cat as any).name || "Uncategorized"))
    : ["Uncategorized"];

  const canDeletePost = isAdmin || (userId && post.userId === userId);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <article className="card p-6 shadow-sm border border-neutral-200 bg-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {post.title}
            </h1>

            {/* Kategoriler */}
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((cat, i) => (
                <span
                  key={i}
                  className="text-xs rounded-full bg-brand-100 text-brand-800 px-2 py-1"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {canDeletePost && (
            <button
              onClick={handleDeletePost}
              className="btn text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>

        {/* İçerik */}
        <p className="text-neutral-800 leading-7 whitespace-pre-wrap">
          {post.content || post.description || ""}
        </p>

        {/* Alt bilgi */}
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-500 border-t pt-3">
          <div>@{author}</div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={`flex items-center gap-2 ${
                liked ? "text-brand-600" : "text-neutral-500"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </article>

      {/* YORUMLAR */}
      <section className="card p-6 border border-neutral-200 bg-white">
        <h2 className="text-lg font-semibold mb-3">Comments</h2>
        <div className="space-y-3">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-lg border border-brand-50 flex justify-between items-start"
              >
                <div>
                  <div className="text-sm text-neutral-600">
                    @{c.user?.username || c.user?.userName || "Anonymous"}
                  </div>
                  <p className="text-neutral-800 mt-1">{c.content}</p>
                </div>
                {(isAdmin || (userId && c.userId === userId)) && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-xs text-red-600 hover:text-red-700 ml-2"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-neutral-500">No comments yet.</div>
          )}
        </div>

        {/* Yeni yorum */}
        <div className="mt-5">
          {isAuthenticated ? (
            <form
              onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                if (!comment.trim()) return;
                setSending(true);
                try {
                  await api.post(`/api/Comment/${id}`, { content: comment });
                  const resComments = await api.get<Comment[]>(
                    `/api/Post/${id}/comments`
                  );
                  setPost((prev) =>
                    prev ? { ...prev, comments: resComments.data } : prev
                  );
                  setComment("");
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
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                className="btn btn-primary"
                disabled={sending || !comment.trim()}
              >
                {sending ? "Posting…" : "Post Comment"}
              </button>
            </form>
          ) : (
            <div className="text-sm text-neutral-600">
              Log in to write a comment.
            </div>
          )}
        </div>
      </section>

      <Link
        to="/"
        className="text-brand-700 hover:underline block text-sm mt-2"
      >
        ← Back to Feed
      </Link>
    </div>
  );
}
