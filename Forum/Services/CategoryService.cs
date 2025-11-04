using Forum2.Data;
using Forum2.Dto;
using Forum2.Implementations;
using Forum2.Models;
using Microsoft.EntityFrameworkCore;

namespace Forum2.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;
        public CategoryService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<CategoryResponse> CreateCategoryAsync(CategoryRequest category)
        {
            var cate = new Category
            {
                Name = category.Name,
                Description = category.Description,
            };
            await _context.Categories.AddAsync(cate);
            await _context.SaveChangesAsync();
            var res = new CategoryResponse
            {
                Id = cate.Id,
                Name = cate.Name,
                Description = cate.Description,
            };
            return res;
            
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var IsNull = await _context.Categories.FindAsync(id);
            if (IsNull == null)
            {
                throw new InvalidOperationException("Category bulunamadi");
            }
            _context.Categories.Remove(IsNull);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync()
        {
            var res = _context.Categories.Select(c => new CategoryResponse
            {
                Description = c.Description,
                Name = c.Name,
                Id = c.Id,
            });
            return res;
        }

        public async Task<CategoryResponse?> GetCategoryByIdAsync(int id)
        {
            var IsNull = await _context.Categories.FindAsync(id);
            if (IsNull == null)
            {
                throw new InvalidOperationException("Category bulunamadi");
            }
            var res = new CategoryResponse
            {
                Description = IsNull.Description,
                Name = IsNull.Name,
                Id = IsNull.Id,
            };
            return res;

        }

        public Task<Category?> UpdateCategoryAsync(int id, Category updatedCategory)
        {
            throw new NotImplementedException();
        }
    }
}
