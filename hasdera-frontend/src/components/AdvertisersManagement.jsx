/**
 * AdvertisersManagement.jsx
 * ניהול מפרסמים - רשימה, פרטי קשר, היסטוריה וחוזים
 * מעוצב כמו אזור המפרסמים
 */

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Users, Mail, Phone, FileText, Package, Send } from 'lucide-react';
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

// 🎨 Advertisers Grid
const AdvertisersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const AdvertiserCard = styled.div`
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

const AdvertiserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
`;

const AdvertiserInfo = styled.div`
  flex: 1;
`;

const AdvertiserName = styled.h3`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: 1px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: ${props => {
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.2)';
    if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.3)';
    if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => {
    if (props.$variant === 'success') return '#10b981';
    if (props.$variant === 'warning') return '#f59e0b';
    return 'rgba(255, 255, 255, 0.7)';
  }};
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const ContactRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  
  svg {
    width: 16px;
    height: 16px;
    display: block;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
`;

const StatBox = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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
    <AdminLayout title="ניהול מפרסמים">
      <Container>
        <Header>
          <AddButton>
            <Users size={18} />
            הוספת מפרסם חדש
          </AddButton>
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
                  <Badge $variant={advertiser.status === 'active' ? 'success' : 'warning'}>
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
                <ActionButton>
                  <FileText size={16} />
                  היסטוריה
                </ActionButton>
                <ActionButton>
                  <Package size={16} />
                  חבילות
                </ActionButton>
                <ActionButton>
                  <Send size={16} />
                  שליחת מודעה
                </ActionButton>
              </CardActions>
            </AdvertiserCard>
          ))}
        </AdvertisersGrid>
      </Container>
    </AdminLayout>
  );
}
