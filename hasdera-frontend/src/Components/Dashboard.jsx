import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { 
  DollarSign, 
  BarChart3, 
  MessageCircle, 
  Bell, 
  Book,
  MapPin,
  TrendingUp,
  AlertCircle,
  FileText,
  Plus,
  ArrowRight,
  Lightbulb,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, Grid, Container as ThemeContainer, Badge, PrimaryButton } from "../styles";
import hasederaTheme from "../styles/HasederaTheme";
// Chatbot מופיע ב-App.jsx ככפתור צף גלובלי

// 🎨 Styled Components
const Container = styled(ThemeContainer)`
  min-height: 100vh;
  background: ${hasederaTheme.colors.background.main};
  padding: ${hasederaTheme.spacing.xl} ${hasederaTheme.spacing['2xl']};
  max-width: 1400px;
`;

// === Above the Fold Section ===
const AboveFoldSection = styled.section`
  margin-bottom: ${hasederaTheme.spacing['2xl']};
`;

const WelcomeCard = styled(Card)`
  background: ${hasederaTheme.colors.gradient.primary};
  color: ${hasederaTheme.colors.text.white};
  padding: ${hasederaTheme.spacing.xl} ${hasederaTheme.spacing['2xl']};
  margin-bottom: ${hasederaTheme.spacing.lg};
  border: none;
`;

const WelcomeText = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${hasederaTheme.spacing.md};
`;

const WelcomeTitle = styled.h1`
  font-size: ${hasederaTheme.typography.fontSize['2xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  margin: 0;
  color: ${hasederaTheme.colors.text.white};
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${hasederaTheme.spacing.md};
  margin-bottom: ${hasederaTheme.spacing.lg};
`;

const QuickActionCard = styled(Card)`
  cursor: pointer;
  padding: ${hasederaTheme.spacing.lg};
  text-align: center;
  border: 2px solid ${hasederaTheme.colors.border.light};
  transition: ${hasederaTheme.transitions.base};
  
  &:hover {
    border-color: ${hasederaTheme.colors.primary.main};
    box-shadow: ${hasederaTheme.shadows.md};
    transform: translateY(-2px);
  }
`;

const QuickActionIcon = styled.div`
  padding: ${hasederaTheme.spacing.md};
  background: ${hasederaTheme.colors.gradient.primary};
  border-radius: ${hasederaTheme.borderRadius.lg};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${hasederaTheme.spacing.sm};
  flex-shrink: 0;
  
  svg {
    color: ${hasederaTheme.colors.text.white};
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: block;
  }
`;

const QuickActionTitle = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0;
`;

const StatusCard = styled(Card)`
  padding: ${hasederaTheme.spacing.lg};
  border-left: 4px solid ${hasederaTheme.colors.primary.main};
`;

const StatusTitle = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.lg};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0 0 ${hasederaTheme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
  
  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    display: block;
  }
`;

const StatusList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${hasederaTheme.spacing.sm};
`;

const StatusItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${hasederaTheme.spacing.sm};
  background: ${hasederaTheme.colors.background.hover};
  border-radius: ${hasederaTheme.borderRadius.md};
`;

const StatusItemText = styled.span`
  font-size: ${hasederaTheme.typography.fontSize.base};
  color: ${hasederaTheme.colors.text.primary};
`;

// === Scroll Section ===
const ScrollSection = styled.section`
  margin-bottom: ${hasederaTheme.spacing['2xl']};
`;

const SectionTitle = styled.h2`
  font-size: ${hasederaTheme.typography.fontSize.xl};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0 0 ${hasederaTheme.spacing.lg} 0;
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
`;

const ModulesGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${hasederaTheme.spacing.lg};
`;

const ModuleCard = styled(Card)`
  cursor: pointer;
  padding: ${hasederaTheme.spacing.xl};
  transition: ${hasederaTheme.transitions.base};
  border: 2px solid ${hasederaTheme.colors.border.light};
  
  &:hover {
    border-color: ${hasederaTheme.colors.primary.main};
    box-shadow: ${hasederaTheme.shadows.md};
    transform: translateY(-4px);
  }
`;

const ModuleHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.md};
  margin-bottom: ${hasederaTheme.spacing.md};
