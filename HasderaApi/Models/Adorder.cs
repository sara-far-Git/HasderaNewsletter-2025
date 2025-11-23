using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Adorder
{
    public int OrderId { get; set; }

    public int AdvertiserId { get; set; }

    public int PackageId { get; set; }

    public DateOnly? OrderDate { get; set; }

    public string? Status { get; set; }

    public virtual ICollection<Adplacement> Adplacements { get; set; } = new List<Adplacement>();

    public virtual Advertiser Advertiser { get; set; } = null!;

    public virtual ICollection<Creative> Creatives { get; set; } = new List<Creative>();

    public virtual Package Package { get; set; } = null!;
}
