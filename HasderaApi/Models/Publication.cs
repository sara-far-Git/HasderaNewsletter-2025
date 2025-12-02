using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Publication
{
    public string? BookTitle { get; set; }

    public long? CreatedDate { get; set; }

    public long? TotalViews { get; set; }
}
