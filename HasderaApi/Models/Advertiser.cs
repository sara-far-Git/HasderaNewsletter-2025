using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Advertiser
{
    public int AdvertiserId { get; set; }

    public string Name { get; set; } = null!;

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string? Company { get; set; }

    public DateOnly? JoinDate { get; set; }

    public virtual ICollection<Ad> Ads { get; set; } = new List<Ad>();

    public virtual ICollection<Package> Packages { get; set; } = new List<Package>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
