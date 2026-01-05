/**
 * AdminFlipbookViewer.styles.jsx
 * כל ה-styled components וה-animations לקומפוננטה AdminFlipbookViewer
 */

import styled, { keyframes, createGlobalStyle, css } from "styled-components";

// 🎬 אנימציות
export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const fadeOut = keyframes`
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
`;

export const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
`;

export const blink = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
`;

export const linkPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 4px 16px rgba(20, 184, 166, 0.6);
  }
`;

export const linkFadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.5) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

// 🎨 CSS גלובלי - כולל הסתרת ממשק Real3D
export const FlipbookStyles = createGlobalStyle`
  /* ========================================
     הסתרת ממשק Real3D המובנה
     ======================================== */
  
  /* הסתרת ה-header/toolbar של Real3D */
  .flipbook-top,
  .flipbook-top-wrapper,
  .flipbook-toolbar,
  .flipbook-menu,
  .flipbook-menubar,
  .flipbook-topbar,
  .flipbook-header,
  .flipbook-top-bar,
  .flipbook-controls-top,
  .flipbook-top-controls,
  [class*="flipbook-top"],
  [class*="flipbook-toolbar"],
  [class*="flipbook-menu"]:not(.flipbook-nav) {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }
  
  /* הסתרת כפתורי fullscreen, share וכו' של Real3D */
  .flipbook-btn-fullscreen,
  .flipbook-btn-share,
  .flipbook-btn-download,
  .flipbook-btn-print,
  .flipbook-btn-toc,
  .flipbook-btn-search,
  .flipbook-btn-thumb,
  .flipbook-btn-zoom-in,
  .flipbook-btn-zoom-out,
  .flipbook-btn-zoom-dropdown,
  .flipbook-btn-autoplay,
  .flipbook-btn-sound,
  .flipbook-zoom-menu,
  .flipbook-currentPage,
  .flipbook-page-input,
  .flipbook-total-pages {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* הסתרת חצי הניווט של Real3D - נשתמש בחצים שלנו */
  .flipbook-nav,
  .flipbook-left-arrow,
  .flipbook-right-arrow,
  .flipbook-arrow,
  .flipbook-btn-prev,
  .flipbook-btn-next,
  .flipbook-first-arrow,
  .flipbook-last-arrow,
  .flipbook-side-buttons,
  [class*="flipbook-arrow"],
  [class*="flipbook-btn-prev"],
  [class*="flipbook-btn-next"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  /* ========================================
     סגנונות כלליים לספר
     ======================================== */
  
  .flipbook-page3,
  .flipbook-page3-inner {
    transform-style: preserve-3d !important;
    -webkit-transform-style: preserve-3d !important;
  }

  .flipbook-page3-inner * {
    backface-visibility: visible !important;
    -webkit-backface-visibility: visible !important;
  }

  /* סמן עכבר */
  .flipbook-bookLayer,
  .flipbook-book-webgl,
  .flipbook-book-webgl canvas {
    cursor: default !important;
  }
  
  /* וידוא שהספר מוצג */
  .flipbook,
  .flipbook-book,
  .flipbook-bookLayer,
  .flipbook-book-webgl {
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
  }

  .flipbook-hidden {
    display: none !important;
  }
  
  /* וידוא שה-container של הספר מוצג */
  .flipbook-container,
  .flipbook-wrapper,
  .flipbook-viewport {
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  /* תיקון איקונים בתוך העמודים */
  .flipbook-page-html img,
  .flipbook-page-html svg,
  .flipbook-page-html [class*="icon"],
  .flipbook-page-html [class*="Icon"],
  .flipbook-page-html canvas,
  .flipbook-page-html .htmlContent img,
  .flipbook-page-html .htmlContent svg {
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    max-width: 100% !important;
    height: auto !important;
  }
  
  /* וידוא שאיקונים בתוך PDF מוצגים */
  .flipbook-page-html *,
  .flipbook-page-html .htmlContent * {
    visibility: visible !important;
  }

  .flipbook-page-html svg,
  .flipbook-page-html .htmlContent svg {
    display: inline-block !important;
    width: auto !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: 100% !important;
  }
  
  /* וידוא ש-images בתוך PDF מוצגים */
  .flipbook-page-html img,
  .flipbook-page-html .htmlContent img {
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    max-width: 100% !important;
    height: auto !important;
  }
  
  /* וידוא שה-canvas של PDF מוצג */
  .flipbook-page-html canvas,
  .flipbook-bookLayer canvas {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 100% !important;
    height: auto !important;
  }
`;

// 🎨 Main Container
export const ViewerContainer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;
  background: #1a1a1a;
`;

export const BackgroundImage = styled.div`
  position: absolute;
  inset: 0;
  background-image: url("/image/ChatGPT Image Nov 16, 2025, 08_56_06 PM.png");
  background-size: cover;
  background-position: center;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(26, 26, 26, 0.9) 50%,
      rgba(26, 26, 26, 0.95) 100%
    );
  }
`;

// 🎨 Header
export const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10001;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeInUp} 0.5s ease-out;
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
`;

export const HeaderTitle = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  letter-spacing: 1px;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant',
})`
  padding: 0.5rem 1rem;
  background: ${props => {
    if (props.$variant === 'primary') return 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)';
    if (props.$variant === 'success') return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (props.$variant === 'danger') return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PageCounter = styled.div`
  padding: 0.5rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: 'Assistant', sans-serif;
  
  span {
    color: #10b981;
    font-weight: 600;
  }
`;

export const IconButton = styled.button`
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  
  &:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: #10b981;
    color: #10b981;
    transform: scale(1.05);
  }
`;

export const CloseButton = styled(IconButton)`
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
  
  &:hover {
    background: rgba(239, 68, 68, 0.4);
    border-color: #ef4444;
    color: white;
  }
`;

// 🎨 Flipbook
export const FlipbookWrapper = styled.div`
  position: absolute;
  inset: 0;
  top: 74px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  visibility: visible !important;
  opacity: 1 !important;
  overflow: visible !important;
`;

export const FlipbookContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  
  /* וידוא שהספר מוצג */
  & > div {
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
  }
`;

// 🎯 חצי ניווט מותאמים אישית
export const NavigationArrow = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'side' && prop !== 'disabled',
})`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  display: flex !important;
  visibility: visible !important;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  z-index: 10002;
  transition: all 0.3s ease;
  opacity: ${props => props.$disabled ? 0.4 : 1};
  pointer-events: ${props => props.$disabled ? 'auto' : 'auto'};
  
  ${props => props.$side === 'right' ? 'right: 30px;' : 'left: 30px;'}
  
  &:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.8);
    border-color: #10b981;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 25px rgba(16, 185, 129, 0.5);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-50%) scale(0.95);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    ${props => props.$side === 'right' ? 'right: 15px;' : 'left: 15px;'}
  }
`;

// 🎨 Loading
export const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  gap: 2rem;
`;

export const Spinner = styled.div`
  width: 64px;
  height: 64px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const LoadingText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  font-family: 'Assistant', sans-serif;
`;

// 🎨 Error
export const ErrorBox = styled.div`
  max-width: 400px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 24px;
  text-align: center;
`;

export const ErrorTitle = styled.h3`
  color: #ef4444;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  font-family: 'Assistant', sans-serif;
`;

export const ErrorMessage = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

export const RetryButton = styled.button`
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 50px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
`;

// 🎯 Link Overlay Component
export const LinkOverlay = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isEditing' && prop !== '$showAnimation',
})`
  position: absolute;
  top: ${props => props.y}px;
  left: ${props => props.x}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: 2px dashed ${props => props.$isEditing ? '#14b8a6' : 'rgba(20, 184, 166, 0.5)'};
  background: ${props => props.$isEditing ? 'rgba(20, 184, 166, 0.1)' : 'rgba(20, 184, 166, 0.05)'};
  cursor: grab;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  user-select: none;
  opacity: 1 !important;
  
  ${props => props.$showAnimation && css`
    animation: ${fadeInUp} 0.5s ease-out;
  `}
  
  &:hover {
    background: rgba(20, 184, 166, 0.2);
    border-color: #14b8a6;
    transform: scale(1.02);
  }
  
  &:active {
    cursor: grabbing;
  }
`;

