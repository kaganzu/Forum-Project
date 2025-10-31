using Forum2.Data;
using Forum2.Implementations;
using Forum2.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Forum2.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IUserService _userService;
        private readonly PasswordHasher<User> _passwordHasher = new();
        public AuthService(AppDbContext context)
        {
            _context = context;
            _userService = new UserService(_context);
        }
        public async Task<string?> LoginAsync(string usernameOrEmail, string password)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == usernameOrEmail || u.Email == usernameOrEmail);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }
            var verificationResult = _passwordHasher.VerifyHashedPassword(user,user.PasswordHash, password);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                throw new UnauthorizedAccessException("Invalid password");
            }
            return "Login success";
        }

        public async Task<string?> RegisterAsync(string username, string email, string password, string confirmPassword)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Username == username || u.Email == email);
            if (userExists)
            {
                throw new InvalidOperationException("User already exists");
            }
            if (password != confirmPassword)
            {
                throw new ArgumentException("Passwords do not match");
            }
            var user = new User
            {
                Username = username,
                Email =  email
                //user.PasswordHash will be set after hashing because we need the user object for hashing
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, password);

            await _userService.CreateUserAsync(user);
            return "Register success";
        }
    }
}
