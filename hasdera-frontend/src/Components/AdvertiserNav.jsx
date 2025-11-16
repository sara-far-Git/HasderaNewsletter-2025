import React from "react";
import styled from "styled-components";
import { Users, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Container as ThemeContainer, 
  Card
} from "../styles";
import hasederaTheme from "../styles/HasederaTheme";

// 🎨 Styled Components - מבוסס על התמה החדשה
const Container = styled(ThemeContainer)`
  min-height: 100vh;
  background: ${hasederaTheme.colors.background.main};
  display: flex;
  flex-direction: column;
  padding: 0;
`;

// אזור ברכה מרכזי
const WelcomeSection = styled.section`
  padding: ${hasederaTheme.spacing['2xl']} ${hasederaTheme.spacing['2xl']};
  text-align: center;
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.main}08 0%, ${hasederaTheme.colors.primary.dark}05 100%);
  border-bottom: 1px solid ${hasederaTheme.colors.border.light};
`;

const WelcomeTitle = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${hasederaTheme.spacing.lg};
`;

const WelcomeIcon = styled.div`
  padding: ${hasederaTheme.spacing.lg};
  background: ${hasederaTheme.colors.gradient.primary};
  border-radius: ${hasederaTheme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${hasederaTheme.shadows.green};
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  svg {
    color: ${hasederaTheme.colors.text.white};
  }
`;

const WelcomeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${hasederaTheme.spacing.sm};
`;

const WelcomeHeading = styled.h1`
  font-size: ${hasederaTheme.typography.fontSize['3xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.dark} 0%, ${hasederaTheme.colors.primary.main} 50%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  
  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    font-size: ${hasederaTheme.typography.fontSize['2xl']};
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: ${hasederaTheme.typography.fontSize.lg};
  color: ${hasederaTheme.colors.text.secondary};
  margin: 0;
`;

// מיכל הכרטיסיות
const GridContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${hasederaTheme.spacing['2xl']} ${hasederaTheme.spacing['2xl']};
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: ${hasederaTheme.spacing.xl};
  
  @media (min-width: ${hasederaTheme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${hasederaTheme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

// כרטיס אימות
const AuthCard = styled(Card)`
  text-align: center;
  border: 2px solid ${hasederaTheme.colors.border.light};
  transition: ${hasederaTheme.transitions.base};
  
  &:hover {
    border-color: ${hasederaTheme.colors.primary.main};
    box-shadow: ${hasederaTheme.shadows.md};
    transform: translateY(-4px);
  }
`;

// כרטיס גישה מהירה
const QuickAccessCard = styled(AuthCard)`
  grid-column: 1 / -1;
  
  @media (min-width: ${hasederaTheme.breakpoints.lg}) {
    grid-column: span 1;
  }
`;

const CardContent = styled.div`
  padding: ${hasederaTheme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${hasederaTheme.spacing.md};
`;

const CardTitle = styled.h3`
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  font-size: ${hasederaTheme.typography.fontSize.xl};
  margin: 0;
`;

const CardDescription = styled.p`
  font-size: ${hasederaTheme.typography.fontSize.base};
  color: ${hasederaTheme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${hasederaTheme.spacing.sm};
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing.lg};
  background: ${props => props.$primary ? hasederaTheme.colors.gradient.primary : 'transparent'};
  color: ${props => props.$primary ? hasederaTheme.colors.text.white : hasederaTheme.colors.primary.main};
  border: 2px solid ${props => props.$primary ? 'transparent' : hasederaTheme.colors.primary.main};
  border-radius: ${hasederaTheme.borderRadius.md};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  width: 100%;
  
  &:hover {
    background: ${props => props.$primary ? hasederaTheme.colors.primary.dark : hasederaTheme.colors.primary.main};
    color: ${hasederaTheme.colors.text.white};
    transform: translateY(-2px);
    box-shadow: ${hasederaTheme.shadows.md};
  }
`;

const NoteText = styled.p`
  font-size: ${hasederaTheme.typography.fontSize.sm};
  color: ${hasederaTheme.colors.text.secondary};
  margin: 0;
  font-style: italic;
`;

// 🔹 רכיב הניווט הראשי - דף נחיתה למפרסמים
export default function AdvertiserNav() {
  const navigate = useNavigate();

  const goToDashboard = () => navigate('/dashboard');
  const goToLogin = () => {
    // TODO: הוספת לוגיקה של התחברות
    alert('מערכת התחברות תתווסף בקרוב');
    navigate('/dashboard');
  };
  const goToRegister = () => {
    // TODO: הוספת לוגיקה של הרשמה
    alert('מערכת הרשמה תתווסף בקרוב');
    navigate('/dashboard');
  };

  return (
    <Container>
      {/* כותרת מרכזית - ללא Header כפול כי יש Navbar */}
      <WelcomeSection>
        <WelcomeTitle>
          <WelcomeIcon>
            <Users size={32} />
          </WelcomeIcon>
          <WelcomeText>
            <WelcomeHeading>דף נחיתה למפרסמים</WelcomeHeading>
            <WelcomeSubtitle>התחברו או הירשמו כדי להתחיל</WelcomeSubtitle>
          </WelcomeText>
        </WelcomeTitle>
      </WelcomeSection>
      
      <GridContainer>
        <AuthCard>
          <CardContent>
            <CardTitle>התחברות</CardTitle>
            <CardDescription>יש לכם חשבון? התחברו כאן</CardDescription>
            <ActionButton onClick={goToLogin}>
              <LogIn size={20} />
              <span>התחברות</span>
              <ArrowRight size={16} />
            </ActionButton>
          </CardContent>
        </AuthCard>

        <AuthCard>
          <CardContent>
            <CardTitle>הרשמה חדשה</CardTitle>
            <CardDescription>משתמש חדש? הירשמו כאן</CardDescription>
            <ActionButton onClick={goToRegister} $primary>
              <UserPlus size={20} />
              <span>הרשמה חדשה</span>
              <ArrowRight size={16} />
            </ActionButton>
            <NoteText>← אימות מייל</NoteText>
          </CardContent>
        </AuthCard>

        <QuickAccessCard>
          <CardContent>
            <CardTitle>גישה מהירה</CardTitle>
            <CardDescription>דלגו ישירות ל-Dashboard</CardDescription>
            <ActionButton onClick={goToDashboard} $primary>
              <ArrowRight size={20} />
              <span>דף הבית (Dashboard)</span>
            </ActionButton>
          </CardContent>
        </QuickAccessCard>
      </GridContainer>
    </Container>
  );
}