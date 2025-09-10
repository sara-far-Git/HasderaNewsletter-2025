using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Reader
{
    public int ReaderId { get; set; }

    public string Name { get; set; } = null!;

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public DateOnly? SignupDate { get; set; }

    public string? Preferences { get; set; }

    public virtual ICollection<Click> Clicks { get; set; } = new List<Click>();

    public virtual ICollection<Engagement> Engagements { get; set; } = new List<Engagement>();

    public virtual ICollection<Newsletter> Newsletters { get; set; } = new List<Newsletter>();

    public virtual ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}
