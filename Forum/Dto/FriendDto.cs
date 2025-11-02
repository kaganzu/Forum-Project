using Forum2.Models;

namespace Forum2.Dto
{
    public class FriendDto
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public int FriendId { get; set; }
        public string FriendName { get; set; }
    }
}
