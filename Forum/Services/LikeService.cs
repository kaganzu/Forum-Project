using Forum2.Data;
using Forum2.Dto;
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
        public async Task<LikeResponse> CreateLikeAsync(LikeRequest _like,int userId)
        {
            var isAlreadyLiked = await _context.Likes.AnyAsync(l => l.UserId == userId && l.PostId == _like.PostId);
            if (isAlreadyLiked) throw new Exception("already liked");

            var post = await _context.Posts.FindAsync(_like.PostId);
            if (post == null) throw new Exception("couldnt find post");
            var user = await  _context.Users.FindAsync(userId);
            var like = new Like
            {
               PostId = _like.PostId,
               Post = post,
               UserId = userId,
               User = user
            };
            await _context.Likes.AddAsync(like);
            await _context.SaveChangesAsync();
            var res = new LikeResponse
            {
                PostId = like.PostId,
                PostTitle = like.Post.Title,
                UserId = like.UserId,
                Username = like.User.Username,
            };
            return res;
        }

        public async Task<bool> DeleteLikeAsync(int postId,int userId)
        {
            var Deleted = await _context.Likes
                .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId==userId);
            if (Deleted == null)
            {
                throw new InvalidOperationException("Like bulunamadi");
            }
            _context.Likes.Remove(Deleted);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<LikeResponse>> GetAllLikesAsync()
        {
            var likes = await _context.Likes
                .Include(l => l.User)
                .Include(l => l.Post)
                .ToListAsync();
            var res = likes.Select(l => new LikeResponse
            {
                PostId = l.PostId,
                PostTitle = l.Post.Title,
                UserId = l.UserId,
                Username = l.User.Username,
            });
            return res;
        }

        public async Task<LikeResponse?> GetLikeByIdAsync(int id)
        {
            var IsNull = await _context.Likes
                .Where(l=> l.Id == id)
                .Include(l => l.User)
                .Include(l => l.Post)
                .ToListAsync();
            if (IsNull == null)
            {
                throw new InvalidOperationException("Like bulunamadi");
            }
           var res = IsNull.Select(l => new LikeResponse
            {
                PostId = l.PostId,
                PostTitle = l.Post.Title,
                UserId = l.UserId,
                Username = l.User.Username,
            }).FirstOrDefault();
            return res;
        }

        public Task<Like?> UpdateLikeAsync(int id, Like updatedLike)
        {
            throw new NotImplementedException();
        }
    }
}
