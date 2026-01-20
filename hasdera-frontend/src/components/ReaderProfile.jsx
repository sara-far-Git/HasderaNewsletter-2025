import React from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { User, Mail, Calendar, BookOpen, Heart, Settings, LogOut, ChevronLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ReaderNav from "./ReaderNav";

/* ======================== Animations ======================== */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ======================== Styled Components ======================== */
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: #f8fafc;
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 2rem 0;
  text-align: center;
  animation: ${fadeInUp} 0.6s ease-out;
`;

/* ============ Profile Card ============ */
const ProfileCard = styled.div`
  background: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 500px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #f8fafc;
`;

const ProfileDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
`;

/* ============ Stats ============ */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #64748b;
`;

/* ============ Menu Section ============ */
const MenuSection = styled.div`
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #94a3b8;
  margin: 0 0 1rem;
  padding-right: 0.5rem;
`;

const MenuCard = styled.div`
  background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  overflow: hidden;
`;

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: right;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  &:hover {
    background: rgba(16, 185, 129, 0.1);
  }

  svg {
    color: #10b981;
  }
`;

const MenuItemText = styled.span`
  flex: 1;
`;

const MenuItemArrow = styled(ChevronLeft)`
  color: #64748b !important;
  opacity: 0.5;
`;

const LogoutButton = styled(MenuItem)`
  color: #f87171;
  
  svg {
    color: #f87171;
  }

  &:hover {
    background: rgba(248, 113, 113, 0.1);
  }
`;

/* ============ Coming Soon Badge ============ */
const ComingSoon = styled.span`
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
`;

/* ======================== Component ======================== */
export default function ReaderProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "לא ידוע";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "לא ידוע";
    return d.toLocaleDateString("he-IL", { year: 'numeric', month: 'long' });
  };

  return (
    <PageWrapper>
      <Container>
        <ReaderNav />
        
        <PageTitle>אזור אישי</PageTitle>

        <ProfileCard>
          <ProfileHeader>
            <Avatar>
              {getInitials(user?.fullName || user?.name)}
            </Avatar>
            <ProfileInfo>
              <ProfileName>{user?.fullName || user?.name || "קורא/ת"}</ProfileName>
              <ProfileDetail>
                <Mail size={16} />
                {user?.email || "לא צוין"}
              </ProfileDetail>
              <ProfileDetail>
                <Calendar size={16} />
                חבר/ה מאז {formatDate(user?.createdAt)}
              </ProfileDetail>
            </ProfileInfo>
          </ProfileHeader>

          <StatsGrid>
            <StatItem>
              <StatValue>-</StatValue>
              <StatLabel>גיליונות נקראו</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>-</StatValue>
              <StatLabel>כתבות שמורות</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>-</StatValue>
              <StatLabel>תגובות</StatLabel>
            </StatItem>
          </StatsGrid>
        </ProfileCard>

        <MenuSection>
          <SectionTitle>תפריט מהיר</SectionTitle>
          <MenuCard>
            <MenuItem onClick={() => navigate("/issues")}>
              <BookOpen size={20} />
              <MenuItemText>הגיליונות שלי</MenuItemText>
              <MenuItemArrow size={18} />
            </MenuItem>
            <MenuItem onClick={() => {}}>
              <Heart size={20} />
              <MenuItemText>כתבות שמורות</MenuItemText>
              <ComingSoon>בקרוב</ComingSoon>
            </MenuItem>
            <MenuItem onClick={() => {}}>
              <Settings size={20} />
              <MenuItemText>הגדרות</MenuItemText>
              <ComingSoon>בקרוב</ComingSoon>
            </MenuItem>
          </MenuCard>
        </MenuSection>

        <MenuSection style={{ marginTop: '1.5rem' }}>
          <MenuCard>
            <LogoutButton onClick={handleLogout}>
              <LogOut size={20} />
              <MenuItemText>התנתקות</MenuItemText>
            </LogoutButton>
          </MenuCard>
        </MenuSection>
      </Container>
    </PageWrapper>
  );
}

