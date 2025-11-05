import { useEffect, useState } from "react";
import { api } from "../api/client";

type Friend = {
  friendId: number;
  friendName: string;
  userId: number;
  username: string;
};

type FriendRequest = {
  requestId: number;
  senderId: number;
  receiverId: number;
  senderUsername: string;
  receiverUsername: string;
  isAccepted: number;
  sentAt?: string;
};

type User = {
  id: number;
  username: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedReqs, setReceivedReqs] = useState<FriendRequest[]>([]);
  const [sentReqs, setSentReqs] = useState<FriendRequest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<number | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [usersRes, friendsRes, receivedRes, sentRes] = await Promise.all([
        api.get<User[]>("/api/User").catch(() => ({ data: [] })),
        api.get<Friend[]>("/api/Friend").catch(() => ({ data: [] })),
        api
          .get<FriendRequest[]>("/api/Friend/received-reqs")
          .catch(() => ({ data: [] })),
        api
          .get<FriendRequest[]>("/api/Friend/sent-reqs")
          .catch(() => ({ data: [] })),
      ]);
      setUsers(usersRes.data || []);
      setFriends(friendsRes.data || []);
      setReceivedReqs(receivedRes.data || []);
      setSentReqs(sentRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSendRequest = async (userId: number) => {
    try {
      setSending(userId);
      await api.post(`/api/Friend/req/${userId}`);
      alert("Friend request sent!");
      loadAll();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to send friend request");
    } finally {
      setSending(null);
    }
  };

  const isAlreadyFriend = (userId: number) =>
    friends.some((f) => f.friendId === userId || f.userId === userId);

  const isAlreadySent = (userId: number) =>
    sentReqs.some((r) => r.receiverId === userId);

  const isAlreadyReceived = (userId: number) =>
    receivedReqs.some((r) => r.senderId === userId);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <div className="w-80">
          <input
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="text-sm text-neutral-500">
            No users match your search.
          </div>
        ) : (
          filtered.map((u) => {
            const alreadyFriend = isAlreadyFriend(u.id);
            const alreadySent = isAlreadySent(u.id);
            const alreadyReceived = isAlreadyReceived(u.id);
            const disabled = alreadyFriend || alreadySent || alreadyReceived;

            let label = "Add Friend";
            if (alreadyFriend) label = "Friends";
            else if (alreadySent) label = "Request Sent";
            else if (alreadyReceived) label = "Requested You";

            return (
              <div
                key={u.id}
                className="card p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">
                    {(u.username[0] || "U").toUpperCase()}
                  </div>
                  <div className="font-medium">{u.username}</div>
                </div>
                <button
                  className={`btn ${
                    disabled ? "opacity-60 cursor-not-allowed" : "btn-primary"
                  }`}
                  disabled={disabled || sending === u.id}
                  onClick={() => handleSendRequest(u.id)}
                >
                  {sending === u.id ? "Sending…" : label}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
