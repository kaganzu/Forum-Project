using Forum2.Models;

namespace Forum2.Implementations
{
    public interface ILikeService
    {
        //CRUD işlemleri
        Task<Like> CreateLikeAsync(Like like);//create
        Task<IEnumerable<Like>> GetAllLikesAsync();//read
        Task<Like?> GetLikeByIdAsync(int id);//read
        Task<Like?> UpdateLikeAsync(int id, Like updatedLike);//update
        Task<bool> DeleteLikeAsync(int id);//delete
    }
}
