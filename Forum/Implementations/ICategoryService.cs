using Forum2.Dto;
using Forum2.Models;

namespace Forum2.Implementations
{
    public interface ICategoryService
    {
        //CRUD işlemleri
        Task<CategoryResponse> CreateCategoryAsync(CategoryRequest category);//create
        Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync();//read
        Task<CategoryResponse?> GetCategoryByIdAsync(int id);//read
        Task<Category?> UpdateCategoryAsync(int id, Category updatedCategory);//update
        Task<bool> DeleteCategoryAsync(int id);//delete
    }
}