export const LinkBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isBlinking' && prop !== '$showAnimation',
})`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 32px;
  height: 32px;
  background: #14b8a6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  opacity: 1 !important;
  z-index: 101;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  ${props => props.$isBlinking && css`
    animation: ${blink} 1.5s ease-in-out infinite;
  `}
  
  ${props => !props.$isBlinking && props.$showAnimation && css`
    animation: ${linkPulse} 2s ease-in-out infinite;
  `}
  
  &:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 16px rgba(20, 184, 166, 0.8);
  }
`;

export const LinkIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: white;
`;

export const CursorIcon = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 10001;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: #14b8a6;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.1s ease-out;
`;

export const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

export const IconOption = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'selected',
})`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: 2px solid ${props => props.$selected ? '#14b8a6' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.$selected ? 'rgba(20, 184, 166, 0.1)' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  color: ${props => props.$selected ? '#14b8a6' : '#6b7280'};
  
  &:hover {
    border-color: #14b8a6;
    background: rgba(20, 184, 166, 0.1);
    color: #14b8a6;
    transform: scale(1.1);
  }
`;

export const LinkModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

export const LinkModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  direction: rtl;
  display: flex;
  flex-direction: column;
`;

export const ModalTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #14b8a6;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

// 🎨 SVG Icon Components
export const ZoomInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
    <path d="M11 8v6"/>
    <path d="M8 11h6"/>
  </svg>
);

export const ZoomOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
    <path d="M8 11h6"/>
  </svg>
);

export const MaximizeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
    <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
    <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
    <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
  </svg>
);

export const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

export const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18"/>
    <path d="M6 6l12 12"/>
  </svg>
);

// 🔧 חצי ניווט
export const ChevronLeftIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

export const ChevronRightIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

