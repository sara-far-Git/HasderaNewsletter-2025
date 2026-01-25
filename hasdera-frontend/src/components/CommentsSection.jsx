import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MessageSquare, Send, Trash2, Edit2, Reply } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getSectionComments,
  addSectionComment,
  updateComment,
  deleteComment,
  getArticleComments,
  addArticleComment,
} from '../Services/commentsService';

const CommentsContainer = styled.section`
  margin-top: 3rem;
  padding: 2rem;
  background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
`;

const CommentsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const CommentsTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
`;

const CommentsCount = styled.span`
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #f8fafc;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #10b981;
    background: rgba(255,255,255,0.08);
  }
  
  &::placeholder {
    color: rgba(255,255,255,0.4);
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-end;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CommentCard = styled.div`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.5rem;
  ${props => props.$isReply && `
    margin-right: 2rem;
    background: rgba(255,255,255,0.02);
  `}
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const CommentAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AuthorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-weight: 600;
  color: #f8fafc;
  font-size: 1rem;
`;

const CommentDate = styled.span`
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
`;

const CommentActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255,255,255,0.1);
    color: #f8fafc;
  }
`;

const CommentContent = styled.div`
  color: #e2e8f0;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ReplyForm = styled.form`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ReplyTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #f8fafc;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #10b981;
  }
`;

const ReplyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-end;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.3);
    border-color: #10b981;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255,255,255,0.5);
`;

