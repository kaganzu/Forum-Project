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
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly IUserService _userService;
        public PostController(IPostService postService,IUserService userService)
        {
            _postService = postService;
            _userService = userService;
        }
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllPostsAsync()
        {
            var result = await _postService.GetAllPostsAsync();
            return Ok(result);
        }
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreatePostAsync([FromBody]PostRequest _post) 
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _postService.CreatePostAsync(_post, userId);
            return Ok("post created");
        }
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPostByIdAsync(int id)
        {
            var result = await _postService.GetPostByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = "Post not found." });
            }
            return Ok(result);
        }
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePostAsync(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var IsAdmin = User.IsInRole("Admin");
            var IsModerator = User.IsInRole("Moderator");
            var IsPostOwner = _userService.GetUserPostsAsync(userId).Result.Any(p => p.Id == id);

            if (!IsAdmin && !IsModerator && !IsPostOwner)
            {
                return Forbid();
            }
            

            await _postService.DeletePostAsync(id, userId);
            return Ok("Post deleted successfully.");

        }
        [Authorize]
        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetPostsComments(int id)
        {
            var res = await _postService.GetPostComments(id);
            return Ok(res);
        }
        [Authorize]
        [HttpGet("{id}/likes")]
        public async Task<IActionResult> GetPostLikes(int id)
        {
            var res = await _postService.GetLikesOfPost(id);
            return Ok(res);
        }
    }
}
