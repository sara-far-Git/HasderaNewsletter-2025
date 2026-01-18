/**
 * IssuesManagement.jsx
 * ניהול גליונות - גרסה מתוקנת
 * תיקון: טיפול נכון ב-PDF URLs שעדיין בהעלאה
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Upload, Edit, Eye, Download, FileText, Calendar, Hash, X, CalendarDays, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import IssueEditor from './IssueEditor';
import { getIssues, deleteIssue, getIssueCreatives } from '../Services/issuesService';
import { api } from '../Services/api.js';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// PDF Worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// ============================================
// Helper Functions
// ============================================

/**
 * בדיקה האם URL של PDF הוא תקין וניתן לטעינה
 */
const isValidPdfUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const trimmed = url.trim();
  
  // URLs לא תקינים
  if (trimmed === '' || 
      trimmed === 'null' || 
      trimmed === 'undefined' ||
      trimmed.startsWith('pending-upload-') ||
      trimmed.startsWith('/uploads/') ||
      trimmed.startsWith('/api/issues/draft-file/')) {
    return false;
  }
  
  // URL תקין צריך להתחיל ב-http/https
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
};

/**
 * בדיקה האם הגיליון פורסם (הקובץ ב-S3)
 */
const isIssuePublished = (pdfUrl) => {
  if (!isValidPdfUrl(pdfUrl)) return false;
  
  return pdfUrl.includes('s3.eu-north-1.amazonaws.com') || 
         pdfUrl.includes('s3.amazonaws.com') ||
         pdfUrl.includes('amazonaws.com') ||
         pdfUrl.includes('.s3.');
};

/**
 * קבלת ID של גיליון
 */
const getIssueId = (issue) => {
  return issue.Issue_id || issue.IssueId || issue.issue_id || issue.issueId || issue.id;
};

/**
 * קבלת URL של PDF
 */
const getPdfUrl = (issue) => {
  return issue.Pdf_url || issue.PdfUrl || issue.pdf_url || issue.pdfUrl || '';
};

/**
 * קבלת URL של קובץ (fallback לשדות FileUrl)
 */
const getFileUrl = (issue) => {
  return issue.File_url || issue.FileUrl || issue.file_url || issue.fileUrl || '';
};

const buildIssuePdfProxyUrl = (issueId) => {
  if (!issueId) return '';
  const base = api.defaults.baseURL;
  if (!base) return `/api/issues/${issueId}/pdf`;
  return `${base}/issues/${issueId}/pdf`;
};

/**
 * בדיקה האם יש לגיליון קובץ PDF/קובץ להורדה
 */
const hasIssuePdf = (issue) => {
  const pdfUrl = getPdfUrl(issue);
  const fileUrl = getFileUrl(issue);
  return Boolean((typeof pdfUrl === 'string' && pdfUrl.trim()) || (typeof fileUrl === 'string' && fileUrl.trim()));
};

