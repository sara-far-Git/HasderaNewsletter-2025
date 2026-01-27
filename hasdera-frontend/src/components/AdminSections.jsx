/**
 * AdminSections.jsx
 * ממשק ניהול מדורים ותוכן
 */

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { 
  Plus, Edit2, Trash2, Save, X, Eye, EyeOff, 
  FileText, Layout, MessageSquare, Heart, Eye as EyeIcon
} from "lucide-react";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  getSectionContents,
  createContent,
  updateContent,
  deleteContent,
  toggleContentPublished
} from "../Services/sectionsService";

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

// 🎨 Styled Components - עיצוב מודרני עם רקע כהה ושקיפות
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1.5rem;
  animation: ${slideIn} 0.6s ease-out;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 1px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: rgba(16, 185, 129, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 50px;
  color: #10b981;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: #10b981;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${slideIn} 0.6s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const Tab = styled.button`
  padding: 0.875rem 1.75rem;
  background: ${props => props.$active ? 'rgba(16, 185, 129, 0.15)' : 'transparent'};
  backdrop-filter: ${props => props.$active ? 'blur(10px)' : 'none'};
  border: ${props => props.$active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent'};
  border-radius: 50px;
  color: ${props => props.$active ? '#10b981' : 'rgba(255, 255, 255, 0.7)'};
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.2);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  animation: ${slideIn} 0.6s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const SectionCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  animation: ${slideIn} 0.5s ease-out;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  user-select: none;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.$color || '#10b981'}, transparent);
    opacity: 0.6;
    pointer-events: none;
    z-index: 1;
  }
  
  &:hover {
    transform: translateY(-6px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(-3px);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.35rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Cormorant Garamond', serif;
`;

const SectionIcon = styled.span`
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
`;

const SectionDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  margin: 0.75rem 0 1.25rem 0;
  line-height: 1.6;
`;

const SectionStats = styled.div`
  display: flex;
  gap: 1.25rem;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  position: relative;
  z-index: 10;
`;

const ActionButton = styled.button`
  padding: 0.625rem 1rem;
  background: ${props => {
    if (props.$variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => {
    if (props.$variant === 'danger') return 'rgba(239, 68, 68, 0.3)';
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.3)';
    return 'rgba(255, 255, 255, 0.15)';
  }};
  color: ${props => {
    if (props.$variant === 'danger') return '#ef4444';
    if (props.$variant === 'success') return '#10b981';
    return 'rgba(255, 255, 255, 0.9)';
  }};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  
  &:hover {
    background: ${props => {
      if (props.$variant === 'danger') return 'rgba(239, 68, 68, 0.3)';
      if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.3)';
      return 'rgba(255, 255, 255, 0.15)';
    }};
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  animation: ${slideIn} 0.5s ease-out;
  position: relative;
  border-left: 4px solid ${props => props.$published ? '#10b981' : 'rgba(255, 255, 255, 0.3)'};
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
`;

const ContentTitle = styled.h4`
  font-size: 1.15rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
`;

const ContentExcerpt = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0.75rem 0;
  line-height: 1.6;
`;

const ContentMeta = styled.div`
  display: flex;
  gap: 1.25rem;
  margin-top: 1.25rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  align-items: center;
  flex-wrap: wrap;
  
  svg {
    width: 14px;
    height: 14px;
    margin-left: 0.25rem;
  }
`;

const Badge = styled.span`
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$published ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  color: ${props => props.$published ? '#10b981' : '#ef4444'};
  border: 1px solid ${props => props.$published ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
  backdrop-filter: blur(10px);
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s;
`;

const ModalContent = styled.div`
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideIn} 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 1);
    transform: rotate(90deg);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.75rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: #10b981;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  font-size: 1rem;
  min-height: ${props => props.$rows ? `${props.$rows * 2.5}rem` : '5rem'};
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;
  color: rgba(255, 255, 255, 0.95);
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: #10b981;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const SaveButton = styled.button`
  padding: 0.875rem 2rem;
  background: rgba(16, 185, 129, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 50px;
  color: #10b981;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: #10b981;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 450px;
  padding: 0.875rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  font-size: 1rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: #10b981;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5rem 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateX(-4px);
  }
`;

const SectionHeaderBar = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  
  strong {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.95);
    font-family: 'Cormorant Garamond', serif;
  }
`;

export default function AdminSections() {
  const [sections, setSections] = useState([]);
  const [contents, setContents] = useState([]);
  const [activeTab, setActiveTab] = useState('sections');
  const [selectedSection, setSelectedSection] = useState(null);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [sectionForm, setSectionForm] = useState({
    sectionKey: '',
    title: '',
    description: '',
    icon: '',
    color: '#10b981',
    sortOrder: 0
  });

  const [contentForm, setContentForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    published: false
  });

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      loadContents(selectedSection.id);
    }
  }, [selectedSection]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await getSections();
      setSections(data);
    } catch (error) {
      console.error('Error loading sections:', error);
      alert('שגיאה בטעינת מדורים');
    } finally {
      setLoading(false);
    }
  };

  const loadContents = async (sectionId) => {
    try {
      setLoading(true);
      const data = await getSectionContents(sectionId, false);
      setContents(data);
    } catch (error) {
      console.error('Error loading contents:', error);
      alert('שגיאה בטעינת תוכן');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = () => {
    setEditingSection(null);
    setSectionForm({
      sectionKey: '',
      title: '',
      description: '',
      icon: '',
      color: '#10b981',
      sortOrder: sections.length
    });
    setShowSectionModal(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionForm({
      sectionKey: section.sectionKey,
      title: section.title,
      description: section.description || '',
      icon: section.icon || '',
      color: section.color || '#10b981',
      sortOrder: section.sortOrder
    });
    setShowSectionModal(true);
  };

  const handleSaveSection = async () => {
    try {
      setLoading(true);
      if (editingSection) {
        await updateSection(editingSection.id, sectionForm);
      } else {
        await createSection(sectionForm);
      }
      await loadSections();
      setShowSectionModal(false);
    } catch (error) {
      console.error('Error saving section:', error);
      alert('שגיאה בשמירת מדור');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (id) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק מדור זה?')) return;
    
    try {
      setLoading(true);
      await deleteSection(id);
      await loadSections();
      if (selectedSection?.id === id) {
        setSelectedSection(null);
        setContents([]);
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('שגיאה במחיקת מדור');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = () => {
    if (!selectedSection) {
      alert('אנא בחר מדור תחילה');
      return;
    }
    setEditingContent(null);
    setContentForm({
      title: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      published: false
    });
    setShowContentModal(true);
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setContentForm({
      title: content.title,
      excerpt: content.excerpt || '',
      content: content.content || '',
      imageUrl: content.imageUrl || '',
      published: content.published
    });
    setShowContentModal(true);
  };

  const handleSaveContent = async () => {
    try {
      setLoading(true);
      if (editingContent) {
        await updateContent(editingContent.id, contentForm);
      } else {
        await createContent(selectedSection.id, contentForm);
      }
      await loadContents(selectedSection.id);
      setShowContentModal(false);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('שגיאה בשמירת תוכן');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק תוכן זה?')) return;
    
    try {
      setLoading(true);
      await deleteContent(id);
      await loadContents(selectedSection.id);
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('שגיאה במחיקת תוכן');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (content) => {
    try {
      setLoading(true);
      await toggleContentPublished(content.id, !content.published);
      await loadContents(selectedSection.id);
    } catch (error) {
      console.error('Error toggling publish:', error);
      alert('שגיאה בשינוי סטטוס פרסום');
    } finally {
      setLoading(false);
    }
  };

  const filteredContents = contents.filter(content => 
    content.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSections = sections.filter(section =>
    section.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <Title>ניהול מדורים ותוכן</Title>
        {activeTab === 'sections' && (
          <AddButton onClick={handleCreateSection}>
            <Plus size={18} />
            מדור חדש
          </AddButton>
        )}
        {activeTab === 'contents' && selectedSection && (
          <AddButton onClick={handleCreateContent}>
            <Plus size={18} />
            תוכן חדש
          </AddButton>
        )}
      </Header>

      <TabsContainer>
        <Tab $active={activeTab === 'sections'} onClick={() => setActiveTab('sections')}>
          <Layout size={18} style={{ display: 'inline', marginLeft: '0.5rem' }} />
          מדורים
        </Tab>
        <Tab 
          $active={activeTab === 'contents'} 
          onClick={() => {
            if (!selectedSection) {
              alert('אנא בחר מדור תחילה');
              return;
            }
            setActiveTab('contents');
          }}
        >
          <FileText size={18} style={{ display: 'inline', marginLeft: '0.5rem' }} />
          תוכן
        </Tab>
      </TabsContainer>

      {activeTab === 'sections' && (
        <>
          <SearchInput
            type="text"
            placeholder="חיפוש מדורים..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {loading ? (
            <LoadingSpinner>טוען...</LoadingSpinner>
          ) : filteredSections.length === 0 ? (
            <EmptyState>
              {searchQuery ? 'לא נמצאו מדורים התואמים לחיפוש' : 'אין מדורים עדיין. צור מדור חדש!'}
            </EmptyState>
          ) : (
            <Grid>
              {filteredSections.map((section) => (
            <SectionCard 
              key={section.id} 
              $color={section.color}
              onClick={() => {
                setSelectedSection(section);
                setActiveTab('contents');
              }}
              style={{ cursor: 'pointer' }}
            >
              <SectionHeader>
                <SectionTitle>
                  {section.icon && <SectionIcon>{section.icon}</SectionIcon>}
                  {section.title}
                </SectionTitle>
                <Actions onClick={(e) => e.stopPropagation()}>
                  <ActionButton onClick={() => handleEditSection(section)}>
                    <Edit2 size={16} />
                  </ActionButton>
                  <ActionButton $variant="danger" onClick={() => handleDeleteSection(section.id)}>
                    <Trash2 size={16} />
                  </ActionButton>
                </Actions>
              </SectionHeader>
              {section.description && (
                <SectionDescription>{section.description}</SectionDescription>
              )}
              <SectionStats>
                <span>{section.contentsCount || 0} תוכן</span>
              </SectionStats>
            </SectionCard>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeTab === 'contents' && selectedSection && (
        <>
          <SectionHeaderBar>
            <div>
              <strong style={{ fontSize: '1.1rem' }}>מדור: {selectedSection.title}</strong>
            </div>
            <BackButton 
              onClick={() => {
                setSelectedSection(null);
                setActiveTab('sections');
                setSearchQuery('');
              }}
            >
              ← חזרה למדורים
            </BackButton>
          </SectionHeaderBar>
          <SearchInput
            type="text"
            placeholder="חיפוש תוכן..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {loading ? (
            <LoadingSpinner>טוען...</LoadingSpinner>
          ) : filteredContents.length === 0 ? (
            <EmptyState>
              {searchQuery ? 'לא נמצא תוכן התואם לחיפוש' : 'אין תוכן במדור זה עדיין. צור תוכן חדש!'}
            </EmptyState>
          ) : (
            <Grid>
              {filteredContents.map((content) => (
              <ContentCard key={content.id} $published={content.published}>
                <ContentTitle>{content.title}</ContentTitle>
                {content.excerpt && <ContentExcerpt>{content.excerpt}</ContentExcerpt>}
                {content.imageUrl && (
                  <img 
                    src={content.imageUrl} 
                    alt={content.title}
                    style={{ 
                      width: '100%', 
                      maxHeight: '200px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      marginTop: '0.5rem',
                      marginBottom: '0.5rem'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <ContentMeta>
                  <Badge $published={content.published}>
                    {content.published ? 'פורסם' : 'טיוטה'}
                  </Badge>
                  <span><EyeIcon size={14} style={{ display: 'inline', marginLeft: '0.25rem' }} /> {content.viewsCount}</span>
                  <span><Heart size={14} style={{ display: 'inline', marginLeft: '0.25rem' }} /> {content.likesCount}</span>
                  <span><MessageSquare size={14} style={{ display: 'inline', marginLeft: '0.25rem' }} /> {content.commentsCount}</span>
                </ContentMeta>
                <Actions>
                  <ActionButton $variant="success" onClick={() => handleTogglePublish(content)}>
                    {content.published ? <EyeOff size={16} /> : <Eye size={16} />}
                    {content.published ? 'בטל פרסום' : 'פרסם'}
                  </ActionButton>
                  <ActionButton onClick={() => handleEditContent(content)}>
                    <Edit2 size={16} />
                    עריכה
                  </ActionButton>
                  <ActionButton $variant="danger" onClick={() => handleDeleteContent(content.id)}>
                    <Trash2 size={16} />
                    מחיקה
                  </ActionButton>
                </Actions>
              </ContentCard>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <Modal onClick={() => setShowSectionModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingSection ? 'עריכת מדור' : 'מדור חדש'}</ModalTitle>
              <CloseButton onClick={() => setShowSectionModal(false)}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            <FormGroup>
              <Label>מזהה ייחודי (אנגלית)</Label>
              <Input
                value={sectionForm.sectionKey}
                onChange={(e) => setSectionForm({ ...sectionForm, sectionKey: e.target.value })}
                placeholder="recipes"
                disabled={!!editingSection}
              />
            </FormGroup>
            <FormGroup>
              <Label>שם המדור</Label>
              <Input
                value={sectionForm.title}
                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                placeholder="מתכונים"
              />
            </FormGroup>
            <FormGroup>
              <Label>תיאור</Label>
              <TextArea
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                rows={3}
                placeholder="תיאור המדור..."
              />
            </FormGroup>
            <FormGroup>
              <Label>אייקון (Emoji)</Label>
              <Input
                value={sectionForm.icon}
                onChange={(e) => setSectionForm({ ...sectionForm, icon: e.target.value })}
                placeholder="🍳"
              />
            </FormGroup>
            <FormGroup>
              <Label>צבע</Label>
              <Input
                type="color"
                value={sectionForm.color}
                onChange={(e) => setSectionForm({ ...sectionForm, color: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>סדר הצגה</Label>
              <Input
                type="number"
                value={sectionForm.sortOrder}
                onChange={(e) => setSectionForm({ ...sectionForm, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </FormGroup>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <ActionButton onClick={() => setShowSectionModal(false)}>ביטול</ActionButton>
              <SaveButton onClick={handleSaveSection} disabled={loading}>
                <Save size={18} style={{ display: 'inline', marginLeft: '0.5rem' }} />
                שמירה
              </SaveButton>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Content Modal */}
      {showContentModal && (
        <Modal onClick={() => setShowContentModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingContent ? 'עריכת תוכן' : 'תוכן חדש'}</ModalTitle>
              <CloseButton onClick={() => setShowContentModal(false)}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            <FormGroup>
              <Label>כותרת</Label>
              <Input
                value={contentForm.title}
                onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                placeholder="כותרת התוכן..."
              />
            </FormGroup>
            <FormGroup>
              <Label>תקציר</Label>
              <TextArea
                value={contentForm.excerpt}
                onChange={(e) => setContentForm({ ...contentForm, excerpt: e.target.value })}
                rows={2}
                placeholder="תקציר קצר..."
              />
            </FormGroup>
            <FormGroup>
              <Label>תוכן מלא</Label>
              <TextArea
                value={contentForm.content}
                onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                rows={10}
                placeholder="תוכן מלא (תמיכה ב-HTML)..."
              />
            </FormGroup>
            <FormGroup>
              <Label>קישור לתמונה</Label>
              <Input
                value={contentForm.imageUrl}
                onChange={(e) => setContentForm({ ...contentForm, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </FormGroup>
            <FormGroup>
              <Label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={contentForm.published}
                  onChange={(e) => setContentForm({ ...contentForm, published: e.target.checked })}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: '#10b981'
                  }}
                />
                <span>פרסם מיד (אחרת ישמר כטיוטה)</span>
              </Label>
            </FormGroup>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <ActionButton onClick={() => setShowContentModal(false)}>ביטול</ActionButton>
              <SaveButton onClick={handleSaveContent} disabled={loading}>
                <Save size={18} style={{ display: 'inline', marginLeft: '0.5rem' }} />
                שמירה
              </SaveButton>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

