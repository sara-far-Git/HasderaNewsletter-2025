import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import HTMLFlipBook from "react-pageflip";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Home, 
  Plus, 
  Tag,
  FileText
} from "lucide-react";
import AdvertiserChat from "./AdvertiserChat";
import AdPlacementSelector from "./AdPlacementSelector";
import AdUpload from "./AdUpload";
import hasederaTheme from "../styles/HasederaTheme";

// CSS גלובלי להסתרת עמודים ריקים ליד כריכות + תיקון איקונים
// תחליפי את ה-CoverStyles הקיים בזה:

const CoverStyles = createGlobalStyle`
  /* וידוא שכריכות תמיד מוצגות */
  .stf-parent .stf-block.page-cover,
  .stf-parent [data-density="hard"] {
    display: block !important;
    visibility: visible !important;
  }
  
  /* הסתרת עמודים ריקים בלבד - לא כריכות */
  .stf-parent .stf-block:not(.page-cover):not([data-density="hard"]) {
    /* רק אם זה עמוד ריק אמיתי */
  }
  
  /* תיקון איקונים - בלי לשבור את הגדלים! */
  svg {
    display: block;
    flex-shrink: 0;
  }
  
  /* איקונים של lucide-react - שמירה על הגודל המקורי */
  [data-lucide],
  .lucide {
    display: block;
    /* לא מגדירים width/height כאן - נותנים ל-lucide לקבוע */
  }
`;
// --- Animations ---
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// --- Styled Components ---

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
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(20, 184, 166, 0.08), transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(20, 184, 166, 0.06), transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.04), transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(20, 184, 166, 0.1);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(20, 184, 166, 0.05);
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  direction: rtl;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Heebo', -apple-system, BlinkMacSystemFont, sans-serif;

  &:hover {
    background: rgba(20, 184, 166, 0.15);
    border-color: rgba(20, 184, 166, 0.3);
    transform: translateX(-2px);
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.2);
  }

  svg {
    display: block;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    transition: transform 0.3s;
  }

  &:hover svg {
    transform: translateX(-3px);
  }
`;

const TitleSection = styled.div`
  flex: 1;
  text-align: center;
  padding: 0 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
  font-family: 'Heebo', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.02em;
  
  background: linear-gradient(135deg, #ffffff 0%, #14b8a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-weight: 400;
`;

const PageCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(20, 184, 166, 0.1);
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #14b8a6;
  min-width: 120px;
  justify-content: center;
  font-family: 'Heebo', -apple-system, BlinkMacSystemFont, sans-serif;
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.1);
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  min-height: calc(100vh - 180px);
  position: relative;
  z-index: 1;
  transition: margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-right: ${props => props.$sidebarOpen ? '450px' : '0'};

  @media (max-width: 1024px) {
    margin-right: 0;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BookSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  direction: rtl;
  max-width: 1400px;
  width: 100%;

  @media (max-width: 1024px) {
    gap: 1rem;
  }
`;

const NavButton = styled.button`
  padding: 1rem;
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  
  &:hover:not(:disabled) {
    background: rgba(20, 184, 166, 0.2);
    border-color: rgba(20, 184, 166, 0.4);
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(20, 184, 166, 0.25);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const FlipBookContainer = styled.div`
  position: relative;
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(20, 184, 166, 0.1),
    inset 0 0 40px rgba(20, 184, 166, 0.05);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(20px);
  direction: rtl;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(20, 184, 166, 0.03) 0%,
      transparent 50%,
      rgba(20, 184, 166, 0.03) 100%
    );
    pointer-events: none;
    z-index: 10;
  }
`;

const PageWrapper = styled.div`
  background: ${props => props.$isCover ? '#ffffff' : '#ffffff'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  box-shadow: 
    inset 0 0 30px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(0, 0, 0, 0.1);
  
  /* עבור כריכות - וודא שהתוכן גלוי */
  ${props => props.$isCover && `
    z-index: 2;
  `}
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.05) 0%,
      transparent 5%,
      transparent 95%,
      rgba(0, 0, 0, 0.05) 100%
    );
    pointer-events: none;
    z-index: 1;
  }
`;

const CoverContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 3rem 2rem;
  position: relative;
  background: linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #0f766e 100%);
  z-index: 3;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.1), transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.05), transparent 50%);
    pointer-events: none;
    z-index: 1;
  }
`;

const CoverHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  z-index: 1;
`;

const CoverLogo = styled.div`
  font-size: 3rem;
  font-weight: 900;
  font-family: 'Heebo', -apple-system, BlinkMacSystemFont, sans-serif;
  color: white;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.05em;
`;

const CoverTagline = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-align: center;
  letter-spacing: 0.1em;
`;

const CoverCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  z-index: 1;
`;

const CoverTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 700;
  font-family: 'Heebo', -apple-system, BlinkMacSystemFont, sans-serif;
  color: white;
  margin: 0;
  line-height: 1.2;
  text-align: center;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const CoverIssue = styled.div`
  font-size: 1rem;
  color: white;
  padding: 0.75rem 1.5rem;
  border: 2px solid white;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  font-weight: 600;
`;

const CoverFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;
`;

const CoverDate = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const BackCoverContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  position: relative;
  background: linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #0f766e 100%);
  gap: 2rem;
  z-index: 3;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.1), transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.05), transparent 50%);
    pointer-events: none;
    z-index: 1;
  }
`;

const BackCoverLogo = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  font-family: 'Heebo', -apple-system, BlinkMacSystemFont, sans-serif;
  color: white;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1;
`;

const BackCoverText = styled.div`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  max-width: 80%;
  line-height: 1.8;
  z-index: 1;
  font-weight: 500;
`;

const PageOverlayButton = styled.button`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  border: 3px solid transparent;
  cursor: pointer;
  z-index: 4;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  pointer-events: auto;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(20, 184, 166, 0.3), transparent 70%);
    border-radius: 50%;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    z-index: -1;
  }
  
  &:hover {
    /* רק border, לא background שמכסה את הכריכה */
    border-color: rgba(20, 184, 166, 0.6);
    background: rgba(20, 184, 166, 0.05);
    
    &::before {
      transform: translate(-50%, -50%) scale(2);
    }
  }
  
  /* עבור כריכות - overlay יותר עדין שלא מכסה את הכריכה */
  .page-cover & {
    background: transparent !important;
    
    &:hover {
      background: rgba(20, 184, 166, 0.01) !important;
      border-color: rgba(20, 184, 166, 0.4);
    }
  }
`;

const PageOverlayContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${PageOverlayButton}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PageOverlayIcon = styled.div`
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(20, 184, 166, 0.4);
  flex-shrink: 0;
  
  svg {
    color: white;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    display: block;
  }
`;

