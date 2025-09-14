using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class DailyStat
{
    public string? BookTitle { get; set; }

    public string? Date { get; set; }

    public double? Views { get; set; }
}
