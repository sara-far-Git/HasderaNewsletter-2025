using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Systemlog
{
    public int LogId { get; set; }

    public string Action { get; set; } = null!;

    public int? UserId { get; set; }

    public DateTime? LogTimestamp { get; set; }

    public string? Details { get; set; }
}
