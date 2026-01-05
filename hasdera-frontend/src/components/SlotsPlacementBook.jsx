/**
 * SlotsPlacementBook.jsx
 * ספר להצגת מקומות פרסום - גרסה מתוקנת
 * תיקונים: RTL navigation, re-renders, page sync, buy button
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import HTMLFlipBook from "react-pageflip";
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronsLeft, 
  ChevronsRight, 
  FileText,
  CheckCircle,
  XCircle,
  ShoppingCart
} from "lucide-react";

// ===================== Global Styles =====================
const GlobalStyles = createGlobalStyle`
  .stf__parent {
    direction: ltr !important;
  }
  
  .stf__block.page-cover,
  [data-density="hard"] {
    display: block !important;
    visibility: visible !important;
  }
  
  svg {
    display: block;
    flex-shrink: 0;
  }
`;

// ===================== Animations =====================
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// ===================== Container Styles =====================
const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(20, 184, 166, 0.08), transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(20, 184, 166, 0.06), transparent 40%);
    pointer-events: none;
    z-index: 0;
  }
`;

const BookSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
`;

const NavButton = styled.button`
  padding: 1rem;
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    background: rgba(20, 184, 166, 0.2);
    border-color: rgba(20, 184, 166, 0.4);
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(20, 184, 166, 0.25);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const FlipBookWrapper = styled.div`
  position: relative;
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(20, 184, 166, 0.1);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(20px);
`;

// ===================== Page Styles =====================
const PageContainer = styled.div`
  background: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.05);
  height: 100%;
`;

const BuyButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.4);
  font-family: 'Heebo', sans-serif;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  
  &:hover {
    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.5);
  }
  
  &:active {
    transform: translateY(0);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const PageHeader = styled.div`
  width: 100%;
  text-align: center;
  padding: 3rem 1rem 1rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.08);
  direction: rtl;
`;

const PageTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  font-family: 'Heebo', sans-serif;
`;

const SlotsList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  overflow-y: auto;
  direction: rtl;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
`;

const SlotCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${props => props.$occupied 
    ? 'rgba(239, 68, 68, 0.08)' 
    : 'rgba(16, 185, 129, 0.08)'};
  border: 1px solid ${props => props.$occupied 
    ? 'rgba(239, 68, 68, 0.2)' 
    : 'rgba(16, 185, 129, 0.2)'};
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: ${props => props.$occupied ? 'not-allowed' : 'pointer'};
  
  ${props => !props.$occupied && `
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.4);
    }
  `}
`;

const SlotIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => props.$occupied 
    ? 'rgba(239, 68, 68, 0.15)' 
    : 'rgba(16, 185, 129, 0.15)'};
  flex-shrink: 0;
  
  svg {
    color: ${props => props.$occupied ? '#ef4444' : '#10b981'};
    width: 20px;
    height: 20px;
  }
`;

const SlotInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SlotName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SlotMeta = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.2rem;
`;

const SlotStatus = styled.span`
  font-weight: 600;
  color: ${props => props.$occupied ? '#ef4444' : '#10b981'};
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
`;

const PageNumber = styled.div`
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
`;

// ===================== Footer Styles =====================
const Footer = styled.footer`
  position: sticky;
  bottom: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(20, 184, 166, 0.1);
`;

const FooterNav = styled.nav`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FooterButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Heebo', sans-serif;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover:not(:disabled) {
    background: rgba(20, 184, 166, 0.2);
    border-color: rgba(20, 184, 166, 0.4);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PageIndicator = styled.div`
  padding: 0.5rem 1.25rem;
  background: rgba(20, 184, 166, 0.15);
  border: 1px solid rgba(20, 184, 166, 0.3);
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #14b8a6;
  min-width: 100px;
  text-align: center;
  font-family: 'Heebo', sans-serif;
`;

// ===================== Page Components =====================

// כריכה קדמית
const FrontCover = React.forwardRef(({ title }, ref) => (
  <PageContainer ref={ref} data-density="hard">
    <EmptyState style={{ height: '100%' }}>
      <FileText size={56} style={{ opacity: 0.2 }} />
      <PageTitle style={{ marginTop: '1rem' }}>{title || 'ניהול מקומות פרסום'}</PageTitle>
      <p style={{ fontSize: '0.875rem', opacity: 0.6, marginTop: '0.5rem' }}>
        דפדף לצפייה במקומות הפרסום
      </p>
    </EmptyState>
  </PageContainer>
));
FrontCover.displayName = 'FrontCover';

// כריכה אחורית
const BackCover = React.forwardRef((_, ref) => (
  <PageContainer ref={ref} data-density="hard">
    <EmptyState style={{ height: '100%' }}>
      <FileText size={40} style={{ opacity: 0.2 }} />
      <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>כריכה אחורית</span>
    </EmptyState>
  </PageContainer>
));
BackCover.displayName = 'BackCover';

// עמוד slots
const SlotsPage = React.forwardRef(({ 
  pageNumber, 
  slots = [], 
  onSlotClick, 
  onBuyClick 
}, ref) => {
  const available = slots.filter(s => !s.isOccupied);
  const occupied = slots.filter(s => s.isOccupied);

  const handleBuyClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    onBuyClick?.(pageNumber);
  }, [onBuyClick, pageNumber]);

  const handleSlotClick = useCallback((e, slot) => {
    e.stopPropagation();
    if (!slot.isOccupied) {
      onSlotClick?.(slot, pageNumber);
    }
  }, [onSlotClick, pageNumber]);

  return (
    <PageContainer ref={ref} data-density="soft">
      <BuyButton onClick={handleBuyClick}>
        <ShoppingCart />
        קנה מקום
      </BuyButton>
      
      <PageHeader>
        <PageTitle>עמוד {pageNumber}</PageTitle>
      </PageHeader>
      
      {slots.length > 0 ? (
        <SlotsList>
          {available.map((slot) => (
            <SlotCard 
              key={slot.slotId} 
              $occupied={false}
              onClick={(e) => handleSlotClick(e, slot)}
            >
              <SlotIcon $occupied={false}>
                <CheckCircle />
              </SlotIcon>
              <SlotInfo>
                <SlotName>{slot.name || 'מקום פרסום'}</SlotName>
                <SlotMeta>
                  קוד: {slot.code || 'N/A'} | <SlotStatus $occupied={false}>פנוי</SlotStatus>
                </SlotMeta>
              </SlotInfo>
            </SlotCard>
          ))}
          
          {occupied.map((slot) => (
            <SlotCard key={slot.slotId} $occupied={true}>
              <SlotIcon $occupied={true}>
                <XCircle />
              </SlotIcon>
              <SlotInfo>
                <SlotName>{slot.name || 'מקום פרסום'}</SlotName>
                <SlotMeta>
                  קוד: {slot.code || 'N/A'} | <SlotStatus $occupied={true}>תפוס</SlotStatus>
                  {slot.occupiedBy?.advertiserName && (
                    <> - {slot.occupiedBy.advertiserName}</>
                  )}
                </SlotMeta>
              </SlotInfo>
            </SlotCard>
          ))}
        </SlotsList>
      ) : (
        <EmptyState>
          <FileText size={40} style={{ opacity: 0.2 }} />
          <span>אין מקומות פרסום בעמוד זה</span>
        </EmptyState>
      )}
      
      <PageNumber>עמוד {pageNumber}</PageNumber>
    </PageContainer>
  );
});
SlotsPage.displayName = 'SlotsPage';

// ===================== Main Component =====================
export default function SlotsPlacementBook({ 
  issue, 
  slots, 
  totalPages: propTotalPages, 
  onSlotClick, 
  onPageClick 
}) {
  const bookRef = useRef(null);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 400, height: 566 });

  // חישוב מספר עמודים
  const totalPages = useMemo(() => {
    if (propTotalPages > 0) return propTotalPages;
    const slotsArray = slots?.Slots || slots?.slots || [];
    return Math.max(10, Math.ceil(slotsArray.length / 5));
  }, [propTotalPages, slots]);

  // מיפוי slots לעמודים
  const slotsByPage = useMemo(() => {
    const slotsList = slots?.Slots || slots?.slots || [];
    const result = {};
    
    slotsList.forEach((slot, index) => {
      // אם יש pageNumber ב-slot, נשתמש בו, אחרת חישוב לפי אינדקס
      const pageNum = slot.pageNumber || slot.PageNumber || Math.floor(index / 5) + 1;
      
      if (!result[pageNum]) {
        result[pageNum] = [];
      }
      
      result[pageNum].push({
        slotId: slot.slotId || slot.SlotId || `slot-${index}`,
        code: slot.code || slot.Code,
        name: slot.name || slot.Name,
        isOccupied: slot.isOccupied || slot.IsOccupied || false,
        occupiedBy: slot.occupiedBy || slot.OccupiedBy || null,
        basePrice: slot.basePrice || slot.BasePrice
      });
    });
    
    return result;
  }, [slots]);

  // חישוב גודל עמודים
  useEffect(() => {
    const calculateDimensions = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      let width;
      if (vw < 640) width = Math.min(280, vw * 0.42);
      else if (vw < 1024) width = Math.min(350, vw * 0.32);
      else width = Math.min(400, vw * 0.25);
      
      const maxByHeight = (vh - 200) / 1.414;
      width = Math.min(width, maxByHeight);
      
      setDimensions({
        width: Math.max(250, width),
        height: Math.max(350, width * 1.414)
      });
    };
    
    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  // פונקציות ניווט - מותאמות ל-RTL
  const getPageFlip = useCallback(() => bookRef.current?.pageFlip(), []);
  
  const goNext = useCallback(() => {
    getPageFlip()?.flipNext();
  }, [getPageFlip]);
  
  const goPrev = useCallback(() => {
    getPageFlip()?.flipPrev();
  }, [getPageFlip]);
  
  const goFirst = useCallback(() => {
    getPageFlip()?.flip(0);
  }, [getPageFlip]);
  
  const goLast = useCallback(() => {
    const pageFlip = getPageFlip();
    if (pageFlip) {
      const pageCount = pageFlip.getPageCount();
      pageFlip.flip(pageCount - 1);
    }
  }, [getPageFlip]);

  const handleFlip = useCallback((e) => {
    setCurrentSpread(e.data);
  }, []);

  // חישוב עמוד נוכחי להצגה (RTL)
  const displayPageNumber = useMemo(() => {
    const totalSpreads = Math.ceil((totalPages + 2) / 2); // +2 לכריכות
    const rtlSpread = totalSpreads - 1 - currentSpread;
    return Math.max(1, Math.min(totalPages, rtlSpread * 2));
  }, [currentSpread, totalPages]);

  // בניית עמודים - RTL (מימין לשמאל)
  const pages = useMemo(() => {
    const result = [];
    
    // כריכה אחורית (מופיעה ראשונה ב-RTL)
    result.push(<BackCover key="back" />);
    
    // עמודים פנימיים - מהסוף להתחלה
    for (let i = totalPages; i >= 1; i--) {
      result.push(
        <SlotsPage
          key={`page-${i}`}
          pageNumber={i}
          slots={slotsByPage[i] || []}
          onSlotClick={onSlotClick}
          onBuyClick={onPageClick}
        />
      );
    }
    
    // כריכה קדמית (מופיעה אחרונה ב-RTL)
    result.push(
      <FrontCover 
        key="front" 
        title={issue?.title || issue?.Title}
      />
    );
    
    return result;
  }, [totalPages, slotsByPage, issue, onSlotClick, onPageClick]);

  const totalSpreads = Math.ceil(pages.length / 2);
  const isFirstSpread = currentSpread === 0;
  const isLastSpread = currentSpread >= totalSpreads - 1;

  return (
    <Container>
      <GlobalStyles />
      
      <BookSection>
        {/* RTL: חץ שמאלה = הבא */}
        <NavButton onClick={goNext} disabled={isLastSpread} title="עמוד הבא">
          <ArrowLeft size={24} />
        </NavButton>

        <FlipBookWrapper>
          {dimensions.width > 0 && pages.length > 0 && (
            <HTMLFlipBook
              ref={bookRef}
              width={dimensions.width}
              height={dimensions.height}
              size="stretch"
              minWidth={250}
              maxWidth={500}
              minHeight={350}
              maxHeight={750}
              maxShadowOpacity={0.4}
              showCover={true}
              mobileScrollSupport={true}
              onFlip={handleFlip}
              clickEventForward={false}
              useMouseEvents={true}
              swipeDistance={30}
              disableFlipByClick={true}
              startPage={pages.length - 1}
              drawShadow={true}
              flippingTime={800}
              usePortrait={false}
              autoSize={true}
            >
              {pages}
            </HTMLFlipBook>
          )}
        </FlipBookWrapper>

        {/* RTL: חץ ימינה = קודם */}
        <NavButton onClick={goPrev} disabled={isFirstSpread} title="עמוד קודם">
          <ArrowRight size={24} />
        </NavButton>
      </BookSection>

      <Footer>
        <FooterNav>
          {/* RTL: אחרון בצד ימין */}
          <FooterButton onClick={goLast} disabled={isLastSpread}>
            <ChevronsRight size={16} />
            אחרון
          </FooterButton>

          <FooterButton onClick={goNext} disabled={isLastSpread}>
            <ArrowRight size={16} />
            הבא
          </FooterButton>

          <PageIndicator>
            {displayPageNumber} / {totalPages}
          </PageIndicator>

          <FooterButton onClick={goPrev} disabled={isFirstSpread}>
            קודם
            <ArrowLeft size={16} />
          </FooterButton>

          <FooterButton onClick={goFirst} disabled={isFirstSpread}>
            ראשון
            <ChevronsLeft size={16} />
          </FooterButton>
        </FooterNav>
      </Footer>
    </Container>
  );
}