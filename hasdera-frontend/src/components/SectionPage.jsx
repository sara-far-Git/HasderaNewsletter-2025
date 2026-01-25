import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowRight, BookOpen, Calendar, User, ExternalLink } from 'lucide-react';
import { getSectionArticles, getSection } from '../Services/sectionsService';
import CommentsSection from './CommentsSection';
import AdsSection from './AdsSection';
import ReaderNav from './ReaderNav';
import ReaderFooter from './ReaderFooter';

// מדורים קבועים עם אייקונים וצבעים
const SECTIONS_CONFIG = {
  recipes: {
    name: 'מתכונים',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.2)',
  },
  health: {
    name: 'בריאות',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.2)',
  },
  community: {
    name: 'קהילה',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.2)',
  },
  home: {
    name: 'בית ומשפחה',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.2)',
  },
  tips: {
    name: 'טיפים',
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.2)',
  },
  culture: {
    name: 'תרבות',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.2)',
  },
};

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  position: relative;
  color: #f8fafc;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
`;

const BackgroundImage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("/image/ChatGPT Image Nov 16, 2025, 08_56_06 PM.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.92) 0%,
      rgba(30, 41, 59, 0.85) 50%,
      rgba(15, 23, 42, 0.92) 100%
    );
  }
`;

const PageContainer = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  color: #f8fafc;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.header`
  margin-bottom: 3rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #f8fafc;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  
  &:hover {
    background: rgba(255,255,255,0.15);
    transform: translateX(-4px);
  }
`;

const SectionTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, ${props => props.$color || '#10b981'} 0%, ${props => props.$color || '#059669'} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionDescription = styled.p`
  font-size: 1.2rem;
  color: rgba(255,255,255,0.7);
  margin-top: 1rem;
  line-height: 1.6;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    order: -1;
  }
`;

const ArticlesSection = styled.section`
  background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 2rem;
`;

const ArticlesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const ArticlesTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ArticlesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ArticleCard = styled.div`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(16, 185, 129, 0.5);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  }
`;

const ArticleHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ArticleTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
  flex: 1;
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.5);
  margin-top: 0.75rem;
`;

const ArticleExcerpt = styled.p`
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ReadMore = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-weight: 500;
  margin-top: 1rem;
  transition: all 0.2s ease;
  
  ${ArticleCard}:hover & {
    transform: translateX(-4px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255,255,255,0.5);
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255,255,255,0.5);
`;

