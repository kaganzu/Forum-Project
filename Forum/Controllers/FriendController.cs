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
    public class FriendController : ControllerBase
    {
        private readonly IFriendsService _friendService;
        public FriendController(IFriendsService friendService)
        {
            _friendService = friendService;
        }
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllFriends()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var friends = await _friendService.GetAllFriendsAsync(userId);
            return Ok(friends);
        }
        [Authorize]
        [HttpGet("received-reqs")]
        public async Task<IActionResult> GetReceivedFriendRequests()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var requests = await _friendService.GetFriendRequestsAsync(userId);
            return Ok(requests);
        }
        [Authorize]
        [HttpPost("req/{friendId}")]
        public async Task<IActionResult> SendFriendRequest(int friendId)
        {
            var CurrentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var request = await _friendService.SendFriendRequestAsync(CurrentUserId, friendId);
            return Ok(request);
        }
        [Authorize]
        [HttpGet("sent-reqs")]
        public async Task<IActionResult> GetSentFriendRequests()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var requests = await _friendService.GetSentFriendRequestsAsync(userId);
            return Ok(requests);
        }
        [Authorize]
        [HttpPost("req/answer")]
        public async Task<IActionResult> AnswerFriendRequest([FromQuery] int requestId, [FromQuery] State state)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var request = await _friendService.GetFriendRequestById(requestId);
            if (request == null) throw new Exception("request could not be found");
            if(!(request.ReceiverId == userId))
            {
                throw new Exception("you cannot answer this request cause its not yours.");
            }
            var response = await _friendService.AnswerFriendRequestAsync(requestId, state);
            return Ok(new {message = response});
        }
    }
}
