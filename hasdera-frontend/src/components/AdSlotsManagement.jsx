/**
 * AdSlotsManagement.jsx
 * ניהול מקומות פרסום - גרסה מתוקנת
 * תיקונים: state sync, loading states, callback memoization
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { FileText, ChevronDown, CheckCircle, XCircle, X, Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import SlotsPlacementBook from './SlotsPlacementBook';
import AdminSlotSelector from './AdminSlotSelector';
import { getIssues, getIssueSlots } from '../Services/issuesService';
import { createManualOrder } from '../Services/ordersService';

// ===================== Animations =====================
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ===================== Container Styles =====================
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

// ===================== Selector Styles =====================
const SelectorSection = styled.div`
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem 1.5rem;
  padding-right: 3rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s ease;
  font-family: inherit;
  direction: rtl;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(16, 185, 129, 0.3);
  }

  &:focus {
    outline: none;
    border-color: rgba(16, 185, 129, 0.5);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  option {
    background: #1e293b;
    color: white;
    direction: rtl;
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

// ===================== Stats Cards =====================
const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  padding: 0.875rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  
  svg {
    flex-shrink: 0;
  }
`;

const StatLabel = styled.span`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const StatValue = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => {
    if (props.$type === 'available') return '#10b981';
    if (props.$type === 'occupied') return '#ef4444';
    return 'white';
  }};
`;

// ===================== Flipbook Container =====================
const BookContainer = styled.div`
  width: 100%;
  min-height: 600px;
  animation: ${fadeInUp} 0.5s ease-out;
  animation-delay: 0.1s;
  animation-fill-mode: both;
`;

// ===================== Empty/Loading States =====================
const StateMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  gap: 1rem;
`;

const Spinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

// ===================== Sidebar =====================
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  max-width: 95vw;
  height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  overflow-y: auto;
  direction: rtl;
  animation: ${slideIn} 0.3s ease-out;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(20, 184, 166, 0.4);
    border-radius: 3px;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 10;
`;

const SidebarTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }
`;

const SidebarContent = styled.div`
  padding: 1.5rem;
`;

const SlotOption = styled.button`
  width: 100%;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: rgba(20, 184, 166, 0.08);
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  color: white;
  text-align: right;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(20, 184, 166, 0.15);
    border-color: rgba(20, 184, 166, 0.4);
    transform: translateY(-1px);
  }
`;

const SlotOptionName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

const SlotOptionMeta = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
`;

const EmptySlotsMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  margin-bottom: 1rem;
  text-align: center;
`;

// ===================== Main Component =====================
export default function AdSlotsManagement() {
  // State
  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [slots, setSlots] = useState(null);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPageNumber, setSelectedPageNumber] = useState(null);

  // טעינת גיליונות
  useEffect(() => {
    const loadIssues = async () => {
      try {
        setLoadingIssues(true);
        setError(null);
        
        const data = await getIssues(1, 100, false);
        
        // מיון - ריקים קודם, אחר כך לפי תאריך
        const sorted = [...data].sort((a, b) => {
          const aEmpty = !a.pdfUrl;
          const bEmpty = !b.pdfUrl;
          if (aEmpty !== bEmpty) return aEmpty ? -1 : 1;
          return new Date(b.issueDate || b.issue_date || 0) - new Date(a.issueDate || a.issue_date || 0);
        });
        
        setIssues(sorted);
        
        // בחירת גיליון ראשוני
        if (sorted.length > 0) {
          const emptyNew = sorted.find(i => {
            const title = i.title || '';
            return !i.pdfUrl && title.includes('גיליון חדש');
          });
          setSelectedIssueId((emptyNew || sorted[0]).issueId || (emptyNew || sorted[0]).issue_id);
        }
      } catch (err) {
        console.error('Error loading issues:', err);
        setError('לא ניתן לטעון גליונות');
      } finally {
        setLoadingIssues(false);
      }
    };
    
    loadIssues();
  }, []);

  // טעינת slots כשמשתנה הגיליון
  useEffect(() => {
    if (!selectedIssueId) return;
    
    const loadSlots = async () => {
      try {
        setLoadingSlots(true);
        setError(null);
        const data = await getIssueSlots(selectedIssueId);
        setSlots(data);
      } catch (err) {
        console.error('Error loading slots:', err);
        setError('לא ניתן לטעון מקומות פרסום');
        setSlots(null);
      } finally {
        setLoadingSlots(false);
      }
    };
    
    loadSlots();
  }, [selectedIssueId]);

  // הגיליון הנבחר
  const selectedIssue = useMemo(() => {
    if (!selectedIssueId || !issues.length) return null;
    return issues.find(i => (i.issueId || i.issue_id) === selectedIssueId);
  }, [selectedIssueId, issues]);

  // סטטיסטיקות
  const stats = useMemo(() => {
    if (!slots) return { total: 0, available: 0, occupied: 0 };
    
    const list = slots.Slots || slots.slots || [];
    const total = slots.TotalSlots || slots.totalSlots || list.length;
    const occupied = slots.OccupiedSlots || slots.occupiedSlots || list.filter(s => s.IsOccupied || s.isOccupied).length;
    
    return {
      total,
      occupied,
      available: total - occupied
    };
  }, [slots]);

  // Slots פנויים לעמוד הנבחר
  const availableSlotsForPage = useMemo(() => {
    if (!slots || !selectedPageNumber) return [];
    
    const list = slots.Slots || slots.slots || [];
    
    return list
      .map((slot, index) => ({
        slotId: slot.slotId || slot.SlotId,
        code: slot.code || slot.Code,
        name: slot.name || slot.Name,
        basePrice: slot.basePrice || slot.BasePrice,
        isOccupied: slot.isOccupied || slot.IsOccupied || false,
        pageNumber: slot.pageNumber || slot.PageNumber || Math.floor(index / 5) + 1
      }))
      .filter(slot => slot.pageNumber === selectedPageNumber && !slot.isOccupied);
  }, [slots, selectedPageNumber]);

  // Handlers
  const handleIssueChange = useCallback((e) => {
    const id = parseInt(e.target.value, 10);
    if (id) {
      setSelectedIssueId(id);
      setSlots(null);
    }
  }, []);

  const handleSlotClick = useCallback((slot, pageNumber) => {
    setSelectedSlot(slot);
    setSelectedPageNumber(pageNumber);
    setSidebarOpen(true);
  }, []);

  const handlePageClick = useCallback((pageNumber) => {
    setSelectedSlot(null);
    setSelectedPageNumber(pageNumber);
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    setSelectedSlot(null);
    setSelectedPageNumber(null);
  }, []);

  const selectSlotFromList = useCallback((slot) => {
    setSelectedSlot(slot);
  }, []);

  const backToSlotList = useCallback(() => {
    setSelectedSlot(null);
  }, []);

  const handleOrderSubmit = useCallback(async (data) => {
    try {
      setSubmitting(true);
      setError(null);
      
      await createManualOrder({
        advertiserId: data.advertiserId,
        issueId: data.issueId,
        slotId: data.slotId,
        pageNumber: data.pageNumber,
        placement: data.placement
      });
      
      // רענון slots
      const freshSlots = await getIssueSlots(selectedIssueId);
      setSlots(freshSlots);
      
      closeSidebar();
    } catch (err) {
      console.error('Error creating order:', err);
      setError('שגיאה ביצירת הזמנה');
    } finally {
      setSubmitting(false);
    }
  }, [selectedIssueId, closeSidebar]);

  // Render
  return (
    <AdminLayout title="ניהול מקומות פרסום">
      <Container>
        {/* בורר גיליון */}
        <SelectorSection>
          <SelectWrapper>
            <SelectIcon size={20} />
            <Select
              value={selectedIssueId || ''}
              onChange={handleIssueChange}
              disabled={loadingIssues || issues.length === 0}
            >
              {issues.length === 0 ? (
                <option value="">אין גליונות זמינים</option>
              ) : (
                <>
                  <option value="">בחר גיליון...</option>
                  {issues.map((issue) => {
                    const id = issue.issueId || issue.issue_id;
                    const isEmpty = !issue.pdfUrl;
                    const date = new Date(issue.issueDate || issue.issue_date).toLocaleDateString('he-IL');
                    
                    return (
                      <option key={id} value={id}>
                        {issue.title} - {date}
                        {isEmpty && ' (ריק)'}
                      </option>
                    );
                  })}
                </>
              )}
            </Select>
          </SelectWrapper>

          {/* סטטיסטיקות */}
          {slots && !loadingSlots && (
            <StatsRow>
              <StatCard>
                <FileText size={20} />
                <StatLabel>סה"כ:</StatLabel>
                <StatValue>{stats.total}</StatValue>
              </StatCard>
              <StatCard>
                <CheckCircle size={20} color="#10b981" />
                <StatLabel>פנויים:</StatLabel>
                <StatValue $type="available">{stats.available}</StatValue>
              </StatCard>
              <StatCard>
                <XCircle size={20} color="#ef4444" />
                <StatLabel>תפוסים:</StatLabel>
                <StatValue $type="occupied">{stats.occupied}</StatValue>
              </StatCard>
            </StatsRow>
          )}
        </SelectorSection>

        {/* הודעות שגיאה */}
        {error && (
          <StateMessage>
            <FileText size={48} style={{ opacity: 0.3 }} />
            <span>{error}</span>
          </StateMessage>
        )}

        {/* טעינה */}
        {(loadingIssues || loadingSlots) && (
          <StateMessage>
            <Spinner size={32} />
            <span>{loadingIssues ? 'טוען גליונות...' : 'טוען מקומות פרסום...'}</span>
          </StateMessage>
        )}

        {/* הספר */}
        {!loadingIssues && !loadingSlots && selectedIssue && slots && (
          <BookContainer>
            <SlotsPlacementBook
              issue={selectedIssue}
              slots={slots}
              totalPages={selectedIssue.totalPages || selectedIssue.total_pages}
              onSlotClick={handleSlotClick}
              onPageClick={handlePageClick}
            />
          </BookContainer>
        )}

        {/* הודעה לבחירת גיליון */}
        {!loadingIssues && !selectedIssue && issues.length > 0 && (
          <StateMessage>
            <FileText size={48} style={{ opacity: 0.3 }} />
            <span>בחר גיליון להצגת מקומות הפרסום</span>
          </StateMessage>
        )}
      </Container>

      {/* Sidebar */}
      {sidebarOpen && selectedPageNumber && (
        <>
          <Overlay onClick={closeSidebar} />
          <Sidebar>
            <SidebarHeader>
              <SidebarTitle>
                {selectedSlot 
                  ? `${selectedSlot.name || 'מקום פרסום'} - עמוד ${selectedPageNumber}`
                  : `בחר מקום פרסום - עמוד ${selectedPageNumber}`
                }
              </SidebarTitle>
              <CloseButton onClick={selectedSlot ? backToSlotList : closeSidebar}>
                <X size={20} />
              </CloseButton>
            </SidebarHeader>

            <SidebarContent>
              {submitting && (
                <StateMessage style={{ padding: '2rem' }}>
                  <Spinner size={24} />
                  <span>יוצר הזמנה...</span>
                </StateMessage>
              )}

              {error && <ErrorMessage>{error}</ErrorMessage>}

              {!submitting && !selectedSlot && (
                <>
                  {availableSlotsForPage.length > 0 ? (
                    availableSlotsForPage.map((slot) => (
                      <SlotOption 
                        key={slot.slotId} 
                        onClick={() => selectSlotFromList(slot)}
                      >
                        <SlotOptionName>{slot.name || 'מקום פרסום'}</SlotOptionName>
                        <SlotOptionMeta>
                          קוד: {slot.code || 'N/A'}
                          {slot.basePrice && ` | מחיר: ${slot.basePrice} ₪`}
                        </SlotOptionMeta>
                      </SlotOption>
                    ))
                  ) : (
                    <EmptySlotsMessage>
                      אין מקומות פרסום פנויים בעמוד זה
                    </EmptySlotsMessage>
                  )}
                </>
              )}

              {!submitting && selectedSlot && (
                <AdminSlotSelector
                  slot={selectedSlot}
                  pageNumber={selectedPageNumber}
                  issueId={selectedIssueId}
                  onSelect={handleOrderSubmit}
                  onCancel={backToSlotList}
                />
              )}
            </SidebarContent>
          </Sidebar>
        </>
      )}
    </AdminLayout>
  );
}