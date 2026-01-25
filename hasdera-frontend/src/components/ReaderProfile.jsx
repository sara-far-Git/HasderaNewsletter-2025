import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Calendar, BookOpen, Heart, Settings, LogOut, ChevronLeft,
  Bell, Clock, Star, Eye, Bookmark, Edit2, Moon, Sun
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getIssues } from "../Services/issuesService";
import ReaderNav from "./ReaderNav";

/* ======================== Animations ======================== */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ======================== Styled Components ======================== */
const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  color: #f8fafc;
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
      rgba(15, 23, 42, 0.92) 0%,
      rgba(30, 41, 59, 0.85) 50%,
      rgba(15, 23, 42, 0.92) 100%
    );
  }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
  position: relative;
  z-index: 1;
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

/* ============ Reading History ============ */
const HistorySection = styled.section`
  margin-top: 2rem;
  animation: ${fadeInUp} 0.6s ease-out 0.3s both;
`;

const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const HistoryCard = styled.div`
  background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(16, 185, 129, 0.4);
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  }
`;

const HistoryCover = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 10px;
  margin-bottom: 0.75rem;
  background: ${props => props.$gradient || 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.6);
`;

const HistoryTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HistoryDate = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
`;

/* ============ Toggle ============ */
const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);

  &:last-child {
    border-bottom: none;
  }
`;

const ToggleLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #f8fafc;
  
  svg {
    color: #10b981;
  }
`;

const Toggle = styled.button`
  width: 48px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: ${props => props.$active ? '#10b981' : 'rgba(255,255,255,0.15)'};
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.$active ? '25px' : '3px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: all 0.3s ease;
  }
`;

const EmptyHistory = styled.div`
  text-align: center;
  padding: 2rem;
  color: #64748b;
  
  svg {
    margin-bottom: 0.75rem;
    opacity: 0.5;
  }
`;

/* ======================== Component ======================== */
const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

export default function ReaderProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    newsletter: true,
    darkMode: true
  });

  // טעינת גיליונות אחרונים
  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await getIssues(1, 5, true);
        setRecentIssues(data || []);
      } catch (e) {
        console.error("Failed to load issues:", e);
      } finally {
        setLoading(false);
      }
    };
    loadIssues();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
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
      <BackgroundImage />
      <ReaderNav />
      <Container>
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

        {/* היסטוריית קריאה */}
        <HistorySection>
          <SectionTitle>
            <Clock size={18} style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }} />
            נקראו לאחרונה
          </SectionTitle>
          {loading ? (
            <EmptyHistory>טוען...</EmptyHistory>
          ) : recentIssues.length === 0 ? (
            <EmptyHistory>
              <BookOpen size={32} />
              <div>עדיין לא קראת גיליונות</div>
            </EmptyHistory>
          ) : (
            <HistoryGrid>
              {recentIssues.slice(0, 4).map((issue, idx) => (
                <HistoryCard 
                  key={issue.issue_id || issue.issueId}
                  onClick={() => navigate(`/issues/${issue.issue_id || issue.issueId}`)}
                >
                  <HistoryCover $gradient={GRADIENTS[idx % GRADIENTS.length]}>
                    <BookOpen size={28} />
                  </HistoryCover>
                  <HistoryTitle>{issue.title || `גיליון ${issue.issue_id || issue.issueId}`}</HistoryTitle>
                  <HistoryDate>{formatDate(issue.issueDate)}</HistoryDate>
                </HistoryCard>
              ))}
            </HistoryGrid>
          )}
        </HistorySection>

        {/* ניווט מהיר */}
        <MenuSection style={{ marginTop: '2rem' }}>
          <SectionTitle>ניווט מהיר</SectionTitle>
          <MenuCard>
            <MenuItem onClick={() => navigate("/issues")}>
              <BookOpen size={20} />
              <MenuItemText>ארכיון גיליונות</MenuItemText>
              <MenuItemArrow size={18} />
            </MenuItem>
            <MenuItem onClick={() => navigate("/")}>
              <Star size={20} />
              <MenuItemText>גיליון אחרון</MenuItemText>
              <MenuItemArrow size={18} />
            </MenuItem>
            <MenuItem onClick={() => {}}>
              <Bookmark size={20} />
              <MenuItemText>שמורים</MenuItemText>
              <ComingSoon>בקרוב</ComingSoon>
            </MenuItem>
          </MenuCard>
        </MenuSection>

        {/* הגדרות */}
        <MenuSection style={{ marginTop: '1.5rem' }}>
          <SectionTitle>הגדרות</SectionTitle>
          <MenuCard>
            <ToggleRow>
              <ToggleLabel>
                <Bell size={20} />
                התראות על גיליונות חדשים
              </ToggleLabel>
              <Toggle 
                $active={settings.notifications} 
                onClick={() => toggleSetting('notifications')}
              />
            </ToggleRow>
            <ToggleRow>
              <ToggleLabel>
                <Mail size={20} />
                ניוזלטר שבועי
              </ToggleLabel>
              <Toggle 
                $active={settings.newsletter} 
                onClick={() => toggleSetting('newsletter')}
              />
            </ToggleRow>
            <ToggleRow>
              <ToggleLabel>
                <Moon size={20} />
                מצב כהה
              </ToggleLabel>
              <Toggle 
                $active={settings.darkMode} 
                onClick={() => toggleSetting('darkMode')}
              />
            </ToggleRow>
          </MenuCard>
        </MenuSection>

        {/* יציאה */}
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

