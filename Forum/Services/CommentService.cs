using Forum2.Data;
using Forum2.Dto;
using Forum2.Implementations;
using Forum2.Models;
using Microsoft.EntityFrameworkCore;

namespace Forum2.Services
{
    public class CommentService : ICommentService
    {
        private readonly AppDbContext _context;
        public CommentService(AppDbContext context, IPostService postService)
        {
            _context = context;
        }
        public async Task<CommentResponse> CreateCommentAsync(int postId,CommentRequest _comment,int userId)
        {
            var post = await _context.Posts.FindAsync(postId);
            var user = await _context.Users.FindAsync(userId);
            var comment = new Comment
            {
                Content = _comment.Content,
                PostId = postId,
                Post = post!,
                UserId = userId,
                User = user!,
            };
            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();
            var response = new CommentResponse
            {
                Id = comment.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                PostId = comment.PostId,
                PostTitle = post!.Title,
                UserId = comment.UserId,
                UserName = user!.Username,
            };
            return response;
        }

        public async Task<bool> DeleteCommentAsync(int id)
        {
            var Deleted = await _context.Comments.FindAsync(id);
            if (Deleted == null)
            {
                throw new InvalidOperationException("Comment bulunamadi");
            }
            _context.Comments.Remove(Deleted);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CommentResponse>> GetAllCommentsAsync()
        {
            var comments = await _context.Comments
                .Include(c => c.User)
                .Include(c => c.Post)
                .ToListAsync();
            var responses = comments.Select(c => new CommentResponse
            {
                Id = c.Id,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                PostId = c.PostId,
                PostTitle = c.Post!.Title,
                UserId = c.UserId,
                UserName = c.User!.Username,
            });
            return responses;
        }

        public async Task<CommentResponse?> GetCommentByIdAsync(int id)
        {
            var comment = await _context.Comments
                .Include(c => c.User)
                .Include(c => c.Post)
                .FirstOrDefaultAsync(c => c.Id == id);
            var response = new CommentResponse
            {
                Id = comment!.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                PostId = comment.PostId,
                PostTitle = comment.Post!.Title,
                UserId = comment.UserId,
                UserName = comment.User!.Username,
            };
            return response;
        }

        public Task<Comment?> UpdateCommentAsync(int id, CommentRequest updatedComment)
        {
            throw new NotImplementedException();
        }
    }
}
