/**
 * LoginPage.jsx
 * דף התחברות והרשמה עם עיצוב יפה
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle, keyframes, css } from "styled-components";
import { Mail, Lock, User, Eye, EyeOff, BookOpen } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { login, register, loginWithGoogle } from "../Services/Login";
import { useAuth } from "../contexts/AuthContext";
import { DEV_CREDENTIALS, ENABLE_DEV_LOGIN } from "../config/devCredentials";
import hasederaTheme from "../styles/HasederaTheme";

// 🎬 אנימציות
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// 🎨 גופנים גלובליים - נטען דרך index.html
const GlobalFonts = createGlobalStyle`
  /* Fonts are loaded via <link> tag in index.html */
`;

// 🎨 Container
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("/image/ChatGPT Image Nov 16, 2025, 08_56_06 PM.png");
    background-size: cover;
    background-position: center;
    opacity: 0.15;
    z-index: 0;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${hasederaTheme.borderRadius['2xl']};
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
  direction: rtl;
  animation: ${scaleIn} 0.6s ease-out;

  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    padding: 2rem 1.5rem;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const LogoIcon = styled.div`
  display: inline-flex;
  padding: 1rem;
  background: ${hasederaTheme.colors.gradient.primary};
  border-radius: ${hasederaTheme.borderRadius.full};
  margin-bottom: 1rem;
  box-shadow: ${hasederaTheme.shadows.green};
  animation: ${scaleIn} 0.6s ease-out 0.2s both;
`;

const LogoText = styled.h1`
  font-family: ${hasederaTheme.typography.fontFamily?.heading || "'Cormorant Garamond', serif"};
  font-size: 2.5rem;
  font-weight: 300;
  color: ${hasederaTheme.colors.text.primary};
  letter-spacing: 3px;
  margin: 0;
  animation: ${fadeInUp} 0.6s ease-out 0.4s both;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  animation: ${fadeInUp} 0.6s ease-out 0.5s both;
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${props => props.$active ? hasederaTheme.typography.fontWeight.semibold : hasederaTheme.typography.fontWeight.normal};
  color: ${props => props.$active ? hasederaTheme.colors.primary.main : hasederaTheme.colors.text.secondary};
  cursor: pointer;
  position: relative;
  transition: ${hasederaTheme.transitions.base};
  font-family: inherit;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    right: 0;
    left: 0;
    height: 2px;
    background: ${hasederaTheme.colors.primary.main};
    transform: ${props => props.$active ? 'scaleX(1)' : 'scaleX(0)'};
    transition: transform 0.3s ease;
  }

  &:hover {
    color: ${hasederaTheme.colors.primary.main};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${fadeInUp} 0.6s ease-out 0.6s both;
`;

const InputWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== '$delay',
})`
  position: relative;
  animation: ${slideInRight} 0.5s ease-out ${props => props.$delay || 0}s both;
`;

const InputIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${hasederaTheme.colors.text.secondary};
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  
  svg {
    display: block;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: ${hasederaTheme.borderRadius.lg};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-family: inherit;
  transition: ${hasederaTheme.transitions.base};
  background: white;

  &:focus {
    outline: none;
    border-color: ${hasederaTheme.colors.primary.main};
    box-shadow: 0 0 0 3px ${hasederaTheme.colors.primary.main}33;
  }

  &::placeholder {
    color: ${hasederaTheme.colors.text.secondary};
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${hasederaTheme.colors.text.secondary};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${hasederaTheme.transitions.base};

  &:hover {
    color: ${hasederaTheme.colors.primary.main};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: ${hasederaTheme.borderRadius.lg};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-family: inherit;
  background: white;
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};

  ${props => props.$delay != null && css`
    animation: ${slideInRight} 0.5s ease-out ${props.$delay}s both;
  `}

  &:focus {
    outline: none;
    border-color: ${hasederaTheme.colors.primary.main};
    box-shadow: 0 0 0 3px ${hasederaTheme.colors.primary.main}33;
  }
`;

const SubmitButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== '$delay',
})`
  width: 100%;
  padding: 1rem;
  background: ${hasederaTheme.colors.gradient.primary};
  color: white;
  border: none;
  border-radius: ${hasederaTheme.borderRadius.lg};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  font-family: inherit;
  box-shadow: ${hasederaTheme.shadows.green};
  animation: ${fadeInUp} 0.5s ease-out ${props => props.$delay || 0.9}s both;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${hasederaTheme.shadows.greenHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
  color: ${hasederaTheme.colors.text.secondary};
  font-size: ${hasederaTheme.typography.fontSize.sm};

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(0, 0, 0, 0.1);
  }

  ${props => props.$delay != null && css`
    animation: ${fadeIn} 0.5s ease-out ${props.$delay}s both;
  `}
`;

