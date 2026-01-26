/**
 * SectionPage.jsx
 * דף קטגוריה לקוראים - מציג תוכן עם אפשרות להגיב
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { 
  ArrowRight, Heart, MessageSquare, Eye, 
  Calendar, User, Send, Loader
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  getSection,
  getSectionContents,
  getContent,
  getComments,
  addComment,
  toggleLike
} from "../Services/sectionsService";
import ReaderNav from "./ReaderNav";
import ReaderFooter from "./ReaderFooter";

// 🎬 אנימציות
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 🎨 Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  position: relative;
  padding-top: 80px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const SectionIcon = styled.span`
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem 0;
`;

const SectionDescription = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  animation: ${slideIn} 0.4s ease-out;
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(16, 185, 129, 0.3);
    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.2);
  }
`;

const ContentImage = styled.div`
  width: 100%;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ContentTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
`;

const ContentExcerpt = styled.p`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
  line-height: 1.6;
`;

const ContentMeta = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  overflow-y: auto;
  animation: ${fadeIn} 0.3s;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${slideIn} 0.3s;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin: 0;
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.5rem;
  
  &:hover {
    color: white;
  }
`;

const ContentBody = styled.div`
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  font-size: 1.05rem;
  margin-bottom: 2rem;
  
  img {
    max-width: 100%;
    border-radius: 8px;
    margin: 1rem 0;
  }
  
  p {
    margin-bottom: 1rem;
  }
`;

const ActionsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active ? '#10b981' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  
  &:hover {
    background: ${props => props.$active ? '#059669' : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-2px);
  }
`;

const CommentsSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const CommentsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.5rem;
`;

const CommentForm = styled.form`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #10b981;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #10b981;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CommentCard = styled.div`
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const CommentAuthor = styled.div`
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CommentDate = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
`;

const CommentText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.7);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.7);
`;

export default function SectionPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [section, setSection] = useState(null);
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    authorName: user?.fullName || '',
    text: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likedContents, setLikedContents] = useState(new Set());

  useEffect(() => {
    loadSection();
  }, [sectionId]);

  useEffect(() => {
    if (selectedContent) {
      loadComments(selectedContent.id);
    }
  }, [selectedContent]);

  const loadSection = async () => {
    try {
      setLoading(true);
      const sectionData = await getSection(sectionId);
      setSection(sectionData);
      
      const contentsData = await getSectionContents(sectionId, true);
      setContents(contentsData);
    } catch (error) {
      console.error('Error loading section:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (contentId) => {
    try {
      const commentsData = await getComments(contentId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleContentClick = async (content) => {
    try {
      const fullContent = await getContent(content.id);
      setSelectedContent(fullContent);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleLike = async (contentId) => {
    try {
      const result = await toggleLike(contentId);
      setLikedContents(prev => {
        const newSet = new Set(prev);
        if (result.isLiked) {
          newSet.add(contentId);
        } else {
          newSet.delete(contentId);
        }
        return newSet;
      });
      
      // עדכון מספר הלייקים בתוכן
      if (selectedContent && selectedContent.id === contentId) {
        setSelectedContent({
          ...selectedContent,
          likesCount: result.likesCount
        });
      }
      
      // עדכון ברשימה
      setContents(prev => prev.map(c => 
        c.id === contentId ? { ...c, likesCount: result.likesCount } : c
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentForm.text.trim()) return;
    
    try {
      setSubmittingComment(true);
      await addComment(selectedContent.id, commentForm);
      setCommentForm({ ...commentForm, text: '' });
      await loadComments(selectedContent.id);
      
      // עדכון מספר התגובות
      if (selectedContent) {
        setSelectedContent({
          ...selectedContent,
          commentsCount: selectedContent.commentsCount + 1
        });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('שגיאה בשליחת תגובה');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <ReaderNav />
        <PageContainer>
          <LoadingState>
            <Loader size={48} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <p>טוען...</p>
          </LoadingState>
        </PageContainer>
        <ReaderFooter />
      </>
    );
  }

  if (!section) {
    return (
      <>
        <ReaderNav />
        <PageContainer>
          <EmptyState>
            <p>קטגוריה לא נמצאה</p>
          </EmptyState>
        </PageContainer>
        <ReaderFooter />
      </>
    );
  }

  return (
    <>
      <ReaderNav />
      <PageContainer>
        <Container>
          <SectionHeader>
            {section.icon && <SectionIcon>{section.icon}</SectionIcon>}
            <SectionTitle>{section.title}</SectionTitle>
            {section.description && (
            <SectionDescription>{section.description}</SectionDescription>
          )}
          </SectionHeader>

        <ContentGrid>
            {contents.map((content) => (
              <ContentCard key={content.id} onClick={() => handleContentClick(content)}>
                {content.imageUrl && (
                  <ContentImage>
                    <img src={content.imageUrl} alt={content.title} />
                  </ContentImage>
                )}
                <ContentTitle>{content.title}</ContentTitle>
                {content.excerpt && (
                  <ContentExcerpt>{content.excerpt}</ContentExcerpt>
                )}
                <ContentMeta>
                  <MetaItem>
                    <Eye size={16} />
                    {content.viewsCount}
                  </MetaItem>
                  <MetaItem>
                    <Heart size={16} />
                    {content.likesCount}
                  </MetaItem>
                  <MetaItem>
                    <MessageSquare size={16} />
                    {content.commentsCount}
                  </MetaItem>
                  <MetaItem>
                    <Calendar size={16} />
                    {formatDate(content.createdAt)}
                  </MetaItem>
                </ContentMeta>
              </ContentCard>
            ))}
          </ContentGrid>

          {contents.length === 0 && (
                <EmptyState>
              <p>אין תוכן זמין בקטגוריה זו</p>
            </EmptyState>
          )}
        </Container>
      </PageContainer>

      {selectedContent && (
        <Modal onClick={() => setSelectedContent(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedContent.title}</ModalTitle>
              <CloseButton onClick={() => setSelectedContent(null)}>
                ✕
              </CloseButton>
            </ModalHeader>

            {selectedContent.imageUrl && (
              <img 
                src={selectedContent.imageUrl} 
                alt={selectedContent.title}
                style={{ width: '100%', borderRadius: '8px', marginBottom: '1.5rem' }}
              />
            )}

            <ContentBody dangerouslySetInnerHTML={{ __html: selectedContent.content }} />

            <ActionsBar>
              <ActionButton
                $active={likedContents.has(selectedContent.id)}
                onClick={() => handleLike(selectedContent.id)}
              >
                <Heart size={18} fill={likedContents.has(selectedContent.id) ? 'currentColor' : 'none'} />
                {selectedContent.likesCount}
              </ActionButton>
              <ActionButton>
                <MessageSquare size={18} />
                {selectedContent.commentsCount} תגובות
              </ActionButton>
              <MetaItem style={{ marginRight: 'auto', color: 'rgba(255, 255, 255, 0.6)' }}>
                <User size={16} style={{ display: 'inline', marginLeft: '0.25rem' }} />
                {selectedContent.authorName || 'מנהל'}
              </MetaItem>
              <MetaItem style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                <Calendar size={16} style={{ display: 'inline', marginLeft: '0.25rem' }} />
                {formatDate(selectedContent.createdAt)}
              </MetaItem>
            </ActionsBar>

            <CommentsSection>
              <CommentsTitle>תגובות ({comments.length})</CommentsTitle>
              
              <CommentForm onSubmit={handleSubmitComment}>
                <FormGroup>
                  <Label>שם</Label>
                  <Input
                    value={commentForm.authorName}
                    onChange={(e) => setCommentForm({ ...commentForm, authorName: e.target.value })}
                    placeholder="הכנס את שמך"
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>תגובה</Label>
                  <TextArea
                    value={commentForm.text}
                    onChange={(e) => setCommentForm({ ...commentForm, text: e.target.value })}
                    placeholder="כתוב תגובה..."
                    required
                  />
                </FormGroup>
                <SubmitButton type="submit" disabled={submittingComment}>
                  {submittingComment ? (
                    <>
                      <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      שולח...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      שלח תגובה
                    </>
                  )}
                </SubmitButton>
              </CommentForm>

              <CommentsList>
                {comments.map((comment) => (
                  <CommentCard key={comment.id}>
                    <CommentHeader>
                      <CommentAuthor>
                        <User size={16} />
                        {comment.authorName}
                      </CommentAuthor>
                      <CommentDate>{formatDate(comment.createdAt)}</CommentDate>
                    </CommentHeader>
                    <CommentText>{comment.text}</CommentText>
                  </CommentCard>
                ))}
              </CommentsList>

              {comments.length === 0 && (
                <EmptyState style={{ padding: '2rem' }}>
                  <p>אין תגובות עדיין. היה הראשון להגיב!</p>
                </EmptyState>
              )}
            </CommentsSection>
          </ModalContent>
        </Modal>
      )}

      <ReaderFooter />
    </>
  );
}

