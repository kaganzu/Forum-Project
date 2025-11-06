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

type Like = {
  id: number;
  userId: number;
  username: string;
  postId: number;
  postTitle: string;
};

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
  likes?: Like[];
  likeCount: number;
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

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [postRes, commentsRes, likesRes] = await Promise.all([
          api.get<Post>(`/api/Post/${id}`),
          api.get<Comment[]>(`/api/Post/${id}/comments`),
          api.get<Like[]>(`/api/Post/${id}/likes`),
        ]);

        setLikeCount(postRes.data.likeCount || 0);
        setPost({
          ...postRes.data,
          comments: commentsRes.data,
          likes: likesRes.data || [],
          likeCount: postRes.data.likeCount || 0,
        });

        // Like durumunu ayarla
        if (userId && likesRes.data) {
          const userLike = likesRes.data.find((l) => l.userId === userId);
          setLiked(!!userLike);
        } else {
          setLiked(false);
        }
      } catch (err) {
        console.error("Error loading post:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPost();

    return () => {
      setLiked(false);
      setLikeCount(0);
      setPost(null);
    };
  }, [id, userId]);

  const handleLike = async () => {
    if (!isAuthenticated || !id) return;

    try {
      const res = await api.post("/api/Like", { postId: parseInt(id) });
      if (res.data?.id) {
        setLiked(true);

        // Post ve like bilgilerini güncelle
        const [postRes, likesRes] = await Promise.all([
          api.get<Post>(`/api/Post/${id}`),
          api.get<Like[]>(`/api/Post/${id}/likes`),
        ]);

        setLikeCount(postRes.data.likeCount || 0);
        setPost((prev) =>
          prev
            ? {
                ...prev,
                likeCount: postRes.data.likeCount || 0,
                likes: likesRes.data || [],
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Like error:", err);
      refreshPostState();
    }
  };

  const handleUnlike = async () => {
    if (!isAuthenticated || !id) return;

    try {
      await api.delete(`/api/Like/post/${id}`);
      setLiked(false);

      // Post ve like bilgilerini güncelle
      const [postRes, likesRes] = await Promise.all([
        api.get<Post>(`/api/Post/${id}`),
        api.get<Like[]>(`/api/Post/${id}/likes`),
      ]);

      setLikeCount(postRes.data.likeCount || 0);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likeCount: postRes.data.likeCount || 0,
              likes: likesRes.data || [],
            }
          : prev
      );
    } catch (err) {
      console.error("Unlike error:", err);
      refreshPostState();
    }
  };

  const refreshPostState = async () => {
    try {
      const [postRes, likesRes] = await Promise.all([
        api.get<Post>(`/api/Post/${id}`),
        api.get<Like[]>(`/api/Post/${id}/likes`),
      ]);

      const userLike = likesRes.data?.find((l) => l.userId === userId);
      setLiked(!!userLike);
      setLikeCount(postRes.data.likeCount || 0);

      setPost((prev) =>
        prev
          ? {
              ...prev,
              likeCount: postRes.data.likeCount || 0,
              likes: likesRes.data,
            }
          : prev
      );
    } catch (err) {
      console.error("State refresh error:", err);
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

  const getCommentAuthor = (c: Comment) => {
    // support different shapes coming from the API
    // possible fields: c.user?.username, c.user?.userName, c.username, c.userName, or fallback to userId
    // also guard against empty strings
    const nameFromUser = c.user?.username || c.user?.userName;
    if (nameFromUser && nameFromUser.trim()) return nameFromUser;
    const topName = (c as any).username || (c as any).userName;
    if (topName && String(topName).trim()) return String(topName);
    if (c.userId) return `user${c.userId}`;
    return "Anonymous";
  };

  const getCommentInitial = (c: Comment) => {
    const name = getCommentAuthor(c);
    if (!name) return "?";
    // take first letter that's a letter/number
    const ch = String(name).trim().charAt(0).toUpperCase();
    return ch || "?";
  };

  // generate a consistent color per username using a small palette
  const colorForName = (nameOrComment: string | Comment) => {
    const name =
      typeof nameOrComment === "string"
        ? nameOrComment
        : getCommentAuthor(nameOrComment);
    const palette = [
      "#7C3AED", // purple-600
      "#6D28D9", // purple-700
      "#4F46E5", // indigo-600
      "#0EA5E9", // sky-500
      "#06B6D4", // cyan-500
      "#14B8A6", // teal-500
      "#10B981", // green-500
      "#F59E0B", // amber-500
      "#F97316", // orange-500
      "#EF4444", // red-500
    ];

    // simple hash
    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = (h << 5) - h + name.charCodeAt(i);
      h |= 0;
    }
    const idx = Math.abs(h) % palette.length;
    return palette[idx];
  };

  const textColorForBg = (hex: string) => {
    // compute luminance - use relative luminance formula
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    const srgb = [r, g, b].map((v) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    );
    const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    return lum > 0.5 ? "#111827" : "#ffffff";
  };

  const categories =
    post.categories && post.categories.length > 0
      ? typeof post.categories[0] === "string"
        ? post.categories
        : post.categories.map((cat) => (cat as any).name || "Uncategorized")
      : ["Uncategorized"];

  const canDeletePost = isAdmin || (userId && post.userId === userId);

  return (
    <div className="w-full px-6 py-6 space-y-8">
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
            <div className="flex items-center gap-2">
              {liked ? (
                <button
                  onClick={handleUnlike}
                  disabled={!isAuthenticated}
                  className="text-brand-600 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
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
                  <span className="text-sm ml-1">(Unlike)</span>
                </button>
              ) : (
                <button
                  onClick={handleLike}
                  disabled={!isAuthenticated}
                  className="text-neutral-500 hover:text-brand-600 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
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
              )}
            </div>
          </div>
        </div>
      </article>

      {/* YORUMLAR */}
      <section className="card p-6 border border-neutral-200 bg-white">
        <h2 className="text-lg font-semibold mb-3">Comments</h2>
        <div className="space-y-0">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c, idx) => (
              <div key={c.id}>
                <div className="p-4 bg-neutral-50 text-neutral-800 flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {/* avatar with deterministic color */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0"
                      style={{
                        backgroundColor: colorForName(c),
                        color: textColorForBg(colorForName(c)),
                      }}
                    >
                      {getCommentInitial(c)}
                    </div>
                    <div>
                      <div className="text-sm text-neutral-600">
                        @{getCommentAuthor(c)}
                      </div>
                      <p className="text-neutral-800 mt-1">{c.content}</p>
                    </div>
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
                {idx < (post.comments?.length || 0) - 1 && (
                  <div className="border-t border-neutral-200 my-2" />
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
