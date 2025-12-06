/**
 * IntegrationsManagement.jsx
 * אזור התממשקות - Monday.com, Supabase, AWS S3, OpenAI, WhatsApp
 * מעוצב כמו אזור המפרסמים
 */

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Plug, CheckCircle, XCircle, Settings, RefreshCw } from 'lucide-react';
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

const AddButton = styled.button`
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

// 🎨 Integrations Grid
const IntegrationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const IntegrationCard = styled.div`
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

const IntegrationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const IntegrationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IntegrationIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
`;

const IntegrationDetails = styled.div`
  flex: 1;
`;

const IntegrationName = styled.h3`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: 1px;
`;

const IntegrationDescription = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.5;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: ${props => {
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.2)';
    if (props.$variant === 'error') return 'rgba(239, 68, 68, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.3)';
    if (props.$variant === 'error') return 'rgba(239, 68, 68, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => {
    if (props.$variant === 'success') return '#10b981';
    if (props.$variant === 'error') return '#ef4444';
    return 'rgba(255, 255, 255, 0.7)';
  }};
  
  svg {
    width: 14px;
    height: 14px;
    display: block;
  }
`;

const IntegrationFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);

  &::before {
    content: '•';
    color: #10b981;
    font-weight: bold;
    font-size: 1rem;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
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
  
  svg {
    width: 16px;
    height: 16px;
    display: block;
  }
`;

const PrimaryActionButton = styled(ActionButton)`
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
  
  &:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: #10b981;
  }
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
          <Badge $variant="success">
            <CheckCircle size={14} />
            מחובר
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge $variant="error">
            <XCircle size={14} />
            לא מחובר
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="אזור התממשקות">
      <Container>
        <Header>
          <AddButton>
            <Plug size={18} />
            הוספת אינטגרציה
          </AddButton>
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
                    <ActionButton>
                      <Settings size={16} />
                      הגדרות
                    </ActionButton>
                    <ActionButton>
                      <RefreshCw size={16} />
                      רענון
                    </ActionButton>
                  </>
                ) : (
                  <PrimaryActionButton>
                    <Plug size={16} />
                    התחברות
                  </PrimaryActionButton>
                )}
              </CardActions>
            </IntegrationCard>
          ))}
        </IntegrationsGrid>
      </Container>
    </AdminLayout>
  );
}
