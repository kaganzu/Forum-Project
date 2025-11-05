import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { api } from "../api/client";

type User = { id: number; username: string; email?: string; role: Number };
type Post = {
  id: number;
  title: string;
  description?: string;
  createdAt?: string;
};
type Comment = {
  id: number;
  content: string;
  postId: number;
  createdAt?: string;
};
type Like = { id: number; postId: number; createdAt?: string };

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "posts" | "comments" | "likes" | null
  >("posts");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userRes = await api.get<User>("/api/User/me");
        const id = userRes.data.id;
        setUser(userRes.data);

        const [postRes, commentRes, likeRes] = await Promise.all([
          api.get<Post[]>(`/api/User/${id}/posts`),
          api.get<Comment[]>(`/api/User/${id}/comments`),
          api.get<Like[]>(`/api/User/${id}/likes`),
        ]);

        setPosts(postRes.data);
        setComments(commentRes.data);
        setLikes(likeRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) return <div>Loading profile…</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div className="space-y-8">
      {/* Üst Bilgi */}
      <div className="card p-6 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-brand-300 flex items-center justify-center text-2xl font-bold text-brand-900">
            {user.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="text-xl font-semibold">{user.username}</div>
            <div className="text-sm text-neutral-500">{user.email}</div>
            <div className="text-sm text-neutral-500">
              {user.role === 0
                ? "Admin"
                : user.role === 1
                ? "Moderator"
                : user.role === 2
                ? "Member"
                : "Unknown"}
            </div>
          </div>
        </div>

        <div className="ml-4">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="px-3 py-2 rounded-md text-white bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Sekme Butonları */}
      <div className="flex gap-3 border-b border-neutral-200 pb-2">
        <button
          className={`px-4 py-2 rounded-t-md ${
            activeTab === "posts"
              ? "bg-brand-100 text-brand-700 font-semibold"
              : "text-neutral-600 hover:text-brand-600"
          }`}
          onClick={() => setActiveTab(activeTab === "posts" ? null : "posts")}
        >
          Posts ({posts.length})
        </button>
        <button
          className={`px-4 py-2 rounded-t-md ${
            activeTab === "comments"
              ? "bg-brand-100 text-brand-700 font-semibold"
              : "text-neutral-600 hover:text-brand-600"
          }`}
          onClick={() =>
            setActiveTab(activeTab === "comments" ? null : "comments")
          }
        >
          Comments ({comments.length})
        </button>
        <button
          className={`px-4 py-2 rounded-t-md ${
            activeTab === "likes"
              ? "bg-brand-100 text-brand-700 font-semibold"
              : "text-neutral-600 hover:text-brand-600"
          }`}
          onClick={() => setActiveTab(activeTab === "likes" ? null : "likes")}
        >
          Likes ({likes.length})
        </button>
      </div>

      {/* İçerikler */}
      {activeTab === "posts" && (
        <section className="animate-fadeIn">
          <h2 className="text-lg font-semibold mb-3">Posts</h2>
          {posts.length === 0 ? (
            <div className="text-sm text-neutral-500">No posts yet.</div>
          ) : (
            <div className="space-y-3">
              {posts.map((p) => (
                <div key={p.id} className="card p-4">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-neutral-600">
                    {p.description}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    {p.createdAt && new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "comments" && (
        <section className="animate-fadeIn">
          <h2 className="text-lg font-semibold mb-3">Comments</h2>
          {comments.length === 0 ? (
            <div className="text-sm text-neutral-500">No comments yet.</div>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="card p-4">
                  <div className="text-sm text-neutral-800">{c.content}</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    On Post #{c.postId}{" "}
                    {c.createdAt && new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "likes" && (
        <section className="animate-fadeIn">
          <h2 className="text-lg font-semibold mb-3">Likes</h2>
          {likes.length === 0 ? (
            <div className="text-sm text-neutral-500">No likes yet.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {likes.map((l) => (
                <div key={l.id} className="card p-4 text-sm text-neutral-700">
                  ❤️ Liked Post #{l.postId}
                  <div className="text-xs text-neutral-400">
                    {l.createdAt && new Date(l.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
