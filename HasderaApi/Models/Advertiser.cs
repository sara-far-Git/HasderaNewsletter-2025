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

    public virtual ICollection<Adorder> Adorders { get; set; } = new List<Adorder>();

    public virtual ICollection<Ad> Ads { get; set; } = new List<Ad>();

    public virtual ICollection<Advertisercontact> Advertisercontacts { get; set; } = new List<Advertisercontact>();

    public virtual ICollection<Package> Packages { get; set; } = new List<Package>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
