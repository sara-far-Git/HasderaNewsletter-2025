using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Chatbotlog
{
    public int LogId { get; set; }

    public string? UserType { get; set; }

    public int? UserId { get; set; }

    public string Question { get; set; } = null!;

    public string Answer { get; set; } = null!;

    public DateTime? LogTimestamp { get; set; }
}
