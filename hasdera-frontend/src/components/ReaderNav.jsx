import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Book, Home, Archive, User, Newspaper, Menu, X } from "lucide-react";

const NavWrapper = styled.header`
  padding: 1.5rem 0;
  position: relative;
`;

const NavInner = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover { opacity: 0.85; }
`;

const LogoIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
`;

const LogoText = styled.span`
  font-size: 1.35rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.01em;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.4rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const NavItem = styled.button`
  border: none;
  background: ${props => props.$active 
    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
    : "transparent"};
  color: ${props => props.$active ? "#fff" : "#94a3b8"};
  padding: 0.65rem 1rem;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? "600" : "500"};
  transition: all 0.25s ease;
  white-space: nowrap;

  ${props => props.$active && `
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  `}

  &:hover {
    background: ${props => props.$active 
      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
      : "rgba(255, 255, 255, 0.08)"};
    color: ${props => props.$active ? "#fff" : "#f8fafc"};
  }
`;

/* Mobile Menu */
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MobileMenuButton = styled.button`
  display: none;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  padding: 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  @media (max-width: 600px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled.div`
  display: none;
  
  @media (max-width: 600px) {
    display: ${props => props.$open ? 'block' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 0.5rem;
    margin-top: 0.5rem;
    z-index: 100;
    animation: ${slideIn} 0.2s ease-out;
  }
`;

const MobileNavItem = styled.button`
  width: 100%;
  border: none;
  background: ${props => props.$active 
    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
    : "transparent"};
  color: ${props => props.$active ? "#fff" : "#94a3b8"};
  padding: 1rem 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  font-weight: ${props => props.$active ? "600" : "500"};
  transition: all 0.25s ease;
  text-align: right;

  &:hover {
    background: ${props => props.$active 
      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
      : "rgba(255, 255, 255, 0.08)"};
    color: #f8fafc;
  }
`;

const DesktopNavLinks = styled(NavLinks)`
  @media (max-width: 600px) {
    display: none;
  }
`;

export default function ReaderNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (to) => {
    navigate(to);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: "/", label: "בית", icon: Home, exact: true },
    { path: "/issues", label: "ארכיון", icon: Archive, exact: false },
    { path: "/me", label: "אזור אישי", icon: User, exact: true },
  ];

  const isActive = (item) => {
    if (item.exact) return path === item.path;
    return path.startsWith(item.path);
  };

  return (
    <NavWrapper>
      <NavInner>
        <Logo onClick={() => handleNavigate("/")}>
          <LogoIcon>
            <Newspaper size={22} />
          </LogoIcon>
          <LogoText>השדרה</LogoText>
        </Logo>

        {/* Desktop Navigation */}
        <DesktopNavLinks>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavItem 
                key={item.path}
                $active={isActive(item)} 
                onClick={() => handleNavigate(item.path)}
              >
                <Icon size={18} />
                {item.label}
              </NavItem>
            );
          })}
        </DesktopNavLinks>

        {/* Mobile Menu Button */}
        <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </MobileMenuButton>

        {/* Mobile Menu */}
        <MobileMenu $open={mobileMenuOpen}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <MobileNavItem 
                key={item.path}
                $active={isActive(item)} 
                onClick={() => handleNavigate(item.path)}
              >
                <Icon size={20} />
                {item.label}
              </MobileNavItem>
            );
          })}
        </MobileMenu>
      </NavInner>
    </NavWrapper>
  );
}
