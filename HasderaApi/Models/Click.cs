using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Click
{
    public int ClickId { get; set; }

    public int AdId { get; set; }

    public int? ReaderId { get; set; }

    public int IssueId { get; set; }

    public DateTime? Timestamp { get; set; }

    public string? DeviceType { get; set; }

    public string? Source { get; set; }

    public virtual Ad Ad { get; set; } = null!;

    public virtual Issue Issue { get; set; } = null!;

    public virtual Reader? Reader { get; set; }
}
