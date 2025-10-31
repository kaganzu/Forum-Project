using System.ComponentModel.DataAnnotations;

namespace Forum2.Models
{
    public class LoginRequest
    {
        [Required]
        public string UsernameOrEmail { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
