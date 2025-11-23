using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class AdvertiserPackage
{
    public int AdvertiserPackageId { get; set; }

    public int AdvertiserId { get; set; }

    public int PackageId { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public virtual Advertiser Advertiser { get; set; } = null!;

    public virtual ICollection<IssueAdvertiser> IssueAdvertisers { get; set; } = new List<IssueAdvertiser>();

    public virtual Package Package { get; set; } = null!;
}
