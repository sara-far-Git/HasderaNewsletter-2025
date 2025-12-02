using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Adevent
{
    public int AdeventId { get; set; }

    public int AdplacementId { get; set; }

    public string EventType { get; set; } = null!;

    public DateTime? EventTime { get; set; }

    public virtual Adplacement Adplacement { get; set; } = null!;
}
