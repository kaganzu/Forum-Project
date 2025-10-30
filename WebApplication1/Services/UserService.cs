using Forum2.Data;
using Forum2.Implementations;
using Forum2.Models;
using Microsoft.EntityFrameworkCore;

namespace Forum2.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        public UserService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<User> CreateUserAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var Deleted =  await _context.Users.FindAsync(id);
            if (Deleted == null)
            {
                throw new InvalidOperationException("User bulunamadi");
            }
            _context.Users.Remove(Deleted);
            await _context.SaveChangesAsync();
            return true;

        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                throw new InvalidOperationException("User bulunamadi");
            }
            return user;
        }

        public async Task<IEnumerable<Comment>> GetUserCommentsAsync(int userId)
        {
            return await _context.Comments
                .Where(c => c.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Like>> GetUserLikesAsync(int userId)
        {
            return await _context.Likes
                .Where(l => l.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetUserPostsAsync(int userId)
        {
            return await _context.Posts
                .Where(p => p.UserId == userId)
                .ToListAsync();
        }

        public Task<User?> UpdateUserAsync(int id, User updatedUser)
        {
            throw new NotImplementedException();
        }
    }
}