const PageOverlayText = styled.div`
  color: #14b8a6;
  font-size: 1.125rem;
  font-weight: 700;
  font-family: 'Heebo', -apple-system, BlinkMacSystemFont, sans-serif;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const PageOverlaySubtext = styled.div`
  color: rgba(20, 184, 166, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
`;

const EmptyPageContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #94a3b8;
  gap: 1rem;
`;

const PageNumber = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.875rem;
  color: #94a3b8;
  font-weight: 500;
  font-family: 'Heebo', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Footer = styled.footer`
  position: sticky;
  bottom: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(20, 184, 166, 0.1);
  box-shadow: 
    0 -4px 24px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(20, 184, 166, 0.05);
`;

const FooterContent = styled.nav`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  direction: rtl;
`;

const FooterButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Heebo', -apple-system, BlinkMacSystemFont, sans-serif;

  svg {
    display: block;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }

  &:hover:not(:disabled) {
    background: rgba(20, 184, 166, 0.2);
    border-color: rgba(20, 184, 166, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const AddPagesButton = styled(FooterButton)`
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
  }
`;

// --- Sidebar Components ---

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  animation: ${fadeIn} 0.3s ease-out;
`;

const SidebarPanel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 450px;
  max-width: 90vw;
  height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 
    -4px 0 24px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(20, 184, 166, 0.2),
    inset 0 0 40px rgba(20, 184, 166, 0.05);
  z-index: 1000;
  overflow-y: auto;
  overflow-x: hidden;
  direction: rtl;
  animation: ${slideInRight} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.5);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(20, 184, 166, 0.5);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(20, 184, 166, 0.7);
  }

  @media (max-width: 1024px) {
    width: 100vw;
    max-width: 100vw;
  }
`;

// --- Page Components ---

// כריכה קדמית
const FrontCover = React.forwardRef(({ issueTitle, issueNumber }, ref) => (
  <PageWrapper ref={ref} className="page-cover" data-density="hard" $isCover={true}>
    <CoverContent>
      <CoverHeader>
        <CoverLogo>השדרה</CoverLogo>
        <CoverTagline>מגזין דיגיטלי לנשים</CoverTagline>
      </CoverHeader>
      
      <CoverCenter>
        <CoverTitle>{issueTitle || 'גיליון חדש'}</CoverTitle>
        {issueNumber && <CoverIssue>{issueNumber}</CoverIssue>}
      </CoverCenter>
      
      <CoverFooter>
        <CoverDate>{new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}</CoverDate>
      </CoverFooter>
    </CoverContent>
  </PageWrapper>
));
FrontCover.displayName = 'FrontCover';

// כריכה אחורית - ניתנת לקנייה!
const BackCover = React.forwardRef(({ onClick }, ref) => (
  <PageWrapper ref={ref} className="page-cover" data-density="hard" $isCover={true}>
    <BackCoverContent>
      <BackCoverLogo>השדרה</BackCoverLogo>
      <BackCoverText>
        תוכן איכותי ומעשיר בנושאי משפחה, בריאות, אוכל, חינוך ועוד
        <br /><br />
        הצטרפו אלינו למסע מרתק של השראה וידע
      </BackCoverText>
    </BackCoverContent>
    
    <PageOverlayButton 
      onClick={() => onClick && onClick('back-cover')} 
      title="בחר כריכה אחורית לפרסום"
      aria-label="בחר כריכה אחורית לפרסום"
      style={{ zIndex: 4 }}
    >
      <PageOverlayContent>
        <PageOverlayIcon>
          <Tag size={28} />
        </PageOverlayIcon>
        <PageOverlayText>כריכה אחורית</PageOverlayText>
        <PageOverlaySubtext>לחץ לבחירה</PageOverlaySubtext>
      </PageOverlayContent>
    </PageOverlayButton>
  </PageWrapper>
));
BackCover.displayName = 'BackCover';

// עמוד ריק (לא ניתן לקנייה - רק לתצוגה)
const BlankPage = React.forwardRef((props, ref) => (
  <PageWrapper ref={ref} data-density="soft" $isCover={false}>
    <EmptyPageContent>
      <FileText size={48} style={{ opacity: 0.2 }} />
      <div style={{ fontSize: '0.875rem', opacity: 0.3 }}>עמוד ריק</div>
    </EmptyPageContent>
  </PageWrapper>
));
BlankPage.displayName = 'BlankPage';

// עמוד פנימי
const InnerPage = React.forwardRef(({ pageNumber, onClick }, ref) => (
  <PageWrapper ref={ref} data-density="soft" $isCover={false}>
    <PageOverlayButton 
      onClick={() => onClick && onClick(pageNumber)} 
      title={`בחר עמוד ${pageNumber} לפרסום`}
      aria-label={`בחר עמוד ${pageNumber} לפרסום`}
    >
      <PageOverlayContent>
        <PageOverlayIcon>
          <Tag size={28} />
        </PageOverlayIcon>
        <PageOverlayText>עמוד {pageNumber}</PageOverlayText>
        <PageOverlaySubtext>לחץ לבחירה</PageOverlaySubtext>
      </PageOverlayContent>
    </PageOverlayButton>

    <EmptyPageContent>
      <FileText size={48} style={{ opacity: 0.3 }} />
      <div style={{ fontSize: '0.875rem', opacity: 0.5 }}>עמוד ריק</div>
    </EmptyPageContent>
    
    <PageNumber>עמוד {pageNumber}</PageNumber>
  </PageWrapper>
));
InnerPage.displayName = 'InnerPage';

// --- Main Component ---

export default function PlacementBook({ issue: propIssue, slots: propSlots }) {
  const navigate = useNavigate();
  const location = useLocation();
  const initialIssue = propIssue || location.state || {
    title: "בחירת מיקום פרסומי",
    issue_number: "גיליון חדש",
  };

  const bookRef = useRef(null);

  const [innerPages, setInnerPages] = useState(2);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageWidth, setPageWidth] = useState(400);
  const [pageHeight, setPageHeight] = useState(566);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showPlacementSelector, setShowPlacementSelector] = useState(false);
  const [isBookReady, setIsBookReady] = useState(false);
  const [uploadedCreative, setUploadedCreative] = useState(null);
  const [showUpload, setShowUpload] = useState(true);

  const totalPages = innerPages + 2;

  useEffect(() => {
    const onResize = () => {
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

      let w;
      if (vw < 640) w = Math.min(280, vw * 0.4);
      else if (vw < 1024) w = Math.min(350, vw * 0.3);
      else w = Math.min(400, vw * 0.25);

      const maxByHeight = (vh - 200) / 1.414;
      w = Math.min(w, maxByHeight);

      setPageWidth(w);
      setPageHeight(w * 1.414);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // הסתרת עמודים ריקים ליד כריכות - רק עמודים ריקים, לא כריכות!
  useEffect(() => {
    const hideBlankPagesNearCovers = () => {
      if (!bookRef.current) return;
      
      try {
        const bookElement = bookRef.current;
        
        // בדיקה שהאלמנט הוא Node תקין
        if (!(bookElement instanceof Node)) return;
        
        const pages = bookElement.querySelectorAll('.stf-block, [class*="page"]');
        
        pages.forEach((page, index) => {
          if (!(page instanceof Node)) return;
          
          // בדיקה אם זה כריכה - אם כן, נוודא שהיא תמיד מוצגת
          const isCover = page.classList.contains('page-cover') || 
                         page.querySelector('.page-cover') !== null ||
                         page.getAttribute('data-density') === 'hard' ||
                         page.querySelector('[data-density="hard"]') !== null;
          
          // וודא שכריכות תמיד מוצגות - זה הכי חשוב!
          if (isCover) {
            page.style.display = 'block';
            page.style.visibility = 'visible';
            page.style.opacity = '1';
            return; // אל תסתיר כריכות בשום מקרה!
          }
          
          // רק עבור עמודים שאינם כריכות - בדוק אם הם ריקים
          const isEmpty = (!page.textContent?.trim() || 
                          page.textContent?.trim() === 'עמוד ריק' ||
                          (page.textContent?.trim().length < 10 && 
                           !page.querySelector('.page-cover') &&
                           page.getAttribute('data-density') !== 'hard')) &&
                          !page.querySelector('[data-density="hard"]');
          
          // בדוק אם יש כריכה ליד העמוד
          const prevPage = pages[index - 1];
          const nextPage = pages[index + 1];
          
          const prevIsCover = prevPage && (
            prevPage.classList.contains('page-cover') || 
            prevPage.querySelector('.page-cover') !== null ||
            prevPage.getAttribute('data-density') === 'hard' ||
            prevPage.querySelector('[data-density="hard"]') !== null
          );
          
          const nextIsCover = nextPage && (
            nextPage.classList.contains('page-cover') || 
            nextPage.querySelector('.page-cover') !== null ||
            nextPage.getAttribute('data-density') === 'hard' ||
            nextPage.querySelector('[data-density="hard"]') !== null
          );
          
          // הסתר רק עמודים ריקים שיש לידם כריכה
          // אבל לעולם אל תסתיר כריכות!
          if (isEmpty && (prevIsCover || nextIsCover)) {
            page.style.display = 'none';
          } else {
            page.style.display = 'block';
          }
        });
      } catch (error) {
        console.warn('Error hiding blank pages:', error);
      }
    };

    // המתנה קצרה כדי שה-DOM יהיה מוכן
    const timeout = setTimeout(hideBlankPagesNearCovers, 500);
    
    // גם אחרי דפדוף - רק אם הספר מוכן
    let observer = null;
    const setupObserver = () => {
      const bookElement = bookRef.current;
      if (bookElement && bookElement instanceof Node) {
        try {
          observer = new MutationObserver(hideBlankPagesNearCovers);
          observer.observe(bookElement, { childList: true, subtree: true });
        } catch (error) {
          console.warn('Failed to observe book element:', error);
        }
      }
    };
    
    // המתנה לפני הגדרת ה-observer
    const observerTimeout = setTimeout(setupObserver, 600);

    return () => {
      clearTimeout(timeout);
      clearTimeout(observerTimeout);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [innerPages, currentPage]);

  const goToNextPage = useCallback(() => {
    try {
      const pageFlip = bookRef.current?.pageFlip();
      if (pageFlip) pageFlip.flipNext();
    } catch (error) {
      console.error('Error going to next page:', error);
    }
  }, []);
  
  const goToPrevPage = useCallback(() => {
    try {
      const pageFlip = bookRef.current?.pageFlip();
      if (pageFlip) pageFlip.flipPrev();
    } catch (error) {
      console.error('Error going to prev page:', error);
    }
  }, []);
  
  const goToFirstPage = useCallback(() => {
    try {
      const pageFlip = bookRef.current?.pageFlip();
      if (pageFlip) pageFlip.flip(0);
    } catch (error) {
      console.error('Error going to first page:', error);
    }
  }, []);
  
  const goToLastPage = useCallback(() => {
    try {
      const lastSpread = Math.floor((totalPages - 1) / 2);
      const pageFlip = bookRef.current?.pageFlip();
      if (pageFlip) pageFlip.flip(lastSpread);
    } catch (error) {
      console.error('Error going to last page:', error);
    }
  }, [totalPages]);

  const handleFlip = useCallback((event) => {
    setCurrentPage(event.data);
  }, []);

  // בדיקה שהספר מוכן
  useEffect(() => {
    const checkBookReady = () => {
      if (bookRef.current) {
        try {
          const pageFlip = bookRef.current.pageFlip();
          if (pageFlip) {
            setIsBookReady(true);
            return;
          }
        } catch (error) {
          // הספר עדיין לא מוכן
        }
      }
      setIsBookReady(false);
    };

    // בדיקה ראשונית
    const timeout = setTimeout(checkBookReady, 100);
    
    // בדיקה תקופתית עד שהספר מוכן
    const interval = setInterval(() => {
      if (!isBookReady) {
        checkBookReady();
      } else {
        clearInterval(interval);
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isBookReady, innerPages]);

  const getRealPageNumber = useCallback(() => {
    if (!totalPages) return 1;
    try {
      const pageFlip = bookRef.current?.pageFlip();
      if (!pageFlip) return totalPages;
      const spreadIndex = pageFlip.getCurrentPageIndex() || 0;
      // עבור RTL - הספר מתחיל מהסוף, אז צריך לחשב הפוך
      const totalSpreads = Math.ceil(totalPages / 2);
      const rtlSpreadIndex = totalSpreads - 1 - spreadIndex;
      return rtlSpreadIndex * 2 + 1;
    } catch (error) {
      console.warn('Error getting page number:', error);
      // עבור RTL, אם יש שגיאה, נחזיר את המספר הנכון לפי currentPage
      return totalPages - currentPage;
    }
  }, [totalPages, currentPage]);

  const openBuyModal = useCallback((pageIdentifier) => {
    setSelectedPage(pageIdentifier);
    setShowPlacementSelector(true);
  }, []);

  const handlePlacementSelect = useCallback((placementData) => {
    setShowPlacementSelector(false);
    
    // קביעת שם העמוד לתצוגה
    const pageDisplayName = selectedPage === 'back-cover' 
      ? 'כריכה אחורית' 
      : `עמוד ${selectedPage}`;
    
    navigate('/advertiser/payment', {
      state: {
        page: selectedPage,
        pageDisplayName: pageDisplayName,
        issueTitle: initialIssue.title,
        placement: placementData,
        creative: uploadedCreative
      }
    });
  }, [selectedPage, initialIssue.title, navigate, uploadedCreative]);

  const handlePlacementCancel = useCallback(() => {
    setShowPlacementSelector(false);
    setSelectedPage(null);
  }, []);

  const handleUploadComplete = useCallback((creativeData) => {
    setUploadedCreative(creativeData);
    setShowUpload(false);
  }, []);

  const handleCancelUpload = useCallback(() => {
    navigate('/advertiser');
  }, [navigate]);

  const addPages = useCallback((count = 2) => {
    const evenCount = count % 2 === 0 ? count : count + 1;
    setInnerPages(prev => prev + evenCount);
  }, []);

  const renderPages = useMemo(() => {
    try {
      const pages = [];
      
      // עבור RTL - הספר נפתח מימין לשמאל
      // לכן הכריכה האחורית צריכה להיות ראשונה (מימין)
      // והכריכה הקדמית צריכה להיות אחרונה (משמאל)
      
      // כריכה אחורית - ניתנת לקנייה! (תופיע מימין)
      pages.push(
        <BackCover 
          key="back-cover"
          onClick={openBuyModal}
        />
      );

      // עמודים פנימיים - ניתנים לקנייה (יופיעו בזוגות)
      // הפיכת הסדר עבור RTL
      for (let i = innerPages; i >= 1; i--) {
        pages.push(
          <InnerPage
            key={`inner-page-${i}`}
            pageNumber={i}
            onClick={openBuyModal}
          />
        );
      }

      // כריכה קדמית - לא ניתנת לקנייה (תופיע משמאל)
      pages.push(
        <FrontCover 
          key="front-cover" 
          issueTitle={initialIssue?.title || "גיליון חדש"}
          issueNumber={initialIssue?.issue_number || ""}
        />
      );

      return pages;
    } catch (error) {
      console.error('Error rendering pages:', error);
      return [];
    }
  }, [innerPages, initialIssue?.title, initialIssue?.issue_number, openBuyModal]);

  return (
    <Container>
      <CoverStyles />
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/advertiser')}>
            <Home size={18} />
            <span>חזרה לאזור מפרסמים</span>
          </BackButton>

          <TitleSection>
            <Title>{showUpload && !uploadedCreative ? 'העלאת מודעה' : (initialIssue?.title || 'בחירת מיקום פרסומי')}</Title>
            <Subtitle>{showUpload && !uploadedCreative ? 'העלי את המודעה לפני בחירת המיקום' : (initialIssue?.issue_number || 'בחירת עמודים לפרסום')}</Subtitle>
          </TitleSection>

          <PageCounter>
            {getRealPageNumber()} / {totalPages}
          </PageCounter>
        </HeaderContent>
      </Header>

      <MainContent $sidebarOpen={showPlacementSelector}>
        {showUpload && !uploadedCreative ? (
          <AdUpload 
            onUploadComplete={handleUploadComplete}
            onCancel={handleCancelUpload}
          />
        ) : (
        <BookSection>
          <NavButton
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            title="עמוד קודם"
          >
            <ArrowLeft size={24} />
          </NavButton>

          <FlipBookContainer>
            {pageWidth > 0 && pageHeight > 0 && renderPages.length > 0 ? (
              <HTMLFlipBook
                key={`flipbook-${innerPages}`}
                ref={bookRef}
                width={pageWidth}
                height={pageHeight}
                size="stretch"
                minWidth={300}
                maxWidth={500}
                minHeight={400}
                maxHeight={800}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                onFlip={handleFlip}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                disableFlipByClick={false}
                startPage={renderPages.length - 1}
                drawShadow={true}
                flippingTime={1000}
                usePortrait={false}
                autoSize={true}
              >
                {renderPages}
              </HTMLFlipBook>
            ) : (
              <div style={{ 
                width: '400px', 
                height: '566px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                טוען...
              </div>
            )}
          </FlipBookContainer>

          <NavButton
            onClick={goToNextPage}
            disabled={currentPage >= Math.floor((totalPages - 1) / 2)}
            title="עמוד הבא"
          >
            <ArrowRight size={24} />
          </NavButton>
        </BookSection>
        )}
      </MainContent>

      <Footer>
        <FooterContent>
          <AddPagesButton onClick={() => addPages(2)}>
            <Plus size={18} />
            הוסף 2 עמודים
          </AddPagesButton>

          <FooterButton onClick={goToLastPage}>
            <ChevronsRight size={18} />
            אחרון
          </FooterButton>

          <FooterButton onClick={goToNextPage} disabled={currentPage >= Math.floor((totalPages - 1) / 2)}>
            <ArrowRight size={18} />
            הבא
          </FooterButton>

          <PageCounter>
            {getRealPageNumber()} / {totalPages}
          </PageCounter>

          <FooterButton onClick={goToPrevPage} disabled={currentPage === 0}>
            קודם
            <ArrowLeft size={18} />
          </FooterButton>

          <FooterButton onClick={goToFirstPage}>
            ראשון
            <ChevronsLeft size={18} />
          </FooterButton>
        </FooterContent>
      </Footer>

      {showPlacementSelector && (
        <>
          <SidebarOverlay onClick={handlePlacementCancel} />
          <SidebarPanel>
            <AdPlacementSelector
              pageNumber={selectedPage}
              pageDisplayName={selectedPage === 'back-cover' ? 'כריכה אחורית' : `עמוד ${selectedPage}`}
              onSelect={handlePlacementSelect}
              onCancel={handlePlacementCancel}
            />
          </SidebarPanel>
        </>
      )}

      <AdvertiserChat />
    </Container>
  );
}