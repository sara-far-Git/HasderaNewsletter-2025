using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Recommendation
{
    public int RecommendationId { get; set; }

    public int? ReaderId { get; set; }

    public int? ArticleId { get; set; }

    public decimal Score { get; set; }

    public DateTime? GeneratedAt { get; set; }

    public virtual Article? Article { get; set; }
}
