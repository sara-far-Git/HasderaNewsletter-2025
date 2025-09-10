using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Subscription
{
    public int SubscriptionId { get; set; }

    public int ReaderId { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string? Status { get; set; }

    public virtual Reader Reader { get; set; } = null!;
}
