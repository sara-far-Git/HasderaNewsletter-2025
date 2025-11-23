import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getIssueById } from "../Services/issuesService";
import FlipbookViewer from "../components/FlipbookViewer";
import styled from "styled-components";

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  gap: 1.5rem;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(20, 184, 166, 0.3);
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
`;

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 1.25rem;
  font-weight: 600;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
  }
`;

export default function FlipIssue({ fileUrl }) {
  const { issue_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState(fileUrl || null);
  const [loading, setLoading] = useState(!fileUrl);
  const [error, setError] = useState(null);

  useEffect(() => {
    // אם יש לנו את ה-fileUrl, לא צריך לטעון
    if (fileUrl) {
      return;
    }

    console.log("🔍 FlipIssue - fileUrl:", fileUrl);
  }, [fileUrl]);

  const handleClose = () => {
    navigate("/issues");
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>טוען גליון...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorText>שגיאה: {error}</ErrorText>
        <BackButton onClick={handleClose}>
          חזרה לרשימת הגליונות
        </BackButton>
      </ErrorContainer>
    );
  }

  if (!fileUrl) {
    return (
      <ErrorContainer>
        <ErrorText>לא הועבר קובץ PDF</ErrorText>
        <BackButton onClick={handleClose}>
          חזרה לרשימת הגליונות
        </BackButton>
      </ErrorContainer>
    );
  }

  return <FlipbookViewer fileUrl={fileUrl} onClose={handleClose} />;
}
