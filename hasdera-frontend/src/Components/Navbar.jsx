import React from "react";
import styled from "styled-components";
import { Home, Book, MapPin, CreditCard, Users, BarChart3 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import hasederaTheme from "../styles/HasederaTheme";

// 🎨 Styled Components
const NavbarContainer = styled.nav`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid ${hasederaTheme.colors.primary.main}33;
  box-shadow: ${hasederaTheme.shadows.md};
  padding: ${hasederaTheme.spacing.md} 0;
`;

const NavbarContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${hasederaTheme.spacing['2xl']};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${hasederaTheme.spacing.lg};
  
  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    padding: 0 ${hasederaTheme.spacing.lg};
    flex-wrap: wrap;
  }
`;

const Logo = styled.button`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
  background: none;
  border: none;
  cursor: pointer;
  padding: ${hasederaTheme.spacing.sm};
  border-radius: ${hasederaTheme.borderRadius.md};
  transition: ${hasederaTheme.transitions.base};
  
  &:hover {
    background: ${hasederaTheme.colors.background.hover};
    transform: translateY(-2px);
  }
`;

const LogoIcon = styled.div`
  padding: ${hasederaTheme.spacing.sm};
  background: ${hasederaTheme.colors.gradient.primary};
  border-radius: ${hasederaTheme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${hasederaTheme.shadows.green};
  
  svg {
    color: ${hasederaTheme.colors.text.white};
  }
`;

const LogoText = styled.span`
  font-size: ${hasederaTheme.typography.fontSize.xl};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.dark} 0%, ${hasederaTheme.colors.primary.main} 50%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    font-size: ${hasederaTheme.typography.fontSize.lg};
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
  flex-wrap: wrap;
  
  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    width: 100%;
    justify-content: center;
    margin-top: ${hasederaTheme.spacing.sm};
  }
`;

const NavLink = styled.button`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.xs};
  padding: ${hasederaTheme.spacing.sm} ${hasederaTheme.spacing.md};
  background: ${props => props.$active ? hasederaTheme.colors.gradient.primary : 'transparent'};
  color: ${props => props.$active ? hasederaTheme.colors.text.white : hasederaTheme.colors.text.primary};
  border: 2px solid ${props => props.$active ? 'transparent' : hasederaTheme.colors.border.light};
  border-radius: ${hasederaTheme.borderRadius.md};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$active ? hasederaTheme.colors.primary.dark : hasederaTheme.colors.background.hover};
    border-color: ${props => props.$active ? 'transparent' : hasederaTheme.colors.primary.main};
    transform: translateY(-2px);
    box-shadow: ${props => props.$active ? hasederaTheme.shadows.greenHover : hasederaTheme.shadows.sm};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    font-size: ${hasederaTheme.typography.fontSize.sm};
    padding: ${hasederaTheme.spacing.xs} ${hasederaTheme.spacing.sm};
    
    span {
      display: none;
    }
  }
`;

// 🔹 רכיב הניווט הראשי
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/dashboard', label: 'דף הבית', icon: Home },
    { path: '/issues', label: 'גליונות', icon: Book },
    { path: '/advertiser/placement', label: 'ניהול מודעות', icon: MapPin },
    { path: '/analytics', label: 'אנליטיקה', icon: BarChart3 },
    { path: '/advertiser/payment', label: 'תשלומים', icon: CreditCard },
  ];

  return (
    <NavbarContainer>
      <NavbarContent>
        <Logo onClick={() => navigate('/dashboard')}>
          <LogoIcon>
            <Users size={20} />
          </LogoIcon>
          <LogoText>אזור מפרסמים</LogoText>
        </Logo>
        
        <NavLinks>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                onClick={() => navigate(item.path)}
                $active={isActive(item.path)}
                title={item.label}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </NavLinks>
      </NavbarContent>
    </NavbarContainer>
  );
}

