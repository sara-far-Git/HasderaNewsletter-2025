﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace HasderaApi.Models;

public partial class Issue
{
    public int IssueId { get; set; }

    public string Title { get; set; } = null!;

  public DateTime IssueDate { get; set; }

    public string? FileUrl { get; set; }
    
[Column("pdf_url")]
public string PdfUrl { get; set; } = string.Empty;

    public string? Summary { get; set; }

    public virtual ICollection<Ad> Ads { get; set; } = new List<Ad>();

    public virtual ICollection<AiEmbedding> AiEmbeddings { get; set; } = new List<AiEmbedding>();

    public virtual ICollection<Analytics> Analytics { get; set; } = new List<Analytics>();

    public virtual ICollection<Article> Articles { get; set; } = new List<Article>();

    public virtual ICollection<Click> Clicks { get; set; } = new List<Click>();

    public virtual ICollection<Engagement> Engagements { get; set; } = new List<Engagement>();

    public virtual ICollection<IssueAdvertiser> IssueAdvertisers { get; set; } = new List<IssueAdvertiser>();
}
