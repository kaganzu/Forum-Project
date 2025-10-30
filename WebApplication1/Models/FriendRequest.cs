namespace Forum2.Models
{
    public class FriendRequest
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public User Sender { get; set; }
        public int ReceiverId { get; set; }
        public User Receiver { get; set; }
        public DateTime SentAt { get; set; } = DateTime.Now;
        public State IsAccepted { get; set; } = State.Pending;
    }
    public enum State
    {
        Pending,
        Accepted,
        Rejected
    }
}