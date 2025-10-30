using Forum2.Data;
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
        public async Task<Category> CreateCategoryAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();
            return category;
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

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            return await _context.Categories.ToListAsync();
        }

        public async Task<Category?> GetCategoryByIdAsync(int id)
        {
            var IsNull = await _context.Categories.FindAsync(id);
            if (IsNull == null)
            {
                throw new InvalidOperationException("Category bulunamadi");
            }
            return IsNull;

        }

        public Task<Category?> UpdateCategoryAsync(int id, Category updatedCategory)
        {
            throw new NotImplementedException();
        }
    }
}