`;

const ModuleIcon = styled.div`
  padding: ${hasederaTheme.spacing.md};
  background: ${hasederaTheme.colors.gradient.primary};
  border-radius: ${hasederaTheme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${hasederaTheme.shadows.green};
  flex-shrink: 0;
  
  svg {
    color: ${hasederaTheme.colors.text.white};
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: block;
  }
`;

const ModuleTitle = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.lg};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${hasederaTheme.spacing.md};
  margin-bottom: ${hasederaTheme.spacing.lg};
`;

const StatCard = styled(Card)`
  padding: ${hasederaTheme.spacing.lg};
  text-align: center;
  border: 1px solid ${hasederaTheme.colors.border.light};
`;

const StatValue = styled.div`
  font-size: ${hasederaTheme.typography.fontSize['2xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  color: ${hasederaTheme.colors.primary.main};
  margin-bottom: ${hasederaTheme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${hasederaTheme.typography.fontSize.sm};
  color: ${hasederaTheme.colors.text.secondary};
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${hasederaTheme.spacing.sm};
`;

const AlertItem = styled(Card)`
  padding: ${hasederaTheme.spacing.md};
  border-right: 4px solid ${hasederaTheme.colors.status.info};
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
`;

// === Bottom Section ===
const BottomSection = styled.section`
  margin-top: ${hasederaTheme.spacing['2xl']};
  padding-top: ${hasederaTheme.spacing.xl};
  border-top: 1px solid ${hasederaTheme.colors.border.light};
`;

const TipsCard = styled(Card)`
  padding: ${hasederaTheme.spacing.lg};
`;

const TipsTitle = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.lg};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0 0 ${hasederaTheme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
`;

const TipsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${hasederaTheme.spacing.sm};
`;

const TipItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${hasederaTheme.spacing.sm};
  color: ${hasederaTheme.colors.text.secondary};
  font-size: ${hasederaTheme.typography.fontSize.base};
  
  &::before {
    content: "💡";
    flex-shrink: 0;
  }
`;

const DeepReportsLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
  color: ${hasederaTheme.colors.primary.main};
  text-decoration: none;
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  margin-top: ${hasederaTheme.spacing.md};
  
  &:hover {
    text-decoration: underline;
  }
`;

// 🔹 Dashboard Component
export default function Dashboard() {
  const navigate = useNavigate();
  const [userName] = useState("משתמש"); // TODO: לקבל מהקונטקסט/API

  // דוגמה לנתונים - יש להחליף ב-API אמיתי
  const activeAds = [
    { id: 1, title: "מודעה בגיליון 123", status: "פעילה", date: "2024-01-15" },
    { id: 2, title: "מודעה בגיליון 122", status: "ממתינה", date: "2024-01-10" },
  ];

  const recentAlerts = [
    { id: 1, text: "מודעה חדשה אושרה", time: "לפני שעה" },
    { id: 2, text: "תשלום התקבל", time: "לפני 3 שעות" },
  ];

  const quickActions = [
    { icon: Plus, title: "צור מודעה", onClick: () => navigate('/advertiser/placement') },
    { icon: MapPin, title: "בחר מיקום", onClick: () => navigate('/advertiser/placement') },
    { icon: DollarSign, title: "תשלום", onClick: () => navigate('/advertiser/payment') },
    { icon: BarChart3, title: "אנליטיקה", onClick: () => navigate('/analytics') },
  ];

  return (
    <>
      <Container>
        {/* === Above the Fold === */}
        <AboveFoldSection>
          <WelcomeCard>
            <WelcomeText>
              <WelcomeTitle>שלום {userName} 👋</WelcomeTitle>
            </WelcomeText>
          </WelcomeCard>

          <QuickActionsGrid>
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <QuickActionCard key={idx} onClick={action.onClick}>
                  <QuickActionIcon>
                    <Icon size={24} />
                  </QuickActionIcon>
                  <QuickActionTitle>{action.title}</QuickActionTitle>
                </QuickActionCard>
              );
            })}
          </QuickActionsGrid>

          <StatusCard>
            <StatusTitle>
              <AlertCircle size={20} />
              סטטוס נוכחי מודעות
            </StatusTitle>
            <StatusList>
              {activeAds.length > 0 ? (
                activeAds.map((ad) => (
                  <StatusItem key={ad.id}>
                    <StatusItemText>{ad.title}</StatusItemText>
                    <Badge $variant={ad.status === "פעילה" ? "success" : "warning"}>
                      {ad.status}
                    </Badge>
                  </StatusItem>
                ))
              ) : (
                <StatusItem>
                  <StatusItemText>אין מודעות פעילות</StatusItemText>
                </StatusItem>
              )}
            </StatusList>
          </StatusCard>
        </AboveFoldSection>

        {/* === Scroll Section === */}
        <ScrollSection>
          <SectionTitle>
            <TrendingUp size={24} />
            סטטיסטיקה כללית
          </SectionTitle>
          <StatsGrid>
            <StatCard>
              <StatValue>5</StatValue>
              <StatLabel>מודעות פעילות</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>12</StatValue>
              <StatLabel>גליונות</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>₪2,500</StatValue>
              <StatLabel>סה"כ הוצאות</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>8.5%</StatValue>
              <StatLabel>CTR ממוצע</StatLabel>
            </StatCard>
          </StatsGrid>

          <SectionTitle>
            <Bell size={24} />
            התראות אחרונות
          </SectionTitle>
          <AlertsList>
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <AlertItem key={alert.id}>
                  <Bell size={18} />
                  <div>
                    <div>{alert.text}</div>
                    <div style={{ fontSize: hasederaTheme.typography.fontSize.sm, color: hasederaTheme.colors.text.secondary }}>
                      {alert.time}
                    </div>
                  </div>
                </AlertItem>
              ))
            ) : (
              <AlertItem>
                <div>אין התראות חדשות</div>
              </AlertItem>
            )}
          </AlertsList>

          <SectionTitle>
            <FileText size={24} />
            מודולים נוספים
          </SectionTitle>
          <ModulesGrid>
            <ModuleCard onClick={() => navigate('/issues')}>
              <ModuleHeader>
                <ModuleIcon>
                  <Book size={24} />
                </ModuleIcon>
                <ModuleTitle>גליונות</ModuleTitle>
              </ModuleHeader>
              <div>היסטוריה, הורדת PDF</div>
            </ModuleCard>

            <ModuleCard onClick={() => navigate('/analytics')}>
              <ModuleHeader>
                <ModuleIcon>
                  <BarChart3 size={24} />
                </ModuleIcon>
                <ModuleTitle>אנליטיקה</ModuleTitle>
              </ModuleHeader>
              <div>גרפים • דוחות • השוואות</div>
            </ModuleCard>

            <ModuleCard onClick={() => navigate('/advertiser/payment')}>
              <ModuleHeader>
                <ModuleIcon>
                  <DollarSign size={24} />
                </ModuleIcon>
                <ModuleTitle>תשלומים</ModuleTitle>
              </ModuleHeader>
              <div>חשבוניות • תשלום חדש</div>
            </ModuleCard>
          </ModulesGrid>
        </ScrollSection>

        {/* === Bottom Section === */}
        <BottomSection>
          <TipsCard>
            <TipsTitle>
              <Lightbulb size={20} />
              טיפים ועזרה
            </TipsTitle>
            <TipsList>
              <TipItem>השתמש ב-Assistant כדי לקבל המלצות על מיקום פרסום</TipItem>
              <TipItem>בדוק את האנליטיקה כדי להבין את ביצועי המודעות שלך</TipItem>
              <TipItem>שמור על מודעות פעילות כדי להגדיל את הנראות</TipItem>
            </TipsList>
            <DeepReportsLink href="/analytics">
              לינק לדוחות מעמיקים
              <ExternalLink size={16} />
            </DeepReportsLink>
          </TipsCard>
        </BottomSection>
      </Container>
    </>
  );
}
