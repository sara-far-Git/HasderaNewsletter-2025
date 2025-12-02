/**
 * AdvertisersManagement.jsx
 * ניהול מפרסמים - רשימה, פרטי קשר, היסטוריה וחוזים
 */

import { useState } from 'react';
import styled from 'styled-components';
import { Users, Mail, Phone, FileText, Package, Send } from 'lucide-react';
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

const AdvertisersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${hasederaTheme.spacing.xl};
`;

const AdvertiserCard = styled(Card)`
  position: relative;
`;

const AdvertiserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.md};
  margin-bottom: ${hasederaTheme.spacing.lg};
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.main} 0%, ${hasederaTheme.colors.primary.dark} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${hasederaTheme.colors.text.white};
  font-size: ${hasederaTheme.typography.fontSize.xl};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
`;

const AdvertiserInfo = styled.div`
  flex: 1;
`;

const AdvertiserName = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.xl};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0 0 ${hasederaTheme.spacing.xs} 0;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${hasederaTheme.spacing.xs};
  margin-bottom: ${hasederaTheme.spacing.lg};
`;

const ContactRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
  color: ${hasederaTheme.colors.text.secondary};
  font-size: ${hasederaTheme.typography.fontSize.base};
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${hasederaTheme.spacing.md};
  margin-bottom: ${hasederaTheme.spacing.lg};
  padding: ${hasederaTheme.spacing.md};
  background: ${hasederaTheme.colors.background.main};
  border-radius: ${hasederaTheme.borderRadius.md};
`;

const StatBox = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${hasederaTheme.typography.fontSize.xl};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  color: ${hasederaTheme.colors.primary.main};
`;

const StatLabel = styled.div`
  font-size: ${hasederaTheme.typography.fontSize.sm};
  color: ${hasederaTheme.colors.text.secondary};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${hasederaTheme.spacing.sm};
  flex-wrap: wrap;
`;

export default function AdvertisersManagement() {
  const [advertisers] = useState([
    {
      id: 1,
      name: 'חברת ABC בע"מ',
      email: 'contact@abc.co.il',
      phone: '03-1234567',
      totalAds: 15,
      totalSpent: 75000,
      activeContracts: 3,
      status: 'active',
    },
    {
      id: 2,
      name: 'XYZ שיווק',
      email: 'info@xyz.co.il',
      phone: '02-9876543',
      totalAds: 8,
      totalSpent: 40000,
      activeContracts: 1,
      status: 'active',
    },
  ]);

  return (
    <Container>
      <Header>
        <Title>ניהול מפרסמים</Title>
        <PrimaryButton>
          <Users size={18} style={{ marginLeft: '8px' }} />
          הוספת מפרסם חדש
        </PrimaryButton>
      </Header>

      <AdvertisersGrid>
        {advertisers.map((advertiser) => (
          <AdvertiserCard key={advertiser.id}>
            <AdvertiserHeader>
              <Avatar>
                {advertiser.name.charAt(0)}
              </Avatar>
              <AdvertiserInfo>
                <AdvertiserName>{advertiser.name}</AdvertiserName>
                <Badge variant={advertiser.status === 'active' ? 'success' : 'warning'}>
                  {advertiser.status === 'active' ? 'פעיל' : 'לא פעיל'}
                </Badge>
              </AdvertiserInfo>
            </AdvertiserHeader>

            <ContactInfo>
              <ContactRow>
                <Mail size={16} />
                {advertiser.email}
              </ContactRow>
              <ContactRow>
                <Phone size={16} />
                {advertiser.phone}
              </ContactRow>
            </ContactInfo>

            <StatsSection>
              <StatBox>
                <StatValue>{advertiser.totalAds}</StatValue>
                <StatLabel>מודעות</StatLabel>
              </StatBox>
              <StatBox>
                <StatValue>₪{advertiser.totalSpent.toLocaleString()}</StatValue>
                <StatLabel>סה"כ הוצאה</StatLabel>
              </StatBox>
              <StatBox>
                <StatValue>{advertiser.activeContracts}</StatValue>
                <StatLabel>חוזים פעילים</StatLabel>
              </StatBox>
            </StatsSection>

            <CardActions>
              <SecondaryButton style={{ flex: 1 }}>
                <FileText size={16} style={{ marginLeft: '4px' }} />
                היסטוריה
              </SecondaryButton>
              <SecondaryButton style={{ flex: 1 }}>
                <Package size={16} style={{ marginLeft: '4px' }} />
                חבילות
              </SecondaryButton>
              <SecondaryButton style={{ flex: 1 }}>
                <Send size={16} style={{ marginLeft: '4px' }} />
                שליחת מודעה
              </SecondaryButton>
            </CardActions>
          </AdvertiserCard>
        ))}
      </AdvertisersGrid>
    </Container>
  );
}

