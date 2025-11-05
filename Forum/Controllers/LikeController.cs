using Forum2.Dto;
using Forum2.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Forum2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LikeController : ControllerBase
    {
        private readonly ILikeService _likeService;
        public LikeController(ILikeService likeService)
        {
            _likeService = likeService;
        }
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllLikes()
        {
            var res = await _likeService.GetAllLikesAsync();
            return Ok(res);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateLike([FromBody] LikeRequest like)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var res = await _likeService.CreateLikeAsync(like, userId);
            return Ok(res);
        }
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLikeById(int id)
        {
            var res = await _likeService.GetLikeByIdAsync(id);
            return Ok(res);
        }
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLike(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var res = await _likeService.DeleteLikeAsync(id,userId);
            return Ok(res);
        }
    }
}
