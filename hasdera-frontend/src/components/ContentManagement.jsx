/**
 * ContentManagement.jsx
 * מערכת תוכן (CMS) - מדורים, כתבות, עורכים ופריסה
 */

import { useState } from 'react';
import styled from 'styled-components';
import { FileEdit, Users, Image, Layout, FileText, CheckCircle, Clock, Edit } from 'lucide-react';
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${hasederaTheme.spacing.xl};
`;

const ContentCard = styled(Card)`
  position: relative;
`;

const ContentImage = styled.div`
  width: 100%;
  height: 150px;
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.main} 0%, ${hasederaTheme.colors.primary.dark} 100%);
  border-radius: ${hasederaTheme.borderRadius.md};
  margin-bottom: ${hasederaTheme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${hasederaTheme.colors.text.white};
`;

const ContentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${hasederaTheme.spacing.md};
  padding-bottom: ${hasederaTheme.spacing.md};
  border-bottom: 1px solid ${hasederaTheme.colors.border.light};
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
  color: ${hasederaTheme.colors.text.secondary};
  font-size: ${hasederaTheme.typography.fontSize.sm};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${hasederaTheme.spacing.sm};
  margin-top: ${hasederaTheme.spacing.lg};
`;

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('articles');
  const [articles] = useState([
    {
      id: 1,
      title: 'כותרת כתבה ראשונה',
      category: 'חדשות',
      author: 'שרה כהן',
      status: 'ready',
      statusLabel: 'מוכן לדפוס',
      date: '2025-01-15',
      wordCount: 1200,
    },
    {
      id: 2,
      title: 'כותרת כתבה שנייה',
      category: 'תרבות',
      author: 'דוד לוי',
      status: 'editing',
      statusLabel: 'בעריכה',
      date: '2025-01-14',
      wordCount: 800,
    },
    {
      id: 3,
      title: 'כותרת כתבה שלישית',
      category: 'ספורט',
      author: 'מיכל רוזן',
      status: 'draft',
      statusLabel: 'טיוטה',
      date: '2025-01-13',
      wordCount: 500,
    },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return <Badge variant="success">מוכן לדפוס</Badge>;
      case 'editing':
        return <Badge variant="warning">בעריכה</Badge>;
      case 'draft':
        return <Badge variant="info">טיוטה</Badge>;
      default:
        return null;
    }
  };

  return (
    <Container>
      <Header>
        <Title>מערכת תוכן (CMS)</Title>
        <PrimaryButton>
          <FileEdit size={18} style={{ marginLeft: '8px' }} />
          כתבה חדשה
        </PrimaryButton>
      </Header>

      <TabsBar>
        <Tab $active={activeTab === 'articles'} onClick={() => setActiveTab('articles')}>
          <FileText size={18} style={{ marginLeft: '8px' }} />
          כתבות
        </Tab>
        <Tab $active={activeTab === 'sections'} onClick={() => setActiveTab('sections')}>
          <Layout size={18} style={{ marginLeft: '8px' }} />
          מדורים
        </Tab>
        <Tab $active={activeTab === 'editors'} onClick={() => setActiveTab('editors')}>
          <Users size={18} style={{ marginLeft: '8px' }} />
          עורכים
        </Tab>
        <Tab $active={activeTab === 'layout'} onClick={() => setActiveTab('layout')}>
          <Image size={18} style={{ marginLeft: '8px' }} />
          פריסה
        </Tab>
      </TabsBar>

      {activeTab === 'articles' && (
        <ContentGrid>
          {articles.map((article) => (
            <ContentCard key={article.id}>
              <ContentImage>
                <FileText size={48} />
              </ContentImage>
              <CardHeader>
                <CardTitle>{article.title}</CardTitle>
                {getStatusBadge(article.status)}
              </CardHeader>
              <ContentMeta>
                <AuthorInfo>
                  <Users size={16} />
                  {article.author}
                </AuthorInfo>
                <div style={{ color: hasederaTheme.colors.text.secondary, fontSize: hasederaTheme.typography.fontSize.sm }}>
                  {article.date}
                </div>
              </ContentMeta>
              <div style={{ marginBottom: hasederaTheme.spacing.md }}>
                <Badge variant="info">{article.category}</Badge>
                <span style={{ marginRight: hasederaTheme.spacing.sm, color: hasederaTheme.colors.text.secondary }}>
                  {article.wordCount} מילים
                </span>
              </div>
              <CardActions>
                <SecondaryButton style={{ flex: 1 }}>
                  <Edit size={16} style={{ marginLeft: '4px' }} />
                  עריכה
                </SecondaryButton>
                <SecondaryButton style={{ flex: 1 }}>
                  <FileText size={16} style={{ marginLeft: '4px' }} />
                  צפייה
                </SecondaryButton>
              </CardActions>
            </ContentCard>
          ))}
        </ContentGrid>
      )}

      {activeTab === 'sections' && (
        <div style={{ textAlign: 'center', padding: '4rem', color: hasederaTheme.colors.text.secondary }}>
          <Layout size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>ניהול מדורים - בקרוב</p>
        </div>
      )}

      {activeTab === 'editors' && (
        <div style={{ textAlign: 'center', padding: '4rem', color: hasederaTheme.colors.text.secondary }}>
          <Users size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>ניהול עורכים - בקרוב</p>
        </div>
      )}

      {activeTab === 'layout' && (
        <div style={{ textAlign: 'center', padding: '4rem', color: hasederaTheme.colors.text.secondary }}>
          <Image size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>מתכנן פריסה - בקרוב</p>
        </div>
      )}
    </Container>
  );
}

