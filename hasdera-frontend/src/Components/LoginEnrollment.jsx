// src/Components/Login&enrollment.jsx
import { useState } from "react";
import {
  login,
  register,
  forgotPassword,
} from "../Services/Login";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "../Services/Login";

export default function LoginAndEnrollment({ onLoggedIn }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Subscriber");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");
    try {
      const { token, user } = await login(email, password);
      localStorage.setItem("hasdera_token", token);
      localStorage.setItem("hasdera_user", JSON.stringify(user));
      onLoggedIn && onLoggedIn(user);
      setMsg("התחברת בהצלחה");
    } catch (err) {
      setMsg(err.response?.data || "שגיאה בהתחברות");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");
    try {
      const { token, user } = await register(fullName, email, password, role);
      localStorage.setItem("hasdera_token", token);
      localStorage.setItem("hasdera_user", JSON.stringify(user));
      onLoggedIn && onLoggedIn(user);
      setMsg("נרשמת והתחברת בהצלחה");
    } catch (err) {
      setMsg(err.response?.data || "שגיאה בהרשמה");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");
    try {
      await forgotPassword(email);
      setMsg("אם המייל קיים במערכת נשלח אלייך קישור לאיפוס סיסמה");
    } catch {
      setMsg("שגיאה");
    } finally {
      setIsLoading(false);
    }
  };

  // דוגמה לגוגל – כאן את תשלבי את Google Identity ותקבלי idToken
  const handleGoogleLogin = async (idToken) => {
    try {
      const { token, user } = await loginWithGoogle(idToken);
      localStorage.setItem("hasdera_token", token);
      localStorage.setItem("hasdera_user", JSON.stringify(user));
      onLoggedIn && onLoggedIn(user);
    } catch (err) {
      setMsg("שגיאה בהתחברות עם גוגל");
    }
  };

  return (
    <div className="login-page">
      <div className="tabs">
        <button onClick={() => setMode("login")}>התחברות</button>
        <button onClick={() => setMode("register")}>הרשמה</button>
        <button onClick={() => setMode("forgot")}>שכחתי סיסמה</button>
      </div>

      {mode === "login" && (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="מייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button disabled={isLoading}>התחברות</button>
        </form>
      )}

      {mode === "register" && (
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="שם מלא"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="email"
            placeholder="מייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Subscriber">מנויה</option>
            <option value="Advertiser">מפרסמת</option>
            <option value="Admin">מנהל/ת</option>
          </select>
          <button disabled={isLoading}>הרשמה</button>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={handleForgot}>
          <input
            type="email"
            placeholder="מייל לאיפוס סיסמה"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button disabled={isLoading}>שליחת קישור איפוס</button>
        </form>
      )}
<GoogleLogin
    onSuccess={async credentialResponse => {
        const idToken = credentialResponse.credential;
        const result = await loginWithGoogle(idToken);
        localStorage.setItem("hasdera_token", result.token);
        localStorage.setItem("hasdera_user", JSON.stringify(result.user));
        window.location.reload();
    }}
    onError={() => {
        console.log("Google Login Failed");
    }}
/>
      {msg && <p>{msg}</p>}
    </div>
  );
}
