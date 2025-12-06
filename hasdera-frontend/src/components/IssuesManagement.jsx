/**
 * IssuesManagement.jsx
 * ניהול גליונות - רשימת גליונות עם אפשרות לעריכה/יצירה
 * מעוצב כמו אזור המפרסמים
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Upload, Edit, Eye, Download, Plus, FileText, Calendar, Hash, X, CalendarDays, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import IssueEditor from './IssueEditor';
import { getIssues, deleteIssue } from '../Services/issuesService';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// 🎯 PDF Worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

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

// 🎨 Actions Bar
const ActionsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const ActionButton = styled.button`
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

// 🎨 Issues Grid
const IssuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const IssueCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateY(-4px);
  }
`;

const IssueImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
  overflow: hidden;
  position: relative;
  
  svg {
    width: 64px;
    height: 64px;
    display: block;
  }
`;

const PDFCoverWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  
  canvas {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const PDFLoading = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 0.5rem;
  
  svg {
    width: 40px;
    height: 40px;
    display: block;
    opacity: 0.4;
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const IssueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const IssueTitle = styled.h3`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  margin: 0;
  letter-spacing: 1px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: ${props => {
    if (props.$status === 'published') return 'rgba(16, 185, 129, 0.2)';
    if (props.$status === 'draft') return 'rgba(245, 158, 11, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.$status === 'published') return 'rgba(16, 185, 129, 0.3)';
    if (props.$status === 'draft') return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => {
    if (props.$status === 'published') return '#10b981';
    if (props.$status === 'draft') return '#f59e0b';
    return 'rgba(255, 255, 255, 0.7)';
  }};
`;

const IssueInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  
  svg {
    width: 16px;
    height: 16px;
    display: block;
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatItem = styled.div`
  text-align: center;
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  width: 100%;
`;

const CardButton = styled.button`
  flex: 1;
  min-width: calc(25% - 0.375rem);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
  }
  
  svg {
    width: 16px;
    height: 16px;
    display: block;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    min-width: calc(50% - 0.25rem);
    font-size: 0.75rem;
    padding: 0.5rem;
  }
`;

// 🎨 Editor Modal
const EditorModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
  animation: ${fadeIn} 0.3s ease-out;
`;

const EditorContent = styled.div`
  width: 100%;
  max-width: 1400px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 50%;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.1);
  }
  
  svg {
    width: 24px;
    height: 24px;
    display: block;
  }
`;

// PDF Options
const pdfOptions = {
  cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
  standardFontDataUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/",
};

// PDF Cover Component
function PDFCover({ pdfUrl, shouldLoad }) {
  const memoizedOptions = useMemo(() => pdfOptions, []);
  const [retryCount, setRetryCount] = useState(0);

  if (!shouldLoad || !pdfUrl) {
    return (
      <PDFLoading>
        <CalendarDays size={40} opacity={0.2} />
        <div style={{ fontSize: '0.85rem' }}>ממתין...</div>
      </PDFLoading>
    );
  }

  return (
    <PDFCoverWrapper>
      <Document
        file={pdfUrl}
        loading={
          <PDFLoading>
            <Spinner />
            <div>טוען שער...</div>
          </PDFLoading>
        }
        error={
          <PDFLoading>
            <CalendarDays size={40} opacity={0.4} />
            <div>שגיאה בטעינת שער</div>
          </PDFLoading>
        }
        options={memoizedOptions}
        onLoadError={(error) => {
          console.error('PDF load error:', error);
        }}
        key={retryCount}
      >
        <Page
          pageNumber={1}
          width={280}
          renderMode="canvas"
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </PDFCoverWrapper>
  );
}

export default function IssuesManagement() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIssue, setEditingIssue] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading issues...');
      const data = await getIssues(1, 100); // נטען עד 100 פריטים
      console.log(`✅ Loaded ${data?.length || 0} issues`);
      setIssues(data || []);
    } catch (error) {
      console.error('שגיאה בטעינת גליונות:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingIssue(null);
    setShowEditor(true);
  };

  const handleEdit = (issue) => {
    setEditingIssue(issue);
    setShowEditor(true);
  };

  const handleView = (issue) => {
    // נבדוק את כל האפשרויות לשדה ID
    const issueId = issue.Issue_id || issue.IssueId || issue.issue_id || issue.issueId || issue.id;
    console.log('🔍 handleView - issue:', issue);
    console.log('🔍 handleView - issueId:', issueId);
    console.log('🔍 handleView - issue.Issue_id:', issue.Issue_id);
    console.log('🔍 handleView - issue.IssueId:', issue.IssueId);
    console.log('🔍 handleView - issue.issue_id:', issue.issue_id);
    if (!issueId) {
      console.error('❌ handleView: No issueId found!', issue);
      alert('שגיאה: לא נמצא מזהה גיליון');
      return;
    }
    navigate(`/admin/flipbook/${issueId}`);
  };

  const handleDownload = async (issue) => {
    try {
      const pdfUrl = issue.Pdf_url || issue.PdfUrl;
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('שגיאה בהורדת PDF:', error);
    }
  };

  const handleDelete = async (issue) => {
    const issueId = issue.Issue_id || issue.IssueId || issue.issue_id || issue.issueId || issue.id;
    if (!issueId) {
      alert('שגיאה: לא נמצא מזהה גיליון');
      return;
    }

    // בדיקה אם הגיליון פורסם
    const pdfUrl = issue.Pdf_url || issue.PdfUrl || issue.pdf_url || issue.pdfUrl || '';
    const isPublished = pdfUrl && 
      !pdfUrl.startsWith('pending-upload-') && 
      !pdfUrl.startsWith('/uploads/') &&
      !pdfUrl.startsWith('/api/issues/draft-file/') &&
      (pdfUrl.includes('s3.eu-north-1.amazonaws.com') || 
       pdfUrl.includes('s3.amazonaws.com') ||
       pdfUrl.includes('amazonaws.com') ||
       (pdfUrl.startsWith('https://') && (pdfUrl.includes('amazonaws.com') || pdfUrl.includes('.s3.'))));

    if (isPublished) {
      if (!confirm('הגיליון כבר פורסם. האם אתה בטוח שברצונך למחוק אותו?')) {
        return;
      }
    } else {
      if (!confirm('האם אתה בטוח שברצונך למחוק את הגיליון?')) {
        return;
      }
    }

    try {
      await deleteIssue(issueId);
      alert('הגיליון נמחק בהצלחה');
      await loadIssues();
    } catch (error) {
      console.error('שגיאה במחיקת גיליון:', error);
      const errorMessage = error.response?.data?.error || 'שגיאה במחיקת הגיליון';
      alert(errorMessage);
    }
  };

  const handleSave = async (issueData) => {
    try {
      // TODO: שמירה/עדכון דרך ה-API
      console.log('שמירת גיליון:', issueData);
      setShowEditor(false);
      await loadIssues();
    } catch (error) {
      console.error('שגיאה בשמירת גיליון:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('he-IL');
  };

  return (
    <AdminLayout title="ניהול גליונות">
      <Container>
        {showEditor ? (
          <EditorModal onClick={(e) => e.target === e.currentTarget && setShowEditor(false)}>
            <EditorContent onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={() => setShowEditor(false)}>
                <X size={24} />
              </CloseButton>
              <IssueEditor
                issueId={editingIssue?.Issue_id || editingIssue?.IssueId}
                onClose={() => setShowEditor(false)}
                onSave={handleSave}
              />
            </EditorContent>
          </EditorModal>
        ) : (
          <>
            <ActionsBar>
              <ActionButton onClick={handleCreateNew}>
                <Upload size={18} />
                העלאת גיליון חדש
              </ActionButton>
            </ActionsBar>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                <FileText size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>טוען גליונות...</p>
              </div>
            ) : issues.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                <FileText size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>אין גליונות עדיין. לחץ על "העלאת גיליון חדש" כדי להתחיל</p>
              </div>
            ) : (
              <IssuesGrid>
                {issues.map((issue, index) => {
                  const issueId = issue.Issue_id || issue.IssueId || issue.issue_id || issue.issueId || issue.id || `issue-${index}`;
                  // בדיקה אם הגיליון פורסם - אם הקובץ ב-S3 (לא pending-upload ולא /uploads/ ולא draft-file), הוא פורסם
                  const pdfUrl = issue.Pdf_url || issue.PdfUrl || issue.pdf_url || issue.pdfUrl || '';
                  const isPublished = pdfUrl && 
                    !pdfUrl.startsWith('pending-upload-') && 
                    !pdfUrl.startsWith('/uploads/') &&
                    !pdfUrl.startsWith('/api/issues/draft-file/') &&
                    (pdfUrl.includes('s3.eu-north-1.amazonaws.com') || 
                     pdfUrl.includes('s3.amazonaws.com') ||
                     pdfUrl.includes('amazonaws.com') ||
                     (pdfUrl.startsWith('https://') && (pdfUrl.includes('amazonaws.com') || pdfUrl.includes('.s3.'))));
                  const status = isPublished ? 'published' : 'draft';
                  const title = issue.Title || issue.title || `גיליון ${issueId}`;
                  
                  return (
                    <IssueCard key={issueId}>
                      <IssueImage>
                        {pdfUrl ? (
                          <PDFCover pdfUrl={pdfUrl} shouldLoad={true} />
                        ) : (
                          <FileText size={64} />
                        )}
                      </IssueImage>
                      <IssueHeader>
                        <IssueTitle>{title}</IssueTitle>
                        <StatusBadge $status={status}>
                          {status === 'published' ? 'פורסם' : 'טיוטה'}
                        </StatusBadge>
                      </IssueHeader>
                      <IssueInfo>
                        <InfoRow>
                          <Calendar size={16} />
                          תאריך: {formatDate(issue.Issue_date || issue.IssueDate)}
                        </InfoRow>
                        <InfoRow>
                          <Hash size={16} />
                          מספר גיליון: {issueId}
                        </InfoRow>
                      </IssueInfo>
                      <CardActions>
                        <CardButton onClick={() => handleEdit(issue)}>
                          <Edit size={16} />
                          עריכה
                        </CardButton>
                        <CardButton onClick={() => handleView(issue)}>
                          <Eye size={16} />
                          צפייה
                        </CardButton>
                        <CardButton onClick={() => handleDownload(issue)}>
                          <Download size={16} />
                          הורדה
                        </CardButton>
                        <CardButton 
                          onClick={() => handleDelete(issue)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            color: '#ef4444'
                          }}
                        >
                          <Trash2 size={16} />
                          מחיקה
                        </CardButton>
                      </CardActions>
                    </IssueCard>
                  );
                })}
              </IssuesGrid>
            )}
          </>
        )}
      </Container>
    </AdminLayout>
  );
}
