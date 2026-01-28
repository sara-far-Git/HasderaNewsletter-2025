/**
 * SearchModal.jsx
 * מודל חיפוש יפה לחיפוש בגיליונות
 */

import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Search, X, Book, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { getIssues } from "../Services/issuesService";

/* ======================== Animations ======================== */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

/* ======================== Styled Components ======================== */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 10vh 1rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
  width: 100%;
  max-width: 600px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
  animation: ${slideUp} 0.3s ease-out;
`;

const SearchHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SearchIcon = styled.div`
  color: #10b981;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 1.1rem;
  font-family: inherit;
  outline: none;

  &::placeholder {
    color: #64748b;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f8fafc;
  }
`;

const ResultsContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
`;

const ResultItem = styled.button`
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: right;

  &:hover {
    background: rgba(16, 185, 129, 0.1);
  }
`;

const ResultIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const ResultInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultTitle = styled.div`
  color: #f8fafc;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #64748b;
  font-size: 0.85rem;
`;

const ResultArrow = styled.div`
  color: #64748b;
  transition: all 0.2s;
  
  ${ResultItem}:hover & {
    color: #10b981;
    transform: translateX(-4px);
  }
`;

const EmptyState = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #64748b;
`;

const EmptyIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
`;

const LoadingState = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Spinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
  color: #10b981;
`;

const Hint = styled.div`
  padding: 1rem;
  text-align: center;
  color: #475569;
  font-size: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const Kbd = styled.kbd`
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.75rem;
  margin: 0 0.2rem;
`;

/* ======================== Component ======================== */
export default function SearchModal({ isOpen, onClose, onSelectIssue }) {
  const [query, setQuery] = useState("");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadIssues();
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await getIssues(1, 30, true); // הפחתה ל-30 לטעינה מהירה
      setIssues(data || []);
    } catch (error) {
      console.error("Error loading issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (!query.trim()) return true;
    const searchLower = query.toLowerCase();
    const title = (issue.title || "").toLowerCase();
    const date = formatDate(issue.issueDate || issue.issue_date);
    return title.includes(searchLower) || date.includes(searchLower);
  });

  const handleSelect = (issue) => {
    onSelectIssue(issue);
    onClose();
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <SearchHeader>
          <SearchIcon>
            <Search size={22} />
          </SearchIcon>
          <SearchInput
            ref={inputRef}
            type="text"
            placeholder="חיפוש גיליונות..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <CloseButton onClick={onClose}>
            <X size={18} />
          </CloseButton>
        </SearchHeader>

        <ResultsContainer>
          {loading ? (
            <LoadingState>
              <Spinner size={32} />
              <span>טוען גיליונות...</span>
            </LoadingState>
          ) : filteredIssues.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <Search size={28} />
              </EmptyIcon>
              <div>לא נמצאו תוצאות עבור "{query}"</div>
            </EmptyState>
          ) : (
            filteredIssues.slice(0, 10).map((issue) => (
              <ResultItem key={issue.issue_id || issue.issueId} onClick={() => handleSelect(issue)}>
                <ResultIcon>
                  <Book size={22} />
                </ResultIcon>
                <ResultInfo>
                  <ResultTitle>{issue.title || "גיליון"}</ResultTitle>
                  <ResultDate>
                    <Calendar size={14} />
                    {formatDate(issue.issueDate || issue.issue_date)}
                  </ResultDate>
                </ResultInfo>
                <ResultArrow>
                  <ArrowLeft size={18} />
                </ResultArrow>
              </ResultItem>
            ))
          )}
        </ResultsContainer>

        <Hint>
          <Kbd>ESC</Kbd> לסגירה
        </Hint>
      </Modal>
    </Overlay>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "תאריך לא זמין";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "תאריך לא זמין";
  return d.toLocaleDateString("he-IL", { year: 'numeric', month: 'long', day: 'numeric' });
}

