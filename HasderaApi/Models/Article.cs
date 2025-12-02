using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Article
{
    public int ArticleId { get; set; }

    public int IssueId { get; set; }

    public string Title { get; set; } = null!;

    public string? Author { get; set; }

    public int? CategoryId { get; set; }

    public string Content { get; set; } = null!;

    public bool? IsHighlighted { get; set; }

    public virtual ICollection<AiEmbedding> AiEmbeddings { get; set; } = new List<AiEmbedding>();

    public virtual Category? Category { get; set; }

    public virtual Issue Issue { get; set; } = null!;

    public virtual ICollection<Recommendation> Recommendations { get; set; } = new List<Recommendation>();
}
