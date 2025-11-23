using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class IssueAdvertiser
{
    public int IssueAdvertiserId { get; set; }

    public int IssueId { get; set; }

    public int AdvertiserPackageId { get; set; }

    public string? AdFileUrl { get; set; }

    public virtual AdvertiserPackage AdvertiserPackage { get; set; } = null!;

    public virtual Issue Issue { get; set; } = null!;
}
