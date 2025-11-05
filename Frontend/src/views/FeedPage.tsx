import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import NewPost from '../components/NewPost';
import { useAuth } from '../state/auth';

type Post = {
  id: number;
  title: string;
  description?: string;
  username?: string; // 👈 backend’den gelen alan
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
      // Swagger: GET /api/Post
      const res = await api.get<Post[]>('/api/Post');
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Latest Posts</h1>
        {isAuthenticated && (
          <button
            className="btn btn-primary"
            onClick={() => setShowNewPost((v) => !v)}
          >
            {showNewPost ? 'Close' : 'New Post'}
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

      {posts.map((p) => (
        <article key={p.id} className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-neutral-900">{p.title}</h2>

            {/* Kategoriler */}
            {p.categories && Array.isArray(p.categories) && p.categories.length > 0 && (
              <div className="flex gap-2">
                {p.categories.map((cat, index) =>
                  typeof cat === 'string' ? (
                    <span
                      key={index}
                      className="text-xs rounded-full bg-brand-100 text-brand-800 px-2 py-1"
                    >
                      {cat}
                    </span>
                  ) : (
                    <span
                      key={cat.id}
                      className="text-xs rounded-full bg-brand-100 text-brand-800 px-2 py-1"
                    >
                      {cat.name}
                    </span>
                  )
                )}
              </div>
            )}
          </div>

          {/* İçerik */}
          <p className="mt-2 text-neutral-700 line-clamp-3">
            {p.description || ''}
          </p>

          {/* Alt bilgi */}
          <div className="mt-3 flex items-center justify-between text-sm text-neutral-500">
            <div>{p.username || 'Anonymous'}</div>
            <Link
              to={`/post/${p.id}`}
              className="text-brand-700 hover:underline"
            >
              Read more
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
