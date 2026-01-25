import React, { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { CalendarDays, BookOpen, ChevronLeft, Sparkles, ArrowLeft, Utensils, Heart, Users, Home, Lightbulb, Palette } from "lucide-react";
import { getIssues } from "../Services/issuesService";
import hasederaTheme from "../styles/HasederaTheme";
import ReaderNav from "./ReaderNav";
import AnnouncementsBanner from "./AnnouncementsBanner";

/* ======================== Animations ======================== */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
`;

/* ======================== Styled Components ======================== */
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: #f8fafc;
  overflow-x: hidden;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
`;

/* ============ Hero Section ============ */
const HeroSection = styled.section`
  position: relative;
  padding: 4rem 0 3rem;
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  margin: 0 0 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: #94a3b8;
  margin: 0 auto;
  max-width: 500px;
  line-height: 1.7;
`;

/* ============ Latest Issue Highlight ============ */
const LatestSection = styled.section`
  margin-top: 3rem;
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
`;

const LatestCard = styled.div`
  display: flex;
  gap: 2rem;
  background: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const LatestCover = styled.div`
  width: 200px;
  height: 280px;
  border-radius: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);
  animation: ${float} 4s ease-in-out infinite;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    background-size: 200% 100%;
    animation: ${shimmer} 3s infinite;
  }
`;

const CoverIcon = styled.div`
  margin-bottom: 1rem;
  svg { width: 48px; height: 48px; }
`;

const LatestInfo = styled.div`
  flex: 1;
  min-width: 280px;
`;

const LatestLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #10b981;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
`;

const LatestTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: #f8fafc;
`;

const LatestDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

const ReadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  font-family: inherit;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
  }
`;

/* ============ Archive Grid ============ */
const ArchiveSection = styled.section`
  margin-top: 4rem;
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: #f8fafc;
`;

const ViewAllBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;

  &:hover {
    background: rgba(16, 185, 129, 0.1);
    border-color: #10b981;
  }
`;

const IssuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
`;

const IssueCard = styled.div`
  background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(16, 185, 129, 0.4);
    box-shadow: 0 15px 30px rgba(0,0,0,0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #10b981, #059669);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before { opacity: 1; }
`;

const CardCoverSmall = styled.div`
  width: 100%;
  height: 140px;
  border-radius: 12px;
  margin-bottom: 1rem;
  background: ${props => props.$gradient || 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
  font-weight: 600;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #f8fafc;
`;

const CardDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #64748b;
  font-size: 0.9rem;
`;

/* ============ Empty State ============ */
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
`;

/* ============ Sections (מדורים) ============ */
const SectionsSection = styled.section`
  margin-top: 3rem;
  animation: ${fadeInUp} 0.8s ease-out 0.3s both;
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

const SectionCard = styled.div`
  background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.$color || '#10b981'};
    box-shadow: 0 15px 30px rgba(0,0,0,0.3);
    
    .icon-wrapper {
      transform: scale(1.1);
      background: ${props => props.$color || '#10b981'};
    }
  }