export default function SectionPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('📄 SectionPage - component mounted, sectionId:', sectionId);

  useEffect(() => {
    console.log('📄 SectionPage - useEffect triggered, sectionId:', sectionId);
    if (sectionId) {
      loadSectionData();
    } else {
      console.warn('⚠️ SectionPage - no sectionId provided');
      setLoading(false);
      setError('לא נמצא מזהה מדור');
    }
  }, [sectionId]);

  const loadSectionData = async () => {
    try {
      console.log('📄 SectionPage - loading data for section:', sectionId);
      setLoading(true);
      
      // טעינת פרטי המדור
      try {
        const sectionData = await getSection(sectionId);
        console.log('📄 SectionPage - section data from API:', sectionData);
        setSection(sectionData);
      } catch (err) {
        console.log('📄 SectionPage - API error, using default config:', err.message);
        // אם אין endpoint, נשתמש בהגדרות הקבועות
        const config = SECTIONS_CONFIG[sectionId];
        if (config) {
          console.log('📄 SectionPage - using default config:', config);
          setSection({ id: sectionId, name: config.name, ...config });
        } else {
          console.warn('⚠️ SectionPage - no config found for sectionId:', sectionId);
          setSection({ id: sectionId, name: 'מדור', color: '#10b981' });
        }
      }
      
      // טעינת מאמרים
      const articlesData = await getSectionArticles(sectionId);
      console.log('📄 SectionPage - articles data:', articlesData);
      setArticles(articlesData || []);
    } catch (err) {
      console.error('❌ שגיאה בטעינת נתוני המדור:', err);
      setError(err.message || 'שגיאה בטעינת נתוני המדור');
      setArticles([]);
      // גם אם יש שגיאה, נציג את המדור עם ההגדרות הקבועות
      const config = SECTIONS_CONFIG[sectionId];
      if (config && !section) {
        console.log('📄 SectionPage - setting default section after error:', config);
        setSection({ id: sectionId, name: config.name, ...config });
      }
    } finally {
      console.log('📄 SectionPage - loading complete, section:', section, 'articles:', articles.length);
      setLoading(false);
    }
  };

  const handleArticleClick = (article) => {
    // אם יש קישור לגיליון, נפתח אותו
    if (article.issueId) {
      navigate(`/issues/${article.issueId}`, { state: article });
    } else if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const sectionConfig = section
    ? { ...SECTIONS_CONFIG[sectionId], ...section }
    : SECTIONS_CONFIG[sectionId] || { name: 'מדור', color: '#10b981' };

  console.log('📄 SectionPage - render - loading:', loading, 'section:', section, 'sectionConfig:', sectionConfig, 'articles:', articles.length, 'error:', error);

  if (loading) {
    return (
      <PageWrapper>
        <BackgroundImage />
        <ReaderNav />
        <PageContainer>
          <LoadingState>טוען נתונים...</LoadingState>
        </PageContainer>
      </PageWrapper>
    );
  }

  // אם אין sectionId, נציג הודעת שגיאה
  if (!sectionId) {
    return (
      <PageWrapper>
        <BackgroundImage />
        <ReaderNav />
        <PageContainer>
          <EmptyState>
            <p>מדור לא נמצא</p>
            <BackButton onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
              חזרה לדף הבית
            </BackButton>
          </EmptyState>
        </PageContainer>
        <ReaderFooter />
      </PageWrapper>
    );
  }

  // אם אין sectionConfig, נציג הודעת שגיאה
  if (!sectionConfig || !sectionConfig.name) {
    return (
      <PageWrapper>
        <BackgroundImage />
        <ReaderNav />
        <PageContainer>
          <EmptyState>
            <p>מדור לא נמצא: {sectionId}</p>
            {error && <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>שגיאה: {error}</p>}
            <BackButton onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
              <ArrowRight size={20} />
              חזרה לדף הבית
            </BackButton>
          </EmptyState>
        </PageContainer>
        <ReaderFooter />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <BackgroundImage />
      <ReaderNav />
      <PageContainer>
        <Header>
          <BackButton onClick={() => navigate('/')}>
            <ArrowRight size={20} />
            חזרה לדף הבית
          </BackButton>
          <SectionTitle $color={sectionConfig.color}>
            {sectionConfig.name}
          </SectionTitle>
          {section?.description && (
            <SectionDescription>{section.description}</SectionDescription>
          )}
        </Header>

        <ContentGrid>
          <MainContent>
            <ArticlesSection>
              <ArticlesHeader>
                <ArticlesTitle>
                  <BookOpen size={28} />
                  מאמרים
                </ArticlesTitle>
              </ArticlesHeader>
              {articles.length === 0 ? (
                <EmptyState>
                  <p>אין מאמרים זמינים במדור זה כרגע</p>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    העלאת תוכן למדורים תתבצע בהמשך
                  </p>
                </EmptyState>
              ) : (
                <ArticlesList>
                  {articles.map((article) => {
                    const articleId = article.articleId || article.id;
                    return (
                      <ArticleCard
                        key={articleId}
                        onClick={() => handleArticleClick(article)}
                      >
                        <ArticleHeader>
                          <ArticleTitle>{article.title || article.name || 'מאמר ללא כותרת'}</ArticleTitle>
                        </ArticleHeader>
                        {article.excerpt || article.content ? (
                          <ArticleExcerpt>
                            {article.excerpt || article.content?.substring(0, 200)}
                          </ArticleExcerpt>
                        ) : null}
                        <ArticleMeta>
                          {article.author && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <User size={14} />
                              {article.author}
                            </span>
                          )}
                          {article.createdAt || article.date ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Calendar size={14} />
                              {formatDate(article.createdAt || article.date)}
                            </span>
                          ) : null}
                        </ArticleMeta>
                        <ReadMore>
                          קראי עוד
                          <ExternalLink size={16} />
                        </ReadMore>
                      </ArticleCard>
                    );
                  })}
                </ArticlesList>
              )}
            </ArticlesSection>

            <CommentsSection sectionId={sectionId} type="section" />
          </MainContent>

          <Sidebar>
            <AdsSection sectionId={sectionId} />
          </Sidebar>
        </ContentGrid>
      </PageContainer>
      <ReaderFooter />
    </PageWrapper>
  );
}
