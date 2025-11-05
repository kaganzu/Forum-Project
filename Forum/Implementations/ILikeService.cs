using Forum2.Dto;
using Forum2.Models;

namespace Forum2.Implementations
{
    public interface ILikeService
    {
        //CRUD işlemleri
        Task<LikeResponse> CreateLikeAsync(LikeRequest like,int userId);//create
        Task<IEnumerable<LikeResponse>> GetAllLikesAsync();//read
        Task<LikeResponse?> GetLikeByIdAsync(int id);//read
        Task<Like?> UpdateLikeAsync(int id, Like updatedLike);//update
        Task<bool> DeleteLikeAsync(int postId,int userId);//delete
    }
}
