using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Analytic
{
    public int AnalyticsId { get; set; }

    public int? AdId { get; set; }

    public int? IssueId { get; set; }

    public int? ClicksTotal { get; set; }

    public int? UniqueReaders { get; set; }

    public decimal? Ctr { get; set; }

    public DateOnly ReportDate { get; set; }

    public virtual Medium? Ad { get; set; }

    public virtual Issue? Issue { get; set; }
}
