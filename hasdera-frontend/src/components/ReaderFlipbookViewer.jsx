/**
 * ReaderFlipbookViewer.jsx
 * צופה מגזין מתקדם לקוראים עם UX משופר
 * כולל: מחוון עמודים, מסך מלא, זום, שיתוף, קיצורי מקלדת
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ChevronLeft, ChevronRight, X, Maximize, Minimize, 
  ZoomIn, ZoomOut, Share2, ArrowRight, Keyboard, BookOpen
} from "lucide-react";
import { getIssueById } from "../Services/issuesService";
import { LinksContainer } from "./LinkOverlayComponent";

// 🎬 אנימציות
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

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

// 🎨 CSS גלובלי
const FlipbookStyles = createGlobalStyle`
  /* הסתרת ממשק Real3D המובנה */
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
  .flipbook-btn-page,
  .flipbook-btn-sound,
  .flipbook-btn-autoplay,
  .flipbook-btn-bookmark,
  .flipbook-btn-notes,
  .flipbook-btn-select,
  .flipbook-fullscreen-btn,
  .flipbook-share-btn,
  .flipbook-download-btn,
  .flipbook-print-btn,
  .flipbook-zoom-btn,
  [class*="flipbook-btn-"]:not(.flipbook-btn-prev):not(.flipbook-btn-next) {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    width: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }
  
  .flipbook-nav-wrapper,
  .flipbook-nav,
  .flipbook-currentPageHolder,
  .flipbook-page-number,
  .flipbook-currentPageNumber,
  .flipbook-page-indicator,
  .flipbook-bottom,
  .flipbook-bottom-controls,
  [class*="flipbook-nav"],
  [class*="flipbook-page-number"],
  [class*="flipbook-currentPage"],
  [class*="flipbook-bottom"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }
  
  .flipbook-btn-prev,
  .flipbook-btn-next,
  .flipbook-arrow-left,
  .flipbook-arrow-right,
  [class*="flipbook-arrow"],
  [class*="flipbook-prev"],
  [class*="flipbook-next"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
  
  /* וידוא שהתוכן מוצג */
  .flipbook-page,
  .flipbook-page-content,
  .flipbook-page-wrapper,
  .flipbook-book,
  .flipbook-bookLayer,
  .flipbook-viewport {
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
  }
  
  .flipbook-page-html,
  .flipbook-page-html *,
  .flipbook-page-html svg,
  .htmlContent,
  .htmlContent * {
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
  }
  
  .flipbook-page-html svg {
    display: inline-block !important;
    width: auto !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: 100% !important;
    fill: currentColor !important;
  }
  
  .flipbook-page-html img,
  .flipbook-page-html .htmlContent img {
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    max-width: 100% !important;
    height: auto !important;
  }
  
  .flipbook-page-html canvas,
  .flipbook-bookLayer canvas {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 100% !important;
    height: auto !important;
  }
`;

// 🎨 Styled Components
const ViewerContainer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;
  background: #1a1a1a;
`;

const BackgroundImage = styled.div`
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
const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10001;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeInUp} 0.5s ease-out;
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Assistant', sans-serif;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: #10b981;
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
`;

const HeaderTitle = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem;
  font-weight: 400;
  color: white;
  letter-spacing: 1px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    display: none;
  }
`;

const HeaderCenter = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PageIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  color: white;
  font-family: 'Assistant', sans-serif;
  font-size: 0.9rem;
  
  span.current {
    color: #10b981;
    font-weight: 600;
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
`;

const PageSlider = styled.input`
  width: 120px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #10b981;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      transform: scale(1.2);
    }
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #10b981;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
  
  @media (max-width: 768px) {
    width: 80px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: #10b981;
    color: #10b981;
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

const CloseButton = styled(IconButton)`
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
  
  &:hover {
    background: rgba(239, 68, 68, 0.4);
    border-color: #ef4444;
    color: white;
  }
`;

// 🎨 Flipbook
const FlipbookWrapper = styled.div`
  position: absolute;
  inset: 0;
  top: 60px;
  bottom: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const FlipbookContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

// 🎨 Navigation Arrows
const NavigationArrow = styled.button`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.85);
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  z-index: 10002;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  
  ${props => props.$side === 'right' ? 'right: 25px;' : 'left: 25px;'}
  
  &:hover {
    background: rgba(16, 185, 129, 1);
    border-color: white;
    transform: translateY(-50%) scale(1.12);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.6);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    &:hover {
      transform: translateY(-50%);
    }
  }
  
  @media (max-width: 768px) {
    width: 46px;
    height: 46px;
    ${props => props.$side === 'right' ? 'right: 12px;' : 'left: 12px;'}
  }
`;

