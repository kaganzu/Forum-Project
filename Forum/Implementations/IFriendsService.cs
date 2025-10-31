using Forum2.Models;

namespace Forum2.Implementations
{
    public interface IFriendsService
    {
        Task<IEnumerable<Friends>> GetAllFriendsAsync(int userId);
        Task<FriendRequest> SendFriendRequestAsync(int senderId,int receiverId);
        Task<FriendRequest> AnswerFriendRequestAsync(int requestId, State state);
        Task<IEnumerable<FriendRequest?>> GetFriendRequestsAsync(int userId);
        Task<bool> DeleteFriendAsync(int userId, int friendId);
    } 
}   
