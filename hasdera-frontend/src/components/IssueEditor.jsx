/**
 * IssueEditor.jsx
 * עורך גליונות - העלאת PDF, הוספת קישורים ואנימציות, תצוגה מקדימה ופרסום
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Upload, X, FileText, Eye, Save, Send, ChevronLeft, Loader, Download } from 'lucide-react';
import { uploadIssuePdf, updateIssueMetadata, publishIssue, getIssueById, getIssueCreatives } from '../Services/issuesService';

// 🎬 אנימציות
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

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

// 🎨 Container
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

// 🎨 Stepper
const Stepper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active 
    ? 'rgba(16, 185, 129, 0.2)' 
    : 'rgba(255, 255, 255, 0.05)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.$active 
    ? 'rgba(16, 185, 129, 0.3)' 
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 50px;
  color: ${props => props.$active ? '#10b981' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? 600 : 400};
  transition: all 0.3s ease;
  
  svg {
    width: 18px;
    height: 18px;
    display: block;
  }
`;

const StepConnector = styled.div`
  width: 40px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
`;

// 🎨 Step Content
const StepContent = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

// 🎨 Upload Step
const UploadArea = styled.div`
  border: 2px dashed ${props => props.$isDragging ? '#10b981' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  background: ${props => props.$isDragging ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
  }
`;

const UploadIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: #10b981;
  
  svg {
    width: 64px;
    height: 64px;
    display: block;
  }
`;

const UploadText = styled.div`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  color: white;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
`;

const UploadHint = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
`;

const FileInput = styled.input`
  display: none;
`;

const FilePreview = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const FileIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  svg {
    width: 24px;
    height: 24px;
    display: block;
  }
`;

const FileDetails = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-size: 1rem;
  color: white;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const RemoveButton = styled.button`
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
  }
  
  svg {
    width: 20px;
    height: 20px;
    display: block;
  }
`;

// 🎨 Editor Step
const EditorSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  margin-bottom: 1rem;
  letter-spacing: 1px;
`;

const LinkInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 0.95rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

// 🎨 Preview Step
const PreviewContainer = styled.div`
  width: 100%;
  height: 80vh;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
`;

// 🎨 Actions
const ActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
  }
  
  svg {
    width: 18px;
    height: 18px;
    display: block;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const PrimaryActionButton = styled.button`
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
    display: block;
  }
`;

const SecondaryActionButton = styled(PrimaryActionButton)`
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #ef4444;
  font-size: 0.95rem;
`;

const SuccessMessage = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  color: #10b981;
  font-size: 0.95rem;
`;

const CreativesPanel = styled.div`
  margin-top: 1.5rem;
  padding: 1.25rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const CreativesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  color: white;
`;

const CreativesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
`;

const CreativeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
`;

const CreativeMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
`;

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  
  svg {
    width: 18px;
    height: 18px;
    display: block;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  }
`;

export default function IssueEditor({ issueId, onClose, onSave }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  // פונקציה שמוודאת שהכתובת היא absolute
  function toAbsoluteUrl(url) {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // אם זה נתיב יחסי, נוסיף origin
    return window.location.origin + (url.startsWith('/') ? url : '/' + url);
  }
  const [isDragging, setIsDragging] = useState(false);
  const [issueData, setIssueData] = useState({
    title: '',
    issueNumber: '',
    date: '',
    status: 'draft',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [currentIssueId, setCurrentIssueId] = useState(issueId);
  const [error, setError] = useState(null);
  const [creatives, setCreatives] = useState([]);
  const [creativesLoading, setCreativesLoading] = useState(false);
  const [creativesError, setCreativesError] = useState(null);
  
  const fileInputRef = useRef(null);

  // טעינת גיליון קיים אם יש issueId
  useEffect(() => {
    if (issueId) {
      loadExistingIssue();
    }
  }, [issueId]);

  const loadExistingIssue = async () => {
    try {
      const issue = await getIssueById(issueId);
      setCurrentIssueId(issue.IssueId || issue.issueId);
      setIssueData({
        title: issue.Title || issue.title || '',
        issueNumber: issue.IssueNumber || issue.issueNumber || '',
        date: issue.IssueDate || issue.issueDate || '',
        status: issue.status || 'draft',
      });
      if (issue.PdfUrl || issue.pdfUrl) {
        setPdfUrl(toAbsoluteUrl(issue.PdfUrl || issue.pdfUrl));
      }
    } catch (err) {
      console.error('שגיאה בטעינת גיליון:', err);
    }
  };

  const steps = [
    { id: 1, label: 'העלאת PDF', icon: Upload },
    { id: 2, label: 'פרטי הגיליון', icon: FileText },
    { id: 3, label: 'תצוגה מקדימה', icon: Eye },
    { id: 4, label: 'פרסום', icon: Send },
  ];

  const handleFileSelect = async (file) => {
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url); // תצוגה מיידית מקומית
      
      // העלאת PDF לשרת
      setUploading(true);
      setError(null);
      try {
        const result = await uploadIssuePdf(
          file,
          issueData.title || undefined,
          issueData.issueNumber || undefined,
          issueData.date ? new Date(issueData.date) : undefined
        );
        
        setCurrentIssueId(result.issueId);
        setPdfUrl(toAbsoluteUrl(result.pdfUrl));
        setIssueData(prev => ({
          ...prev,
          title: result.title || prev.title,
        }));
        
        if (currentStep === 1) {
          setCurrentStep(2);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'שגיאה בהעלאת PDF');
        console.error('שגיאה בהעלאת PDF:', err);
      } finally {
        setUploading(false);
      }
    } else {
      setError('רק קבצי PDF נתמכים');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleSaveDraft = async () => {
    if (!currentIssueId) {
      setError('יש להעלות PDF קודם');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateIssueMetadata(currentIssueId, {
        title: issueData.title,
        issueDate: issueData.date ? new Date(issueData.date) : undefined,
      });

      if (onSave) {
        onSave({
          issueId: currentIssueId,
          ...issueData,
          pdfUrl,
          status: 'draft',
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בשמירת טיוטה');
      console.error('שגיאה בשמירת טיוטה:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!currentIssueId) {
      setError('יש להעלות PDF קודם');
      return;
    }

    setPublishing(true);
    setError(null);
    try {
      // שמירת מטא-דאטה לפני פרסום
      await updateIssueMetadata(currentIssueId, {
        title: issueData.title,
        issueDate: issueData.date ? new Date(issueData.date) : undefined,
      });

      // פרסום הגיליון
      const result = await publishIssue(currentIssueId);

      if (onSave) {
        onSave({
          issueId: currentIssueId,
          ...issueData,
          pdfUrl,
          status: 'published',
          publishUrl: result.publishUrl,
        });
      }

      // סגירת העורך לאחר פרסום מוצלח
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בפרסום הגיליון');
      console.error('שגיאה בפרסום:', err);
    } finally {
      setPublishing(false);
    }
  };

  const handleOpenLinkEditor = () => {
    if (!currentIssueId) {
      setError('יש להעלות PDF קודם');
      return;
    }
    try {
      navigate(`/admin/flipbook/${currentIssueId}`);
    } catch (e) {
      console.error('שגיאה בפתיחת עורך הקישורים:', e);
      setError('שגיאה בפתיחת עורך הקישורים');
    }
  };

  const loadCreatives = useCallback(async () => {
    if (!currentIssueId) return;
    setCreativesLoading(true);
    setCreativesError(null);
    try {
      const items = await getIssueCreatives(currentIssueId);
      setCreatives(items);
    } catch (err) {
      console.error('שגיאה בטעינת מודעות:', err);
      setCreativesError('שגיאה בטעינת מודעות');
    } finally {
      setCreativesLoading(false);
    }
  }, [currentIssueId]);

  const downloadCreativeFile = async (item) => {
    const url = item?.fileUrl;
    if (!url) return;
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
    } catch {
      window.open(url, '_blank');
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return pdfFile !== null;
      case 2:
        return true; // תמיד אפשר להמשיך
      case 3:
        return true; // תמיד אפשר להמשיך
      default:
        return false;
    }
  };

  return (
    <Container>
      <Stepper>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <React.Fragment key={step.id}>
              <Step $active={isActive || isCompleted}>
                <Icon size={18} />
                {step.label}
              </Step>
              {index < steps.length - 1 && <StepConnector />}
            </React.Fragment>
          );
        })}
      </Stepper>

      <StepContent>
        {/* שלב 1: העלאת PDF */}
        {currentStep === 1 && (
          <>
            <UploadArea
              $isDragging={isDragging}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon>
                <Upload size={64} />
              </UploadIcon>
              <UploadText>גרור ושחרר קובץ PDF כאן</UploadText>
              <UploadHint>או לחץ לבחירת קובץ מהמחשב</UploadHint>
            </UploadArea>

            <FileInput
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileInputChange}
            />

            {uploading && (
              <LoadingOverlay>
                <Loader size={18} />
                מעלה PDF לשרת...
              </LoadingOverlay>
            )}

            {pdfFile && !uploading && (
              <FilePreview>
                <FileInfo>
                  <FileIcon>
                    <FileText size={24} />
                  </FileIcon>
                  <FileDetails>
                    <FileName>{pdfFile.name}</FileName>
                    <FileSize>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</FileSize>
                  </FileDetails>
                </FileInfo>
                <RemoveButton onClick={() => {
                  setPdfFile(null);
                  setPdfUrl(null);
                  setCurrentIssueId(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}>
                  <X size={20} />
                </RemoveButton>
              </FilePreview>
            )}

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {!currentIssueId && (
              <div style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                לאחר העלאת ה‑PDF יופיע כאן אזור המודעות לגיליון.
              </div>
            )}
          </>
        )}

        {/* שלב 2: פרטי הגיליון */}
        {currentStep === 2 && (
          <>
            <EditorSection>
              <SectionTitle>פרטי הגיליון</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <LinkInput
                  type="text"
                  value={issueData.title}
                  onChange={(e) => setIssueData({ ...issueData, title: e.target.value })}
                  placeholder="כותרת הגיליון"
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <LinkInput
                    type="text"
                    value={issueData.issueNumber}
                    onChange={(e) => setIssueData({ ...issueData, issueNumber: e.target.value })}
                    placeholder="מספר גיליון"
                    style={{ flex: 1 }}
                  />
                  <LinkInput
                    type="date"
                    value={issueData.date}
                    onChange={(e) => setIssueData({ ...issueData, date: e.target.value })}
                    placeholder="תאריך פרסום"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </EditorSection>

            <CreativesPanel>
              <CreativesHeader>
                <div style={{ fontWeight: 700 }}>מודעות שהועלו לגיליון</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <SecondaryActionButton
                    type="button"
                    onClick={loadCreatives}
                    disabled={!currentIssueId || creativesLoading}
                  >
                    {creativesLoading ? 'טוען...' : 'רענון'}
                  </SecondaryActionButton>
                  <PrimaryActionButton
                    type="button"
                    onClick={async () => {
                      if (!creatives.length) return;
                      for (const item of creatives) {
                        await downloadCreativeFile(item);
                      }
                    }}
                    disabled={!creatives.length}
                  >
                    <Download size={16} />
                    הורדת הכל
                  </PrimaryActionButton>
                </div>
              </CreativesHeader>

              {!currentIssueId && (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  יש להעלות PDF כדי לקבל מזהה גיליון.
                </div>
              )}

              {creativesError && (
                <ErrorMessage>{creativesError}</ErrorMessage>
              )}

              {currentIssueId && !creativesLoading && creatives.length === 0 && (
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                  לא נמצאו מודעות לגיליון זה עדיין.
                </div>
              )}

              {creatives.length > 0 && (
                <CreativesList>
                  {creatives.map((item) => (
                    <CreativeRow key={`${item.creativeId}-${item.orderId}`}>
                      <CreativeMeta>
                        <div>{item.advertiserName || 'מפרסם לא ידוע'}</div>
                        <div style={{ opacity: 0.7 }}>
                          מקום: {item.slotCode || '—'}
                        </div>
                      </CreativeMeta>
                      <SecondaryActionButton type="button" onClick={() => downloadCreativeFile(item)}>
                        הורדה
                      </SecondaryActionButton>
                    </CreativeRow>
                  ))}
                </CreativesList>
              )}
            </CreativesPanel>
          </>
        )}

        {/* שלב 3: תצוגה מקדימה */}
        {currentStep === 3 && (
          <PreviewContainer>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: 'white', marginBottom: '1rem' }}>
              תצוגה מקדימה ועריכת קישורים
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', marginBottom: '1.5rem' }}>
              כעת ניתן לפתוח את עורך הקישורים על גבי הגיליון, למקם קישורים אינטראקטיביים על העיתון ולשמור טיוטה לפני פרסום.
            </p>
            {!currentIssueId && (
              <p style={{ color: '#f97316', marginBottom: '1.5rem' }}>
                יש להעלות PDF ולשמור טיוטה לפני פתיחת עורך הקישורים.
              </p>
            )}

            {(() => {
              console.log('🟢 Preview Step - pdfUrl:', pdfUrl);
              if (!pdfUrl) {
                return (
                  <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
                    לא נבחר או הועלה קובץ PDF.<br />
                    בחרי קובץ ונסי שוב.
                  </div>
                );
              }
              if (pdfUrl.startsWith('blob:')) {
                return (
                  <iframe
                    src={pdfUrl}
                    title="תצוגה מקדימה של PDF"
                    style={{ width: '100%', height: '100%', border: '2px solid #10b981', background: '#222' }}
                  />
                );
              }
              if (pdfUrl.includes('pending-upload')) {
                return (
                  <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
                    הקובץ עדיין בתהליך העלאה לשרת.<br />
                    נא להמתין או לשמור טיוטה.<br />
                  </div>
                );
              }
              return (
                <FlipCanvasViewer
                  issue={{
                    pdf_url: pdfUrl,
                    IssueId: currentIssueId,
                    Title: issueData.title || 'תצוגה מקדימה'
                  }}
                  onClose={() => setCurrentStep(2)}
                />
              );
            })()}
          </PreviewContainer>
        )}

        {/* שלב 4: פרסום */}
        {currentStep === 4 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            {publishing ? (
              <>
                <Loader size={64} style={{ margin: '0 auto 1rem', color: '#10b981', animation: 'spin 1s linear infinite' }} />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: 'white', marginBottom: '1rem' }}>
                  מפרסם את הגיליון...
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  אנא המתן
                </p>
              </>
            ) : (
              <>
                <Send size={64} style={{ margin: '0 auto 1rem', color: '#10b981' }} />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: 'white', marginBottom: '1rem' }}>
                  מוכן לפרסום
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
                  העיתון יופיע באזור הקוראים והמפרסמים ויפתח בקישור מגוף המייל
                </p>
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </>
            )}
          </div>
        )}

        <ActionsBar>
          {currentStep > 1 && (
            <BackButton onClick={() => setCurrentStep(currentStep - 1)}>
              <ChevronLeft size={18} />
              חזרה
            </BackButton>
          )}
          {currentStep === 1 && <div />}
          
          <ActionButtons>
            {currentStep < 4 && (
              <PrimaryActionButton
                onClick={() => {
                  if (currentStep === 2) {
                    setCurrentStep(3);
                    if (currentIssueId) {
                      handleOpenLinkEditor();
                    }
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                disabled={!canProceedToNextStep()}
              >
                {currentStep === 1 && 'המשך'}
                {currentStep === 2 && 'תצוגה מקדימה'}
                {currentStep === 3 && 'המשך לפרסום'}
              </PrimaryActionButton>
            )}
            {(currentStep === 2 || currentStep === 3) && (
              <SecondaryActionButton onClick={handleSaveDraft} disabled={saving || !currentIssueId}>
                {saving ? (
                  <>
                    <Loader size={18} />
                    שומר...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    שמור טיוטה
                  </>
                )}
              </SecondaryActionButton>
            )}
            {currentStep === 3 && currentIssueId && (
              <SecondaryActionButton onClick={handleOpenLinkEditor} disabled={!currentIssueId}>
                <>
                  <Eye size={18} />
                  עריכת קישורים על הגיליון
                </>
              </SecondaryActionButton>
            )}
            {currentStep === 4 && (
              <>
                <SecondaryActionButton onClick={() => setCurrentStep(3)} disabled={publishing}>
                  חזרה לתצוגה מקדימה
                </SecondaryActionButton>
                <PrimaryActionButton onClick={handlePublish} disabled={publishing || !currentIssueId}>
                  {publishing ? (
                    <>
                      <Loader size={18} />
                      מפרסם...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      פרסם עכשיו
                    </>
                  )}
                </PrimaryActionButton>
              </>
            )}
          </ActionButtons>
        </ActionsBar>
      </StepContent>
    </Container>
  );
}

