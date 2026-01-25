/**
 * Dashboard.jsx
 * עמוד ניווט ראשי מעוצב - אזור מפרסמים
 * מגיעים לכאן אחרי לחיצה על "התחילי עכשיו" בדף הבית
 */

import React, { useState, useEffect } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { 
  Book, 
  MapPin, 
  CreditCard, 
  BarChart3, 
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Eye,
  Calendar,
  ArrowLeft,
  Users,
  MessageCircle,
  Settings,
  HelpCircle,
  Image as ImageIcon,
  Clock,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAdvertiserDashboard } from "../Services/Login";
import AdvertiserChat from "./AdvertiserChat";
import hasederaTheme from "../styles/HasederaTheme";

// 🎨 גופנים - נטען דרך index.html
const GlobalFonts = createGlobalStyle`
  /* Fonts are loaded via <link> tag in index.html */
`;

// 🎬 אנימציות
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// 🎨 רקע עם תמונה
const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
`;

const BackgroundImage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("/image/ChatGPT Image Nov 16, 2025, 08_56_06 PM.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(26, 26, 26, 0.92) 0%,
      rgba(26, 26, 26, 0.85) 50%,
      rgba(26, 26, 26, 0.92) 100%
    );
  }
`;

// 🎨 תוכן ראשי
const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// 🎨 Header
const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Logo = styled.div`
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.5rem;
  font-weight: 300;
  color: white;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #10b981;
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: #10b981;
    color: #10b981;
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateX(4px);
  }
`;

// 🎨 Welcome Section
const WelcomeSection = styled.div`
  max-width: 1200px;
  margin: 0 auto 4rem;
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const WelcomeTitle = styled.h1`
  font-family: 'Cormorant Garamond', serif;
  font-size: 3.5rem;
  font-weight: 300;
  color: white;
  margin-bottom: 1rem;
  letter-spacing: 2px;
  
  span {
    color: #10b981;
  }
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.8;
`;

// 🎨 Stats Bar
const StatsBar = styled.div`
  max-width: 1200px;
  margin: 0 auto 4rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
  
  @media (max-width: 968px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: block;
  }
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem;
  font-weight: 600;
  color: white;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
`;

// 🎨 Navigation Cards Grid
const CardsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const NavCard = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2.5rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: ${props => props.$delay || '0s'};
  animation-fill-mode: both;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, #10b981, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(16, 185, 129, 0.4);
    transform: translateY(-8px);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 60px rgba(16, 185, 129, 0.1);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:hover ${props => props.$iconClass} {
    transform: scale(1.1);
  }
`;

const CardIcon = styled.div`
  width: 72px;
  height: 72px;
  background: ${props => props.$gradient || 'linear-gradient(135deg, #10b981 0%, #059669 100%)'};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1.5rem;
  transition: all 0.4s ease;
  box-shadow: 0 8px 24px ${props => props.$shadow || 'rgba(16, 185, 129, 0.3)'};
  
  svg {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: block;
  }
`;

const CardTitle = styled.h3`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem;
  font-weight: 500;
  color: white;
  margin-bottom: 0.75rem;
  letter-spacing: 1px;
`;

const CardDescription = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  margin-bottom: 1.5rem;
`;

const CardAction = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-size: 0.95rem;
  font-weight: 500;
  
  svg {
    transition: transform 0.3s ease;
  }
  
  ${NavCard}:hover & svg {
    transform: translateX(-4px);
  }
`;

const CardBadge = styled.span`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  padding: 0.4rem 1rem;
  background: ${props => props.$type === 'new' 
    ? 'linear-gradient(135deg, #10b981, #059669)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 50px;
  letter-spacing: 1px;
`;

// 🎨 Quick Links Section
const QuickLinksSection = styled.div`
  max-width: 1200px;
  margin: 4rem auto 0;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.9s;
  animation-fill-mode: both;
`;

const SectionTitle = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 300;
  color: white;
  margin-bottom: 1.5rem;
  letter-spacing: 1px;
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const QuickLink = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: white;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: right;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(16, 185, 129, 0.4);
    
    svg {
      color: #10b981;
    }
  }
  
  svg {
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
  }
`;

// 🎨 Footer
const Footer = styled.footer`
  max-width: 1200px;
  margin: 4rem auto 0;
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  animation: ${fadeIn} 0.8s ease-out;
  animation-delay: 1s;
  animation-fill-mode: both;
`;

const FooterText = styled.p`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
  
  span {
    color: #10b981;
  }
`;

// 🎨 אזור אישי - פרסומות אחרונות
const PersonalSection = styled.div`
  max-width: 1200px;
  margin: 0 auto 4rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.6s;
  animation-fill-mode: both;
`;

const PersonalSectionTitle = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  font-weight: 400;
  color: white;
  margin-bottom: 1.5rem;
  letter-spacing: 1px;
`;

const AdsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AdCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateY(-4px);
  }
`;

const AdImage = styled.div`
  width: 100%;
  height: 180px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AdTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
`;

const AdMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.7);
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.3rem;
  color: white;
  margin-bottom: 0.5rem;
`;

