/**
 * SectionPage.jsx
 * 📚 דף מדור - מציג תכנים של מדור ומאפשר תגובות
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { 
  ArrowRight, Heart, MessageCircle, Share2, Calendar,
  User, ChevronDown, Send, Loader2, AlertCircle, Sparkles
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ReaderNav from "./ReaderNav";
import ReaderFooter from "./ReaderFooter";
import { api } from "../Services/api";

// ================ ANIMATIONS ================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

// ================ STYLED COMPONENTS ================

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const BackgroundImage = styled.div`
  position: fixed;
  inset: 0;
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
      180deg,
      rgba(15, 23, 42, 0.85) 0%,
      rgba(20, 30, 48, 0.9) 100%
    );
  }
`;

const Content = styled.main`
  position: relative;
  z-index: 10;
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
`;

// Header
const Header = styled.div`
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #f8fafc;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const SectionIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${props => props.$gradient};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  box-shadow: 0 15px 40px ${props => props.$color}40;
`;

const SectionInfo = styled.div`
  flex: 1;
`;

const SectionTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.5rem;
`;

const SectionDescription = styled.p`
  color: #94a3b8;
  font-size: 1.1rem;
  line-height: 1.6;
`;

// Content List
const ContentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ContentCard = styled.article`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;
  animation-delay: ${props => props.$delay || 0}s;
  animation-fill-mode: both;
  
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

const ContentImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.$image ? `url(${props.$image})` : 'linear-gradient(135deg, #1e293b, #334155)'};
  background-size: cover;
  background-position: center;
`;

const ContentBody = styled.div`
  padding: 1.5rem;
`;

const ContentTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.75rem;
  cursor: pointer;
  
  &:hover {
    color: ${props => props.$color};
  }
`;

const ContentExcerpt = styled.p`
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ContentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: #64748b;
  font-size: 0.85rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const ContentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  color: ${props => props.$active ? props.$color : '#64748b'};
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: ${props => props.$color};
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    animation: ${pulse} 0.5s ease-in-out;
  }
`;

// Comments Section
const CommentsSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const CommentsTitle = styled.h3`
  font-size: 1.2rem;
  color: #f8fafc;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CommentInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  color: #f8fafc;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: #64748b;
  }
  
  &:focus {
    outline: none;
    border-color: #10b981;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const CommentSubmit = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  padding: 0.85rem 1.5rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Comment = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const CommentAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`;

const CommentAuthor = styled.span`
  color: #f8fafc;
  font-weight: 600;
  font-size: 0.9rem;
`;

const CommentDate = styled.span`
  color: #64748b;
  font-size: 0.8rem;
`;

const CommentText = styled.p`
  color: #cbd5e1;
  font-size: 0.95rem;
  line-height: 1.6;
`;

// Empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
  
  h3 {
    color: #94a3b8;
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 1rem;
  }
`;

// Loading
const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 3rem;
  
  svg {
    animation: spin 1s linear infinite;
    color: #10b981;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// ================ SECTION DATA ================

const SECTIONS_INFO = {
  recipes: {
    id: 'recipes',
    title: 'מתכונים',
    description: 'מתכונים טעימים, טיפים קולינריים וסודות המטבח שלנו',
    icon: '🍳',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  stories: {
    id: 'stories',
    title: 'סיפורים בהמשכים',
    description: 'סיפורים מרגשים שילוו אותך לאורך כל השבוע',
    icon: '📚',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  },
  challenges: {
    id: 'challenges',
    title: 'חידות ואתגרים',
    description: 'סודוקו, חידות חשיבה ואתגרים שבועיים',
    icon: '🧩',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
  },
  giveaways: {
    id: 'giveaways',
    title: 'הגרלות ופרסים',
    description: 'השתתפי בהגרלות שבועיות ותזכי בפרסים',
    icon: '🎁',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
  articles: {
    id: 'articles',
    title: 'כתבות וטורים',
    description: 'טורים אישיים, כתבות מעמיקות ושיחות מהלב',
    icon: '☕',
    color: '#92400e',
    gradient: 'linear-gradient(135deg, #b45309, #92400e)',
  },
  market: {
    id: 'market',
    title: 'לוח קהילתי',
    description: 'קניה, מכירה, שירותים - הכל בתוך הקהילה',
    icon: '🛍️',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
};

// ================ COMPONENT ================

export default function SectionPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedContent, setExpandedContent] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likedContents, setLikedContents] = useState(new Set());

  const section = SECTIONS_INFO[sectionId];

  // Fetch section contents
  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/sections/${sectionId}/contents`);
        // Map API response to expected format
        const mappedContents = (response.data || []).map(c => ({
          id: c.id,
          title: c.title,
          excerpt: c.excerpt,
          content: c.content,
          imageUrl: c.imageUrl,
          author: c.authorName || 'מערכת השדרה',
          createdAt: c.createdAt,
          likesCount: c.likesCount || 0,
          commentsCount: c.commentsCount || 0,
          comments: (c.comments || []).map(comment => ({
            id: comment.id,
            author: comment.author,
            text: comment.text,
            createdAt: comment.createdAt
          }))
        }));
        setContents(mappedContents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching contents:', err);
        // Show empty state instead of error for empty sections
        if (err.response?.status === 404) {
          setContents([]);
        } else {
          setError('שגיאה בטעינת התוכן');
        }
        setLoading(false);
      }
    };
    
    if (section) {
      fetchContents();
    }
  }, [sectionId, section]);
  
  const handleLike = async (contentId) => {
    try {
      const response = await api.post(`/sections/contents/${contentId}/like`, {
        userId: user?.id || 0
      });
      
      const newLiked = new Set(likedContents);
      if (response.data.liked) {
        newLiked.add(contentId);
      } else {
        newLiked.delete(contentId);
      }
      setLikedContents(newLiked);
      
      // Update likes count in content
      setContents(prev => prev.map(c => 
        c.id === contentId 
          ? { ...c, likesCount: response.data.likesCount }
          : c
      ));
    } catch (err) {
      console.error('Error toggling like:', err);
      // Fallback to local state
      const newLiked = new Set(likedContents);
      if (newLiked.has(contentId)) {
        newLiked.delete(contentId);
      } else {
        newLiked.add(contentId);
      }
      setLikedContents(newLiked);
    }
  };
  
  const handleComment = async (e, contentId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      const response = await api.post(`/sections/contents/${contentId}/comments`, { 
        authorName: user?.name || 'אורחת',
        text: commentText 
      });
      
      // Add comment from API response
      setContents(prev => prev.map(c => {
        if (c.id === contentId) {
          return {
            ...c,
            comments: [...c.comments, {
              id: response.data.id,
              author: response.data.author,
              text: response.data.text,
              createdAt: response.data.createdAt
            }],
            commentsCount: c.commentsCount + 1
          };
        }
        return c;
      }));
      
      setCommentText('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      // Fallback to local state
      setContents(prev => prev.map(c => {
        if (c.id === contentId) {
          return {
            ...c,
            comments: [...c.comments, {
              id: Date.now(),
              author: user?.name || 'אורחת',
              text: commentText,
              createdAt: new Date().toISOString()
            }],
            commentsCount: c.commentsCount + 1
          };
        }
        return c;
      }));
      setCommentText('');
    } finally {
      setSubmittingComment(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric', 
      month: 'long',
      year: 'numeric' 
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };
  
  if (!section) {
    return (
      <PageWrapper>
        <BackgroundImage />
        <Content>
          <EmptyState>
            <AlertCircle size={48} />
            <h3>מדור לא נמצא</h3>
            <p>המדור שחיפשת לא קיים</p>
            <BackButton onClick={() => navigate('/street')}>
              חזרה למדורים
              <ArrowRight size={16} />
            </BackButton>
          </EmptyState>
        </Content>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <BackgroundImage />
      
      <Content>
        <Header>
          <BackButton onClick={() => navigate('/street')}>
            חזרה למדורים
            <ArrowRight size={16} />
          </BackButton>
          
          <SectionHeader>
            <SectionIcon $gradient={section.gradient} $color={section.color}>
              {section.icon}
            </SectionIcon>
            <SectionInfo>
              <SectionTitle>{section.title}</SectionTitle>
            <SectionDescription>{section.description}</SectionDescription>
            </SectionInfo>
          </SectionHeader>
        </Header>

        {loading ? (
          <LoadingSpinner>
            <Loader2 size={40} />
          </LoadingSpinner>
        ) : error ? (
          <EmptyState>
            <AlertCircle size={48} />
            <h3>שגיאה</h3>
            <p>{error}</p>
          </EmptyState>
        ) : contents.length === 0 ? (
                <EmptyState>
            <Sparkles size={48} />
            <h3>אין תוכן עדיין</h3>
            <p>בקרוב יעלו כאן תכנים חדשים!</p>
                </EmptyState>
              ) : (
          <ContentList>
            {contents.map((content, index) => (
              <ContentCard key={content.id} $delay={index * 0.1}>
                {content.imageUrl && (
                  <ContentImage $image={content.imageUrl} />
                )}
                <ContentBody>
                  <ContentTitle $color={section.color}>
                    {content.title}
                  </ContentTitle>
                  <ContentExcerpt>{content.excerpt}</ContentExcerpt>
                  
                  <ContentMeta>
                    <MetaItem>
                      <User size={14} />
                      {content.author}
                    </MetaItem>
                    <MetaItem>
                      <Calendar size={14} />
                      {formatDate(content.createdAt)}
                    </MetaItem>
                  </ContentMeta>
                  
                  <ContentActions>
                    <ActionButton 
                      $color="#ef4444" 
                      $active={likedContents.has(content.id)}
                      onClick={() => handleLike(content.id)}
                    >
                      <Heart size={18} fill={likedContents.has(content.id) ? 'currentColor' : 'none'} />
                      {content.likesCount + (likedContents.has(content.id) ? 1 : 0)}
                    </ActionButton>
                    
                    <ActionButton 
                      $color={section.color}
                      onClick={() => setExpandedContent(expandedContent === content.id ? null : content.id)}
                    >
                      <MessageCircle size={18} />
                      {content.commentsCount} תגובות
                      <ChevronDown 
                        size={16} 
                        style={{ 
                          transform: expandedContent === content.id ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.3s ease'
                        }} 
                      />
                    </ActionButton>
                    
                    <ActionButton $color="#64748b">
                      <Share2 size={18} />
                      שיתוף
                    </ActionButton>
                  </ContentActions>
                  
                  {expandedContent === content.id && (
                    <CommentsSection>
                      <CommentsTitle>
                        <MessageCircle size={20} />
                        תגובות ({content.comments.length})
                      </CommentsTitle>
                      
                      <CommentForm onSubmit={(e) => handleComment(e, content.id)}>
                        <CommentInput
                          type="text"
                          placeholder="כתבי תגובה..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                        <CommentSubmit type="submit" disabled={submittingComment || !commentText.trim()}>
                          {submittingComment ? <Loader2 size={18} /> : <Send size={18} />}
                          שלחי
                        </CommentSubmit>
                      </CommentForm>
                      
                      <CommentsList>
                        {content.comments.map(comment => (
                          <Comment key={comment.id}>
                            <CommentHeader>
                              <CommentAvatar>
                                {getInitials(comment.author)}
                              </CommentAvatar>
                              <CommentAuthor>{comment.author}</CommentAuthor>
                              <CommentDate>{formatDate(comment.createdAt)}</CommentDate>
                            </CommentHeader>
                            <CommentText>{comment.text}</CommentText>
                          </Comment>
                        ))}
                        
                        {content.comments.length === 0 && (
                          <EmptyState style={{ padding: '2rem' }}>
                            <p>אין תגובות עדיין. היי הראשונה להגיב! 💬</p>
                          </EmptyState>
                        )}
                      </CommentsList>
                    </CommentsSection>
                  )}
                </ContentBody>
              </ContentCard>
            ))}
          </ContentList>
        )}
      </Content>
    </PageWrapper>
  );
}
