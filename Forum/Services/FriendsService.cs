using Forum2.Data;
using Forum2.Dto;
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
        public async Task<string> AnswerFriendRequestAsync(int requestId, State state)
        {
            var friendRequest = await _context.FriendRequests.FindAsync(requestId);
            if (friendRequest == null)
            {
                throw new InvalidOperationException("Friend request not found");
            }

            if (friendRequest.IsAccepted != State.Pending)
                return "request already handled";

            if (state == State.Accepted)
            {
                _context.FriendRequests.Remove(friendRequest);
                var friendship = new Friends
                {
                    UserId = friendRequest.SenderId,
                    User = friendRequest.Sender,
                    FriendId = friendRequest.ReceiverId,
                    Friend = friendRequest.Receiver
                };
                await _context.Friends.AddAsync(friendship);
                await _context.SaveChangesAsync();
                return "friendship started";
            }
            if(state == State.Rejected)
            {
                _context.FriendRequests.Remove(friendRequest);
                await _context.SaveChangesAsync();
                return "friendship rejected";
            }
            return "pending";
        }

        public async Task<bool> DeleteFriendAsync(int userId, int friendId)
        {
            var friendship =await _context.Friends
                .FirstOrDefaultAsync(f => (f.UserId == userId && f.FriendId == friendId) ||
                                     (f.UserId == friendId && f.FriendId == userId));
            if (friendship == null)
            {
                throw new InvalidOperationException("Friendship not found");
            }
            _context.Friends.Remove(friendship);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<FriendDto>> GetAllFriendsAsync(int userId)
        {
            var friends = await _context.Friends
                .Where(f => f.UserId == userId || f.FriendId == userId)
                .Include(f => f.User)
                .Include(f => f.Friend)
                .ToListAsync();
            if (friends == null) throw new Exception("you have no friends");
            return friends.Select(fr => new FriendDto
            {
                FriendId = (fr.UserId == userId ? fr.FriendId : fr.UserId),
                FriendName = (fr.UserId == userId ? fr.Friend.Username : fr.User.Username),
            });
        }

        public async Task<FriendRequest> GetFriendRequestById(int requestId)
        {
            return await _context.FriendRequests.FindAsync(requestId);
        }

        public async Task<IEnumerable<FriendRequestDto?>> GetFriendRequestsAsync(int userId)
        {
            var requests = await _context.FriendRequests
                .Where(fr => fr.ReceiverId == userId && fr.IsAccepted == State.Pending)
                .Include(fr => fr.Sender)
                .Include(fr => fr.Receiver)
                .ToListAsync();

            return requests.Select(fr => new FriendRequestDto
            {
                RequestId = fr.Id,
                SenderId = fr.SenderId,
                ReceiverId = fr.ReceiverId,
                SenderUsername = fr.Sender.Username,
                ReceiverUsername = fr.Receiver.Username,
                IsAccepted = fr.IsAccepted
            });
        }

        public async Task<IEnumerable<FriendRequestDto?>> GetSentFriendRequestsAsync(int userId)
        {
            var requests = await _context.FriendRequests
                .Where(fr => fr.SenderId == userId && fr.IsAccepted == State.Pending)
                .Include(fr => fr.Sender)
                .Include(fr => fr.Receiver)
                .ToListAsync();

            return requests.Select(fr => new FriendRequestDto
            {
                RequestId = fr.Id,
                SenderId = fr.SenderId,
                ReceiverId = fr.ReceiverId,
                SenderUsername = fr.Sender.Username,
                ReceiverUsername = fr.Receiver.Username,
                IsAccepted = fr.IsAccepted
            });
        }

        public async Task<FriendRequestDto> SendFriendRequestAsync(int senderId, int receiverId)
        {
            var IsAlreadySent = await _context.FriendRequests.AnyAsync(fr => fr.SenderId == senderId && fr.ReceiverId == receiverId);
            var AreFriends = await _context.Friends.AnyAsync(
                fr => (fr.UserId == senderId && fr.FriendId == receiverId)||
                (fr.UserId == receiverId && fr.FriendId == senderId)
                );
            if (IsAlreadySent) throw new Exception("Request Already sent");
            if (AreFriends) throw new Exception("Already friends");
            if (senderId == receiverId) throw new Exception("you cant add yourself");
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
            var friendRequestDto = new FriendRequestDto
            {
                RequestId = friendRequest.Id,
                SenderId = friendRequest.SenderId,
                ReceiverId = friendRequest.ReceiverId,
                SenderUsername = friendRequest.Sender.Username,
                ReceiverUsername = friendRequest.Receiver.Username,
                IsAccepted = friendRequest.IsAccepted
            };
            return friendRequestDto;
        }
    }
}
