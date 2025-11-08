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
  likedByCurrentUser?: boolean;
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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-brand-600 text-lg font-medium">
        Loading feed…
      </div>
    );

  const colorForUsername = (username: string) => {
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
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = (hash << 5) - hash + username.charCodeAt(i);
      hash |= 0;
    }
    return palette[Math.abs(hash) % palette.length];
  };

  const textColorForBg = (hex: string) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.5 ? "#111827" : "#ffffff";
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-purple-50/60 to-white">
      <div className="w-full px-4 sm:px-6 py-8 space-y-8">
        {/* ÜST BAR */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-800 tracking-tight">
            Community Feed
          </h1>

          {isAuthenticated && (
            <button
              className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium shadow-md hover:bg-brand-700 transition-all"
              onClick={() => setShowNewPost((v) => !v)}
            >
              {showNewPost ? "Close" : "New Post"}
            </button>
          )}
        </div>

        {showNewPost && (
          <NewPost
            onCreated={() => {
              setShowNewPost(false);
              fetchPosts();
            }}
            onCancel={() => setShowNewPost(false)}
          />
        )}

        {/* FEED GRID */}
        <div className="grid gap-5 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.length === 0 ? (
            <div className="text-neutral-500 text-center col-span-full mt-10">
              No posts yet 😢
            </div>
          ) : (
            posts.map((p) => {
              const bg = colorForUsername(p.username || `user${p.userId}`);
              const txt = textColorForBg(bg);
              const date = p.createdAt
                ? new Date(p.createdAt).toLocaleDateString()
                : null;

              const mainCategory =
                p.categories && p.categories.length > 0
                  ? typeof p.categories[0] === "string"
                    ? p.categories[0]
                    : (p.categories[0] as any).name
                  : "General";

              return (
                <article
                  key={p.id}
                  className="group flex flex-col justify-between min-h-[16rem] bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                >
                  <div className="flex-1 px-4 pt-5 pb-4 flex flex-col items-center text-center justify-start">
                    {/* CATEGORY */}
                    <div className="text-[13px] font-semibold text-brand-700 uppercase tracking-wide mb-1">
                      {mainCategory}
                    </div>
                    <div className="w-12 h-[1.5px] bg-brand-300 mb-3"></div>

                    {/* TITLE */}
                    <h2 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-brand-700 transition-colors">
                      {p.title}
                    </h2>

                    {/* DESCRIPTION alanı sabit yükseklikli */}
                    <div className="min-h-[2.5rem] flex items-center">
                      {p.description ? (
                        <p className="text-[13px] text-neutral-500 line-clamp-2">
                          {p.description}
                        </p>
                      ) : (
                        <span className="invisible select-none">_</span>
                      )}
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between px-5 py-3 border-t bg-neutral-50 text-sm">
                    {/* LEFT */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs"
                        style={{ backgroundColor: bg, color: txt }}
                      >
                        {(p.username || `user${p.userId}`)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-medium text-neutral-700">
                          @{p.username || `user${p.userId}`}
                        </span>
                        {date && (
                          <span className="text-xs text-neutral-400">
                            {date}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm">
                        {p.likedByCurrentUser ? (
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-neutral-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                        <span
                          className={`font-medium ${
                            p.likedByCurrentUser
                              ? "text-green-600"
                              : "text-neutral-500"
                          }`}
                        >
                          {p.likeCount ?? 0}
                        </span>
                      </div>

                      <Link
                        to={`/post/${p.id}`}
                        className="flex items-center gap-1 text-brand-600 font-medium hover:text-brand-800 whitespace-nowrap"
                      >
                        Read
                        <svg
                          className="w-3.5 h-3.5 ml-0.5 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
