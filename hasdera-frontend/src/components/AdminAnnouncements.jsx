/**
 * AdminAnnouncements.jsx
 * ממשק ניהול הודעות חגיגיות ומבצעים
 */

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { 
  Plus, Edit2, Trash2, ToggleLeft, ToggleRight, 
  Calendar, Clock, Link, X, Save, Eye, EyeOff
} from "lucide-react";
import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncement,
  ANNOUNCEMENT_TYPES,
  BACKGROUND_COLORS,
  ANNOUNCEMENT_ICONS
} from "../Services/announcementsService";

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
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  animation: ${slideIn} 0.4s ease-out;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const CardPreview = styled.div`
  background: ${props => props.$bg || 'linear-gradient(135deg, #10b981 0%, #059669 100%)'};
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 80px;
`;

const PreviewIcon = styled.span`
  font-size: 2rem;
`;

const PreviewContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const PreviewTitle = styled.h3`
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PreviewText = styled.p`
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardBody = styled.div`
  padding: 1rem 1.25rem;
`;

const CardMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #6b7280;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)'};
  color: ${props => props.$active ? '#10b981' : '#6b7280'};
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => {
    if (props.$variant === 'edit') return 'rgba(59, 130, 246, 0.1)';
    if (props.$variant === 'delete') return 'rgba(239, 68, 68, 0.1)';
    if (props.$variant === 'toggle') return props.$active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)';
    return 'rgba(107, 114, 128, 0.1)';
  }};
  color: ${props => {
    if (props.$variant === 'edit') return '#3b82f6';
    if (props.$variant === 'delete') return '#ef4444';
    if (props.$variant === 'toggle') return props.$active ? '#10b981' : '#6b7280';
    return '#6b7280';
  }};
  
  &:hover {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

// Modal
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #10b981;
  }
`;

const IconsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${props => props.$selected ? '#10b981' : '#e5e7eb'};
  border-radius: 10px;
  background: ${props => props.$selected ? 'rgba(16, 185, 129, 0.1)' : 'white'};
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #10b981;
  }
`;

const ColorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ColorButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 3px solid ${props => props.$selected ? '#1f2937' : 'transparent'};
  background: ${props => props.$color};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    }
  ` : `
    background: white;
    border: 2px solid #e5e7eb;
    color: #6b7280;
    
    &:hover {
      border-color: #d1d5db;
      background: #f9fafb;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
  
  h3 {
    font-size: 1.25rem;
    color: #374151;
    margin-bottom: 0.5rem;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
`;

// קומפוננטה ראשית
const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'news',
    icon: '📢',
    backgroundColor: BACKGROUND_COLORS[0].value,
    actionUrl: '',
    actionText: '',
    startDate: '',
    endDate: '',
    isActive: true,
    priority: 0
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAllAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      type: 'news',
      icon: '📢',
      backgroundColor: BACKGROUND_COLORS[0].value,
      actionUrl: '',
      actionText: '',
      startDate: '',
      endDate: '',
      isActive: true,
      priority: 0
    });
    setEditingId(null);
  };

  const openModal = (announcement = null) => {
    if (announcement) {
      setEditingId(announcement.announcementId);
      setForm({
        title: announcement.title || '',
        content: announcement.content || '',
        type: announcement.type || 'news',
        icon: announcement.icon || '📢',
        backgroundColor: announcement.backgroundColor || BACKGROUND_COLORS[0].value,
        actionUrl: announcement.actionUrl || '',
        actionText: announcement.actionText || '',
        startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().split('T')[0] : '',
        endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().split('T')[0] : '',
        isActive: announcement.isActive ?? true,
        priority: announcement.priority || 0
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert('נא להזין כותרת');
      return;
    }

    try {
      setSaving(true);
      
      const data = {
        ...form,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        priority: parseInt(form.priority) || 0
      };

      if (editingId) {
        await updateAnnouncement(editingId, data);
      } else {
        await createAnnouncement(data);
      }

      closeModal();
      loadAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert('שגיאה בשמירת ההודעה');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleAnnouncement(id);
      loadAnnouncements();
    } catch (error) {
      console.error("Error toggling announcement:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם למחוק את ההודעה?')) return;
    
    try {
      await deleteAnnouncement(id);
      loadAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('he-IL');
  };

  return (
    <Container>
      <Header>
        <Title>🎉 ניהול הודעות</Title>
        <AddButton onClick={() => openModal()}>
          <Plus size={18} />
          הודעה חדשה
        </AddButton>
      </Header>

      {loading ? (
        <EmptyState>טוען...</EmptyState>
      ) : announcements.length === 0 ? (
        <EmptyState>
          <h3>אין הודעות</h3>
          <p>צרו הודעה חדשה כדי להציג לקוראים</p>
          <AddButton onClick={() => openModal()}>
            <Plus size={18} />
            הודעה ראשונה
          </AddButton>
        </EmptyState>
      ) : (
        <Grid>
          {announcements.map((announcement) => (
            <Card key={announcement.announcementId}>
              <CardPreview $bg={announcement.backgroundColor}>
                <PreviewIcon>{announcement.icon || '📢'}</PreviewIcon>
                <PreviewContent>
                  <PreviewTitle>{announcement.title}</PreviewTitle>
                  {announcement.content && (
                    <PreviewText>{announcement.content}</PreviewText>
                  )}
                </PreviewContent>
              </CardPreview>
              
              <CardBody>
                <CardMeta>
                  <StatusBadge $active={announcement.isActive}>
                    {announcement.isActive ? 'פעיל' : 'לא פעיל'}
                  </StatusBadge>
                  <MetaItem>
                    <Calendar size={14} />
                    {formatDate(announcement.startDate)}
                  </MetaItem>
                  {announcement.endDate && (
                    <MetaItem>
                      <Clock size={14} />
                      עד {formatDate(announcement.endDate)}
                    </MetaItem>
                  )}
                </CardMeta>
                
                <CardActions>
                  <ActionButton 
                    $variant="toggle" 
                    $active={announcement.isActive}
                    onClick={() => handleToggle(announcement.announcementId)}
                    title={announcement.isActive ? 'כבה' : 'הפעל'}
                  >
                    {announcement.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </ActionButton>
                  <ActionButton 
                    $variant="edit"
                    onClick={() => openModal(announcement)}
                    title="ערוך"
                  >
                    <Edit2 size={16} />
                  </ActionButton>
                  <ActionButton 
                    $variant="delete"
                    onClick={() => handleDelete(announcement.announcementId)}
                    title="מחק"
                  >
                    <Trash2 size={16} />
                  </ActionButton>
                </CardActions>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}

      {/* Modal */}
      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingId ? 'עריכת הודעה' : 'הודעה חדשה'}
              </ModalTitle>
              <CloseButton onClick={closeModal}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <FormGroup>
                <Label>כותרת *</Label>
                <Input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="כותרת ההודעה"
                />
              </FormGroup>

              <FormGroup>
                <Label>תוכן</Label>
                <Textarea
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                  placeholder="תוכן ההודעה (אופציונלי)"
                />
              </FormGroup>

              <Row>
                <FormGroup>
                  <Label>סוג הודעה</Label>
                  <Select
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                  >
                    {ANNOUNCEMENT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>עדיפות</Label>
                  <Input
                    type="number"
                    value={form.priority}
                    onChange={e => setForm({...form, priority: e.target.value})}
                    placeholder="0"
                  />
                </FormGroup>
              </Row>

              <FormGroup>
                <Label>אייקון</Label>
                <IconsGrid>
                  {ANNOUNCEMENT_ICONS.map(icon => (
                    <IconButton
                      key={icon}
                      $selected={form.icon === icon}
                      onClick={() => setForm({...form, icon})}
                    >
                      {icon}
                    </IconButton>
                  ))}
                </IconsGrid>
              </FormGroup>

              <FormGroup>
                <Label>צבע רקע</Label>
                <ColorGrid>
                  {BACKGROUND_COLORS.map(color => (
                    <ColorButton
                      key={color.value}
                      $color={color.value}
                      $selected={form.backgroundColor === color.value}
                      onClick={() => setForm({...form, backgroundColor: color.value})}
                      title={color.label}
                    />
                  ))}
                </ColorGrid>
              </FormGroup>

              <Row>
                <FormGroup>
                  <Label>תאריך התחלה</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({...form, startDate: e.target.value})}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>תאריך סיום (אופציונלי)</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({...form, endDate: e.target.value})}
                  />
                </FormGroup>
              </Row>

              <FormGroup>
                <Label>טקסט לכפתור (אופציונלי)</Label>
                <Input
                  type="text"
                  value={form.actionText}
                  onChange={e => setForm({...form, actionText: e.target.value})}
                  placeholder="לדוגמה: לפרטים נוספים"
                />
              </FormGroup>

              <FormGroup>
                <Label>קישור (אופציונלי)</Label>
                <Input
                  type="text"
                  value={form.actionUrl}
                  onChange={e => setForm({...form, actionUrl: e.target.value})}
                  placeholder="https://..."
                />
              </FormGroup>
            </ModalBody>

            <ModalFooter>
              <Button onClick={closeModal}>ביטול</Button>
              <Button $primary onClick={handleSubmit} disabled={saving}>
                <Save size={16} />
                {saving ? 'שומר...' : 'שמור'}
              </Button>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default AdminAnnouncements;

