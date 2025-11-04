using Forum2.Dto;
using Forum2.Models;

namespace Forum2.Implementations
{
    public interface IPostService
    {
        //CRUD işlemleri
        Task<PostResponse> CreatePostAsync(PostRequest post,int userId);//create
        Task<IEnumerable<PostResponse>> GetAllPostsAsync();//read
        Task<PostResponse?> GetPostByIdAsync(int id);//read
        Task<Post?> UpdatePostAsync(int id, Post updatedPost);//update
        Task<bool> DeletePostAsync(int id, int userId);//delete

        Task<IEnumerable<CommentResponse>> GetPostComments(int postId);
    }
}
