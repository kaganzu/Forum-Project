using Forum2.Dto;
using Forum2.Implementations;
using Forum2.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Forum2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;
        private readonly IPostService _postService;
        public CommentController(ICommentService commentService,IPostService postService)
        {
            _commentService = commentService;
            _postService = postService;
        }
        [Authorize]
        [HttpPost("{postId}")]
        public async Task<IActionResult> CreateComment (int postId, [FromBody] CommentRequest comment)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var post = await _postService.GetPostByIdAsync(postId);
            if (post == null)
            {
                return NotFound(new { message = "Post not found." });
            }
            var Response = await _commentService.CreateCommentAsync(postId,comment,userId);
            return Ok(Response);

        }
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllComments()
        {
            var IsAdmin = User.IsInRole("Admin");
            var IsModerator = User.IsInRole("Moderator");
            if (!IsAdmin && !IsModerator)
            {
                return Forbid();
            }
            var comments = await _commentService.GetAllCommentsAsync();
            return Ok(comments);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCommentById(int id)
        {
            var IsAdmin = User.IsInRole("Admin");
            var IsModerator = User.IsInRole("Moderator");
            if (!IsAdmin && !IsModerator)
            {
                return Forbid();
            }
            var comment = await _commentService.GetCommentByIdAsync(id);
            return Ok(comment);
        }
        [Authorize]
        [HttpDelete("{id}")]    
        public async Task<IActionResult> DeleteComment(int id)
        {
            var comment = await _commentService.GetCommentByIdAsync(id);
            if (comment == null) throw new Exception("comment not found");

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isUser = comment.UserId == userId;
            var isAdmin = User.IsInRole("Admin");

            if (isUser && isAdmin)
            {
                await _commentService.DeleteCommentAsync(id);
                return Ok("deleted succesfully");
            }

            return BadRequest();
        }
    }
}
