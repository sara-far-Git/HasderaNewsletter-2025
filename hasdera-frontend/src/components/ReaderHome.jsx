import React, { useEffect, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { CalendarDays, BookOpen, ChevronLeft, Sparkles, ArrowLeft, Utensils, Heart, Users, Home, Lightbulb, Palette, Share2, Clock, Star, Play } from "lucide-react";
import { getIssues } from "../Services/issuesService";
import ReaderNav from "./ReaderNav";
import AnnouncementsBanner from "./AnnouncementsBanner";
import ReaderFooter from "./ReaderFooter";
import { LatestIssueSkeleton, IssuesGridSkeleton } from "./SkeletonLoader";
import { ShareButtonsInline } from "./ShareButtons";
import { getInProgressIssues, getFavorites } from "../Services/readingHistoryService";

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

const Container = styled.div`
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
  position: relative;
  z-index: 1;
  flex: 1;
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

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
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

/* ============ Continue Reading / Favorites ============ */
const QuickAccessSection = styled.section`
  margin-top: 2rem;
  animation: ${fadeInUp} 0.8s ease-out 0.15s both;
`;

const QuickAccessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const QuickAccessCard = styled.div`
  background: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 1.5rem;
`;

const QuickAccessHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const QuickAccessIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${props => props.$bg || 'rgba(16, 185, 129, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color || '#10b981'};
`;

const QuickAccessTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
`;

const QuickAccessList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const QuickAccessItem = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  width: 100%;
  text-align: right;

  &:hover {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateX(-4px);
  }
`;

const QuickAccessItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const QuickAccessItemTitle = styled.div`
  color: #f8fafc;
  font-weight: 500;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const QuickAccessItemMeta = styled.div`
  color: #64748b;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const ProgressBar = styled.div`
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  width: ${props => props.$percent || 0}%;
`;

const EmptyQuickAccess = styled.div`
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-size: 0.9rem;
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
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
];

// מדורים קבועים
const SECTIONS = [
  { id: 'recipes', name: 'מתכונים', icon: Utensils, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)' },
  { id: 'health', name: 'בריאות', icon: Heart, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.2)' },
  { id: 'community', name: 'קהילה', icon: Users, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.2)' },
  { id: 'home', name: 'בית ומשפחה', icon: Home, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.2)' },
  { id: 'tips', name: 'טיפים', icon: Lightbulb, color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.2)' },
  { id: 'culture', name: 'תרבות', icon: Palette, color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.2)' },
];

export default function ReaderHome() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inProgressIssues, setInProgressIssues] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await getIssues(1, 50, true);
        setIssues(rows || []);
        
        // טען מועדפים והמשך קריאה
        setInProgressIssues(getInProgressIssues());
        setFavorites(getFavorites().slice(0, 5));
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
      <BackgroundImage />
      <ReaderNav />
      
      <Container>
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

        {/* ⚡ גישה מהירה - המשך קריאה ומועדפים */}
        {!loading && (inProgressIssues.length > 0 || favorites.length > 0) && (
          <QuickAccessSection>
            <QuickAccessGrid>
              {/* המשך קריאה */}
              {inProgressIssues.length > 0 && (
                <QuickAccessCard>
                  <QuickAccessHeader>
                    <QuickAccessIcon $bg="rgba(16, 185, 129, 0.2)" $color="#10b981">
                      <Clock size={20} />
                    </QuickAccessIcon>
                    <QuickAccessTitle>המשך קריאה</QuickAccessTitle>
                  </QuickAccessHeader>
                  <QuickAccessList>
                    {inProgressIssues.map((item) => (
                      <QuickAccessItem 
                        key={item.issueId} 
                        onClick={() => openIssue({ issue_id: item.issueId, title: item.title })}
                      >
                        <Play size={16} color="#10b981" />
                        <QuickAccessItemInfo>
                          <QuickAccessItemTitle>{item.title || "גיליון"}</QuickAccessItemTitle>
                          <QuickAccessItemMeta>
                            עמוד {item.progress?.page} מתוך {item.progress?.totalPages}
                          </QuickAccessItemMeta>
                        </QuickAccessItemInfo>
                        <ProgressBar>
                          <ProgressFill $percent={item.progress?.percentage || 0} />
                        </ProgressBar>
                      </QuickAccessItem>
                    ))}
                  </QuickAccessList>
                </QuickAccessCard>
              )}

              {/* מועדפים */}
              {favorites.length > 0 && (
                <QuickAccessCard>
                  <QuickAccessHeader>
                    <QuickAccessIcon $bg="rgba(245, 158, 11, 0.2)" $color="#f59e0b">
                      <Star size={20} />
                    </QuickAccessIcon>
                    <QuickAccessTitle>המועדפים שלי</QuickAccessTitle>
                  </QuickAccessHeader>
                  <QuickAccessList>
                    {favorites.map((item) => (
                      <QuickAccessItem 
                        key={item.issueId} 
                        onClick={() => openIssue({ issue_id: item.issueId, title: item.title })}
                      >
                        <Star size={16} color="#f59e0b" fill="#f59e0b" />
                        <QuickAccessItemInfo>
                          <QuickAccessItemTitle>{item.title || "גיליון"}</QuickAccessItemTitle>
                          <QuickAccessItemMeta>
                            <CalendarDays size={12} />
                            {formatDate(item.issueDate)}
                          </QuickAccessItemMeta>
                        </QuickAccessItemInfo>
                        <ChevronLeft size={16} color="#64748b" />
                      </QuickAccessItem>
                    ))}
                  </QuickAccessList>
                </QuickAccessCard>
              )}
            </QuickAccessGrid>
          </QuickAccessSection>
        )}

        {loading ? (
          <>
            <LatestSection>
              <LatestIssueSkeleton />
            </LatestSection>
            <ArchiveSection>
              <SectionHeader>
                <SectionTitle>גיליונות קודמים</SectionTitle>
              </SectionHeader>
              <IssuesGridSkeleton count={6} />
            </ArchiveSection>
          </>
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
                    <ButtonsRow>
                      <ReadButton onClick={() => openIssue(latestIssue)}>
                        פתח לקריאה
                        <ArrowLeft size={20} />
                      </ReadButton>
                      <ShareButtonsInline title={latestIssue.title || "גיליון חדש"} />
                    </ButtonsRow>
                  </LatestInfo>
                </LatestCard>
              </LatestSection>
            )}

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
      {/* Footer */}
      <ReaderFooter />
    </PageWrapper>
  );
}
