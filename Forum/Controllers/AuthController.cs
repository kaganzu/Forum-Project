using Forum2.Implementations;
using Forum2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Forum2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (req.Password != req.ConfirmPassword)
            {
                return BadRequest(new { message = "Passwords do not match." });
            }
            
            await _authService.RegisterAsync(req.Username,req.Email,req.Password,req.ConfirmPassword);
            return Ok(new { message = "User registered successfully." });

        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            await _authService.LoginAsync(req.UsernameOrEmail, req.Password);
            return Ok(new { message = "Login successful." });
        }
    }
}
