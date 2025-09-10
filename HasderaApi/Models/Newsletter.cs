using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Newsletter
{
    public int NewsletterId { get; set; }

    public int ReaderId { get; set; }

    public bool? Subscribed { get; set; }

    public DateOnly? UnsubscribedDate { get; set; }

    public virtual Reader Reader { get; set; } = null!;
}