const downloadCreativeFile = async (item) => {
  const url = item?.fileUrl;
  if (!url) return false;
  const fileName = item.fileName || `creative-${item.creativeId || item.orderId || 'file'}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('download failed');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    return true;
  } catch {
    window.open(url, '_blank');
    return false;
  }
};

/**
 * קבלת כותרת גיליון
 */
const getIssueTitle = (issue, fallbackId) => {
  return issue.Title || issue.title || `גיליון ${fallbackId}`;
};

/**
 * פורמט תאריך
 */
const formatDate = (date) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('he-IL');
  } catch {
    return '-';
  }
};

// ============================================
// Animations
// ============================================
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

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ============================================
// Styled Components
// ============================================
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.8s ease-out;
`;

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
  background: ${props => props.$published ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'};
  border: 1px solid ${props => props.$published ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => props.$published ? '#10b981' : '#f59e0b'};
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const DeleteButton = styled(CardButton)`
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    color: #ef4444;
  }
`;

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

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: rgba(255, 255, 255, 0.7);
  
  svg {
    margin: 0 auto 1rem;
    opacity: 0.5;
  }
`;

// ============================================
// PDF Cover Component
// ============================================
const pdfOptions = {
  cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
  standardFontDataUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/",
};

const PDFCover = React.memo(function PDFCover({ pdfUrl, shouldLoad = true }) {
  const [hasError, setHasError] = useState(false);
  const canLoad = useMemo(() => isValidPdfUrl(pdfUrl), [pdfUrl]);

  useEffect(() => {
    setHasError(false);
  }, [pdfUrl, shouldLoad]);

  if (!shouldLoad || !canLoad || hasError) {
    return (
      <PDFLoading>
        <CalendarDays size={40} />
        <div style={{ fontSize: '0.85rem' }}>{!canLoad ? 'ממתין להעלאה...' : 'שגיאה בטעינה'}</div>
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
            <CalendarDays size={40} />
            <div>שגיאה בטעינה</div>
          </PDFLoading>
        }
        options={pdfOptions}
        onLoadError={(error) => {
          console.error('PDF cover load error:', error);
          setHasError(true);
        }}
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
});

// ============================================
// Issue Card Component
// ============================================
const IssueCardComponent = React.memo(function IssueCardComponent({ 
  issue, 
  index,
  onEdit, 
  onView, 
  onDownload, 
  onDownloadCreatives,
  onDelete 
}) {
  const issueId = getIssueId(issue) || `issue-${index}`;
  const pdfUrl = getPdfUrl(issue);
  const isPublished = isIssuePublished(pdfUrl);
  const title = getIssueTitle(issue, issueId);
  const hasValidPdf = isValidPdfUrl(pdfUrl);
  const coverUrl = hasValidPdf && getIssueId(issue) ? buildIssuePdfProxyUrl(getIssueId(issue)) : pdfUrl;
  
  return (
    <IssueCard>
      <IssueImage>
        {hasValidPdf ? (
          <PDFCover pdfUrl={coverUrl} shouldLoad={true} />
        ) : (
          <FileText size={64} />
        )}
      </IssueImage>
      
      <IssueHeader>
        <IssueTitle>{title}</IssueTitle>
        <StatusBadge $published={isPublished}>
          {isPublished ? 'פורסם' : 'טיוטה'}
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
        <CardButton onClick={() => onEdit(issue)}>
          <Edit size={16} />
          עריכה
        </CardButton>
        <CardButton onClick={() => onView(issue)}>
          <Eye size={16} />
          צפייה
        </CardButton>
        <CardButton 
          onClick={() => onDownload(issue)}
          disabled={!hasValidPdf}
        >
          <Download size={16} />
          הורדה
        </CardButton>
        <CardButton onClick={() => onDownloadCreatives(issue)}>
          <FileText size={16} />
          מודעות
        </CardButton>
        <DeleteButton onClick={() => onDelete(issue)}>
          <Trash2 size={16} />
          מחיקה
        </DeleteButton>
      </CardActions>
    </IssueCard>
  );
});

// ============================================
// Main Component
// ============================================
export default function IssuesManagement() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIssue, setEditingIssue] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getIssues(1, 100);
      // לא מציגים גליונות ריקים (ללא PDF) כדי לא ליצור "טיוטה" שלא ניתן לצפות בה
      const visible = (data || []).filter(hasIssuePdf);
      setIssues(visible);
    } catch (error) {
      console.error('שגיאה בטעינת גליונות:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleCreateNew = useCallback(() => {
    setEditingIssue(null);
    setShowEditor(true);
  }, []);

  const handleEdit = useCallback((issue) => {
    setEditingIssue(issue);
    setShowEditor(true);
  }, []);

  const handleView = useCallback((issue) => {
    if (!hasIssuePdf(issue)) {
      alert('לא ניתן לצפות בגיליון בלי קובץ PDF');
      return;
    }

    const issueId = getIssueId(issue);
    if (!issueId) {
      alert('שגיאה: לא נמצא מזהה גיליון');
      return;
    }
    navigate(`/admin/flipbook/${issueId}`);
  }, [navigate]);

  const handleDownload = useCallback((issue) => {
    const pdfUrl = getPdfUrl(issue);
    const issueId = getIssueId(issue);
    if (issueId) {
      window.open(buildIssuePdfProxyUrl(issueId), '_blank');
    } else if (isValidPdfUrl(pdfUrl)) {
      window.open(pdfUrl, '_blank');
    }
  }, []);

  const handleDownloadCreatives = useCallback(async (issue) => {
    const issueId = getIssueId(issue);
    if (!issueId) {
      alert('שגיאה: לא נמצא מזהה גיליון');
      return;
    }
    try {
      const items = await getIssueCreatives(issueId);
      if (!items.length) {
        alert('לא נמצאו מודעות לגיליון זה');
        return;
      }
      const confirmMsg = `נמצאו ${items.length} מודעות. להוריד את כולן עכשיו?`;
      if (!confirm(confirmMsg)) return;
      for (const item of items) {
        await downloadCreativeFile(item);
      }
    } catch (error) {
      console.error('שגיאה בהורדת מודעות:', error);
      alert(error.response?.data?.error || 'שגיאה בהורדת מודעות');
    }
  }, []);

  const handleDelete = useCallback(async (issue) => {
    const issueId = getIssueId(issue);
    if (!issueId) {
      alert('שגיאה: לא נמצא מזהה גיליון');
      return;
    }


    const pdfUrl = getPdfUrl(issue);
    const isPublished = isIssuePublished(pdfUrl);

    const confirmMessage = isPublished
      ? 'הגיליון כבר פורסם. האם אתה בטוח שברצונך למחוק אותו?'
      : 'האם אתה בטוח שברצונך למחוק את הגיליון?';

    if (!confirm(confirmMessage)) return;

    try {
      await deleteIssue(issueId);
      alert('הגיליון נמחק בהצלחה');
      await loadIssues();
    } catch (error) {
      console.error('שגיאה במחיקת גיליון:', error);
      alert(error.response?.data?.error || 'שגיאה במחיקת הגיליון');
    }
  }, [loadIssues]);

  const handleSave = useCallback(async () => {
    setShowEditor(false);
    await loadIssues();
  }, [loadIssues]);

  const closeEditor = useCallback(() => {
    setShowEditor(false);
  }, []);

  const handleModalBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      closeEditor();
    }
  }, [closeEditor]);

  return (
    <AdminLayout title="ניהול גליונות">
      <Container>
        {showEditor ? (
          <EditorModal onClick={handleModalBackdropClick}>
            <EditorContent onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={closeEditor}>
                <X size={24} />
              </CloseButton>
              <IssueEditor
                issueId={getIssueId(editingIssue)}
                onClose={closeEditor}
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
              <EmptyState>
                <FileText size={64} />
                <p>טוען גליונות...</p>
              </EmptyState>
            ) : issues.length === 0 ? (
              <EmptyState>
                <FileText size={64} />
                <p>אין גליונות עדיין. לחץ על "העלאת גיליון חדש" כדי להתחיל</p>
              </EmptyState>
            ) : (
              <IssuesGrid>
                {issues.map((issue, index) => (
                  <IssueCardComponent
                    key={getIssueId(issue) || `issue-${index}`}
                    issue={issue}
                    index={index}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDownload={handleDownload}
                    onDownloadCreatives={handleDownloadCreatives}
                    onDelete={handleDelete}
                  />
                ))}
              </IssuesGrid>
            )}
          </>
        )}
      </Container>
    </AdminLayout>
  );
}