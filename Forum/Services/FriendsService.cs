using Forum2.Data;
using Forum2.Implementations;
using Forum2.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace Forum2.Services
{
    public class FriendsService : IFriendsService
    {
        private readonly AppDbContext _context;
        private readonly IUserService _userService;
        public FriendsService(AppDbContext context,IUserService userService)
        {
            _context = context;
            _userService = userService;
        }
        public async Task<FriendRequest> AnswerFriendRequestAsync(int requestId, State state)
        {
            var friendRequest = await _context.FriendRequests.FindAsync(requestId);
            if (friendRequest == null)
            {
                throw new InvalidOperationException("Friend request not found");
            }
            friendRequest.IsAccepted = state;
            if(state == State.Accepted)
            {
                var friendship = new Friends
                {
                    UserId = friendRequest.SenderId,
                    FriendId = friendRequest.ReceiverId,
                };
                await _context.Friends.AddAsync(friendship);
            }
            await _context.SaveChangesAsync();
            return friendRequest;
        }

        public async Task<bool> DeleteFriendAsync(int userId, int friendId)
        {
            var friendship = _context.Friends
                .FirstOrDefault(f => (f.UserId == userId && f.FriendId == friendId) ||
                                     (f.UserId == friendId && f.FriendId == userId));
            if (friendship == null)
            {
                throw new InvalidOperationException("Friendship not found");
            }
            _context.Friends.Remove(friendship);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Friends>> GetAllFriendsAsync(int userId)
        {
            var friends = await _context.Friends
                .Where(f => f.UserId == userId || f.FriendId == userId)
                .ToListAsync();
            return friends;
        }

        public async Task<IEnumerable<FriendRequest?>> GetFriendRequestsAsync(int userId)
        {
            var requests = await _context.FriendRequests
                .Where(fr => fr.ReceiverId == userId && fr.IsAccepted == State.Pending)
                .Include(fr => fr.Sender)
                .Include(fr => fr.Receiver)
                .ToListAsync();
            return requests;
        }

        public async Task<FriendRequest> SendFriendRequestAsync(int senderId, int receiverId)
        {
            var friendRequest = new FriendRequest
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Sender = await _userService.GetUserByIdAsync(senderId),
                Receiver = await _userService.GetUserByIdAsync(receiverId),
                SentAt = DateTime.UtcNow,
                IsAccepted = State.Pending
            };
           
            await _context.FriendRequests.AddAsync(friendRequest);
            await _context.SaveChangesAsync();
            return friendRequest;
        }
    }
}
