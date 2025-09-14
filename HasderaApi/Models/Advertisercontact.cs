using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Advertisercontact
{
    public int ContactId { get; set; }

    public int AdvertiserId { get; set; }

    public string FullName { get; set; } = null!;

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public bool? IsPrimary { get; set; }

    public virtual Advertiser Advertiser { get; set; } = null!;
}
