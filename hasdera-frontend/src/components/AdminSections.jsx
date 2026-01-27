/**
 * AdminSections.jsx
 * 📝 ממשק ניהול מדורים - הוספת תוכן למדורים
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { 
  Plus, Trash2, Edit2, Save, X, Image, Loader2,
  Book, Utensils, Gift, Coffee, Puzzle, ShoppingBag,
  Eye, EyeOff, MessageCircle, Heart, Calendar
} from "lucide-react";
import { api } from "../Services/api";

// ================ STYLED COMPONENTS ================

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  }
`;

// Tabs for sections
const TabsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 16px;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? props.$color : '#64748b'};
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$active ? '0 4px 15px rgba(0,0,0,0.1)' : 'none'};
  
  &:hover {
    background: ${props => props.$active ? 'white' : 'rgba(255,255,255,0.5)'};
  }
`;

// Content list
const ContentGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  }
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background: ${props => props.$published ? '#f0fdf4' : '#fef3c7'};
`;

const ContentStatus = styled.span`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$published ? '#10b981' : '#f59e0b'};
  color: white;
`;

const ContentActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: ${props => props.$danger ? '#ef4444' : '#64748b'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$danger ? '#fef2f2' : '#f8fafc'};
    border-color: ${props => props.$danger ? '#fecaca' : '#cbd5e1'};
  }
`;

const ContentBody = styled.div`
  padding: 1.25rem;
`;

const ContentTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const ContentExcerpt = styled.p`
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ContentMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  color: #94a3b8;
  font-size: 0.8rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

// Modal for adding/editing content
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const Modal = styled.div`
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e293b;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  min-height: 150px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const ImageUpload = styled.div`
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #10b981;
    background: #f0fdf4;
  }
`;

const CheckboxGroup = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  
  input {
    width: 20px;
    height: 20px;
    accent-color: #10b981;
  }
  
  span {
    color: #374151;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
    }
  ` : `
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f8fafc;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;
  
  h3 {
    color: #64748b;
    font-size: 1.2rem;
    margin: 1rem 0 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
  }
`;

// ================ SECTIONS DATA ================

const SECTIONS = [
  { id: 'recipes', title: 'מתכונים', icon: '🍳', color: '#f59e0b' },
  { id: 'stories', title: 'סיפורים', icon: '📚', color: '#8b5cf6' },
  { id: 'challenges', title: 'אתגרים', icon: '🧩', color: '#ec4899' },
  { id: 'giveaways', title: 'הגרלות', icon: '🎁', color: '#10b981' },
  { id: 'articles', title: 'כתבות', icon: '☕', color: '#92400e' },
  { id: 'market', title: 'לוח קהילתי', icon: '🛍️', color: '#059669' },
];

// ================ COMPONENT ================

export default function AdminSections() {
  const [activeSection, setActiveSection] = useState('recipes');
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    published: true,
  });
  
  // Fetch contents for active section
  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/sections/admin/${activeSection}/contents`);
        setContents(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching contents:', err);
        // Show empty state for 404 (section has no content yet)
        if (err.response?.status === 404) {
          setContents([]);
        }
        setLoading(false);
      }
    };
    
    fetchContents();
  }, [activeSection]);
  
  const handleOpenModal = (content = null) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        title: content.title,
        excerpt: content.excerpt,
        content: content.content,
        imageUrl: content.imageUrl || '',
        published: content.published,
      });
    } else {
      setEditingContent(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        imageUrl: '',
        published: true,
      });
    }
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContent(null);
  };
  
  const handleSave = async () => {
    if (!formData.title.trim()) return;
    
    setSaving(true);
    try {
      if (editingContent) {
        await api.put(`/sections/admin/contents/${editingContent.id}`, formData);
        
        setContents(prev => prev.map(c => 
          c.id === editingContent.id 
            ? { ...c, ...formData, updatedAt: new Date().toISOString() }
            : c
        ));
      } else {
        const response = await api.post(`/sections/admin/${activeSection}/contents`, formData);
        
        const newContent = {
          id: response.data.id,
          ...formData,
          sectionId: activeSection,
          createdAt: new Date().toISOString(),
          likesCount: 0,
          commentsCount: 0,
          viewsCount: 0,
        };
        setContents(prev => [newContent, ...prev]);
      }
      
      handleCloseModal();
    } catch (err) {
      console.error('Error saving content:', err);
      alert('שגיאה בשמירת התוכן');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async (contentId) => {
    if (!window.confirm('האם למחוק תוכן זה?')) return;
    
    try {
      await api.delete(`/sections/admin/contents/${contentId}`);
      setContents(prev => prev.filter(c => c.id !== contentId));
    } catch (err) {
      console.error('Error deleting content:', err);
      alert('שגיאה במחיקת התוכן');
    }
  };
  
  const handleTogglePublish = async (content) => {
    try {
      const response = await api.patch(`/sections/admin/contents/${content.id}/publish`);
      
      setContents(prev => prev.map(c => 
        c.id === content.id 
          ? { ...c, published: response.data.published }
          : c
      ));
    } catch (err) {
      console.error('Error toggling publish:', err);
      alert('שגיאה בשינוי סטטוס הפרסום');
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const currentSection = SECTIONS.find(s => s.id === activeSection);
  
  return (
    <Container>
      <Header>
        <Title>
          📝 ניהול מדורים
        </Title>
        <AddButton onClick={() => handleOpenModal()}>
          <Plus size={20} />
          הוסף תוכן חדש
        </AddButton>
      </Header>
      
      {/* Section Tabs */}
      <TabsContainer>
        {SECTIONS.map(section => (
          <Tab
            key={section.id}
            $active={activeSection === section.id}
            $color={section.color}
            onClick={() => setActiveSection(section.id)}
          >
            <span>{section.icon}</span>
            {section.title}
          </Tab>
        ))}
      </TabsContainer>
      
      {/* Contents */}
      {loading ? (
        <EmptyState>
          <Loader2 size={40} className="animate-spin" />
          <p>טוען...</p>
        </EmptyState>
      ) : contents.length === 0 ? (
        <EmptyState>
          <span style={{ fontSize: '3rem' }}>{currentSection?.icon}</span>
          <h3>אין תוכן במדור זה</h3>
          <p>לחצי על "הוסף תוכן חדש" כדי להתחיל</p>
        </EmptyState>
      ) : (
        <ContentGrid>
          {contents.map(content => (
            <ContentCard key={content.id}>
              <ContentHeader $published={content.published}>
                <ContentStatus $published={content.published}>
                  {content.published ? (
                    <>
                      <Eye size={14} />
                      מפורסם
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} />
                      טיוטה
                    </>
                  )}
                </ContentStatus>
                
                <ContentActions>
                  <IconButton 
                    onClick={() => handleTogglePublish(content)}
                    title={content.published ? 'הסתר' : 'פרסם'}
                  >
                    {content.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                  <IconButton onClick={() => handleOpenModal(content)} title="עריכה">
                    <Edit2 size={16} />
                  </IconButton>
                  <IconButton $danger onClick={() => handleDelete(content.id)} title="מחק">
                    <Trash2 size={16} />
                  </IconButton>
                </ContentActions>
              </ContentHeader>
              
              <ContentBody>
                <ContentTitle>{content.title}</ContentTitle>
                <ContentExcerpt>{content.excerpt}</ContentExcerpt>
                
                <ContentMeta>
                  <MetaItem>
                    <Calendar size={14} />
                    {formatDate(content.createdAt)}
                  </MetaItem>
                  <MetaItem>
                    <Heart size={14} />
                    {content.likesCount} לייקים
                  </MetaItem>
                  <MetaItem>
                    <MessageCircle size={14} />
                    {content.commentsCount} תגובות
                  </MetaItem>
                </ContentMeta>
              </ContentBody>
            </ContentCard>
          ))}
        </ContentGrid>
      )}
      
      {/* Modal */}
      {showModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingContent ? 'עריכת תוכן' : 'הוספת תוכן חדש'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <FormGroup>
                <Label>כותרת *</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="הזיני כותרת..."
                />
              </FormGroup>
              
              <FormGroup>
                <Label>תקציר</Label>
                <TextArea
                  value={formData.excerpt}
                  onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="כתבי תקציר קצר שיופיע ברשימת התכנים..."
                  style={{ minHeight: '80px' }}
                />
              </FormGroup>
              
              <FormGroup>
                <Label>תוכן מלא</Label>
                <TextArea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="כתבי את התוכן המלא..."
                />
              </FormGroup>
              
              <FormGroup>
                <Label>קישור לתמונה (אופציונלי)</Label>
                <Input
                  type="url"
                  value={formData.imageUrl}
                  onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </FormGroup>
              
              <FormGroup>
                <CheckboxGroup>
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={e => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                  />
                  <span>פרסם מיד (אחרת ישמר כטיוטה)</span>
                </CheckboxGroup>
              </FormGroup>
            </ModalBody>
            
            <ModalFooter>
              <Button onClick={handleCloseModal}>ביטול</Button>
              <Button 
                $primary 
                onClick={handleSave}
                disabled={saving || !formData.title.trim()}
              >
                {saving ? <Loader2 size={18} /> : <Save size={18} />}
                {editingContent ? 'שמור שינויים' : 'צור תוכן'}
              </Button>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
}

