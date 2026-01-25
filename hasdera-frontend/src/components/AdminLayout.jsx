/**
 * AdminLayout.jsx
 * Layout משותף לכל קומפוננטות הניהול - רקע, סיידבר, וכו'
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Tag,
} from 'lucide-react';

// 🎨 גופנים - נטען דרך index.html
const GlobalFonts = createGlobalStyle`
  /* Fonts are loaded via <link> tag in index.html */
`;

// 🎬 אנימציות
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
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
  
  /* בדף הבית - תמיד גלוי, בשאר העמודים - מוסתר כברירת מחדל */
  transform: ${props => {
    if (props.$isDashboard) return 'translateX(0)';
    if (props.$isOpen) return 'translateX(0)';
    return 'translateX(100%)';
  }};

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
  display: ${props => (props.$show ? 'block' : 'none')};
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

// 🎨 תוכן ראשי
const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 2rem;
  margin-right: ${props => (props.$isDashboard || props.$sidebarOpen) ? '280px' : '0'};
  transition: margin-right 0.3s ease;
  
  @media (max-width: 968px) {
    margin-right: 0;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto 3rem;
  display: flex;
  justify-content: ${props => props.$isDashboard ? 'flex-end' : 'space-between'};
  align-items: center;
  animation: ${fadeIn} 0.8s ease-out;
  
  @media (max-width: 968px) {
    justify-content: space-between;
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

const MenuButton = styled.button`
  display: ${props => props.$isDashboard ? 'none' : 'flex'};
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
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
  
  svg {
    width: 20px;
    height: 20px;
    display: block;
  }
`;

const Overlay = styled.div`
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  backdrop-filter: blur(4px);
`;

const modules = [
  {
    id: 'issues',
    title: 'ניהול גליונות',
    icon: FileText,
    path: '/admin/issues',
  },
  {
    id: 'ad-slots',
    title: 'ניהול מקומות פרסום',
    icon: Layout,
    path: '/admin/ad-slots',
  },
  {
    id: 'placement-book',
    title: 'בחירת מיקום פרסום',
    icon: Tag,
    path: '/admin/placement-book',
  },
  {
    id: 'advertisers',
    title: 'ניהול מפרסמים',
    icon: Users,
    path: '/admin/advertisers',
  },
  {
    id: 'payments',
    title: 'מערכת תשלומים וגבייה',
    icon: CreditCard,
    path: '/admin/payments',
  },
  {
    id: 'content',
    title: 'מערכת תוכן (CMS)',
    icon: FileEdit,
    path: '/admin/content',
  },
  {
    id: 'analytics',
    title: 'מערכת אנליטיקות',
    icon: BarChart3,
    path: '/admin/analytics',
  },
  {
    id: 'users',
    title: 'משתמשים והרשאות',
    icon: Shield,
    path: '/admin/users',
  },
  {
    id: 'infrastructure',
    title: 'תשתית ודוחות מערכת',
    icon: Settings,
    path: '/admin/infrastructure',
  },
  {
    id: 'integrations',
    title: 'אזור התממשקות',
    icon: Plug,
    path: '/admin/integrations',
  },
];

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPath = location.pathname;
  const isDashboard = currentPath === '/admin';
  const activeModule = modules.find(m => currentPath.startsWith(m.path))?.id || 'dashboard';

  const handleModuleClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      <GlobalFonts />
      <PageWrapper>
        <BackgroundImage />
        
        <Overlay $isOpen={sidebarOpen && !isDashboard} onClick={() => setSidebarOpen(false)} />
        
        <Sidebar $isOpen={sidebarOpen} $isDashboard={isDashboard}>
          <SidebarHeader>
            <Logo><img src="/logo.png" alt="השדרה" style={{ height: '40px', width: 'auto', marginLeft: '10px' }} /> ניהול</Logo>
            <CloseButton $show={!isDashboard && sidebarOpen} onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </CloseButton>
          </SidebarHeader>

          <NavSection>
            <NavSectionTitle>ראשי</NavSectionTitle>
            <NavItem
              $active={activeModule === 'dashboard'}
              onClick={() => {
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
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <NavItem
                  key={module.id}
                  $active={activeModule === module.id}
                  onClick={() => handleModuleClick(module.path)}
                >
                  <Icon size={20} />
                  {module.title}
                </NavItem>
              );
            })}
          </NavSection>
        </Sidebar>

        <ContentWrapper $isDashboard={isDashboard} $sidebarOpen={sidebarOpen && !isDashboard}>
          {!isDashboard && (
            <Header $isDashboard={isDashboard}>
              <MenuButton $isDashboard={isDashboard} onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
                תפריט
              </MenuButton>
              <BackButton onClick={() => navigate('/admin')}>
                <ChevronLeft size={20} />
                חזרה לדשבורד
              </BackButton>
            </Header>
          )}

          {title && (
            <h1 style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '3rem',
              fontWeight: 300,
              color: 'white',
              textAlign: 'center',
              marginBottom: '3rem',
              letterSpacing: '2px'
            }}>
              {title}
            </h1>
          )}

          {children}
        </ContentWrapper>
      </PageWrapper>
    </>
  );
}

