import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Book, Home, Archive, User } from "lucide-react";
import hasederaTheme from "../styles/HasederaTheme";

const NavBar = styled.nav`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
  margin-bottom: 1rem;
`;

const NavItem = styled.button`
  border: none;
  background: ${props => (props.$active ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)")};
  color: ${hasederaTheme.colors.text.white};
  padding: 0.6rem 1rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: inherit;
  transition: ${hasederaTheme.transitions.base};

  &:hover {
    background: rgba(16, 185, 129, 0.25);
  }
`;

export default function ReaderNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  return (
    <NavBar>
      <NavItem $active={path === "/"} onClick={() => navigate("/")}>
        <Home size={16} />
        בית
      </NavItem>
      <NavItem $active={path === "/issues" || path === "/archive"} onClick={() => navigate("/issues")}>
        <Archive size={16} />
        ארכיון
      </NavItem>
      <NavItem $active={path === "/issues/latest"} onClick={() => navigate("/issues")}>
        <Book size={16} />
        גיליון אחרון
      </NavItem>
      <NavItem $active={path === "/me"} onClick={() => navigate("/me")}>
        <User size={16} />
        אזור אישי
      </NavItem>
    </NavBar>
  );
}

