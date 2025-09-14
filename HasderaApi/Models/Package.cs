using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Package
{
    public int PackageId { get; set; }

    public int AdvertiserId { get; set; }

    public string? Name { get; set; }

    public decimal? Price { get; set; }

    public int? SlotsTotal { get; set; }

    public int? SlotsUsed { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public virtual ICollection<Adorder> Adorders { get; set; } = new List<Adorder>();

    public virtual ICollection<Ad> Ads { get; set; } = new List<Ad>();

    public virtual Advertiser Advertiser { get; set; } = null!;
}
