using Forum2.Models;

namespace Forum2.Dto
{
    public class LikeResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public int PostId { get; set; }
        public string PostTitle { get; set; }
    }
}
