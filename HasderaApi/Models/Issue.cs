using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Issue
{
    public int IssueId { get; set; }

    public string Title { get; set; } = null!;

    public DateOnly IssueDate { get; set; }

    public string? FileUrl { get; set; }

    public string? Summary { get; set; }

    public virtual ICollection<Ad> Ads { get; set; } = new List<Ad>();

    public virtual ICollection<AiEmbedding> AiEmbeddings { get; set; } = new List<AiEmbedding>();

    public virtual ICollection<Analytic> Analytics { get; set; } = new List<Analytic>();

    public virtual ICollection<Article> Articles { get; set; } = new List<Article>();

    public virtual ICollection<Click> Clicks { get; set; } = new List<Click>();

    public virtual ICollection<Engagement> Engagements { get; set; } = new List<Engagement>();
}
