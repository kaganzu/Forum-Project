using Forum2.Data;
using Forum2.Implementations;
using Forum2.Models;
using Microsoft.EntityFrameworkCore;

namespace Forum2.Services
{
    public class LikeService : ILikeService
    {
        private readonly AppDbContext _context;
        public LikeService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Like> CreateLikeAsync(Like like)
        {
            await _context.Likes.AddAsync(like);
            await _context.SaveChangesAsync();
            return like;
        }

        public async Task<bool> DeleteLikeAsync(int id)
        {
            var Deleted = await _context.Likes.FindAsync(id);
            if (Deleted == null)
            {
                throw new InvalidOperationException("Like bulunamadi");
            }
            _context.Likes.Remove(Deleted);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Like>> GetAllLikesAsync()
        {
            return await _context.Likes.ToListAsync();
        }

        public async Task<Like?> GetLikeByIdAsync(int id)
        {
            var IsNull = await _context.Likes.FindAsync(id);
            if (IsNull == null)
            {
                throw new InvalidOperationException("Like bulunamadi");
            }
            return IsNull;
        }

        public Task<Like?> UpdateLikeAsync(int id, Like updatedLike)
        {
            throw new NotImplementedException();
        }
    }
}
