using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Ad
{
    public int AdId { get; set; }

    public int AdvertiserId { get; set; }

    public int IssueId { get; set; }

    public int PackageId { get; set; }

    public string? Placement { get; set; }

    public string? MediaUrl { get; set; }

    public string? Status { get; set; }

    public virtual Advertiser Advertiser { get; set; } = null!;

    public virtual ICollection<Click> Clicks { get; set; } = new List<Click>();

    public virtual Issue Issue { get; set; } = null!;

    public virtual Package Package { get; set; } = null!;
}
