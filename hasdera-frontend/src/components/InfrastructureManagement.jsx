/**
 * InfrastructureManagement.jsx
 * תשתית ודוחות מערכת - גיבויים, Storage, בדיקות ומעקב
 * מעוצב כמו אזור המפרסמים
 */

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Settings, Database, Cloud, CheckCircle, AlertCircle, FileArchive, Server } from 'lucide-react';
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

const SettingsButton = styled.button`
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

// 🎨 Services Grid
const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.6s;
  animation-fill-mode: both;
`;

const ServiceCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateY(-4px);
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ServiceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ServiceIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
  
  svg {
    width: 24px;
    height: 24px;
    display: block;
  }
`;

const ServiceDetails = styled.div`
  flex: 1;
`;

const ServiceName = styled.h3`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: white;
  margin: 0 0 0.25rem 0;
  letter-spacing: 1px;
`;

const ServiceStatus = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: ${props => {
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.2)';
    if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
    if (props.$variant === 'error') return 'rgba(239, 68, 68, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.3)';
    if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.3)';
    if (props.$variant === 'error') return 'rgba(239, 68, 68, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => {
    if (props.$variant === 'success') return '#10b981';
    if (props.$variant === 'warning') return '#f59e0b';
    if (props.$variant === 'error') return '#ef4444';
    return 'rgba(255, 255, 255, 0.7)';
  }};
`;

const ServiceMetrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
`;

const MetricLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
`;

const MetricValue = styled.span`
  color: white;
  font-weight: 600;
`;

const SectionTitle = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  font-weight: 400;
  color: white;
  margin-bottom: 2rem;
  letter-spacing: 1px;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.5s;
  animation-fill-mode: both;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
  }
`;

export default function InfrastructureManagement() {
  const [services] = useState([
    {
      id: 1,
      name: 'AWS S3 Storage',
      status: 'operational',
      statusLabel: 'פעיל',
      icon: Cloud,
      metrics: [
        { label: 'שימוש', value: '245 GB / 500 GB' },
        { label: 'קבצים', value: '1,234' },
        { label: 'גיבויים', value: '12' },
      ],
    },
    {
      id: 2,
      name: 'PostgreSQL Database',
      status: 'operational',
      statusLabel: 'פעיל',
      icon: Database,
      metrics: [
        { label: 'גודל DB', value: '12.5 GB' },
        { label: 'חיבורים פעילים', value: '8' },
        { label: 'ביצועים', value: 'מצוין' },
      ],
    },
    {
      id: 3,
      name: 'Backup System',
      status: 'warning',
      statusLabel: 'דורש תשומת לב',
      icon: FileArchive,
      metrics: [
        { label: 'גיבוי אחרון', value: 'אתמול 02:00' },
        { label: 'גיבויים שבועיים', value: '7/7' },
        { label: 'גודל גיבוי', value: '45 GB' },
      ],
    },
    {
      id: 4,
      name: 'File Availability',
      status: 'operational',
      statusLabel: 'פעיל',
      icon: Server,
      metrics: [
        { label: 'קבצים זמינים', value: '99.9%' },
        { label: 'זמן תגובה ממוצע', value: '120ms' },
        { label: 'שגיאות', value: '0' },
      ],
    },
  ]);

  const stats = [
    { label: 'גיבויים שבועיים', value: '7', icon: FileArchive },
    { label: 'שימוש ב-Storage', value: '245 GB', icon: Cloud },
    { label: 'קבצים במערכת', value: '1,234', icon: Database },
    { label: 'זמינות מערכת', value: '99.9%', icon: CheckCircle },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'operational':
        return <Badge $variant="success">פעיל</Badge>;
      case 'warning':
        return <Badge $variant="warning">אזהרה</Badge>;
      case 'error':
        return <Badge $variant="error">שגיאה</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="תשתית ודוחות מערכת">
      <Container>
        <Header>
          <SettingsButton>
            <Settings size={18} />
            הגדרות
          </SettingsButton>
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

        <SectionTitle>שירותי מערכת</SectionTitle>

        <ServicesGrid>
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <ServiceCard key={service.id}>
                <ServiceHeader>
                  <ServiceInfo>
                    <ServiceIcon>
                      <Icon size={24} />
                    </ServiceIcon>
                    <ServiceDetails>
                      <ServiceName>{service.name}</ServiceName>
                      <ServiceStatus>{service.statusLabel}</ServiceStatus>
                    </ServiceDetails>
                  </ServiceInfo>
                  {getStatusBadge(service.status)}
                </ServiceHeader>
                <ServiceMetrics>
                  {service.metrics.map((metric, idx) => (
                    <MetricRow key={idx}>
                      <MetricLabel>{metric.label}</MetricLabel>
                      <MetricValue>{metric.value}</MetricValue>
                    </MetricRow>
                  ))}
                </ServiceMetrics>
                <CardActions>
                  <ActionButton>בדיקה</ActionButton>
                  <ActionButton>הגדרות</ActionButton>
                </CardActions>
              </ServiceCard>
            );
          })}
        </ServicesGrid>
      </Container>
    </AdminLayout>
  );
}
