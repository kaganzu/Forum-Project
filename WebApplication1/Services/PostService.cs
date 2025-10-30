using Forum2.Data;
using Forum2.Implementations;
using Forum2.Models;
using Microsoft.EntityFrameworkCore;

namespace Forum2.Services
{
    public class PostService : IPostService
    {
        private readonly AppDbContext _context;
        public PostService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Post> CreatePostAsync(Post post)
        {
            await _context.Posts.AddAsync(post);
            await _context.SaveChangesAsync();
            return post;
        }

        public async Task<bool> DeletePostAsync(int id)
        {
            var Deleted = await _context.Posts.FindAsync(id);
            if (Deleted == null)
            {
                throw new InvalidOperationException("Post bulunamadi");
            }
            _context.Posts.Remove(Deleted);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Post>> GetAllPostsAsync()
        {
            return await _context.Posts.ToListAsync();
        }

        public async Task<Post?> GetPostByIdAsync(int id)
        {
            var post =  await _context.Posts.FindAsync(id);
            if (post == null)
            {
                throw new InvalidOperationException("Post bulunamadi");
            }
            return post;
        }

        public Task<Post?> UpdatePostAsync(int id, Post updatedPost)
        {
            throw new NotImplementedException();
        }
    }
}
