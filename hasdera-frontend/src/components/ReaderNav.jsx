import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Home, Archive, User, Newspaper, Menu, X, LogOut, Bell, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import SearchModal from "./SearchModal";

/* ======================== Animations ======================== */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

/* ======================== Styled Components ======================== */
const NavWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin: 0 -1.5rem;
  padding: 0.75rem 2rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const NavInner = styled.nav`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

/* ============ Logo ============ */
const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover { 
    transform: scale(1.02);
  }
`;

const LogoImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%);
    transform: translateX(-100%);
    transition: transform 0.5s;
  }
  
  ${Logo}:hover &::after {
    transform: translateX(100%);
  }
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (max-width: 500px) {
    display: none;
  }
`;

const LogoTitle = styled.span`
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.01em;
  line-height: 1.2;
`;

const LogoSubtitle = styled.span`
  font-size: 0.7rem;
  color: #64748b;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

/* ============ Center Navigation ============ */
const CenterNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media (max-width: 700px) {
    display: none;
  }
`;

const NavLink = styled.button`
  border: none;
  background: transparent;
  color: ${props => props.$active ? "#10b981" : "#94a3b8"};
  padding: 0.6rem 1rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.25s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: ${props => props.$active ? "60%" : "0"};
    height: 2px;
    background: linear-gradient(90deg, #10b981, #059669);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #f8fafc;
    
    &::after {
      width: 60%;
    }
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

/* ============ Right Actions ============ */
const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  width: 38px;
  height: 38px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;

  &:hover {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    transform: translateY(-1px);
  }
`;

const NotificationDot = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid rgba(15, 23, 42, 0.9);
  animation: ${pulse} 2s infinite;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.75rem 0.4rem 0.5rem;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
  }

  @media (max-width: 500px) {
    padding: 0.35rem;
    border-radius: 10px;
  }
`;

const UserAvatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
`;

const UserName = styled.span`
  color: #f8fafc;
  font-size: 0.85rem;
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 500px) {
    display: none;
  }
`;

/* ============ Mobile Menu ============ */
const MobileMenuButton = styled.button`
  display: none;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  padding: 0.6rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  @media (max-width: 700px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenuOverlay = styled.div`
  display: none;
  
  @media (max-width: 700px) {
    display: ${props => props.$open ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 200;
    animation: ${fadeIn} 0.2s ease-out;
  }
`;

const MobileMenu = styled.div`
  display: none;
  
  @media (max-width: 700px) {
    display: ${props => props.$open ? 'flex' : 'none'};
    position: fixed;
    top: 0;
    right: 0;
    width: 280px;
    height: 100vh;
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    flex-direction: column;
    z-index: 300;
    animation: ${fadeIn} 0.3s ease-out;
  }
`;

const MobileMenuHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MobileMenuLinks = styled.div`
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MobileNavLink = styled.button`
  width: 100%;
  border: none;
  background: ${props => props.$active 
    ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)" 
    : "transparent"};
  color: ${props => props.$active ? "#10b981" : "#94a3b8"};
  padding: 1rem 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.25s ease;
  text-align: right;
  border: 1px solid ${props => props.$active ? "rgba(16, 185, 129, 0.3)" : "transparent"};

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #f8fafc;
  }
`;

const MobileMenuFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const LogoutButton = styled.button`
  width: 100%;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.9rem 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`;

/* ======================== Component ======================== */
export default function ReaderNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const path = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSelect = (issue) => {
    navigate(`/issues/${issue.issue_id || issue.issueId}`, { state: issue });
  };

  const handleNavigate = (to) => {
    navigate(to);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const navItems = [
    { path: "/", label: "בית", icon: Home, exact: true },
    { path: "/issues", label: "ארכיון גיליונות", icon: Archive, exact: false },
    { path: "/me", label: "אזור אישי", icon: User, exact: true },
  ];

  const isActive = (item) => {
    if (item.exact) return path === item.path;
    return path.startsWith(item.path);
  };

  return (
    <>
      <NavWrapper style={{ 
        background: isScrolled ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.8)',
        borderBottomColor: isScrolled ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)'
      }}>
        <NavInner>
          {/* Logo */}
          <Logo onClick={() => handleNavigate("/")}>
            <img src="/logo.png" alt="השדרה" style={{ height: '45px', width: 'auto' }} />
          </Logo>

          {/* Center Navigation - Desktop */}
          <CenterNav>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink 
                  key={item.path}
                  $active={isActive(item)} 
                  onClick={() => handleNavigate(item.path)}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </CenterNav>

          {/* Right Actions */}
          <RightActions>
            <IconButton title="חיפוש (Ctrl+K)" onClick={() => setSearchOpen(true)}>
              <Search size={18} />
            </IconButton>
            
            <IconButton title="התראות">
              <Bell size={18} />
              <NotificationDot />
            </IconButton>
            
            <UserButton onClick={() => handleNavigate("/me")}>
              <UserAvatar>
                {getInitials(user?.fullName || user?.name)}
              </UserAvatar>
              <UserName>{user?.fullName?.split(" ")[0] || "אורח"}</UserName>
            </UserButton>

            <MobileMenuButton onClick={() => setMobileMenuOpen(true)}>
              <Menu size={22} />
            </MobileMenuButton>
          </RightActions>
        </NavInner>
      </NavWrapper>

      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay $open={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
      
      {/* Mobile Menu */}
      <MobileMenu $open={mobileMenuOpen}>
        <MobileMenuHeader>
          <Logo onClick={() => handleNavigate("/")}>
            <img src="/logo.png" alt="השדרה" style={{ height: '40px', width: 'auto' }} />
          </Logo>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </IconButton>
        </MobileMenuHeader>

        <MobileMenuLinks>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <MobileNavLink 
                key={item.path}
                $active={isActive(item)} 
                onClick={() => handleNavigate(item.path)}
              >
                <Icon size={20} />
                {item.label}
              </MobileNavLink>
            );
          })}
        </MobileMenuLinks>

        <MobileMenuFooter>
          <LogoutButton onClick={handleLogout}>
            <LogOut size={18} />
            התנתקות
          </LogoutButton>
        </MobileMenuFooter>
      </MobileMenu>

      {/* Search Modal */}
      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)}
        onSelectIssue={handleSearchSelect}
      />
    </>
  );
}
