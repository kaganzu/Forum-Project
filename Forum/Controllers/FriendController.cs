using Forum2.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Forum2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FriendController : ControllerBase
    {
        private readonly IFriendsService _friendService;
        public FriendController(IFriendsService friendService)
        {
            _friendService = friendService;
        }
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetAllFriends(int userId)
        {
            var friends = await _friendService.GetAllFriendsAsync(userId);
            return Ok(friends);
        }
        [Authorize]
        [HttpGet("requests")]
        public async Task<IActionResult> GetFriendRequests()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var requests = await _friendService.GetFriendRequestsAsync(userId);
            return Ok(requests);
        }
        [Authorize]
        [HttpPost("request/{friendId}")]
        public async Task<IActionResult> SendFriendRequest(int friendId)
        {
            var CurrentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var request = await _friendService.SendFriendRequestAsync(CurrentUserId, friendId);
            return Ok(request);
        }
    }
}
