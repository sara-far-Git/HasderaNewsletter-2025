/**
 * AnalyticsManagement.jsx
 * מערכת אנליטיקות - צפיות, מפת חום, דוחות והשוואות
 * מעוצב כמו אזור המפרסמים
 */

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { BarChart3, Eye, MousePointerClick, TrendingUp, Calendar, FileText } from 'lucide-react';
import AdminLayout from './AdminLayout';

// 🎬 אנימציות
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// 🎨 Container
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.8s ease-out;
`;

// 🎨 Header
const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const ReportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(16, 185, 129, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 50px;
  color: #10b981;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: #10b981;
    transform: translateY(-2px);
  }
  
  svg {
    width: 18px;
    height: 18px;
    display: block;
  }
`;

// 🎨 Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1rem;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
  
  svg {
    width: 24px;
    height: 24px;
    display: block;
  }
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

// 🎨 Tabs Bar
const TabsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active 
    ? 'rgba(16, 185, 129, 0.2)' 
    : 'transparent'};
  backdrop-filter: blur(10px);
  border: none;
  border-bottom: 3px solid ${props => props.$active 
    ? '#10b981' 
    : 'transparent'};
  color: ${props => props.$active ? '#10b981' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    color: #10b981;
  }
`;

const ContentArea = styled.div`
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.6s;
  animation-fill-mode: both;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: rgba(255, 255, 255, 0.7);
  
  svg {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    opacity: 0.5;
    display: block;
  }
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
    <AdminLayout title="מערכת אנליטיקות">
      <Container>
        <Header>
          <ReportButton>
            <Calendar size={18} />
            דוח חודשי
          </ReportButton>
        </Header>

        <StatsGrid>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <StatCard key={index}>
                <StatIcon>
                  <Icon size={24} />
                </StatIcon>
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
          {(activeTab === 'overview' || activeTab === 'chat' || activeTab === 'heatmap' || activeTab === 'reports' || activeTab === 'comparison') && (
            <EmptyState>
              <BarChart3 size={64} />
              <p>
                {activeTab === 'overview'
                  ? 'סקירה כללית - בקרוב'
                  : activeTab === 'chat'
                  ? 'צ\'אט AI - בקרוב'
                  : activeTab === 'heatmap' 
                  ? 'מפת חום - בקרוב' 
                  : activeTab === 'reports' 
                  ? 'דוחות מפורטים - בקרוב' 
                  : 'השוואות בין גליונות - בקרוב'}
              </p>
            </EmptyState>
          )}
        </ContentArea>
      </Container>
    </AdminLayout>
  );
}
