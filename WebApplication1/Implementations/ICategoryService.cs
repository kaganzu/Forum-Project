using Forum2.Models;

namespace Forum2.Implementations
{
    public interface ICategoryService
    {
        //CRUD işlemleri
        Task<Category> CreateCategoryAsync(Category category);//create
        Task<IEnumerable<Category>> GetAllCategoriesAsync();//read
        Task<Category?> GetCategoryByIdAsync(int id);//read
        Task<Category?> UpdateCategoryAsync(int id, Category updatedCategory);//update
        Task<bool> DeleteCategoryAsync(int id);//delete
    }
}
