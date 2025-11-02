using System.ComponentModel.DataAnnotations;

namespace Forum2.Dto
{
    public class LoginRequest
    {
        [Required]
        public string UsernameOrEmail { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
