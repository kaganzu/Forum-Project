using Forum2.Models;

namespace Forum2.Dto
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
        public int? FriendCount { get; set; }
    }
}