export default function CommentsSection({ sectionId, articleId, type = 'section' }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    loadComments();
  }, [sectionId, articleId, type]);

  const loadComments = async () => {
    try {
      setLoading(true);
      let data = [];
      if (type === 'section') {
        data = await getSectionComments(sectionId);
      } else if (type === 'article') {
        data = await getArticleComments(articleId);
      }
      setComments(data || []);
    } catch (err) {
      console.error('❌ שגיאה בטעינת תגובות:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      let result;
      if (type === 'section') {
        result = await addSectionComment(sectionId, { content: newComment });
      } else {
        result = await addArticleComment(articleId, { content: newComment });
      }
      setComments([result, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('❌ שגיאה בהוספת תגובה:', err);
      alert('שגיאה בהוספת התגובה. נסי שוב.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      let result;
      if (type === 'section') {
        result = await addSectionComment(sectionId, {
          content: replyContent,
          parentCommentId: parentId,
        });
      } else {
        result = await addArticleComment(articleId, {
          content: replyContent,
          parentCommentId: parentId,
        });
      }
      setComments([...comments, result]);
      setReplyContent('');
      setReplyingTo(null);
    } catch (err) {
      console.error('❌ שגיאה בהוספת תגובה:', err);
      alert('שגיאה בהוספת התגובה. נסי שוב.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      await updateComment(commentId, editContent);
      setComments(comments.map(c =>
        c.commentId === commentId || c.id === commentId
          ? { ...c, content: editContent }
          : c
      ));
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('❌ שגיאה בעדכון תגובה:', err);
      alert('שגיאה בעדכון התגובה. נסי שוב.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('האם את בטוחה שברצונך למחוק את התגובה?')) return;

    try {
      setSubmitting(true);
      await deleteComment(commentId);
      setComments(comments.filter(c =>
        (c.commentId !== commentId && c.id !== commentId) &&
        (c.parentCommentId !== commentId && c.parentCommentId !== commentId)
      ));
    } catch (err) {
      console.error('❌ שגיאה במחיקת תגובה:', err);
      alert('שגיאה במחיקת התגובה. נסי שוב.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'לפני רגע';
    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    if (days < 7) return `לפני ${days} ימים`;
    return date.toLocaleDateString('he-IL');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderComment = (comment, isReply = false) => {
    const commentId = comment.commentId || comment.id;
    const isOwner = user && (
      comment.userId === user.userId ||
      comment.userId === user.id ||
      comment.authorId === user.userId ||
      comment.authorId === user.id
    );
    const isEditing = editingId === commentId;

    return (
      <CommentCard key={commentId} $isReply={isReply}>
        <CommentHeader>
          <CommentAuthor>
            <AuthorAvatar>
              {getInitials(comment.authorName || comment.userName || comment.author?.name || 'משתמש')}
            </AuthorAvatar>
            <AuthorInfo>
              <AuthorName>
                {comment.authorName || comment.userName || comment.author?.name || 'משתמש אנונימי'}
              </AuthorName>
              <CommentDate>{formatDate(comment.createdAt || comment.createdDate || comment.date)}</CommentDate>
            </AuthorInfo>
          </CommentAuthor>
          {isOwner && (
            <CommentActions>
              <ActionButton
                onClick={() => {
                  setEditingId(commentId);
                  setEditContent(comment.content);
                }}
                title="עריכה"
              >
                <Edit2 size={16} />
              </ActionButton>
              <ActionButton
                onClick={() => handleDelete(commentId)}
                title="מחיקה"
              >
                <Trash2 size={16} />
              </ActionButton>
            </CommentActions>
          )}
        </CommentHeader>
        {isEditing ? (
          <ReplyForm onSubmit={(e) => {
            e.preventDefault();
            handleEdit(commentId);
          }}>
            <ReplyTextarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="עריכת התגובה..."
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <ReplyButton type="button" onClick={() => {
                setEditingId(null);
                setEditContent('');
              }}>
                ביטול
              </ReplyButton>
              <ReplyButton type="submit" disabled={!editContent.trim() || submitting}>
                שמירה
              </ReplyButton>
            </div>
          </ReplyForm>
        ) : (
          <>
            <CommentContent>{comment.content}</CommentContent>
            {isAuthenticated && replyingTo !== commentId && (
              <ActionButton
                onClick={() => setReplyingTo(commentId)}
                style={{ marginTop: '0.75rem' }}
              >
                <Reply size={14} style={{ marginLeft: '0.25rem' }} />
                הגב
              </ActionButton>
            )}
            {replyingTo === commentId && (
              <ReplyForm onSubmit={(e) => handleReply(e, commentId)}>
                <ReplyTextarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="כתבי תגובה..."
                />
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <ReplyButton type="button" onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}>
                    ביטול
                  </ReplyButton>
                  <ReplyButton type="submit" disabled={!replyContent.trim() || submitting}>
                    <Send size={14} />
                    שלחי
                  </ReplyButton>
                </div>
              </ReplyForm>
            )}
            {/* תגובות משנה */}
            {comment.replies && comment.replies.length > 0 && (
              <div style={{ marginTop: '1rem', marginRight: '1rem' }}>
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </>
        )}
      </CommentCard>
    );
  };

  if (loading) {
    return (
      <CommentsContainer>
        <CommentsHeader>
          <CommentsTitle>תגובות</CommentsTitle>
        </CommentsHeader>
        <EmptyState>טוען תגובות...</EmptyState>
      </CommentsContainer>
    );
  }

  return (
    <CommentsContainer>
      <CommentsHeader>
        <MessageSquare size={24} color="#10b981" />
        <CommentsTitle>תגובות</CommentsTitle>
        {comments.length > 0 && <CommentsCount>{comments.length}</CommentsCount>}
      </CommentsHeader>

      {isAuthenticated && (
        <CommentForm onSubmit={handleSubmit}>
          <CommentTextarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="כתבי תגובה..."
            required
          />
          <SubmitButton type="submit" disabled={!newComment.trim() || submitting}>
            <Send size={18} />
            פרסמי תגובה
          </SubmitButton>
        </CommentForm>
      )}

      {!isAuthenticated && (
        <EmptyState>
          <p>התחברי כדי להוסיף תגובה</p>
        </EmptyState>
      )}

      {comments.length === 0 && isAuthenticated ? (
        <EmptyState>
          <p>אין תגובות עדיין. תהיי הראשונה להגיב!</p>
        </EmptyState>
      ) : (
        <CommentsList>
          {comments.map(comment => renderComment(comment))}
        </CommentsList>
      )}
    </CommentsContainer>
  );
}
