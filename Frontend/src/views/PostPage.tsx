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
  userId?: number | string;
  username?: string;
  userName?: string;
  postId?: number | string;
  postTitle?: string;
  user?: { id?: number | string; userId?: number | string; username?: string; userName?: string };
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

  const likeKey = (postId: string | number | undefined, uid: number | null) =>
    postId != null && uid != null ? `liked_post_${postId}_user_${uid}` : "";

  const isMineLike = (l: Like, uid: number | null) => {
    if (uid == null || !l) return false;
    const lid =
      l.userId ?? l.user?.id ?? l.user?.userId;
    return String(lid) === String(uid);
  };

  const anyMineLike = (likes: Like[] | undefined, uid: number | null) => {
    if (!likes || uid == null) return false;
    for (const l of likes) {
      if (isMineLike(l, uid)) return true;
    }
    return false;
  };

  const applyLikedWithFallback = (postId: number | undefined, likes: Like[] | undefined, uid: number | null, serverLikeCount?: number) => {
    const inServer = anyMineLike(likes, uid);
    if (inServer) {
      setLiked(true);
      // server'da var → localStorage senkronla
      const k = likeKey(postId, uid);
      if (k) localStorage.setItem(k, "1");
      return;
    }
    // fallback: server listesinde yoksa (pagination / filtre yüzünden),
    // localStorage işaretine bak
    const k = likeKey(postId, uid);
    const flag = k ? localStorage.getItem(k) : null;
    if (flag === "1" && (serverLikeCount || 0) > 0) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  };

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

        const likes = likesRes.data || [];
        const likeCountFromServer = postRes.data.likeCount ?? 0;

        setPost({
          ...postRes.data,
          comments: commentsRes.data,
          likes,
          likeCount: likeCountFromServer,
        });

        setLikeCount(likeCountFromServer);
        applyLikedWithFallback(postRes.data.id, likes, userId, likeCountFromServer);
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

  const refreshPostState = async () => {
    if (!id) return;
    try {
      const [postRes, likesRes] = await Promise.all([
        api.get<Post>(`/api/Post/${id}`),
        api.get<Like[]>(`/api/Post/${id}/likes`),
      ]);
      const likes = likesRes.data || [];
      const likeCountFromServer = postRes.data.likeCount ?? 0;

      setLikeCount(likeCountFromServer);
      setPost((prev) =>
        prev
          ? { ...prev, likeCount: likeCountFromServer, likes }
          : prev
      );

      applyLikedWithFallback(postRes.data.id, likes, userId, likeCountFromServer);
    } catch (err) {
      console.error("State refresh error:", err);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !id) return;

    try {
      const res = await api.post("/api/Like", { postId: parseInt(id) });
      if (res.data?.id) {
        setLiked(true);
        // localStorage'a işaret bırak (reload sonrası garanti)
        const k = likeKey(id!, userId);
        if (k) localStorage.setItem(k, "1");

        await refreshPostState();
      }
    } catch (err) {
      console.error("Like error:", err);
      await refreshPostState();
    }
  };

  const handleUnlike = async () => {
    if (!isAuthenticated || !id) return;

    try {
      await api.delete(`/api/Like/post/${id}`);
      setLiked(false);
      const k = likeKey(id!, userId);
      if (k) localStorage.removeItem(k);

      await refreshPostState();
    } catch (err) {
      console.error("Unlike error:", err);
      await refreshPostState();
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/api/Post/${id}`);
      // temizle
      const k = likeKey(id!, userId);
      if (k) localStorage.removeItem(k);
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
    const ch = String(name).trim().charAt(0).toUpperCase();
    return ch || "?";
  };

  const colorForName = (nameOrComment: string | Comment) => {
    const name =
      typeof nameOrComment === "string"
        ? nameOrComment
        : getCommentAuthor(nameOrComment);
    const palette = [
      "#7C3AED",
      "#6D28D9",
      "#4F46E5",
      "#0EA5E9",
      "#06B6D4",
      "#14B8A6",
      "#10B981",
      "#F59E0B",
      "#F97316",
      "#EF4444",
    ];

    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = (h << 5) - h + name.charCodeAt(i);
      h |= 0;
    }
    const idx = Math.abs(h) % palette.length;
    return palette[idx];
  };

  const textColorForBg = (hex: string) => {
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
      ? typeof (post.categories as any[])[0] === "string"
        ? (post.categories as unknown as string[])
        : (post.categories as Category[]).map((cat) => cat?.name || "Uncategorized")
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

        <p className="text-neutral-800 leading-7 whitespace-pre-wrap">
          {post.content || post.description || ""}
        </p>

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