`;

const SectionIcon = styled.div`
  width: 56px;
  height: 56px;
  margin: 0 auto 0.75rem;
  border-radius: 14px;
  background: ${props => props.$color || 'rgba(16, 185, 129, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$iconColor || '#10b981'};
  transition: all 0.3s ease;
`;

const SectionName = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
`;

/* ======================== Component ======================== */
const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

// מדורים קבועים
const SECTIONS = [
  { id: 'recipes', name: 'מתכונים', icon: Utensils, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)' },
  { id: 'health', name: 'בריאות', icon: Heart, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.2)' },
  { id: 'community', name: 'קהילה', icon: Users, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.2)' },
  { id: 'home', name: 'בית ומשפחה', icon: Home, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.2)' },
  { id: 'tips', name: 'טיפים', icon: Lightbulb, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.2)' },
  { id: 'culture', name: 'תרבות', icon: Palette, color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.2)' },
];

export default function ReaderHome() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const rows = await getIssues(1, 50, true);
        setIssues(rows || []);
      } catch (e) {
        console.error("Failed to fetch issues", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const latestIssue = useMemo(() => {
    if (!issues.length) return null;
    return [...issues].sort((a, b) => new Date(b.issueDate || 0) - new Date(a.issueDate || 0))[0];
  }, [issues]);

  const archiveIssues = useMemo(() => {
    if (!issues.length) return [];
    return [...issues]
      .sort((a, b) => new Date(b.issueDate || 0) - new Date(a.issueDate || 0))
      .slice(1, 7);
  }, [issues]);

  const openIssue = (it) => {
    if (!it) return;
    navigate(`/issues/${it.issue_id || it.issueId}`, { state: it });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "תאריך לא זמין";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "תאריך לא זמין";
    return d.toLocaleDateString("he-IL", { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <PageWrapper>
      <Container>
        <ReaderNav />

        <HeroSection>
          <HeroBadge>
            <Sparkles size={16} />
            מגזין השדרה
          </HeroBadge>
          <HeroTitle>ברוכים הבאים לשדרה</HeroTitle>
          <HeroSubtitle>
            המגזין הקהילתי שלכם - כל הגיליונות, הכתבות והתכנים במקום אחד
          </HeroSubtitle>
        </HeroSection>

        {/* 🎉 הודעות חגיגיות/מבצעים */}
        <AnnouncementsBanner />

        {loading ? (
          <EmptyState>טוען גיליונות...</EmptyState>
        ) : !issues.length ? (
          <EmptyState>אין גיליונות זמינים כרגע</EmptyState>
        ) : (
          <>
            {/* Latest Issue Highlight */}
            {latestIssue && (
              <LatestSection>
                <LatestCard>
                  <LatestCover>
                    <CoverIcon><BookOpen /></CoverIcon>
                    גיליון חדש
                  </LatestCover>
                  <LatestInfo>
                    <LatestLabel>
                      <Sparkles size={14} />
                      הגיליון האחרון
                    </LatestLabel>
                    <LatestTitle>{latestIssue.title || "גיליון חדש"}</LatestTitle>
                    <LatestDate>
                      <CalendarDays size={18} />
                      {formatDate(latestIssue.issueDate)}
                    </LatestDate>
                    <ReadButton onClick={() => openIssue(latestIssue)}>
                      פתח לקריאה
                      <ArrowLeft size={20} />
                    </ReadButton>
                  </LatestInfo>
                </LatestCard>
              </LatestSection>
            )}

            {/* 📚 מדורים קבועים */}
            <SectionsSection>
              <SectionHeader>
                <SectionTitle>מדורים</SectionTitle>
              </SectionHeader>
              <SectionsGrid>
                {SECTIONS.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <SectionCard 
                      key={section.id} 
                      $color={section.color}
                      onClick={() => navigate(`/sections/${section.id}`)}
                    >
                      <SectionIcon 
                        className="icon-wrapper"
                        $color={section.bgColor} 
                        $iconColor={section.color}
                      >
                        <IconComponent size={26} />
                      </SectionIcon>
                      <SectionName>{section.name}</SectionName>
                    </SectionCard>
                  );
                })}
              </SectionsGrid>
            </SectionsSection>

            {/* Archive Grid */}
            {archiveIssues.length > 0 && (
              <ArchiveSection>
                <SectionHeader>
                  <SectionTitle>גיליונות קודמים</SectionTitle>
                  <ViewAllBtn onClick={() => navigate("/issues")}>
                    לכל הארכיון
                    <ChevronLeft size={18} />
                  </ViewAllBtn>
                </SectionHeader>
                <IssuesGrid>
                  {archiveIssues.map((it, idx) => (
                    <IssueCard key={it.issue_id || it.issueId} onClick={() => openIssue(it)}>
                      <CardCoverSmall $gradient={GRADIENTS[idx % GRADIENTS.length]}>
                        <BookOpen size={32} />
                      </CardCoverSmall>
                      <CardTitle>{it.title || "גיליון"}</CardTitle>
                      <CardDate>
                        <CalendarDays size={14} />
                        {formatDate(it.issueDate)}
                      </CardDate>
                    </IssueCard>
                  ))}
                </IssuesGrid>
              </ArchiveSection>
            )}
          </>
        )}
      </Container>
    </PageWrapper>
  );
}
