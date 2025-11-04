using Forum2.Data;
using Forum2.Dto;
using Forum2.Implementations;
using Forum2.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using System.Security.Claims;

namespace Forum2.Services
{
    public class PostService : IPostService
    {
        private readonly AppDbContext _context;
        private readonly IUserService _userService;
        private readonly ICategoryService _categoryService;
        public PostService(AppDbContext context, IUserService userService,ICategoryService categoryService)
        {
            _context = context;
            _userService = userService;
            _categoryService = categoryService;
        }
        public async Task<PostResponse> CreatePostAsync(PostRequest _post,int userId)
        {
            var user = await _userService.GetUserByIdAsync(userId);
            var categories = new List<Category>();
            categories = await _context.Categories
                                        .Where(c => _post.CategoryIds.Contains(c.Id))
                                        .ToListAsync();
            var post = new Post
            {
                Title = _post.Title,
                Description = _post.Description,
                UserId = userId,
                User = user,
                Categories = categories
            };
            await _context.Posts.AddAsync(post);
            await _context.SaveChangesAsync();

            var postRes = new PostResponse
            {
                Title = post.Title,
                Description = _post.Description,
                UserId = userId,
                Username = post.User.Username,
                Categories = post.Categories.Select(c=>c.Name).ToList(),
                CreatedAt = post.CreatedAt,
                Id = post.Id,
            };
            return postRes;
        }

        public async Task<bool> DeletePostAsync(int id,int userId)
        {
            var Deleted = await _context.Posts.FindAsync(id);

            var isPostBelongToUser = await _context.Posts
                .AnyAsync(p => p.Id == id && p.UserId == userId);
            var user = await _userService.GetUserByIdAsync(userId);
            var isAdmin = (user.Role == UserRole.Admin);

            if (!isPostBelongToUser && !isAdmin)
            {
                throw new UnauthorizedAccessException("You are not authorized to do this");
            }

            if (Deleted == null)
            {
                throw new InvalidOperationException("Post bulunamadi");
            }

            _context.Posts.Remove(Deleted);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<PostResponse>> GetAllPostsAsync()
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Categories)
                .ToListAsync();

            var response = posts.Select(pr => new PostResponse
            {
                Title = pr.Title,
                Description = pr.Description,
                UserId = pr.UserId,
                Username= pr.User.Username,
                Categories = pr.Categories.Select(c => c.Name).ToList(),
                CreatedAt = pr.CreatedAt,
                Id = pr.Id,
            });
            return response;
        }

        public async Task<PostResponse?> GetPostByIdAsync(int id)
        {
            var post = await _context.Posts
                .Include (p => p.User)
                .Include(p => p.Categories)
                .FirstOrDefaultAsync(p=> p.Id == id);

            if (post == null)
            {
                throw new InvalidOperationException("Post bulunamadi");
            }
            var res = new PostResponse
            {
                Title = post.Title,
                Description = post.Description,
                UserId = post.UserId,
                Username = post.User.Username,
                Categories = post.Categories.Select(c => c.Name).ToList(),
                CreatedAt = post.CreatedAt,
                Id = post.Id,

            };
            return res;
        }

        public Task<Post?> UpdatePostAsync(int id, Post updatedPost)
        {
            throw new NotImplementedException();
        }
    }
}
