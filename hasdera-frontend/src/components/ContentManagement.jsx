/**
 * ContentManagement.jsx
 * מערכת תוכן (CMS) - מדורים, כתבות, עורכים ופריסה
 * מעוצב כמו אזור המפרסמים
 */

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FileEdit, Users, Image, Layout, FileText, Edit, Plus, Trash2, X, FolderOpen, Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../Services/categoriesService';

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

// 🎨 Modal Overlay
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Modal = styled.div`
  background: linear-gradient(135deg, rgba(30, 30, 40, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  animation: ${fadeInUp} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 8px;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #10b981;
    background: rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);

    &:hover {
      border-color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.05);
    }
  `}

  ${props => props.$danger && `
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border: none;
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
    }
  `}

  svg {
    width: 18px;
    height: 18px;
  }
`;

const CategoryCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateY(-4px);
  }
`;

const CategoryIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);

  svg {
    width: 28px;
    height: 28px;
    color: white;
  }
`;

const CategoryName = styled.h3`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: white;
  margin: 0 0 0.5rem 0;
`;

const CategoryStats = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const CategoryActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
`;

const IconButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: ${props => props.$danger ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.3)'};
    color: ${props => props.$danger ? '#ef4444' : '#10b981'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: rgba(255, 255, 255, 0.7);

  svg {
    width: 48px;
    height: 48px;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
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

  // State for categories management
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Load categories when switching to sections tab
  useEffect(() => {
    if (activeTab === 'sections') {
      loadCategories();
    }
  }, [activeTab]);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryError('');
    setShowCategoryModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryError('');
    setShowCategoryModal(true);
  };

  const closeModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryError('');
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      setCategoryError('נא להזין שם מדור');
      return;
    }

    setSavingCategory(true);
    setCategoryError('');

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.categoryId, categoryName.trim());
      } else {
        await createCategory(categoryName.trim());
      }
      await loadCategories();
      closeModal();
    } catch (err) {
      setCategoryError(err.message || 'שגיאה בשמירת המדור');
    } finally {
      setSavingCategory(false);
    }
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.categoryId);
      await loadCategories();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

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
          <>
            <Header>
              <AddButton onClick={openCreateModal}>
                <Plus size={18} />
                מדור חדש
              </AddButton>
            </Header>

            {categoriesLoading ? (
              <LoadingSpinner>
                <Loader2 />
                <span>טוען מדורים...</span>
              </LoadingSpinner>
            ) : categories.length === 0 ? (
              <EmptyState>
                <FolderOpen size={64} />
                <p>אין מדורים עדיין</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>לחץ על "מדור חדש" כדי להתחיל</p>
              </EmptyState>
            ) : (
              <ContentGrid>
                {categories.map((category) => (
                  <CategoryCard key={category.categoryId}>
                    <CategoryIcon>
                      <Layout />
                    </CategoryIcon>
                    <CategoryName>{category.name}</CategoryName>
                    <CategoryStats>
                      {category.articleCount} כתבות
                    </CategoryStats>
                    <CategoryActions>
                      <IconButton onClick={() => openEditModal(category)}>
                        <Edit size={16} />
                        עריכה
                      </IconButton>
                      <IconButton $danger onClick={() => openDeleteModal(category)}>
                        <Trash2 size={16} />
                        מחיקה
                      </IconButton>
                    </CategoryActions>
                  </CategoryCard>
                ))}
              </ContentGrid>
            )}
          </>
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

      {/* Modal for creating/editing category */}
      {showCategoryModal && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingCategory ? 'עריכת מדור' : 'מדור חדש'}
              </ModalTitle>
              <CloseButton onClick={closeModal}>
                <X />
              </CloseButton>
            </ModalHeader>

            <Input
              type="text"
              placeholder="שם המדור"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setCategoryError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !savingCategory) {
                  handleSaveCategory();
                }
              }}
              autoFocus
            />
            {categoryError && <ErrorMessage>{categoryError}</ErrorMessage>}

            <ModalActions>
              <ModalButton onClick={closeModal}>ביטול</ModalButton>
              <ModalButton
                $primary
                onClick={handleSaveCategory}
                disabled={savingCategory}
              >
                {savingCategory ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    שומר...
                  </>
                ) : (
                  <>
                    {editingCategory ? 'שמירה' : 'יצירה'}
                  </>
                )}
              </ModalButton>
            </ModalActions>
          </Modal>
        </ModalOverlay>
      )}

      {/* Modal for confirming delete */}
      {showDeleteModal && categoryToDelete && (
        <ModalOverlay onClick={() => setShowDeleteModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>מחיקת מדור</ModalTitle>
              <CloseButton onClick={() => setShowDeleteModal(false)}>
                <X />
              </CloseButton>
            </ModalHeader>

            <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
              האם אתה בטוח שברצונך למחוק את המדור <strong>"{categoryToDelete.name}"</strong>?
              {categoryToDelete.articleCount > 0 && (
                <span style={{ display: 'block', marginTop: '0.5rem', color: '#f59e0b' }}>
                  שים לב: {categoryToDelete.articleCount} כתבות משויכות למדור זה יישארו ללא מדור.
                </span>
              )}
            </p>

            <ModalActions>
              <ModalButton onClick={() => setShowDeleteModal(false)}>ביטול</ModalButton>
              <ModalButton $danger onClick={handleDeleteCategory}>
                <Trash2 size={18} />
                מחיקה
              </ModalButton>
            </ModalActions>
          </Modal>
        </ModalOverlay>
      )}
    </AdminLayout>
  );
}
