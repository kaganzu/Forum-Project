using Forum2.Models;

namespace Forum2.Dto
{
    public class CommentResponse
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public int PostId { get; set; }
        public string PostTitle { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
    }
}
