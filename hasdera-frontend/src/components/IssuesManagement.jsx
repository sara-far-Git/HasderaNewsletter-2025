/**
 * IssuesManagement.jsx
 * ניהול גליונות - העלאת PDF, עריכת פרטים, PageFlip Viewer
 */

import { useState } from 'react';
import styled from 'styled-components';
import { Upload, Edit, Eye, Download, Plus, FileText, Calendar, Hash } from 'lucide-react';
import hasederaTheme from '../styles/HasederaTheme';
import { Card, CardHeader, CardTitle, PrimaryButton, SecondaryButton, Input, Select } from '../styles';

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

const ActionsBar = styled.div`
  display: flex;
  gap: ${hasederaTheme.spacing.md};
`;

const IssuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${hasederaTheme.spacing.xl};
`;

const IssueCard = styled(Card)`
  position: relative;
  overflow: hidden;
`;

const IssueImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.main} 0%, ${hasederaTheme.colors.primary.dark} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${hasederaTheme.colors.text.white};
  margin-bottom: ${hasederaTheme.spacing.lg};
  border-radius: ${hasederaTheme.borderRadius.md};
`;

const IssueInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${hasederaTheme.spacing.sm};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
  color: ${hasederaTheme.colors.text.secondary};
  font-size: ${hasederaTheme.typography.fontSize.base};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: ${hasederaTheme.spacing.xs} ${hasederaTheme.spacing.sm};
  border-radius: ${hasederaTheme.borderRadius.full};
  font-size: ${hasederaTheme.typography.fontSize.sm};
  background: ${props => {
    if (props.$status === 'published') return hasederaTheme.colors.status.success;
    if (props.$status === 'draft') return hasederaTheme.colors.status.warning;
    return hasederaTheme.colors.text.disabled;
  }};
  color: ${hasederaTheme.colors.text.white};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${hasederaTheme.spacing.sm};
  margin-top: ${hasederaTheme.spacing.lg};
  padding-top: ${hasederaTheme.spacing.lg};
  border-top: 1px solid ${hasederaTheme.colors.border.light};
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${hasederaTheme.spacing.md};
  padding-top: ${hasederaTheme.spacing.md};
  border-top: 1px solid ${hasederaTheme.colors.border.light};
`;

const StatItem = styled.div`
  text-align: center;
  flex: 1;
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

export default function IssuesManagement() {
  const [issues] = useState([
    {
      id: 1,
      title: 'גיליון 123',
      date: '2025-01-15',
      issueNumber: 123,
      pages: 24,
      filledSlots: 18,
      availableSlots: 6,
      status: 'published',
    },
    {
      id: 2,
      title: 'גיליון 124',
      date: '2025-01-22',
      issueNumber: 124,
      pages: 24,
      filledSlots: 12,
      availableSlots: 12,
      status: 'draft',
    },
  ]);

  return (
    <Container>
      <Header>
        <Title>ניהול גליונות</Title>
        <ActionsBar>
          <PrimaryButton>
            <Upload size={18} style={{ marginLeft: '8px' }} />
            העלאת גיליון חדש
          </PrimaryButton>
        </ActionsBar>
      </Header>

      <IssuesGrid>
        {issues.map((issue) => (
          <IssueCard key={issue.id}>
            <IssueImage>
              <FileText size={64} />
            </IssueImage>
            <CardHeader>
              <CardTitle>{issue.title}</CardTitle>
              <StatusBadge $status={issue.status}>
                {issue.status === 'published' ? 'פורסם' : 'טיוטה'}
              </StatusBadge>
            </CardHeader>
            <IssueInfo>
              <InfoRow>
                <Calendar size={16} />
                תאריך: {issue.date}
              </InfoRow>
              <InfoRow>
                <Hash size={16} />
                מספר גיליון: {issue.issueNumber}
              </InfoRow>
            </IssueInfo>
            <StatsRow>
              <StatItem>
                <StatValue>{issue.pages}</StatValue>
                <StatLabel>עמודים</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{issue.filledSlots}</StatValue>
                <StatLabel>תפוסים</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{issue.availableSlots}</StatValue>
                <StatLabel>פנויים</StatLabel>
              </StatItem>
            </StatsRow>
            <CardActions>
              <SecondaryButton style={{ flex: 1 }}>
                <Edit size={16} style={{ marginLeft: '4px' }} />
                עריכה
              </SecondaryButton>
              <SecondaryButton style={{ flex: 1 }}>
                <Eye size={16} style={{ marginLeft: '4px' }} />
                צפייה
              </SecondaryButton>
              <SecondaryButton style={{ flex: 1 }}>
                <Download size={16} style={{ marginLeft: '4px' }} />
                הורדה
              </SecondaryButton>
            </CardActions>
          </IssueCard>
        ))}
      </IssuesGrid>
    </Container>
  );
}

