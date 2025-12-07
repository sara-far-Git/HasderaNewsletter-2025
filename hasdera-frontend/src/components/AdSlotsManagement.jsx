/**
 * AdSlotsManagement.jsx
 * ניהול מקומות פרסום - flipbook עם הצגת מקומות תפוסים ופנויים
 * מעוצב כמו אזור המפרסמים
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { FileText, ChevronDown, CheckCircle, XCircle, Tag, Plus, Building2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminFlipbookViewer from './AdminFlipbookViewer';
import { getIssues, getIssueSlots } from '../Services/issuesService';

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
  max-width: 1400px;
  margin: 0 auto;
  animation: ${fadeIn} 0.8s ease-out;
  padding: 2rem;
`;

// 🎨 Issue Selector
const IssueSelectorWrapper = styled.div`
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  appearance: none;
  padding-right: 3rem;
  transition: all 0.3s ease;
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(16, 185, 129, 0.3);
  }

  &:focus {
    outline: none;
    border-color: rgba(16, 185, 129, 0.5);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  option {
    background: #1e293b;
    color: white;
  }
`;

const SelectIcon = styled(ChevronDown)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: rgba(255, 255, 255, 0.5);
`;

// 🎨 Slots Info
const SlotsInfo = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const InfoCard = styled.div`
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const InfoValue = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => {
    if (props.$variant === 'available') return '#10b981';
    if (props.$variant === 'occupied') return '#ef4444';
    return 'white';
  }};
`;

// 🎨 Flipbook Container
const FlipbookContainer = styled.div`
  width: 100%;
  min-height: 600px;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
`;

const EmptyIcon = styled(FileText)`
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  opacity: 0.3;
`;

const EmptyText = styled.p`
  font-size: 1.125rem;
  margin: 0;
`;

export default function AdSlotsManagement() {
  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [slots, setSlots] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // טעינת רשימת גליונות
  useEffect(() => {
    const loadIssues = async () => {
      try {
        setLoading(true);
        const issuesList = await getIssues(1, 100, true); // רק גליונות שפורסמו
        setIssues(issuesList);
        if (issuesList.length > 0 && !selectedIssueId) {
          setSelectedIssueId(issuesList[0].issueId || issuesList[0].issue_id);
        }
      } catch (err) {
        console.error('❌ שגיאה בטעינת גליונות:', err);
        setError('לא ניתן לטעון גליונות');
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, []);

  // טעינת מקומות פרסום לפי גיליון נבחר
  useEffect(() => {
    if (!selectedIssueId) return;

    const loadSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // מציאת הגיליון הנבחר
        const issue = issues.find(i => (i.issueId || i.issue_id) === selectedIssueId);
        setSelectedIssue(issue);

        // טעינת מקומות פרסום
        const slotsData = await getIssueSlots(selectedIssueId);
        setSlots(slotsData);
      } catch (err) {
        console.error('❌ שגיאה בטעינת מקומות פרסום:', err);
        setError('לא ניתן לטעון מקומות פרסום');
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [selectedIssueId, issues]);

  const handleIssueChange = (e) => {
    const issueId = parseInt(e.target.value);
    setSelectedIssueId(issueId);
    setSlots(null);
  };

  // חישוב סטטיסטיקות
  const stats = useMemo(() => {
    if (!slots || !slots.slots) {
      return { total: 0, occupied: 0, available: 0 };
    }

    const total = slots.totalSlots || slots.slots.length;
    const occupied = slots.occupiedSlots || slots.slots.filter(s => s.isOccupied).length;
    const available = slots.availableSlots || (total - occupied);

    return { total, occupied, available };
  }, [slots]);

  return (
    <AdminLayout title="ניהול מקומות פרסום">
      <Container>
        <IssueSelectorWrapper>
          <SelectWrapper>
            <SelectIcon size={20} />
            <Select
              value={selectedIssueId || ''}
              onChange={handleIssueChange}
              disabled={loading || issues.length === 0}
            >
              {issues.length === 0 ? (
                <option value="">אין גליונות זמינים</option>
              ) : (
                <>
                  <option value="">בחר גיליון...</option>
                  {issues.map((issue) => (
                    <option
                      key={issue.issueId || issue.issue_id}
                      value={issue.issueId || issue.issue_id}
                    >
                      {issue.title} - {new Date(issue.issueDate || issue.issue_date).toLocaleDateString('he-IL')}
                    </option>
                  ))}
                </>
              )}
            </Select>
          </SelectWrapper>

          {slots && (
            <SlotsInfo>
              <InfoCard>
                <FileText size={20} />
                <InfoLabel>סה"כ מקומות:</InfoLabel>
                <InfoValue>{stats.total}</InfoValue>
              </InfoCard>
              <InfoCard>
                <CheckCircle size={20} color="#10b981" />
                <InfoLabel>פנויים:</InfoLabel>
                <InfoValue $variant="available">{stats.available}</InfoValue>
              </InfoCard>
              <InfoCard>
                <XCircle size={20} color="#ef4444" />
                <InfoLabel>תפוסים:</InfoLabel>
                <InfoValue $variant="occupied">{stats.occupied}</InfoValue>
              </InfoCard>
            </SlotsInfo>
          )}
        </IssueSelectorWrapper>

        {error && (
          <EmptyState>
            <EmptyIcon />
            <EmptyText>{error}</EmptyText>
          </EmptyState>
        )}

        {loading && !selectedIssue && (
          <EmptyState>
            <EmptyText>טוען גליונות...</EmptyText>
          </EmptyState>
        )}

        {selectedIssue && selectedIssueId && (
          <FlipbookContainer>
            <AdminFlipbookViewer
              issueId={selectedIssueId}
              issue={selectedIssue}
              slots={slots}
              showSlotsManagement={true}
            />
          </FlipbookContainer>
        )}

        {!loading && !selectedIssue && issues.length > 0 && (
          <EmptyState>
            <EmptyIcon />
            <EmptyText>בחר גיליון כדי להציג את מקומות הפרסום</EmptyText>
          </EmptyState>
        )}
      </Container>
    </AdminLayout>
  );
}
