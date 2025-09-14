using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Adplacement
{
    public int AdplacementId { get; set; }

    public int OrderId { get; set; }

    public int SlotId { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public virtual ICollection<Adevent> Adevents { get; set; } = new List<Adevent>();

    public virtual Adorder Order { get; set; } = null!;

    public virtual Slot Slot { get; set; } = null!;
}
