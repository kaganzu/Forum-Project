using Forum2.Dto;
using Forum2.Models;

namespace Forum2.Implementations
{
    public interface IFriendsService
    {
        Task<FriendRequest> GetFriendRequestById(int requestId);
        Task<IEnumerable<FriendDto>> GetAllFriendsAsync(int userId);
        Task<FriendRequestDto> SendFriendRequestAsync(int senderId,int receiverId);
        Task<string> AnswerFriendRequestAsync(int requestId, State state);
        Task<IEnumerable<FriendRequestDto?>> GetFriendRequestsAsync(int userId);
        Task<IEnumerable<FriendRequestDto?>> GetSentFriendRequestsAsync(int userId);
        Task<bool> DeleteFriendAsync(int userId, int friendId);
    } 
}   
