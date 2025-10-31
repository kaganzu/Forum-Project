using Forum2.Models;

namespace Forum2.Implementations
{
    public interface IPostService
    {
        //CRUD işlemleri
        Task<Post> CreatePostAsync(Post post);//create
        Task<IEnumerable<Post>> GetAllPostsAsync();//read
        Task<Post?> GetPostByIdAsync(int id);//read
        Task<Post?> UpdatePostAsync(int id, Post updatedPost);//update
        Task<bool> DeletePostAsync(int id);//delete
    }
}
