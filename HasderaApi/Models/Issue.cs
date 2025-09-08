namespace HasderaApi.Models
{
    public class Issue
    {
        public int IssueId { get; set; }
        public string Title { get; set; }
        public DateTime IssueDate { get; set; }
        public string FileUrl { get; set; }
        public string Summary { get; set; }
    }
}
