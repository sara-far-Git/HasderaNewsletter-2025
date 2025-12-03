/**
 * AdminDashboard.jsx
 * דף בית ראשי לאזור הניהול עם כל 10 האזורים
 * מעוצב כמו אזור המפרסמים
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import {
  FileText,
  Layout,
  Users,
  CreditCard,
  FileEdit,
  BarChart3,
  Shield,
  Settings,
  Home,
  Plug,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import hasederaTheme from '../styles/HasederaTheme';

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
  margin-right: 280px;
  
  @media (max-width: 968px) {
    margin-right: 0;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// 🎨 Sidebar
const Sidebar = styled.aside`
  position: fixed;
  right: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 2rem;
  overflow-y: auto;
  z-index: 100;
  transition: transform 0.3s ease;

  @media (max-width: 968px) {
    transform: translateX(${props => props.$isOpen ? '0' : '100%'});
    z-index: 1000;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem;
  font-weight: 300;
  color: #10b981;
  letter-spacing: 2px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  display: none;
  transition: all 0.3s ease;

  &:hover {
    color: #10b981;
  }

  @media (max-width: 968px) {
    display: block;
  }
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
`;

const NavSectionTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  padding: 0 1rem;
`;

const NavItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.$active ? 'rgba(16, 185, 129, 0.2)' : 'transparent'};
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: right;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;

  &:hover {
    background: rgba(16, 185, 129, 0.15);
    transform: translateX(-4px);
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    display: block;
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

const MenuButton = styled.button`
  display: none;
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

  @media (max-width: 968px) {
    display: flex;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: #10b981;
    color: #10b981;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

// 🎨 Modules Grid
const ModulesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.6s;
  animation-fill-mode: both;
`;

const ModuleCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #10b981 0%, #059669 100%);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }

  &:hover::before {
    transform: scaleY(1);
  }
`;

const ModuleIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
  animation: ${float} 3s ease-in-out infinite;
  
  svg {
    width: 28px;
    height: 28px;
    display: block;
  }
`;

const ModuleTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.75rem 0;
  font-family: 'Cormorant Garamond', serif;
`;

const ModuleDescription = styled.p`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
  line-height: 1.6;
`;

const ModuleFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FeatureTag = styled.li`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 20px;
  font-size: 0.75rem;
  color: #10b981;
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  backdrop-filter: blur(4px);

  @media (max-width: 968px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    z-index: 999;
  }
`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');

  const modules = [
    {
      id: 'issues',
      title: 'ניהול גליונות',
      icon: FileText,
      description: 'העלאת PDF, עריכת פרטים, ניהול עמודים וצפייה בגליונות',
      features: ['העלאת PDF', 'עריכת פרטים', 'PageFlip Viewer', 'הוספת עמודים'],
      path: '/admin/issues',
      color: '#10b981',
    },
    {
      id: 'ad-slots',
      title: 'ניהול מקומות פרסום',
      icon: Layout,
      description: 'טבלת כל העמודים, חלוקה לסוגי מקום, ניהול זמינות ומחירים',
      features: ['טבלת עמודים', 'סוגי מקום', 'ניהול זמינות', 'מחירים'],
      path: '/admin/ad-slots',
      color: '#3b82f6',
    },
    {
      id: 'advertisers',
      title: 'ניהול מפרסמים',
      icon: Users,
      description: 'רשימת מפרסמים, פרטי קשר, היסטוריית פרסומים וחוזים',
      features: ['רשימת מפרסמים', 'היסטוריית פרסומים', 'חוזים', 'חשבוניות'],
      path: '/admin/advertisers',
      color: '#10b981',
    },
    {
      id: 'payments',
      title: 'מערכת תשלומים וגבייה',
      icon: CreditCard,
      description: 'צירוף חשבוניות, סימון תשלומים, תזכורות ודוחות הכנסות',
      features: ['חשבוניות', 'תשלומים', 'תזכורות', 'דוחות הכנסות'],
      path: '/admin/payments',
      color: '#f59e0b',
    },
    {
      id: 'content',
      title: 'מערכת תוכן (CMS)',
      icon: FileEdit,
      description: 'ניהול מדורים, כתבות, עורכים ופריסה לעיתון',
      features: ['מדורים', 'כתבות', 'עורכים', 'פריסה'],
      path: '/admin/content',
      color: '#8b5cf6',
    },
    {
      id: 'analytics',
      title: 'מערכת אנליטיקות',
      icon: BarChart3,
      description: 'צפיות, עמודים נצפים, מפת חום ודוחות מפורטים',
      features: ['צפיות', 'מפת חום', 'דוחות', 'השוואות'],
      path: '/admin/analytics',
      color: '#3b82f6',
    },
    {
      id: 'users',
      title: 'משתמשים והרשאות',
      icon: Shield,
      description: 'ניהול משתמשים, תפקידים והרשאות גישה',
      features: ['משתמשים', 'תפקידים', 'הרשאות', 'גישה מוגבלת'],
      path: '/admin/users',
      color: '#ef4444',
    },
    {
      id: 'infrastructure',
      title: 'תשתית ודוחות מערכת',
      icon: Settings,
      description: 'גיבויים, ניהול Storage, בדיקות זמינות ומעקב שגיאות',
      features: ['גיבויים', 'Storage', 'בדיקות', 'מעקב שגיאות'],
      path: '/admin/infrastructure',
      color: '#6b7280',
    },
    {
      id: 'integrations',
      title: 'אזור התממשקות',
      icon: Plug,
      description: 'Monday.com, Supabase, AWS S3, OpenAI, WhatsApp API',
      features: ['Monday.com', 'Supabase', 'AWS S3', 'OpenAI'],
      path: '/admin/integrations',
      color: '#10b981',
    },
  ];

  const stats = [
    { label: 'גליונות פעילים', value: '12', icon: FileText },
    { label: 'מפרסמים פעילים', value: '45', icon: Users },
    { label: 'הכנסות החודש', value: '₪125,000', icon: CreditCard },
    { label: 'מקומות פנויים', value: '23', icon: Layout },
  ];

  const handleModuleClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      <GlobalFonts />
      <PageWrapper>
        <BackgroundImage />
        
        <Overlay $isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />
        
        <Sidebar $isOpen={sidebarOpen}>
          <SidebarHeader>
            <Logo>השדרה - ניהול</Logo>
            <CloseButton onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </CloseButton>
          </SidebarHeader>

          <NavSection>
            <NavSectionTitle>ראשי</NavSectionTitle>
            <NavItem
              $active={activeModule === 'dashboard'}
              onClick={() => {
                setActiveModule('dashboard');
                navigate('/admin');
                setSidebarOpen(false);
              }}
            >
              <Home size={20} />
              דשבורד ראשי
            </NavItem>
          </NavSection>

          <NavSection>
            <NavSectionTitle>ניהול</NavSectionTitle>
            {modules.map((module) => (
              <NavItem
                key={module.id}
                $active={activeModule === module.id}
                onClick={() => {
                  setActiveModule(module.id);
                  handleModuleClick(module.path);
                }}
              >
                <module.icon size={20} />
                {module.title}
              </NavItem>
            ))}
          </NavSection>
        </Sidebar>

        <ContentWrapper>
          <Header>
            <MenuButton onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
              תפריט
            </MenuButton>
            <BackButton onClick={() => navigate('/')}>
              <ChevronLeft size={20} />
              חזרה לאתר
            </BackButton>
          </Header>

          <WelcomeSection>
            <WelcomeTitle>
              ברוכים הבאים ל<span>אזור הניהול</span>
            </WelcomeTitle>
            <WelcomeSubtitle>
              ניהול מלא של כל המערכת - גליונות, מפרסמים, תשלומים ועוד
            </WelcomeSubtitle>
          </WelcomeSection>

          <StatsBar>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <StatCard key={index}>
                  <StatIcon>
                    <Icon size={24} />
                  </StatIcon>
                  <StatInfo>
                    <StatValue>{stat.value}</StatValue>
                    <StatLabel>{stat.label}</StatLabel>
                  </StatInfo>
                </StatCard>
              );
            })}
          </StatsBar>

          <ModulesGrid>
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <ModuleCard
                  key={module.id}
                  onClick={() => handleModuleClick(module.path)}
                >
                  <ModuleIcon>
                    <Icon size={28} />
                  </ModuleIcon>
                  <ModuleTitle>{module.title}</ModuleTitle>
                  <ModuleDescription>{module.description}</ModuleDescription>
                  <ModuleFeatures>
                    {module.features.map((feature, idx) => (
                      <FeatureTag key={idx}>{feature}</FeatureTag>
                    ))}
                  </ModuleFeatures>
                </ModuleCard>
              );
            })}
          </ModulesGrid>
        </ContentWrapper>
      </PageWrapper>
    </>
  );
}
