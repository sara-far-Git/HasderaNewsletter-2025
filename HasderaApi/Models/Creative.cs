using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Creative
{
    public int CreativeId { get; set; }

    public int OrderId { get; set; }

    public string? FileUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Adorder Order { get; set; } = null!;
}
