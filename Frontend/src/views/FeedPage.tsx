import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Link } from "react-router-dom";
import NewPost from "../components/NewPost";
import { useAuth } from "../state/auth";

type Post = {
  id: number;
  title: string;
  description?: string;
  username?: string;
  userId?: number;
  categories?: string[] | { id: number; name: string }[];
  createdAt?: string;
  likeCount?: number;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get<Post[]>("/api/Post");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <div>Loading feed…</div>;

  // Deterministic color generation for usernames
  const colorForUsername = (username: string) => {
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

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = (hash << 5) - hash + username.charCodeAt(i);
      hash |= 0;
    }
    return palette[Math.abs(hash) % palette.length];
  };

  const getTextColorForBackground = (hex: string) => {
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

  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-b from-purple-50/80 to-neutral-50 px-4 py-6">
      {/* ÜST KISIM */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-800">
          Latest Posts
        </h1>
        {isAuthenticated && (
          <button
            className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all"
            onClick={() => setShowNewPost((v) => !v)}
          >
            {showNewPost ? "Close" : "New Post"}
          </button>
        )}
      </div>

      {/* YENİ POST MODALI */}
      {showNewPost && (
        <NewPost
          onCreated={() => {
            setShowNewPost(false);
            fetchPosts();
          }}
          onCancel={() => setShowNewPost(false)}
        />
      )}

      {/* POST GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.length === 0 ? (
          <div className="text-sm text-neutral-500 col-span-full">
            No posts yet.
          </div>
        ) : (
          posts.map((p) => (
            <article
              key={p.id}
              className="group card h-44 p-6 flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-xl hover:shadow-brand-600/5 transition-all duration-300"
            >
              {/* ÜST BÖLÜM */}
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-brand-700 transition-colors">
                  {p.title}
                </h2>

                {/* KATEGORİLER */}
                {p.categories &&
                  Array.isArray(p.categories) &&
                  p.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 overflow-hidden max-h-[1.75rem]">
                      {p.categories.slice(0, 2).map((cat, index) =>
                        typeof cat === "string" ? (
                          <span
                            key={index}
                            className="text-xs font-medium rounded-full bg-brand-50 text-brand-700 px-3 py-1 ring-1 ring-brand-200/50"
                          >
                            {cat}
                          </span>
                        ) : (
                          <span
                            key={cat.id}
                            className="text-xs font-medium rounded-full bg-brand-50 text-brand-700 px-3 py-1 ring-1 ring-brand-200/50"
                          >
                            {cat.name}
                          </span>
                        )
                      )}
                      {p.categories.length > 2 && (
                        <span className="text-xs font-medium text-neutral-500">
                          +{p.categories.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
              </div>

              {/* ALT BÖLÜM */}
              <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{
                      backgroundColor: colorForUsername(
                        p.username || `user${p.userId}`
                      ),
                      color: getTextColorForBackground(
                        colorForUsername(p.username || `user${p.userId}`)
                      ),
                    }}
                  >
                    {(p.username || `user${p.userId}`).charAt(0).toUpperCase()}
                  </div>
                  <div className="text-neutral-600">
                    @{p.username || `user${p.userId}`}
                  </div>
                </div>
                <Link
                  to={`/post/${p.id}`}
                  className="text-brand-600 font-medium hover:text-brand-800 group-hover:translate-x-0.5 transform transition-all inline-flex items-center"
                >
                  Read more <span className="ml-1">→</span>
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
