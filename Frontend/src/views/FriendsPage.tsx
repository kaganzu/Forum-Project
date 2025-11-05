import { useEffect, useState } from 'react';
import { api } from '../api/client';

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
  isAccepted: number; // 0=Pending, 1=Accepted, 2=Rejected
  sentAt?: string;
};

type User = {
  id: number;
  username: string;
};

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedReqs, setReceivedReqs] = useState<FriendRequest[]>([]);
  const [sentReqs, setSentReqs] = useState<FriendRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent' | 'users'>('friends');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<number | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [friendsRes, receivedRes, sentRes, usersRes] = await Promise.all([
        api.get<Friend[]>('/api/Friend').catch(() => ({ data: [] })),
        api.get<FriendRequest[]>('/api/Friend/received-reqs').catch(() => ({ data: [] })),
        api.get<FriendRequest[]>('/api/Friend/sent-reqs').catch(() => ({ data: [] })),
        api.get<User[]>('/api/User').catch(() => ({ data: [] })),
      ]);
      setFriends(friendsRes.data || []);
      setReceivedReqs(receivedRes.data || []);
      setSentReqs(sentRes.data || []);
      setUsers(usersRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAccept = async (requestId: number) => {
    await api.post(`/api/Friend/req/answer?requestId=${requestId}&state=Accepted`);
    loadAll();
  };

  const handleReject = async (requestId: number) => {
    await api.post(`/api/Friend/req/answer?requestId=${requestId}&state=Rejected`);
    loadAll();
  };

  const handleUnfriend = async (friendId: number) => {
    if (!confirm('Remove this friend?')) return;
    await api.delete(`/api/Friend/${friendId}`);
    loadAll();
  };

  const handleSendRequest = async (userId: number) => {
    try {
      setSending(userId);
      await api.post(`/api/Friend/req/${userId}`);
      alert('Friend request sent!');
      loadAll();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Failed to send friend request');
    } finally {
      setSending(null);
    }
  };

  const getFriendName = (f: Friend) => f.friendName || 'Unknown';
  const getFriendId = (f: Friend) => f.friendId;

  const isAlreadyFriend = (userId: number) =>
    friends.some((f) => f.friendId === userId || f.userId === userId);

  const isAlreadySent = (userId: number) =>
    sentReqs.some((r) => r.receiverId === userId);

  const isAlreadyReceived = (userId: number) =>
    receivedReqs.some((r) => r.senderId === userId);

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Friends</h1>

      <div className="flex gap-2 border-b border-purple-200">
        <button
          className={`px-4 py-2 ${activeTab === 'friends' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-neutral-600'}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends ({friends.length})
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'received' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-neutral-600'}`}
          onClick={() => setActiveTab('received')}
        >
          Received ({receivedReqs.length})
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'sent' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-neutral-600'}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent ({sentReqs.length})
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-neutral-600'}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      {/* FRIENDS */}
      {activeTab === 'friends' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.length === 0 ? (
            <div className="text-sm text-neutral-500">No friends yet.</div>
          ) : (
            friends.map((f) => (
              <div key={`${f.userId}-${f.friendId}`} className="card p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">
                    {(getFriendName(f).trim()[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{getFriendName(f)}</div>
                    <div className="text-xs text-neutral-500">ID: {getFriendId(f)}</div>
                  </div>
                </div>
                <button className="btn" onClick={() => handleUnfriend(getFriendId(f))}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* RECEIVED */}
      {activeTab === 'received' && (
        <div className="space-y-3">
          {receivedReqs.length === 0 ? (
            <div className="text-sm text-neutral-500">No pending requests.</div>
          ) : (
            receivedReqs.map((req) => (
              <div key={req.requestId} className="card p-5 flex items-center justify-between">
                <div>
                  <div className="font-medium">{req.senderUsername}</div>
                  <div className="text-xs text-neutral-500">
                    Received {req.sentAt ? new Date(req.sentAt).toLocaleDateString() : ''}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary" onClick={() => handleAccept(req.requestId)}>
                    Accept
                  </button>
                  <button className="btn" onClick={() => handleReject(req.requestId)}>
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SENT */}
      {activeTab === 'sent' && (
        <div className="space-y-3">
          {sentReqs.length === 0 ? (
            <div className="text-sm text-neutral-500">No sent requests.</div>
          ) : (
            sentReqs.map((req) => (
              <div key={req.requestId} className="card p-5 flex items-center justify-between">
                <div>
                  <div className="font-medium">{req.receiverUsername}</div>
                  <div className="text-xs text-neutral-500">
                    Sent {req.sentAt ? new Date(req.sentAt).toLocaleDateString() : ''}
                  </div>
                </div>
                {req.isAccepted === 0 && <div className="text-sm text-yellow-600 font-medium">Pending</div>}
                {req.isAccepted === 1 && <div className="text-sm text-green-600 font-medium">Accepted ✅</div>}
                {req.isAccepted === 2 && <div className="text-sm text-red-600 font-medium">Rejected ❌</div>}
              </div>
            ))
          )}
        </div>
      )}

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.length === 0 ? (
            <div className="text-sm text-neutral-500">No users found.</div>
          ) : (
            users.map((u) => {
              const alreadyFriend = isAlreadyFriend(u.id);
              const alreadySent = isAlreadySent(u.id);
              const alreadyReceived = isAlreadyReceived(u.id);
              const disabled = alreadyFriend || alreadySent || alreadyReceived;

              let label = 'Add Friend';
              if (alreadyFriend) label = 'Friends';
              else if (alreadySent) label = 'Request Sent';
              else if (alreadyReceived) label = 'Requested You';

              return (
                <div key={u.id} className="card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700">
                      {(u.username[0] || 'U').toUpperCase()}
                    </div>
                    <div className="font-medium">{u.username}</div>
                  </div>
                  <button
                    className={`btn ${disabled ? 'opacity-60 cursor-not-allowed' : 'btn-primary'}`}
                    disabled={disabled || sending === u.id}
                    onClick={() => handleSendRequest(u.id)}
                  >
                    {sending === u.id ? 'Sending…' : label}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
