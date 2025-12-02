/**
 * IntegrationsManagement.jsx
 * אזור התממשקות - Monday.com, Supabase, AWS S3, OpenAI, WhatsApp
 */

import { useState } from 'react';
import styled from 'styled-components';
import { Plug, CheckCircle, XCircle, Settings, RefreshCw } from 'lucide-react';
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

const IntegrationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${hasederaTheme.spacing.xl};
`;

const IntegrationCard = styled(Card)`
  position: relative;
`;

const IntegrationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${hasederaTheme.spacing.lg};
`;

const IntegrationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.md};
`;

const IntegrationIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${hasederaTheme.borderRadius.lg};
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.main} 0%, ${hasederaTheme.colors.primary.dark} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${hasederaTheme.colors.text.white};
  font-size: ${hasederaTheme.typography.fontSize['2xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
`;

const IntegrationDetails = styled.div`
  flex: 1;
`;

const IntegrationName = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.xl};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0 0 ${hasederaTheme.spacing.xs} 0;
`;

const IntegrationDescription = styled.p`
  font-size: ${hasederaTheme.typography.fontSize.sm};
  color: ${hasederaTheme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const IntegrationFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${hasederaTheme.spacing.lg} 0;
  display: flex;
  flex-direction: column;
  gap: ${hasederaTheme.spacing.xs};
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
  font-size: ${hasederaTheme.typography.fontSize.sm};
  color: ${hasederaTheme.colors.text.secondary};

  &::before {
    content: '•';
    color: ${hasederaTheme.colors.primary.main};
    font-weight: bold;
    font-size: ${hasederaTheme.typography.fontSize.lg};
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: ${hasederaTheme.spacing.sm};
  margin-top: ${hasederaTheme.spacing.lg};
  padding-top: ${hasederaTheme.spacing.lg};
  border-top: 1px solid ${hasederaTheme.colors.border.light};
`;

export default function IntegrationsManagement() {
  const [integrations] = useState([
    {
      id: 1,
      name: 'Monday.com',
      description: 'ניהול משימות ופרויקטים',
      icon: 'M',
      status: 'connected',
      statusLabel: 'מחובר',
      features: ['סנכרון משימות', 'עדכוני סטטוס', 'ניהול תאריכים'],
    },
    {
      id: 2,
      name: 'Supabase / PostgreSQL',
      description: 'מסד נתונים ראשי',
      icon: 'S',
      status: 'connected',
      statusLabel: 'מחובר',
      features: ['סנכרון נתונים', 'גיבויים אוטומטיים', 'שאילתות בזמן אמת'],
    },
    {
      id: 3,
      name: 'AWS S3',
      description: 'אחסון קבצים',
      icon: 'A',
      status: 'connected',
      statusLabel: 'מחובר',
      features: ['העלאת קבצים', 'גיבויים', 'CDN'],
    },
    {
      id: 4,
      name: 'OpenAI Chat Agent',
      description: 'סוכן AI לאנליטיקות',
      icon: 'AI',
      status: 'connected',
      statusLabel: 'מחובר',
      features: ['צ\'אט אנליטיקות', 'ניתוח נתונים', 'דוחות אוטומטיים'],
    },
    {
      id: 5,
      name: 'מערכת חשבוניות',
      description: 'ניהול חשבוניות ותשלומים',
      icon: '₪',
      status: 'connected',
      statusLabel: 'מחובר',
      features: ['יצירת חשבוניות', 'מעקב תשלומים', 'דוחות כספיים'],
    },
    {
      id: 6,
      name: 'WhatsApp API',
      description: 'שליחת ניוזלטר',
      icon: 'W',
      status: 'disconnected',
      statusLabel: 'לא מחובר',
      features: ['שליחת הודעות', 'ניהול רשימות', 'תבניות הודעות'],
    },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} />
            מחובר
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="error" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={14} />
            לא מחובר
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <Header>
        <Title>אזור התממשקות</Title>
        <PrimaryButton>
          <Plug size={18} style={{ marginLeft: '8px' }} />
          הוספת אינטגרציה
        </PrimaryButton>
      </Header>

      <IntegrationsGrid>
        {integrations.map((integration) => (
          <IntegrationCard key={integration.id}>
            <IntegrationHeader>
              <IntegrationInfo>
                <IntegrationIcon>{integration.icon}</IntegrationIcon>
                <IntegrationDetails>
                  <IntegrationName>{integration.name}</IntegrationName>
                  <IntegrationDescription>{integration.description}</IntegrationDescription>
                </IntegrationDetails>
              </IntegrationInfo>
              {getStatusBadge(integration.status)}
            </IntegrationHeader>

            <IntegrationFeatures>
              {integration.features.map((feature, idx) => (
                <FeatureItem key={idx}>{feature}</FeatureItem>
              ))}
            </IntegrationFeatures>

            <CardActions>
              {integration.status === 'connected' ? (
                <>
                  <SecondaryButton style={{ flex: 1 }}>
                    <Settings size={16} style={{ marginLeft: '4px' }} />
                    הגדרות
                  </SecondaryButton>
                  <SecondaryButton style={{ flex: 1 }}>
                    <RefreshCw size={16} style={{ marginLeft: '4px' }} />
                    רענון
                  </SecondaryButton>
                </>
              ) : (
                <PrimaryButton style={{ flex: 1 }}>
                  <Plug size={16} style={{ marginLeft: '4px' }} />
                  התחברות
                </PrimaryButton>
              )}
            </CardActions>
          </IntegrationCard>
        ))}
      </IntegrationsGrid>
    </Container>
  );
}

