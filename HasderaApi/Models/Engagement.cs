using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Engagement
{
    public int EngagementId { get; set; }

    public int ReaderId { get; set; }

    public int IssueId { get; set; }

    public string? Type { get; set; }

    public DateTime? Timestamp { get; set; }

    public virtual Issue Issue { get; set; } = null!;

    public virtual Reader Reader { get; set; } = null!;
}