// 🎨 Bottom Controls
const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10001;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  gap: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ZoomButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 6px;
  
  &:hover {
    background: rgba(16, 185, 129, 0.3);
    color: #10b981;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ZoomLevel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  min-width: 45px;
  text-align: center;
  font-family: 'Assistant', sans-serif;
`;

// 🎨 Keyboard Hint
const KeyboardHint = styled.div`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Assistant', sans-serif;
  font-size: 0.85rem;
  animation: ${slideIn} 0.3s ease-out, ${fadeOut} 0.3s ease-out 4s forwards;
  z-index: 10003;
  
  svg {
    color: #10b981;
  }
  
  kbd {
    padding: 0.2rem 0.5rem;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.8rem;
  }
`;

// 🎨 Share Modal
const ShareModal = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10010;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  animation: ${fadeIn} 0.2s ease-out;
`;

const ShareContent = styled.div`
  background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  animation: ${slideIn} 0.3s ease-out;
`;

const ShareTitle = styled.h3`
  color: white;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  margin: 0 0 1.5rem;
  text-align: center;
`;

const ShareButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: ${props => props.$bg || 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Assistant', sans-serif;
  font-size: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const CopySuccess = styled.div`
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  background: rgba(16, 185, 129, 0.9);
  border-radius: 8px;
  color: white;
  font-family: 'Assistant', sans-serif;
  animation: ${slideIn} 0.3s ease-out;
  z-index: 10020;
`;

// 🎨 Loading
const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  gap: 1.5rem;
`;

const Spinner = styled.div`
  width: 56px;
  height: 56px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  font-family: 'Assistant', sans-serif;
`;

// ============================================
// 📦 Main Component
// ============================================
const ReaderFlipbookViewer = ({ issueId: propIssueId, onClose }) => {
  const navigate = useNavigate();
  const params = useParams();
  const issueId = propIssueId || params.issueId;
  
  const containerRef = useRef(null);
  const flipbookInstanceRef = useRef(null);
  
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // טעינת הגיליון
  useEffect(() => {
    const loadIssue = async () => {
      try {
        setLoading(true);
        const data = await getIssueById(issueId);
        setIssue(data);
      } catch (err) {
        console.error("Error loading issue:", err);
        setError("שגיאה בטעינת הגיליון");
      } finally {
        setLoading(false);
      }
    };
    
    if (issueId) {
      loadIssue();
    }
  }, [issueId]);
  
  // הצגת הנחיית מקלדת פעם אחת
  useEffect(() => {
    const hintShown = localStorage.getItem('readerKeyboardHintShown');
    if (!hintShown && !loading && issue) {
      setShowKeyboardHint(true);
      localStorage.setItem('readerKeyboardHintShown', 'true');
      
      setTimeout(() => {
        setShowKeyboardHint(false);
      }, 5000);
    }
  }, [loading, issue]);
  
  // אתחול הפליפבוק
  useEffect(() => {
    if (!issue?.pdfUrl || !containerRef.current || loading) return;
    
    const initFlipbook = () => {
      if (typeof window.jQuery === 'undefined' || typeof window.JELYBOX_FLIPBOOK === 'undefined') {
        setTimeout(initFlipbook, 200);
        return;
      }
      
      const $ = window.jQuery;
      const $container = $(containerRef.current);
      
      if (flipbookInstanceRef.current) {
        try {
          flipbookInstanceRef.current.dispose?.();
          $container.empty();
        } catch (e) {}
      }
      
      try {
        const flipbook = new window.JELYBOX_FLIPBOOK($container[0], {
          pdf: issue.pdfUrl,
          pdfAutoLinks: false,
          mode: "webgl",
          viewMode: "2d",
          singlePageMode: false,
          rightToLeft: true,
          startPage: 1,
          pageMode: window.innerWidth < 768 ? "singlePage" : "doublePageRTL",
          responsive: true,
          backgroundColor: "transparent",
          pan: 0,
          zoom: 1,
          zoomMin: 0.5,
          zoomMax: 3,
          zoomStep: 0.2,
          autoplayEnabled: false,
          sound: false,
          
          // Callbacks
          onReady: function(fb) {
            console.log("✅ Flipbook ready for reader");
            flipbookInstanceRef.current = fb;
            
            const total = fb.getTotalPages ? fb.getTotalPages() : fb.totalPages || 0;
            setTotalPages(total);
            setCurrentPage(1);
          },
          
          onPageChange: function(e) {
            const page = e.page || e.current || 1;
            setCurrentPage(page);
          }
        });
        
        flipbookInstanceRef.current = flipbook;
        
      } catch (error) {
        console.error("Error initializing flipbook:", error);
        setError("שגיאה באתחול המגזין");
      }
    };
    
    const timer = setTimeout(initFlipbook, 300);
    return () => clearTimeout(timer);
  }, [issue?.pdfUrl, loading]);
  
  // קיצורי מקלדת
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handleNextPage();
      } else if (e.key === 'ArrowRight') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // פונקציות ניווט
  const handleNextPage = useCallback(() => {
    const fb = flipbookInstanceRef.current;
    if (!fb) return;
    
    try {
      if (fb.next) fb.next();
      else if (fb.nextPage) fb.nextPage();
      else if (fb.flipNext) fb.flipNext();
    } catch (e) {}
  }, []);
  
  const handlePrevPage = useCallback(() => {
    const fb = flipbookInstanceRef.current;
    if (!fb) return;
    
    try {
      if (fb.prev) fb.prev();
      else if (fb.prevPage) fb.prevPage();
      else if (fb.flipPrev) fb.flipPrev();
    } catch (e) {}
  }, []);
  
  const handleGoToPage = useCallback((page) => {
    const fb = flipbookInstanceRef.current;
    if (!fb) return;
    
    try {
      if (fb.gotoPage) fb.gotoPage(page);
      else if (fb.turnToPage) fb.turnToPage(page);
      else if (fb.goToPage) fb.goToPage(page);
    } catch (e) {}
  }, []);
  
  const handleSliderChange = (e) => {
    const page = parseInt(e.target.value);
    setCurrentPage(page);
    handleGoToPage(page);
  };
  
  // זום
  const handleZoomIn = useCallback(() => {
    const fb = flipbookInstanceRef.current;
    if (!fb || zoomLevel >= 200) return;
    
    const newZoom = Math.min(zoomLevel + 25, 200);
    setZoomLevel(newZoom);
    
    try {
      if (fb.zoomIn) fb.zoomIn();
      else if (fb.setZoom) fb.setZoom(newZoom / 100);
    } catch (e) {}
  }, [zoomLevel]);
  
  const handleZoomOut = useCallback(() => {
    const fb = flipbookInstanceRef.current;
    if (!fb || zoomLevel <= 50) return;
    
    const newZoom = Math.max(zoomLevel - 25, 50);
    setZoomLevel(newZoom);
    
    try {
      if (fb.zoomOut) fb.zoomOut();
      else if (fb.setZoom) fb.setZoom(newZoom / 100);
    } catch (e) {}
  }, [zoomLevel]);
  
  // מסך מלא
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // שיתוף
  const handleShare = () => {
    setShowShareModal(true);
  };
  
  const shareToWhatsApp = () => {
    const url = window.location.href;
    const text = `📰 ${issue?.title || 'גיליון השדרה'} - קראו עכשיו!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
    setShowShareModal(false);
  };
  
  const shareByEmail = () => {
    const url = window.location.href;
    const subject = `📰 ${issue?.title || 'גיליון השדרה'}`;
    const body = `היי,\n\nרציתי לשתף איתך את הגיליון החדש של השדרה:\n\n${url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShowShareModal(false);
  };
  
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      setShowShareModal(false);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };
  
  // סגירה
  const handleClose = useCallback(() => {
    if (flipbookInstanceRef.current) {
      try {
        flipbookInstanceRef.current.dispose?.();
      } catch (e) {}
    }
    
    if (onClose) {
      onClose();
    } else {
      navigate('/reader/issues');
    }
  }, [onClose, navigate]);
  
  // ניקוי
  useEffect(() => {
    return () => {
      if (flipbookInstanceRef.current) {
        try {
          flipbookInstanceRef.current.dispose?.();
        } catch (e) {}
      }
    };
  }, []);
  
  if (error) {
    return (
      <ViewerContainer>
        <BackgroundImage />
        <LoadingOverlay>
          <LoadingText>{error}</LoadingText>
          <BackButton onClick={handleClose}>
            <ArrowRight size={18} />
            חזרה לגיליונות
          </BackButton>
        </LoadingOverlay>
      </ViewerContainer>
    );
  }
  
  return (
    <ViewerContainer>
      <FlipbookStyles />
      <BackgroundImage />
      
      {/* Header */}
      <Header>
        <HeaderLeft>
          <BackButton onClick={handleClose}>
            <ArrowRight size={18} />
            חזרה
          </BackButton>
          <HeaderTitle>
            <BookOpen size={20} />
            {issue?.title || "טוען..."}
          </HeaderTitle>
        </HeaderLeft>
        
        <HeaderCenter>
          {totalPages > 0 && (
            <PageIndicator>
              <span>עמוד</span>
              <span className="current">{currentPage}</span>
              <span>מתוך</span>
              <span>{totalPages}</span>
              <PageSlider
                type="range"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={handleSliderChange}
              />
            </PageIndicator>
          )}
        </HeaderCenter>
        
        <HeaderActions>
          <IconButton onClick={handleShare} title="שיתוף">
            <Share2 size={18} />
          </IconButton>
          <IconButton onClick={toggleFullscreen} title={isFullscreen ? "יציאה ממסך מלא" : "מסך מלא"}>
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </IconButton>
          <CloseButton onClick={handleClose} title="סגירה">
            <X size={18} />
          </CloseButton>
        </HeaderActions>
      </Header>
      
      {/* Flipbook */}
      <FlipbookWrapper>
        {loading ? (
          <LoadingOverlay>
            <Spinner />
            <LoadingText>טוען את הגיליון...</LoadingText>
          </LoadingOverlay>
        ) : (
          <>
            <FlipbookContainer ref={containerRef} />
            
            {/* Links Overlay */}
            {issue?.links && issue.links.length > 0 && (
              <LinksContainer 
                links={issue.links}
                currentPage={currentPage}
                isEditMode={false}
              />
            )}
          </>
        )}
      </FlipbookWrapper>
      
      {/* Navigation Arrows */}
      <NavigationArrow 
        $side="right" 
        onClick={handleNextPage}
        disabled={currentPage >= totalPages}
        title="עמוד הבא"
      >
        <ChevronLeft size={28} />
      </NavigationArrow>
      
      <NavigationArrow 
        $side="left" 
        onClick={handlePrevPage}
        disabled={currentPage <= 1}
        title="עמוד קודם"
      >
        <ChevronRight size={28} />
      </NavigationArrow>
      
      {/* Bottom Bar */}
      <BottomBar>
        <ZoomControls>
          <ZoomButton onClick={handleZoomOut} disabled={zoomLevel <= 50} title="הקטנה">
            <ZoomOut size={18} />
          </ZoomButton>
          <ZoomLevel>{zoomLevel}%</ZoomLevel>
          <ZoomButton onClick={handleZoomIn} disabled={zoomLevel >= 200} title="הגדלה">
            <ZoomIn size={18} />
          </ZoomButton>
        </ZoomControls>
      </BottomBar>
      
      {/* Keyboard Hint */}
      {showKeyboardHint && (
        <KeyboardHint>
          <Keyboard size={16} />
          <span>דפדפו עם</span>
          <kbd>←</kbd>
          <kbd>→</kbd>
          <span>| מסך מלא</span>
          <kbd>F</kbd>
        </KeyboardHint>
      )}
      
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal onClick={() => setShowShareModal(false)}>
          <ShareContent onClick={e => e.stopPropagation()}>
            <ShareTitle>שתפו את הגיליון</ShareTitle>
            <ShareButtons>
              <ShareButton $bg="linear-gradient(135deg, #25D366 0%, #128C7E 100%)" onClick={shareToWhatsApp}>
                📱 שיתוף בוואטסאפ
              </ShareButton>
              <ShareButton $bg="linear-gradient(135deg, #EA4335 0%, #C5221F 100%)" onClick={shareByEmail}>
                ✉️ שליחה במייל
              </ShareButton>
              <ShareButton onClick={copyLink}>
                📋 העתקת קישור
              </ShareButton>
              <ShareButton onClick={() => setShowShareModal(false)}>
                ✕ ביטול
              </ShareButton>
            </ShareButtons>
          </ShareContent>
        </ShareModal>
      )}
      
      {/* Copy Success Toast */}
      {copySuccess && (
        <CopySuccess>✓ הקישור הועתק!</CopySuccess>
      )}
    </ViewerContainer>
  );
};

export default ReaderFlipbookViewer;

