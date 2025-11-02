using Forum2.Models;

namespace Forum2.Dto
{
    public class FriendRequestDto
    {
        public int RequestId { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string SenderUsername { get; set; } = string.Empty;
        public string ReceiverUsername { get; set; } = string.Empty;
        public State IsAccepted { get; set; }
    }
}
