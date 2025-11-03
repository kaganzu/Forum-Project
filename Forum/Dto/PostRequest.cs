namespace Forum2.Dto
{
    public class PostRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public List<int?> CategoryIds { get; set; }
    }
}
