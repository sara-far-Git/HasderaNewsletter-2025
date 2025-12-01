using Google.Apis.Auth;

public static class GoogleTokenValidator
{
    public static async Task<GoogleJsonWebSignature.Payload?> Validate(string idToken)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new List<string> 
                { 
                    "953905721700-7f0m0fa230frft4l4ff0hkj20e5q04j5.apps.googleusercontent.com" 
                }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            return payload;
        }
        catch
        {
            return null;
        }
    }
}
