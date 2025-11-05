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
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryRequest request)
        {
            var IsAdmin = User.IsInRole("Admin");
            var IsModerator = User.IsInRole("Moderator");
            if (!IsAdmin && !IsModerator)
            {
                return Forbid();
            }
            var res = await _categoryService.CreateCategoryAsync(request);
            return Ok(res);
        }
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var res = await _categoryService.GetAllCategoriesAsync();
            return Ok(res);
        }
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var res = await _categoryService.GetCategoryByIdAsync(id);
            return Ok(res);
        }
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var IsAdmin = User.IsInRole("Admin");
            var IsModerator = User.IsInRole("Moderator");
            if (!IsAdmin && IsModerator)
            {
                return Forbid();
            }
            await _categoryService.DeleteCategoryAsync(id);
            return Ok("deleted");
        }
    }
}
