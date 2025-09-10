using System;
using System.Collections.Generic;

namespace HasderaApi.Models;

public partial class Adminuser
{
    public int AdminId { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Role { get; set; } = null!;
}
