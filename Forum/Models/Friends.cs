using System.ComponentModel.DataAnnotations;

namespace Forum2.Models
{
    public class Friends
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public int FriendId { get; set; }
        public User Friend { get; set; }
    }
}
