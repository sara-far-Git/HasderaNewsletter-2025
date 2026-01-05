import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getIssueById } from "../Services/issuesService";
import FlipCanvasViewer from "./FlipCanvasViewer";
import styled from "styled-components";

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  color: #ef4444;
  margin-bottom: 1rem;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

function FlipIssue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadIssue = async () => {
      if (!id) {
        setError("לא נמצא מזהה גיליון");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const issueData = await getIssueById(parseInt(id));
        
        if (!issueData) {
          setError("גיליון לא נמצא");
          setLoading(false);
          return;
        }

        // המרת הנתונים לפורמט שהקומפוננטה מצפה לו
        const formattedIssue = {
          pdf_url: issueData.PdfUrl || issueData.pdf_url,
          title: issueData.Title || issueData.title,
          issue_id: issueData.IssueId || issueData.issue_id,
          issueDate: issueData.IssueDate || issueData.issueDate,
          Summary: issueData.Summary || issueData.summary
        };

        setIssue(formattedIssue);
        setLoading(false);
      } catch (err) {
        console.error("Error loading issue:", err);
        setError("שגיאה בטעינת הגיליון");
        setLoading(false);
      }
    };

    loadIssue();
  }, [id]);

  const handleClose = () => {
    navigate(-1); // חזרה לדף הקודם
  };

  if (loading) {
    return (
      <LoadingContainer>
        <div>טוען גיליון...</div>
      </LoadingContainer>
    );
  }

  if (error || !issue) {
    return (
      <ErrorContainer>
        <ErrorTitle>{error || "גיליון לא נמצא"}</ErrorTitle>
        <BackButton onClick={handleClose}>חזרה</BackButton>
      </ErrorContainer>
    );
  }

  return <FlipCanvasViewer issue={issue} onClose={handleClose} />;
}

export default FlipIssue;

