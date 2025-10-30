using Forum2.Models;

namespace Forum2.Implementations
{
    public interface IUserService
    {
        //Önce CRUD
        Task<User> CreateUserAsync(User user);//create
        Task<IEnumerable<User>> GetAllUsersAsync();//read
        Task<User?> GetUserByIdAsync(int id);//read
        Task<User?> UpdateUserAsync(int id, User updatedUser);//update
        Task<bool> DeleteUserAsync(int id);//delete

        //Özel metotlar
        Task<IEnumerable<Post>> GetUserPostsAsync(int userId);
        Task<IEnumerable<Comment>> GetUserCommentsAsync(int userId);
        Task<IEnumerable<Like>> GetUserLikesAsync(int userId);
    }
}