const EmptyStateText = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled(EmptyStateText)`
  animation: ${fadeIn} 0.5s ease-in-out;
  font-weight: 500;
  letter-spacing: 1px;
`;

// 🔹 קומפוננטה ראשית
export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState({
    views: 0,
    issues: 0,
    ads: 0,
    growth: 0
  });

  // קבלת שם המשתמש
  const userName = user?.fullName || user?.email?.split('@')[0] || 'משתמש';

  // טעינת נתונים אמיתיים מהשרת
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getAdvertiserDashboard();
        setDashboardData(data);
        
        // עדכון סטטיסטיקות אמיתיות
        const ads = data?.ads || data?.Ads || [];
        const adsCount = ads.length;
        const totalViews = ads.reduce((sum, ad) => sum + (ad.views || 0), 0) || 0;
        
        // אנימציית ספירה עם נתונים אמיתיים
        const targets = { 
          views: totalViews || 0, 
          issues: 52, // זה עדיין סטטי - אפשר להוסיף endpoint נפרד
          ads: adsCount, 
          growth: adsCount > 0 ? Math.min(50, Math.floor(adsCount * 5)) : 0 
        };
        
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;
        
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const easeOut = 1 - Math.pow(1 - progress, 3);
          
          setStats({
            views: Math.floor(targets.views * easeOut),
            issues: Math.floor(targets.issues * easeOut),
            ads: Math.floor(targets.ads * easeOut),
            growth: Math.floor(targets.growth * easeOut)
          });
          
          if (step >= steps) clearInterval(timer);
        }, interval);
        
        return () => clearInterval(timer);
      } catch (error) {
        console.error('שגיאה בטעינת נתוני הדשבורד:', error);
        // אם יש שגיאה, נשתמש בערכי ברירת מחדל
        const targets = { views: 0, issues: 52, ads: 0, growth: 0 };
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;
        
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const easeOut = 1 - Math.pow(1 - progress, 3);
          
          setStats({
            views: Math.floor(targets.views * easeOut),
            issues: Math.floor(targets.issues * easeOut),
            ads: Math.floor(targets.ads * easeOut),
            growth: Math.floor(targets.growth * easeOut)
          });
          
          if (step >= steps) clearInterval(timer);
        }, interval);
        
        return () => clearInterval(timer);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const navItems = [
    {
      path: '/advertiser/placement',
      title: 'העלאת מודעה',
      description: 'העלי מודעה חדשה ובחרי מיקום בגיליון',
      icon: Plus,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      shadow: 'rgba(16, 185, 129, 0.3)',
      badge: 'חדש',
      badgeType: 'new'
    },
    {
      path: '/issues',
      title: 'גליונות המגזין',
      description: 'צפי בכל הגליונות, עלעלי בדפים ובחרי מיקומים לפרסום',
      icon: Book,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      shadow: 'rgba(139, 92, 246, 0.3)',
    },
    {
      path: '/analytics',
      title: 'אנליטיקה',
      description: 'עקבי אחר הביצועים של המודעות שלך בזמן אמת',
      icon: BarChart3,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      shadow: 'rgba(245, 158, 11, 0.3)',
    },
    {
      path: '/advertiser/payment',
      title: 'תשלומים',
      description: 'נהלי את התשלומים והחשבוניות שלך במקום אחד',
      icon: CreditCard,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      shadow: 'rgba(236, 72, 153, 0.3)',
    },
  ];

  // קישורים מהירים
  const quickLinks = [
    { path: '/advertisers', label: 'רשימת מפרסמים', icon: Users },
    { path: '/advertiser/chat', label: 'צ\'אט תמיכה', icon: MessageCircle },
    { path: '/settings', label: 'הגדרות', icon: Settings },
    { path: '/help', label: 'עזרה', icon: HelpCircle },
  ];

  return (
    <>
      <GlobalFonts />
      <PageWrapper>
        <BackgroundImage />
        
        <ContentWrapper>
          {/* Header */}
          <Header>
            <Logo onClick={() => navigate('/')}><img src="/logo.png" alt="השדרה" style={{ height: '40px', width: 'auto', backgroundColor: 'white', padding: '4px 8px', borderRadius: '8px' }} /></Logo>
            <BackButton onClick={() => navigate('/')}>
              <ArrowLeft size={18} />
              חזרה לדף הבית
            </BackButton>
          </Header>

          {/* Welcome */}
          <WelcomeSection>
            <WelcomeTitle>
              שלום {userName}! 👋<br />
              ברוכה הבאה ל<span>אזור המפרסמים</span>
            </WelcomeTitle>
            <WelcomeSubtitle>
              אז יעלה התחילי את תהליך הפרסום - העלי מודעה, בחרי מיקום ועקבי אחר הביצועים
            </WelcomeSubtitle>
          </WelcomeSection>

          {/* Stats */}
          <StatsBar>
            <StatCard>
              <StatIcon>
                <Eye size={24} />
              </StatIcon>
              <StatInfo>
                <StatValue>{stats.views.toLocaleString('he-IL')}</StatValue>
                <StatLabel>צפיות החודש</StatLabel>
              </StatInfo>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <Calendar size={24} />
              </StatIcon>
              <StatInfo>
                <StatValue>{stats.issues}</StatValue>
                <StatLabel>גליונות השנה</StatLabel>
              </StatInfo>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <Sparkles size={24} />
              </StatIcon>
              <StatInfo>
                <StatValue>{stats.ads}</StatValue>
                <StatLabel>מודעות פעילות</StatLabel>
              </StatInfo>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <TrendingUp size={24} />
              </StatIcon>
              <StatInfo>
                <StatValue>{stats.growth}%</StatValue>
                <StatLabel>צמיחה חודשית</StatLabel>
              </StatInfo>
            </StatCard>
          </StatsBar>

          {/* Navigation Cards */}
          <CardsGrid>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <NavCard 
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  $delay={`${0.5 + index * 0.1}s`}
                >
                  {item.badge && (
                    <CardBadge $type={item.badgeType}>{item.badge}</CardBadge>
                  )}
                  <CardIcon $gradient={item.gradient} $shadow={item.shadow}>
                    <Icon />
                  </CardIcon>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                  <CardAction>
                    כניסה
                    <ChevronLeft size={18} />
                  </CardAction>
                </NavCard>
              );
            })}
          </CardsGrid>

          {/* אזור אישי - פרסומות אחרונות */}
          <PersonalSection>
            <PersonalSectionTitle>הפרסומות שלך</PersonalSectionTitle>
            {loading ? (
              <EmptyState>
                <LoadingSpinner>
                  <Spinner />
                  <LoadingText>טוען נתונים...</LoadingText>
                </LoadingSpinner>
              </EmptyState>
            ) : dashboardData?.ads && dashboardData.ads.length > 0 ? (
              <AdsGrid>
                {dashboardData.ads.slice(0, 6).map((ad, index) => {
                  // המבנה מהשרת: ad.creative ישירות, או ad.order?.creatives?.[0] כגיבוי
                  const creative = ad.creative || ad.order?.creatives?.[0];
                  const slotName = ad.slot?.name || (ad.hasPlacement === false ? 'ממתין לבחירת מיקום' : 'מיקום לא מוגדר');
                  const adKey = ad.adplacementId || ad.orderId || ad.creativeId || index;
                  
                  // בדיקה אם ה-fileUrl תקין (לא pending-upload)
                  const isValidFileUrl = creative?.fileUrl && 
                    !creative.fileUrl.startsWith('pending-upload-') && 
                    (creative.fileUrl.startsWith('http://') || creative.fileUrl.startsWith('https://'));
                  
                  return (
                    <AdCard key={adKey}>
                      <AdImage>
                        {isValidFileUrl ? (
                          <>
                            <img 
                              src={creative.fileUrl} 
                              alt="פרסומת"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.nextElementSibling;
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />
                            <div style={{ 
                              display: 'none',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%',
                              position: 'absolute',
                              top: 0,
                              left: 0
                            }}>
                              <ImageIcon size={48} color="rgba(255, 255, 255, 0.3)" />
                            </div>
                          </>
                        ) : (
                          <ImageIcon size={48} color="rgba(255, 255, 255, 0.3)" />
                        )}
                      </AdImage>
                      <AdTitle>
                        {slotName}
                      </AdTitle>
                      <AdMeta>
                        <Clock size={14} />
                        <span>
                          {ad.startDate 
                            ? new Date(ad.startDate).toLocaleDateString('he-IL')
                            : ad.order?.orderDate
                            ? new Date(ad.order.orderDate).toLocaleDateString('he-IL')
                            : 'תאריך לא זמין'}
                        </span>
                      </AdMeta>
                      {ad.endDate && (
                        <AdMeta>
                          <span>עד: {new Date(ad.endDate).toLocaleDateString('he-IL')}</span>
                        </AdMeta>
                      )}
                      {(ad.order?.status || ad.status) && (
                        <AdMeta>
                          <span>סטטוס: {ad.order?.status || ad.status}</span>
                        </AdMeta>
                      )}
                    </AdCard>
                  );
                })}
              </AdsGrid>
            ) : (
              <EmptyState>
                <EmptyStateTitle>אין פרסומות עדיין</EmptyStateTitle>
                <EmptyStateText>
                  עדיין לא העלית פרסומות. התחילי עכשיו על ידי לחיצה על "הזמנת מיקום" למעלה.
                </EmptyStateText>
              </EmptyState>
            )}
          </PersonalSection>

          {/* Quick Links */}
          <QuickLinksSection>
            <SectionTitle>קישורים מהירים</SectionTitle>
            <QuickLinksGrid>
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <QuickLink key={link.path} onClick={() => navigate(link.path)}>
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </QuickLink>
                );
              })}
            </QuickLinksGrid>
          </QuickLinksSection>

          {/* Footer */}
          <Footer>
            <FooterText>
              © 2025 <span>השדרה</span> - מגזין דיגיטלי לנשים
            </FooterText>
          </Footer>
        </ContentWrapper>
        
        {/* צ'אט בוט */}
        <AdvertiserChat userProfile={dashboardData?.Business} />
      </PageWrapper>
    </>
  );
}