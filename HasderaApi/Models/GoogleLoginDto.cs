using System.Text.Json.Serialization;

namespace HasderaApi.Models
{
    public class GoogleLoginDto
    {
        [JsonPropertyName("idToken")]
        public required string idToken { get; set; }

        [JsonPropertyName("role")]
        public string? role { get; set; }
    }
}
