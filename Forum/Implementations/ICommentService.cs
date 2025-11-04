using Forum2.Dto;
using Forum2.Models;

namespace Forum2.Implementations
{
    public interface ICommentService
    {
        //CRUD işlemleri
        Task<CommentResponse> CreateCommentAsync(int postId,CommentRequest commentReq,int userId);//create
        Task<IEnumerable<CommentResponse>> GetAllCommentsAsync();//read
        Task<CommentResponse?> GetCommentByIdAsync(int id);//read
        Task<Comment?> UpdateCommentAsync(int id, CommentRequest updatedComment);//update
        Task<bool> DeleteCommentAsync(int id);//delete
    }
}
