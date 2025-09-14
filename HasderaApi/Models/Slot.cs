using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Slot
{
    public int SlotId { get; set; }

    public string Code { get; set; } = null!;

    public string Name { get; set; } = null!;

    public decimal? BasePrice { get; set; }

    public bool? IsExclusive { get; set; }

    public virtual ICollection<Adplacement> Adplacements { get; set; } = new List<Adplacement>();
}
