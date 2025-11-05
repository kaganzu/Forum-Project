import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../state/auth";
import CreateCategoryModal from "./CreateCategoryModal";
import { api } from "../api/client";

type User = { id: number; username: string };
type Friend = { friendId: number; userId: number };
type FriendRequest = {
  requestId: number;
  senderId: number;
  receiverId: number;
};

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, userId } = useAuth();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [loadingMe, setLoadingMe] = useState(false);

  // search
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sentReqs, setSentReqs] = useState<FriendRequest[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingSent, setLoadingSent] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    // load current user's username when authenticated
    const loadMe = async () => {
      if (!isAuthenticated) {
        setMyUsername(null);
        return;
      }
      setLoadingMe(true);
      try {
        const res = await api.get<{ id: number; username: string }>(
          "/api/User/me"
        );
        setMyUsername(res.data?.username || null);
      } catch (e) {
        console.error(e);
        setMyUsername(null);
      } finally {
        setLoadingMe(false);
      }
    };

    loadMe();
  }, [isAuthenticated]);

  const loadUsers = async () => {
    if (loadingUsers) return;
    setLoadingUsers(true);
    try {
      const res = await api
        .get<User[]>("/api/User")
        .catch(() => ({ data: [] }));
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadFriends = async () => {
    if (loadingFriends) return;
    setLoadingFriends(true);
    try {
      const res = await api
        .get<Friend[]>("/api/Friend")
        .catch(() => ({ data: [] }));
      setFriends(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFriends(false);
    }
  };

  const loadSent = async () => {
    if (loadingSent) return;
    setLoadingSent(true);
    try {
      const res = await api
        .get<FriendRequest[]>("/api/Friend/sent-reqs")
        .catch(() => ({ data: [] }));
      setSentReqs(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSent(false);
    }
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(query.toLowerCase())
  );

  const isAlreadyFriend = (id: number) =>
    friends.some((f) => f.friendId === id || f.userId === id);

  const handleSendRequest = async (id: number) => {
    try {
      setSendingId(id);
      await api.post(`/api/Friend/req/${id}`);
      alert("Friend request sent!");
      await loadFriends();
      await loadSent();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to send friend request");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-brand-700 to-brand-600 text-white shadow">
      <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-white/20" />
          <span className="font-semibold text-lg">Forum</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "text-white" : "text-white/80 hover:text-white"
            }
          >
            Feed
          </NavLink>
          <NavLink
            to="/friends"
            className={({ isActive }) =>
              isActive ? "text-white" : "text-white/80 hover:text-white"
            }
          >
            Friends
          </NavLink>
          <div ref={containerRef} className="relative">
            <input
              className="input w-64 text-sm"
              placeholder="Search users..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!users.length && !loadingUsers) loadUsers();
                if (!friends.length && !loadingFriends) loadFriends();
                if (!sentReqs.length && !loadingSent) loadSent();
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (!users.length && !loadingUsers) loadUsers();
                if (!friends.length && !loadingFriends) loadFriends();
                if (!sentReqs.length && !loadingSent) loadSent();
                setShowDropdown(true);
              }}
            />

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded shadow max-h-72 overflow-auto z-50">
                {loadingUsers || loadingFriends || loadingSent ? (
                  <div className="p-3 text-sm text-neutral-600">Loading…</div>
                ) : filtered.length === 0 ? (
                  <div className="p-3 text-sm text-neutral-600">
                    No results.
                  </div>
                ) : (
                  filtered.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 flex items-center justify-between border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">
                          {(u.username[0] || "U").toUpperCase()}
                        </div>
                        <div className="text-sm">{u.username}</div>
                      </div>
                      <div>
                        {u.id === userId ? (
                          <div className="text-xs text-neutral-500">You</div>
                        ) : isAlreadyFriend(u.id) ? (
                          <div className="text-xs text-green-600 font-medium">
                            Friends
                          </div>
                        ) : sentReqs.some((s) => s.receiverId === u.id) ? (
                          <div className="text-xs text-yellow-600 font-medium">
                            Requested
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-primary"
                            disabled={sendingId === u.id}
                            onClick={() => handleSendRequest(u.id)}
                          >
                            {sendingId === u.id ? "Sending…" : "Add"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {isAdmin && (
            <button
              className="text-white/80 hover:text-white"
              onClick={() => setShowCategoryModal(true)}
            >
              Create Category
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/profile")}
              >
                {loadingMe ? "Profile" : myUsername || "Profile"}
              </button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => navigate("/login")}>
                Login
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/register")}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
      {showCategoryModal && (
        <CreateCategoryModal onClose={() => setShowCategoryModal(false)} />
      )}
    </header>
  );
}
