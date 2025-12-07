import React, { useState, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Upload, X, FileImage, FileText, CheckCircle2, AlertCircle, Loader } from "lucide-react";
import { uploadCreative } from "../Services/creativesService";
import hasederaTheme from "../styles/HasederaTheme";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  direction: rtl;
  animation: ${fadeIn} 0.4s ease-out;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${hasederaTheme.colors.text.white};
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${hasederaTheme.colors.text.secondary};
  margin-bottom: 2rem;
  text-align: center;
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.$isDragging ? hasederaTheme.colors.primary.main : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${props => props.$isDragging ? 'rgba(20, 184, 166, 0.1)' : 'rgba(255, 255, 255, 0.03)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${hasederaTheme.colors.primary.main};
    background: rgba(20, 184, 166, 0.05);
  }
`;

const UploadIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  color: ${hasederaTheme.colors.primary.main};
  
  svg {
    width: 64px;
    height: 64px;
  }
`;

const UploadText = styled.div`
  font-size: 1.1rem;
  color: ${hasederaTheme.colors.text.white};
  margin-bottom: 0.5rem;
`;

const UploadHint = styled.div`
  font-size: 0.9rem;
  color: ${hasederaTheme.colors.text.secondary};
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
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const PreviewTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${hasederaTheme.colors.text.white};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  margin-top: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
`;

const Button = styled.button`
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.$primary ? `
    background: ${hasederaTheme.colors.primary.main};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${hasederaTheme.colors.primary.dark};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: ${hasederaTheme.colors.text.white};
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SuccessMessage = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export default function AdUpload({ onUploadComplete, onCancel }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // בדיקת סוג קובץ
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('סוג קובץ לא נתמך. אנא העלה תמונה (jpg, png, gif, webp) או PDF');
      return;
    }

    // בדיקת גודל (מקסימום 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('הקובץ גדול מדי. מקסימום 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(null);

    // יצירת תצוגה מקדימה
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await uploadCreative(file);

      setSuccess('המודעה הועלתה בהצלחה!');
      
      // קריאה לפונקציה שמעבירה לשלב הבא
      if (onUploadComplete) {
        setTimeout(() => {
          onUploadComplete(response);
        }, 1000);
      }
    } catch (err) {
      console.error('שגיאה בהעלאת מודעה:', err);
      setError(err.response?.data?.error || 'שגיאה בהעלאת המודעה. נסה שוב.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container>
      <Title>העלאת מודעה</Title>
      <Subtitle>העלי את קובץ המודעה מהמחשב או גרור אותו לכאן</Subtitle>

      <UploadArea
        $isDragging={isDragging}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadIcon>
          <Upload />
        </UploadIcon>
        <UploadText>גרור קובץ לכאן או לחץ לבחירה</UploadText>
        <UploadHint>תמונות: JPG, PNG, GIF, WEBP | מסמכים: PDF</UploadHint>
        <UploadHint>מקסימום 10MB</UploadHint>
      </UploadArea>

      <FileInput
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => handleFileSelect(e.target.files[0])}
      />

      {file && (
        <FilePreview>
          <PreviewHeader>
            <PreviewTitle>
              {file.type.startsWith('image/') ? <FileImage size={20} /> : <FileText size={20} />}
              {file.name}
            </PreviewTitle>
            <Button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setError(null);
                setSuccess(null);
              }}
              style={{ padding: '0.5rem', minWidth: 'auto' }}
            >
              <X size={18} />
            </Button>
          </PreviewHeader>
          {preview && <PreviewImage src={preview} alt="תצוגה מקדימה" />}
        </FilePreview>
      )}

      {error && (
        <ErrorMessage>
          <AlertCircle size={20} />
          {error}
        </ErrorMessage>
      )}

      {success && (
        <SuccessMessage>
          <CheckCircle2 size={20} />
          {success}
        </SuccessMessage>
      )}

      <ButtonGroup>
        {onCancel && (
          <Button onClick={onCancel} disabled={uploading}>
            ביטול
          </Button>
        )}
        <Button $primary onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? (
            <>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              מעלה...
            </>
          ) : (
            <>
              <Upload size={18} />
              העלה מודעה
            </>
          )}
        </Button>
      </ButtonGroup>
    </Container>
  );
}

