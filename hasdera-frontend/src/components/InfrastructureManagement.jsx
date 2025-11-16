/**
 * InfrastructureManagement.jsx
 * תשתית ודוחות מערכת - גיבויים, Storage, בדיקות ומעקב
 */

import { useState } from 'react';
import styled from 'styled-components';
import { Settings, Database, Cloud, CheckCircle, AlertCircle, FileArchive, Server } from 'lucide-react';
import hasederaTheme from '../styles/HasederaTheme';
import { Card, CardHeader, CardTitle, PrimaryButton, SecondaryButton, Badge } from '../styles';

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
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${hasederaTheme.borderRadius.lg};
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.main} 0%, ${hasederaTheme.colors.primary.dark} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${hasederaTheme.colors.text.white};
  margin: 0 auto ${hasederaTheme.spacing.lg};
`;

const StatValue = styled.div`
  font-size: ${hasederaTheme.typography.fontSize['2xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  color: ${hasederaTheme.colors.text.primary};
  margin-bottom: ${hasederaTheme.spacing.sm};
`;

const StatLabel = styled.div`
  font-size: ${hasederaTheme.typography.fontSize.base};
  color: ${hasederaTheme.colors.text.secondary};
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${hasederaTheme.spacing.xl};
`;

const ServiceCard = styled(Card)`
  position: relative;
`;

const ServiceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${hasederaTheme.spacing.lg};
`;

const ServiceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.md};
`;

const ServiceIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${hasederaTheme.borderRadius.md};
  background: ${hasederaTheme.colors.background.main};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${hasederaTheme.colors.primary.main};
`;

const ServiceDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${hasederaTheme.spacing.xs};
`;

const ServiceName = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.lg};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0;
`;

const ServiceStatus = styled.div`
  font-size: ${hasederaTheme.typography.fontSize.sm};
  color: ${hasederaTheme.colors.text.secondary};
`;

const ServiceMetrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${hasederaTheme.spacing.sm};
  margin-top: ${hasederaTheme.spacing.lg};
  padding-top: ${hasederaTheme.spacing.lg};
  border-top: 1px solid ${hasederaTheme.colors.border.light};
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${hasederaTheme.typography.fontSize.base};
`;

const MetricLabel = styled.span`
  color: ${hasederaTheme.colors.text.secondary};
`;

const MetricValue = styled.span`
  color: ${hasederaTheme.colors.text.primary};
  font-weight: ${hasederaTheme.typography.fontWeight.medium};
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
        return <Badge variant="success">פעיל</Badge>;
      case 'warning':
        return <Badge variant="warning">אזהרה</Badge>;
      case 'error':
        return <Badge variant="error">שגיאה</Badge>;
      default:
        return null;
    }
  };

  return (
    <Container>
      <Header>
        <Title>תשתית ודוחות מערכת</Title>
        <PrimaryButton>
          <Settings size={18} style={{ marginLeft: '8px' }} />
          הגדרות
        </PrimaryButton>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <StatCard key={index}>
              <StatIcon>
                <Icon size={28} />
              </StatIcon>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          );
        })}
      </StatsGrid>

      <h2 style={{ marginBottom: hasederaTheme.spacing.xl, fontSize: hasederaTheme.typography.fontSize['2xl'] }}>
        שירותי מערכת
      </h2>

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
              <div style={{ marginTop: hasederaTheme.spacing.lg, display: 'flex', gap: hasederaTheme.spacing.sm }}>
                <SecondaryButton style={{ flex: 1, fontSize: '14px', padding: '8px' }}>
                  בדיקה
                </SecondaryButton>
                <SecondaryButton style={{ flex: 1, fontSize: '14px', padding: '8px' }}>
                  הגדרות
                </SecondaryButton>
              </div>
            </ServiceCard>
          );
        })}
      </ServicesGrid>
    </Container>
  );
}

