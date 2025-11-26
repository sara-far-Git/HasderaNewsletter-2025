namespace HasderaApi.Models;

public class User
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    // רמת ההרשאה
    public string Role { get; set; } = null!;
    // לדוגמה: "User" / "Subscriber" / "Advertiser" / "Admin"
    public string? RefreshToken { get; set; }
    public string GoogleId { get; set; } = null!;
}
