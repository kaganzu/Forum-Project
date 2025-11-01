using Forum2.Models;

namespace Forum2.Implementations
{
    public interface IAuthService
    {
        Task<User?> LoginAsync(string usernameOrEmail, string password);
        Task<string?> RegisterAsync(string username, string email, string password, string confirmPassword);
    }
}
