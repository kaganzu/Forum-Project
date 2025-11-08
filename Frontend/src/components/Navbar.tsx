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
  const { isAuthenticated, isAdmin, userId, logout } = useAuth();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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
  const [isHovering, setIsHovering] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const profileDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node) && !isHovering) {
        setShowDropdown(false);
      }

      if (!profileDropdownRef.current) return;
      if (!profileDropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isHovering]);

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
              className="input w-64 text-sm cursor-pointer"
              placeholder="Search users..."
              value={query}
              onClick={() => {
                if (!users.length && !loadingUsers) loadUsers();
                if (!friends.length && !loadingFriends) loadFriends();
                if (!sentReqs.length && !loadingSent) loadSent();
                setShowDropdown(!showDropdown);
              }}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!users.length && !loadingUsers) loadUsers();
                if (!friends.length && !loadingFriends) loadFriends();
                if (!sentReqs.length && !loadingSent) loadSent();
                setShowDropdown(true);
              }}
            />

            {showDropdown && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white text-black rounded shadow max-h-72 overflow-auto z-50"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
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
            <div className="relative" ref={profileDropdownRef}>
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                {loadingMe ? "Profile" : "@" + myUsername || "Profile"}
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    showProfileDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-sm text-gray-700 divide-y divide-gray-100">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                      setShowProfileDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-gray-900 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
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
