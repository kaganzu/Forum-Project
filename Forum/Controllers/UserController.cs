using Forum2.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Forum2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }
            return Ok(user);
        }
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var users = await _userService.GetAllUsersAsync(userId);
            return Ok(users);
        }
        [Authorize]
        [HttpGet]
        [Route("{id}/posts")]
        public async Task<IActionResult> GetUserPosts(int id)
        {
            var posts = await _userService.GetUserPostsAsync(id);
            return Ok(posts);
        }
        [Authorize]
        [HttpGet]
        [Route("{id}/comments")]
        public async Task<IActionResult> GetUserComments(int id)
        {
            var comments = await _userService.GetUserCommentsAsync(id);
            return Ok(comments);
        }
        [Authorize]
        [HttpGet]
        [Route("{id}/likes")]
        public async Task<IActionResult> GetUserLikes(int id)
        {
            var likes = await _userService.GetUserLikesAsync(id);
            return Ok(likes);
        }
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var currentUser = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");
            if (currentUser != id && !isAdmin)
            {
                return Forbid(); // 403 Forbidden
            }
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }
            await _userService.DeleteUserAsync(id);
            return Ok(new { message = "User deleted successfully." });
        }
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });
            return Ok(user);
        }

    }
}
