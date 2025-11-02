using Forum2.Dto;
using Forum2.Implementations;
using Forum2.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Forum2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly JwtService _jwtService;
        public AuthController(IAuthService authService,JwtService jwtService)
        {
            _authService = authService;
            _jwtService = jwtService;
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
                throw new Exception("Invalid model state");
            }
            var user = await _authService.LoginAsync(req.UsernameOrEmail, req.Password);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username/email or password." });
            }
            string Token = _jwtService.CreateJwtToken(user); 
            return Ok(new 
            { 
                message = "Login successful.",
                token = Token
            });
        }
    }
}
