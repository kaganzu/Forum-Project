using Forum2.Models;

namespace Forum2.Dto
{
    public class PostResponse
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public int UserId { get; set; }
        public string Username { get; set; }
        public List<string> Categories { get; set; }
        public int LikeCount {  get; set; }
        //public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        //public ICollection<Like> Likes { get; set; } = new List<Like>();
    }
}
