import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Book, Home, Archive, User, Newspaper } from "lucide-react";

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

export default function ReaderNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  return (
    <NavWrapper>
      <NavInner>
        <Logo onClick={() => navigate("/")}>
          <LogoIcon>
            <Newspaper size={22} />
          </LogoIcon>
          <LogoText>השדרה</LogoText>
        </Logo>

        <NavLinks>
          <NavItem $active={path === "/"} onClick={() => navigate("/")}>
            <Home size={18} />
            בית
          </NavItem>
          <NavItem 
            $active={path === "/issues" || path === "/archive"} 
            onClick={() => navigate("/issues")}
          >
            <Archive size={18} />
            ארכיון
          </NavItem>
          <NavItem 
            $active={path.startsWith("/issues/") && path !== "/issues"} 
            onClick={() => navigate("/issues")}
          >
            <Book size={18} />
            גיליון אחרון
          </NavItem>
          <NavItem $active={path === "/me"} onClick={() => navigate("/me")}>
            <User size={18} />
            אזור אישי
          </NavItem>
        </NavLinks>
      </NavInner>
    </NavWrapper>
  );
}