const GoogleButton = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;

  ${props => props.$delay != null && css`
    animation: ${fadeInUp} 0.5s ease-out ${props.$delay}s both;
  `}
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: ${hasederaTheme.borderRadius.lg};
  text-align: center;
  font-size: ${hasederaTheme.typography.fontSize.sm};
  margin-top: 1rem;
  background: ${props => props.$error 
    ? 'rgba(239, 68, 68, 0.1)' 
    : 'rgba(16, 185, 129, 0.1)'};
  color: ${props => props.$error 
    ? hasederaTheme.colors.status.error 
    : hasederaTheme.colors.primary.main};
  border: 1px solid ${props => props.$error 
    ? 'rgba(239, 68, 68, 0.3)' 
    : 'rgba(16, 185, 129, 0.3)'};
`;

// 🎨 הודעה אישית עם אנימציה
const SuccessMessage = styled.div`
  padding: 2rem;
  border-radius: ${hasederaTheme.borderRadius['2xl']};
  text-align: center;
  margin-top: 1rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
  border: 2px solid rgba(16, 185, 129, 0.3);
  animation: ${props => props.$fadeIn ? fadeInUp : 'none'} 0.5s ease-out;
`;

const SuccessTitle = styled.div`
  font-family: ${hasederaTheme.typography.fontFamily?.heading || "'Cormorant Garamond', serif"};
  font-size: 1.8rem;
  font-weight: 500;
  color: ${hasederaTheme.colors.primary.main};
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
`;

const SuccessSubtitle = styled.div`
  font-size: ${hasederaTheme.typography.fontSize.base};
  color: ${hasederaTheme.colors.text.secondary};
  margin-top: 0.5rem;
`;

// 🔧 כפתורי כניסה מהירה לפיתוח
const DevLoginSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px dashed rgba(0, 0, 0, 0.1);
`;

const DevTitle = styled.div`
  font-size: ${hasederaTheme.typography.fontSize.sm};
  color: ${hasederaTheme.colors.text.secondary};
  margin-bottom: 1rem;
  text-align: center;
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
`;

const DevButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DevButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: ${hasederaTheme.borderRadius.lg};
  font-size: ${hasederaTheme.typography.fontSize.sm};
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  font-family: inherit;
  color: ${hasederaTheme.colors.text.primary};

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    border-color: ${hasederaTheme.colors.primary.main};
  }
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Advertiser"); // ברירת מחדל - מפרסמת
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [userName, setUserName] = useState("");
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
  const [pendingGoogleProfile, setPendingGoogleProfile] = useState(null);

  // אם כבר מחובר, ניתוב לפי Role
  useEffect(() => {
    if (isAuthenticated) {
      const userStr = localStorage.getItem('hasdera_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        redirectByRole(user.role);
      }
    }
  }, [isAuthenticated]);

  // הפניה לפי תפקיד המשתמש
  const redirectByRole = (userRole) => {
    if (userRole === 'Admin' || userRole === 'admin') {
      // מנהלים מועברים לאזור הניהול
      navigate('/admin');
    } else if (userRole === 'Advertiser') {
      // מפרסמים מועברים לדף הבית
      navigate('/');
    } else if (userRole === 'Reader') {
      // קוראים מועברים לדף הגליונות
      navigate('/issues');
    } else {
      // משתמשים אחרים מועברים לדף הבית
      navigate('/');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");
    setMsgType("");
    setShowSuccess(false);
    
    try {
      const { token, user } = await login(email, password);
      
      // הצגת הודעה אישית
      setUserName(user.fullName || user.email?.split('@')[0] || "משתמש");
      setShowSuccess(true);
      setMsgType("success");
      
      authLogin(token, user);
      
      // העברה אחרי 2 שניות
      setTimeout(() => {
        redirectByRole(user.role);
      }, 2000);
    } catch (err) {
      let errorMsg = "שגיאה בהתחברות";

      // שגיאות timeout/network - כבר מעוצבות ב-Login.js
      if (err.isTimeout || err.isNetwork) {
        errorMsg = err.message;
      } else if (err.response?.data) {
        const responseData = err.response.data;
        if (typeof responseData === 'object' && responseData.error) {
          errorMsg = responseData.error;
          if (responseData.details && responseData.details !== responseData.error) {
            errorMsg += `: ${responseData.details}`;
          }
        } else if (typeof responseData === 'string') {
          errorMsg = responseData;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      setMsg(errorMsg);
      setMsgType("error");
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");
    setMsgType("");
    setShowSuccess(false);
    
    try {
      const { token, user } = await register(fullName, email, password, role);
      
      // הצגת הודעה אישית
      setUserName(user.fullName || user.email?.split('@')[0] || "משתמש");
      setShowSuccess(true);
      setMsgType("success");
      
      authLogin(token, user);
      
      // העברה אחרי 2 שניות
      setTimeout(() => {
        redirectByRole(user.role);
      }, 2000);
    } catch (err) {
      let errorMsg = "שגיאה בהרשמה";

      // שגיאות timeout/network - כבר מעוצבות ב-Login.js
      if (err.isTimeout || err.isNetwork) {
        errorMsg = err.message;
      } else if (err.response?.data) {
        const responseData = err.response.data;
        if (typeof responseData === 'object' && responseData.error) {
          errorMsg = responseData.error;
          if (responseData.details && responseData.details !== responseData.error) {
            errorMsg += `: ${responseData.details}`;
          }
        } else if (typeof responseData === 'string') {
          errorMsg = responseData;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      setMsg(errorMsg);
      setMsgType("error");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    setMsg("");
    setMsgType("");
    setShowSuccess(false);

    try {
      if (!credentialResponse || !credentialResponse.credential) {
        throw new Error("לא התקבל טוקן מגוגל");
      }

      const idToken = credentialResponse.credential;
      console.log("Google token received, length:", idToken.length);
      
      const response = await loginWithGoogle(idToken);

      if (response?.needsRoleSelection) {
        setPendingGoogleToken(idToken);
        setPendingGoogleProfile({ email: response.email, fullName: response.fullName });
        setMsg("בחרי סוג חשבון כדי להמשיך");
        setMsgType("info");
        setIsLoading(false);
        return;
      }

      const { token, user } = response;

      // בדיקה שהמשתמש הוא מפרסם או מנהל (רק אם זה לא reader mode)
      const isReaderMode = window.location.hostname.includes('hasdera-magazine.co.il') || 
                          window.location.hostname.includes('hasderanewsletter-2025.pages.dev');
      
      if (!isReaderMode && user.role !== 'Advertiser' && user.role !== 'Admin' && user.role !== 'admin') {
        setMsg("רק מפרסמים ומנהלים יכולים להיכנס למערכת");
        setMsgType("error");
        setIsLoading(false);
        return;
      }
      
      // הצגת הודעה אישית
      setUserName(user.fullName || user.email?.split('@')[0] || "משתמש");
      setShowSuccess(true);
      setMsgType("success");

      authLogin(token, user);

      // העברה אחרי 2 שניות
      setTimeout(() => {
        redirectByRole(user.role);
      }, 2000);
    } catch (err) {
      let errorMsg = "שגיאה בהתחברות עם גוגל";

      // שגיאות timeout/network - כבר מעוצבות ב-Login.js
      if (err.isTimeout || err.isNetwork) {
        errorMsg = err.message;
      } else if (err.response) {
        // שגיאה מהשרת
        const responseData = err.response.data;

        if (responseData && typeof responseData === 'object') {
          if (responseData.error) {
            errorMsg = responseData.error;
            if (responseData.details && responseData.details !== responseData.error) {
              errorMsg += `: ${responseData.details}`;
            }
          }
        } else if (typeof responseData === 'string') {
          errorMsg = responseData;
        } else {
          errorMsg = err.response.statusText || `שגיאת שרת: ${err.response.status}`;
        }

        console.error("Server error:", err.response.status, err.response.data);
      } else if (err.message) {
        errorMsg = err.message;
        console.error("Local error:", err.message);
      }

      setMsg(errorMsg);
      setMsgType("error");
      setIsLoading(false);
      console.error("Full Google login error:", err);
    }
  };

  const handleGoogleRoleSelect = async (selectedRole) => {
    if (!pendingGoogleToken) return;
    setIsLoading(true);
    setMsg("");
    setMsgType("");
    setShowSuccess(false);
    try {
      const { token, user } = await loginWithGoogle(pendingGoogleToken, selectedRole);
      setUserName(user.fullName || user.email?.split('@')[0] || "משתמש");
      setShowSuccess(true);
      setMsgType("success");
      setPendingGoogleToken(null);
      setPendingGoogleProfile(null);
      authLogin(token, user);
      setTimeout(() => {
        redirectByRole(user.role);
      }, 1500);
    } catch (err) {
      let errorMsg = "שגיאה בהשלמת ההתחברות";
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      setMsg(errorMsg);
      setMsgType("error");
      setIsLoading(false);
    }
  };

  // כניסה מהירה לפיתוח - לא ממלא את השדות, רק מתחבר ישירות
  const handleDevLogin = async (credType) => {
    const creds = DEV_CREDENTIALS[credType];
    if (!creds) return;
    
    setIsLoading(true);
    setMsg("");
    setMsgType("");
    setShowSuccess(false);
    
    try {
      const { token, user } = await login(creds.email, creds.password);
      
      // הצגת הודעה אישית
      setUserName(user.fullName || user.email?.split('@')[0] || "משתמש");
      setShowSuccess(true);
      setMsgType("success");
      
      authLogin(token, user);
      
      // העברה אחרי 2 שניות
      setTimeout(() => {
        redirectByRole(user.role);
      }, 2000);
    } catch (err) {
      setMsg("שגיאה בהתחברות מהירה. ודאי שהמשתמש קיים במערכת.");
      setMsgType("error");
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalFonts />
      <PageContainer>
        <Card>
          <Logo>
            <LogoIcon>
              <BookOpen size={32} color="white" />
            </LogoIcon>
            <LogoText>השדרה</LogoText>
          </Logo>

          {pendingGoogleToken && (
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <div style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>
                בחרי סוג חשבון כדי להמשיך
              </div>
              {pendingGoogleProfile?.email && (
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  {pendingGoogleProfile.email}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <SubmitButton type="button" onClick={() => handleGoogleRoleSelect('Advertiser')} disabled={isLoading}>
                  מפרסמת
                </SubmitButton>
                <SubmitButton type="button" onClick={() => handleGoogleRoleSelect('Reader')} disabled={isLoading}>
                  קוראת
                </SubmitButton>
              </div>
            </div>
          )}

          <Tabs>
            <Tab 
              $active={mode === "login"} 
              onClick={() => { 
                setMode("login"); 
                setMsg(""); 
                setEmail(""); 
                setPassword(""); 
                setFullName(""); 
              }}
            >
              התחברות
            </Tab>
            <Tab 
              $active={mode === "register"} 
              onClick={() => { 
                setMode("register"); 
                setMsg(""); 
                setEmail(""); 
                setPassword(""); 
                setFullName(""); 
              }}
            >
              הרשמה
            </Tab>
          </Tabs>

          {mode === "login" && !showSuccess && (
            <Form onSubmit={handleLogin}>
              <InputWrapper $delay={0.7}>
                <InputIcon>
                  <Mail size={20} />
                </InputIcon>
                <Input
                  type="email"
                  placeholder="מייל"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </InputWrapper>

              <InputWrapper $delay={0.8}>
                <InputIcon>
                  <Lock size={20} />
                </InputIcon>
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </PasswordToggle>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </InputWrapper>

              <SubmitButton type="submit" disabled={isLoading} $delay={0.9}>
                {isLoading ? "מתחברת..." : "התחברות"}
              </SubmitButton>
            </Form>
          )}

          {mode === "register" && !showSuccess && (
            <Form onSubmit={handleRegister}>
              <InputWrapper $delay={0.7}>
                <InputIcon>
                  <User size={20} />
                </InputIcon>
                <Input
                  type="text"
                  placeholder="שם מלא"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="off"
                  required
                />
              </InputWrapper>

              <InputWrapper $delay={0.8}>
                <InputIcon>
                  <Mail size={20} />
                </InputIcon>
                <Input
                  type="email"
                  placeholder="מייל"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </InputWrapper>

              <InputWrapper $delay={0.9}>
                <InputIcon>
                  <Lock size={20} />
                </InputIcon>
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </PasswordToggle>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </InputWrapper>

              <Select value={role} onChange={(e) => setRole(e.target.value)} $delay={1}>
                <option value="Advertiser">מפרסמת</option>
              </Select>

              <SubmitButton type="submit" disabled={isLoading} $delay={1.1}>
                {isLoading ? "נרשמת..." : "הרשמה"}
              </SubmitButton>
            </Form>
          )}

          {!showSuccess && (
            <>
              <Divider $delay={1.1}>או</Divider>

              <GoogleButton $delay={1.2}>
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    setMsg("שגיאה בהתחברות עם גוגל");
                    setMsgType("error");
                  }}
                  theme="filled_black"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                />
              </GoogleButton>
            </>
          )}

          {showSuccess && msgType === "success" ? (
            <SuccessMessage $fadeIn={true}>
              <SuccessTitle>שלום {userName}! 👋</SuccessTitle>
              <SuccessSubtitle>מעבירים אותך לדף הבית...</SuccessSubtitle>
            </SuccessMessage>
          ) : msg && (
            <Message $error={msgType === "error"}>{msg}</Message>
          )}

          {/* כפתורי כניסה מהירה לפיתוח */}
          {ENABLE_DEV_LOGIN && !showSuccess && (
            <DevLoginSection>
              <DevTitle>🔧 כניסה מהירה (פיתוח בלבד - מפרסמים בלבד)</DevTitle>
              <DevButtons>
                <DevButton onClick={() => handleDevLogin('advertiser')}>
                  📢 מפרסמת
                </DevButton>
              </DevButtons>
            </DevLoginSection>
          )}
        </Card>
      </PageContainer>
    </>
  );
}

