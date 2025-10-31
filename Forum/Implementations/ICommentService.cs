using Forum2.Models;

namespace Forum2.Implementations
{
    public interface ICommentService
    {
        //CRUD işlemleri
        Task<Comment> CreateCommentAsync(Comment comment);//create
        Task<IEnumerable<Comment>> GetAllCommentsAsync();//read
        Task<Comment?> GetCommentByIdAsync(int id);//read
        Task<Comment?> UpdateCommentAsync(int id, Comment updatedComment);//update
        Task<bool> DeleteCommentAsync(int id);//delete
    }
}
