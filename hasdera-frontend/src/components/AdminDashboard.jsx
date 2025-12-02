/**
 * AdminDashboard.jsx
 * דף בית ראשי לאזור הניהול עם כל 10 האזורים
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
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
import { Card, CardHeader, CardTitle, CardContent, PrimaryButton } from '../styles';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${hasederaTheme.colors.background.main};
  direction: rtl;
`;

const Sidebar = styled.aside`
  position: fixed;
  right: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: ${hasederaTheme.colors.background.dark};
  color: ${hasederaTheme.colors.text.white};
  padding: ${hasederaTheme.spacing.xl};
  overflow-y: auto;
  box-shadow: ${hasederaTheme.shadows.xl};
  z-index: 1000;
  transition: transform ${hasederaTheme.transitions.base};

  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${hasederaTheme.spacing['2xl']};
  padding-bottom: ${hasederaTheme.spacing.lg};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  font-size: ${hasederaTheme.typography.fontSize['2xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  color: ${hasederaTheme.colors.primary.light};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${hasederaTheme.colors.text.white};
  cursor: pointer;
  padding: ${hasederaTheme.spacing.sm};
  display: none;

  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    display: block;
  }
`;

const NavSection = styled.div`
  margin-bottom: ${hasederaTheme.spacing.xl};
`;

const NavSectionTitle = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.sm};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: ${hasederaTheme.spacing.md};
  padding: 0 ${hasederaTheme.spacing.md};
`;

const NavItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.md};
  padding: ${hasederaTheme.spacing.md};
  background: ${props => props.$active ? 'rgba(41, 142, 142, 0.2)' : 'transparent'};
  border: none;
  border-radius: ${hasederaTheme.borderRadius.md};
  color: ${hasederaTheme.colors.text.white};
  cursor: pointer;
  transition: all ${hasederaTheme.transitions.base};
  text-align: right;
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-family: ${hasederaTheme.typography.fontFamily.primary};
  margin-bottom: ${hasederaTheme.spacing.xs};

  &:hover {
    background: rgba(41, 142, 142, 0.15);
    transform: translateX(-4px);
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const MainContent = styled.main`
  margin-right: 280px;
  padding: ${hasederaTheme.spacing.xl};
  min-height: 100vh;

  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    margin-right: 0;
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${hasederaTheme.spacing['2xl']};
  padding-bottom: ${hasederaTheme.spacing.lg};
  border-bottom: 2px solid ${hasederaTheme.colors.border.light};
`;

const MenuButton = styled.button`
  display: none;
  background: ${hasederaTheme.colors.primary.main};
  color: ${hasederaTheme.colors.text.white};
  border: none;
  padding: ${hasederaTheme.spacing.sm} ${hasederaTheme.spacing.md};
  border-radius: ${hasederaTheme.borderRadius.md};
  cursor: pointer;

  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    display: flex;
    align-items: center;
    gap: ${hasederaTheme.spacing.sm};
  }
`;

const PageTitle = styled.h1`
  font-size: ${hasederaTheme.typography.fontSize['4xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${hasederaTheme.spacing.xl};
  margin-bottom: ${hasederaTheme.spacing['2xl']};
`;

const StatCard = styled(Card)`
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.main} 0%, ${hasederaTheme.colors.primary.dark} 100%);
  color: ${hasederaTheme.colors.text.white};
  border: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.8;
    }
  }
`;

const StatValue = styled.div`
  font-size: ${hasederaTheme.typography.fontSize['3xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  margin-bottom: ${hasederaTheme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const StatLabel = styled.div`
  font-size: ${hasederaTheme.typography.fontSize.base};
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${hasederaTheme.spacing.xl};
`;

const ModuleCard = styled(Card)`
  cursor: pointer;
  transition: all ${hasederaTheme.transitions.base};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${hasederaTheme.shadows.xl};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 4px;
    height: 100%;
    background: ${hasederaTheme.colors.primary.main};
    transform: scaleY(0);
    transition: transform ${hasederaTheme.transitions.base};
  }

  &:hover::before {
    transform: scaleY(1);
  }
`;

const ModuleIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${hasederaTheme.borderRadius.lg};
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.main} 0%, ${hasederaTheme.colors.primary.dark} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${hasederaTheme.colors.text.white};
  margin-bottom: ${hasederaTheme.spacing.lg};
  box-shadow: ${hasederaTheme.shadows.md};
`;

const ModuleTitle = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.xl};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0 0 ${hasederaTheme.spacing.sm} 0;
`;

const ModuleDescription = styled.p`
  font-size: ${hasederaTheme.typography.fontSize.base};
  color: ${hasederaTheme.colors.text.secondary};
  margin: 0;
  line-height: 1.6;
`;

const ModuleFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${hasederaTheme.spacing.md} 0 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: ${hasederaTheme.spacing.xs};
`;

const FeatureTag = styled.li`
  display: inline-block;
  padding: ${hasederaTheme.spacing.xs} ${hasederaTheme.spacing.sm};
  background: ${hasederaTheme.colors.background.main};
  border-radius: ${hasederaTheme.borderRadius.full};
  font-size: ${hasederaTheme.typography.fontSize.xs};
  color: ${hasederaTheme.colors.text.secondary};
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;

  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
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
      color: hasederaTheme.colors.primary.main,
    },
    {
      id: 'ad-slots',
      title: 'ניהול מקומות פרסום',
      icon: Layout,
      description: 'טבלת כל העמודים, חלוקה לסוגי מקום, ניהול זמינות ומחירים',
      features: ['טבלת עמודים', 'סוגי מקום', 'ניהול זמינות', 'מחירים'],
      path: '/admin/ad-slots',
      color: hasederaTheme.colors.info.main,
    },
    {
      id: 'advertisers',
      title: 'ניהול מפרסמים',
      icon: Users,
      description: 'רשימת מפרסמים, פרטי קשר, היסטוריית פרסומים וחוזים',
      features: ['רשימת מפרסמים', 'היסטוריית פרסומים', 'חוזים', 'חשבוניות'],
      path: '/admin/advertisers',
      color: hasederaTheme.colors.success.main,
    },
    {
      id: 'payments',
      title: 'מערכת תשלומים וגבייה',
      icon: CreditCard,
      description: 'צירוף חשבוניות, סימון תשלומים, תזכורות ודוחות הכנסות',
      features: ['חשבוניות', 'תשלומים', 'תזכורות', 'דוחות הכנסות'],
      path: '/admin/payments',
      color: hasederaTheme.colors.warning.main,
    },
    {
      id: 'content',
      title: 'מערכת תוכן (CMS)',
      icon: FileEdit,
      description: 'ניהול מדורים, כתבות, עורכים ופריסה לעיתון',
      features: ['מדורים', 'כתבות', 'עורכים', 'פריסה'],
      path: '/admin/content',
      color: hasederaTheme.colors.secondary.main,
    },
    {
      id: 'analytics',
      title: 'מערכת אנליטיקות',
      icon: BarChart3,
      description: 'צפיות, עמודים נצפים, מפת חום ודוחות מפורטים',
      features: ['צפיות', 'מפת חום', 'דוחות', 'השוואות'],
      path: '/admin/analytics',
      color: hasederaTheme.colors.info.main,
    },
    {
      id: 'users',
      title: 'משתמשים והרשאות',
      icon: Shield,
      description: 'ניהול משתמשים, תפקידים והרשאות גישה',
      features: ['משתמשים', 'תפקידים', 'הרשאות', 'גישה מוגבלת'],
      path: '/admin/users',
      color: hasederaTheme.colors.error.main,
    },
    {
      id: 'infrastructure',
      title: 'תשתית ודוחות מערכת',
      icon: Settings,
      description: 'גיבויים, ניהול Storage, בדיקות זמינות ומעקב שגיאות',
      features: ['גיבויים', 'Storage', 'בדיקות', 'מעקב שגיאות'],
      path: '/admin/infrastructure',
      color: hasederaTheme.colors.text.secondary,
    },
    {
      id: 'integrations',
      title: 'אזור התממשקות',
      icon: Plug,
      description: 'Monday.com, Supabase, AWS S3, OpenAI, WhatsApp API',
      features: ['Monday.com', 'Supabase', 'AWS S3', 'OpenAI'],
      path: '/admin/integrations',
      color: hasederaTheme.colors.primary.light,
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
    <DashboardContainer>
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

      <MainContent>
        <TopBar>
          <MenuButton onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
            תפריט
          </MenuButton>
          <PageTitle>דשבורד ניהול</PageTitle>
        </TopBar>

        <StatsGrid>
          {stats.map((stat, index) => (
            <StatCard key={index}>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatsGrid>

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
      </MainContent>
    </DashboardContainer>
  );
}

