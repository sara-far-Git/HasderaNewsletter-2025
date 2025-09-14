using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Medium
{
    public int MediaId { get; set; }

    public string Type { get; set; } = null!;

    public string Url { get; set; } = null!;

    public string RelatedTo { get; set; } = null!;

    public int? RelatedId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Analytic> Analytics { get; set; } = new List<Analytic>();
}
