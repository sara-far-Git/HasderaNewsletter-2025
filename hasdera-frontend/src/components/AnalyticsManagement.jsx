/**
 * AnalyticsManagement.jsx
 * מערכת אנליטיקות - צפיות, מפת חום, דוחות והשוואות
 */

import { useState } from 'react';
import styled from 'styled-components';
import { BarChart3, Eye, MousePointerClick, TrendingUp, Calendar, FileText } from 'lucide-react';
import hasederaTheme from '../styles/HasederaTheme';
import { Card, CardHeader, CardTitle, PrimaryButton, SecondaryButton } from '../styles';
import Analytics from '../components/Analytics';
import HasderaChat from '../components/HasderaChat';

const Container = styled.div`
  padding: ${hasederaTheme.spacing.xl};
  direction: rtl;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${hasederaTheme.spacing['2xl']};
`;

const Title = styled.h1`
  font-size: ${hasederaTheme.typography.fontSize['3xl']};
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
  text-align: center;
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.main} 0%, ${hasederaTheme.colors.primary.dark} 100%);
  color: ${hasederaTheme.colors.text.white};
  border: none;
`;

const StatValue = styled.div`
  font-size: ${hasederaTheme.typography.fontSize['3xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  margin-bottom: ${hasederaTheme.spacing.sm};
`;

const StatLabel = styled.div`
  font-size: ${hasederaTheme.typography.fontSize.base};
  opacity: 0.9;
`;

const TabsBar = styled.div`
  display: flex;
  gap: ${hasederaTheme.spacing.md};
  margin-bottom: ${hasederaTheme.spacing.xl};
  border-bottom: 2px solid ${hasederaTheme.colors.border.light};
`;

const Tab = styled.button`
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing.xl};
  background: transparent;
  border: none;
  border-bottom: 3px solid ${props => props.$active ? hasederaTheme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? hasederaTheme.colors.primary.main : hasederaTheme.colors.text.secondary};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${props => props.$active ? hasederaTheme.typography.fontWeight.semibold : hasederaTheme.typography.fontWeight.normal};
  cursor: pointer;
  transition: all ${hasederaTheme.transitions.base};
`;

const ContentArea = styled.div`
  margin-top: ${hasederaTheme.spacing.xl};
`;

export default function AnalyticsManagement() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'סה"כ צפיות החודש', value: '45,230', icon: Eye },
    { label: 'עמודים נצפים ביותר', value: '12', icon: FileText },
    { label: 'קליקים על מפרסמים', value: '1,245', icon: MousePointerClick },
    { label: 'שיעור חזרה', value: '68%', icon: TrendingUp },
  ];

  return (
    <Container>
      <Header>
        <Title>מערכת אנליטיקות</Title>
        <PrimaryButton>
          <Calendar size={18} style={{ marginLeft: '8px' }} />
          דוח חודשי
        </PrimaryButton>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <StatCard key={index}>
              <Icon size={32} style={{ marginBottom: '12px', opacity: 0.8 }} />
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          );
        })}
      </StatsGrid>

      <TabsBar>
        <Tab $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          סקירה כללית
        </Tab>
        <Tab $active={activeTab === 'heatmap'} onClick={() => setActiveTab('heatmap')}>
          מפת חום
        </Tab>
        <Tab $active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>
          דוחות
        </Tab>
        <Tab $active={activeTab === 'comparison'} onClick={() => setActiveTab('comparison')}>
          השוואות
        </Tab>
        <Tab $active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>
          צ'אט AI
        </Tab>
      </TabsBar>

      <ContentArea>
        {activeTab === 'overview' && <Analytics />}
        {activeTab === 'chat' && <HasderaChat />}
        {(activeTab === 'heatmap' || activeTab === 'reports' || activeTab === 'comparison') && (
          <div style={{ textAlign: 'center', padding: '4rem', color: hasederaTheme.colors.text.secondary }}>
            <BarChart3 size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>{activeTab === 'heatmap' ? 'מפת חום - בקרוב' : activeTab === 'reports' ? 'דוחות מפורטים - בקרוב' : 'השוואות בין גליונות - בקרוב'}</p>
          </div>
        )}
      </ContentArea>
    </Container>
  );
}

