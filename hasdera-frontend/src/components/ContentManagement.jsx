/**
 * ContentManagement.jsx
 * מערכת תוכן (CMS) - מדורים, כתבות, עורכים ופריסה
 * מעוצב כמו אזור המפרסמים
 */

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FileEdit, Users, Image, Layout, FileText, CheckCircle, Clock, Edit } from 'lucide-react';
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

// 🎨 Tabs Bar
const TabsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  
  svg {
    width: 18px;
    height: 18px;
    display: block;
  }
`;

// 🎨 Content Grid
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.6s;
  animation-fill-mode: both;
`;

const ContentCard = styled.div`
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

const ContentImage = styled.div`
  width: 100%;
  height: 150px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
  
  svg {
    width: 48px;
    height: 48px;
    display: block;
  }
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ContentTitle = styled.h3`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: white;
  margin: 0;
  letter-spacing: 1px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: ${props => {
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.2)';
    if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
    if (props.$variant === 'info') return 'rgba(59, 130, 246, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.3)';
    if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.3)';
    if (props.$variant === 'info') return 'rgba(59, 130, 246, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => {
    if (props.$variant === 'success') return '#10b981';
    if (props.$variant === 'warning') return '#f59e0b';
    if (props.$variant === 'info') return '#3b82f6';
    return 'rgba(255, 255, 255, 0.7)';
  }};
`;

const ContentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  
  svg {
    width: 16px;
    height: 16px;
    display: block;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: rgba(255, 255, 255, 0.7);
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.6s;
  animation-fill-mode: both;
  
  svg {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    opacity: 0.5;
    display: block;
  }
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
        return <Badge $variant="success">מוכן לדפוס</Badge>;
      case 'editing':
        return <Badge $variant="warning">בעריכה</Badge>;
      case 'draft':
        return <Badge $variant="info">טיוטה</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="מערכת תוכן (CMS)">
      <Container>
        <Header>
          <AddButton>
            <FileEdit size={18} />
            כתבה חדשה
          </AddButton>
        </Header>

        <TabsBar>
          <Tab $active={activeTab === 'articles'} onClick={() => setActiveTab('articles')}>
            <FileText size={18} />
            כתבות
          </Tab>
          <Tab $active={activeTab === 'sections'} onClick={() => setActiveTab('sections')}>
            <Layout size={18} />
            מדורים
          </Tab>
          <Tab $active={activeTab === 'editors'} onClick={() => setActiveTab('editors')}>
            <Users size={18} />
            עורכים
          </Tab>
          <Tab $active={activeTab === 'layout'} onClick={() => setActiveTab('layout')}>
            <Image size={18} />
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
                <ContentHeader>
                  <ContentTitle>{article.title}</ContentTitle>
                  {getStatusBadge(article.status)}
                </ContentHeader>
                <ContentMeta>
                  <AuthorInfo>
                    <Users size={16} />
                    {article.author}
                  </AuthorInfo>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    {article.date}
                  </div>
                </ContentMeta>
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Badge $variant="info">{article.category}</Badge>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                    {article.wordCount} מילים
                  </span>
                </div>
                <CardActions>
                  <ActionButton>
                    <Edit size={16} />
                    עריכה
                  </ActionButton>
                  <ActionButton>
                    <FileText size={16} />
                    צפייה
                  </ActionButton>
                </CardActions>
              </ContentCard>
            ))}
          </ContentGrid>
        )}

        {activeTab === 'sections' && (
          <EmptyState>
            <Layout size={64} />
            <p>ניהול מדורים - בקרוב</p>
          </EmptyState>
        )}

        {activeTab === 'editors' && (
          <EmptyState>
            <Users size={64} />
            <p>ניהול עורכים - בקרוב</p>
          </EmptyState>
        )}

        {activeTab === 'layout' && (
          <EmptyState>
            <Image size={64} />
            <p>מתכנן פריסה - בקרוב</p>
          </EmptyState>
        )}
      </Container>
    </AdminLayout>
  );
}
