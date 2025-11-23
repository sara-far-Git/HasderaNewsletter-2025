import React, { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { X } from "lucide-react";

// CSS גלובלי - ביטול רעידות
const BookShadowStyles = createGlobalStyle`
  /* ביטול transitions שגורמים לרעידות */
  .flipbook-page3,
  .flipbook-page3 *,
  .flipbook-page,
  .flipbook-page * {
    transition: none !important;
  }
  
  /* שמירה על transition רק לדפדוף */
  .flipbook-page3 {
    transition: transform 0.6s ease-out !important;
  }
`;

// 🎨 Styled Components - Exact FlipHTML5 Style
const ViewerContainer = styled.div`
  position: fixed;
  inset: 0;
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
  z-index: 9999;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  padding: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  
  &:hover {
    background: rgba(0, 0, 0, 0.95);
    transform: scale(1.1);
  }
`;

const PageCounter = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Assistant', sans-serif;
  z-index: 10001;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

const FlipbookWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
  gap: 1.5rem;
  z-index: 10000;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 3s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 400;
  font-family: 'Assistant', sans-serif;
`;

export default function FlipCanvasViewer({ issue, onClose }) {
  const flipbookContainerRef = useRef(null);
  const flipbookInstanceRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // בדיקה שהספרייה נטענה
  useEffect(() => {
    const checkFlipBook = setInterval(() => {
      if (window.FlipBook || window.FLIPBOOK) {
        clearInterval(checkFlipBook);
        setIsLoading(false);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkFlipBook);
      if (!window.FlipBook && !window.FLIPBOOK) {
        console.error("❌ Real3D FlipBook לא נטען");
        setIsLoading(false);
      }
    }, 10000);

    return () => clearInterval(checkFlipBook);
  }, []);

  useEffect(() => {
    if (!issue?.pdf_url || !flipbookContainerRef.current) return;
    if (!window.FlipBook && !window.FLIPBOOK) return;
    
    if (flipbookInstanceRef.current) {
      try {
        if (flipbookInstanceRef.current.destroy) {
          flipbookInstanceRef.current.destroy();
        } else if (flipbookInstanceRef.current.dispose) {
          flipbookInstanceRef.current.dispose();
        }
      } catch (e) {
        console.warn("Warning destroying previous flipbook:", e);
      }
      flipbookInstanceRef.current = null;
    }

    if (flipbookContainerRef.current) {
      flipbookContainerRef.current.innerHTML = '';
    }

    console.log("🎯 Initializing FlipBook...", issue.pdf_url);

    let flipbook;
    let container;

    try {
      container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      flipbookContainerRef.current.appendChild(container);

      // ============================================
      // 📖 הגדרות מקוריות - לא לשנות!
      // ============================================
      const options = {
        pdfUrl: issue.pdf_url,
        rightToLeft: true,
        startPage: 0,
        
        // רקע כהה
        backgroundColor: '#2a2a2a',
        backgroundTransparent: false,
        
        // PDF
        pdfAutoLinks: false,
        pdfTextLayer: true,
        htmlLayer: true,
        sound: false,
        
        // טעינה
        loadAllPages: false,
        loadPagesF: 2,
        loadPagesB: 1,
        
        // תצוגה - 3D מציאותי
        viewMode: '3d',
        
        // ללא תפריט!
        hideMenu: true,
        
        // חצים גדולים
        arrows: true,
        arrowsAlwaysVisible: true,
        arrowsColor: '#ffffff',
        arrowsBackground: 'rgba(0, 0, 0, 0.5)',
        arrowsBackgroundHover: 'rgba(0, 0, 0, 0.7)',
        arrowsSize: 50,
        arrowsMargin: 20,
        
        // זמן דפדוף איטי (1.5 = 900ms, 2.0 = 1200ms)
        pageFlipDuration: 1.8,
        
        // עיצוב
        skin: 'dark'
      };

      if (window.FlipBook) {
        flipbook = new window.FlipBook(container, options);
      } else if (window.FLIPBOOK && window.FLIPBOOK.Main) {
        flipbook = new window.FLIPBOOK.Main(options, container);
      }

      if (flipbook) {
        flipbookInstanceRef.current = flipbook;
        console.log("✅ FlipBook initialized");

        if (flipbook.on) {
          flipbook.on('pagechange', () => {
            try {
              if (flipbook.getCurrentPageNumber) {
                const page = flipbook.getCurrentPageNumber();
                setCurrentPage(page);
              }
            } catch (e) {
              console.warn("Error in pagechange:", e);
            }
          });

          flipbook.on('ready', () => {
            try {
              console.log("✅ FlipBook ready");
              setIsLoading(false);
              if (flipbook.options?.numPages) {
                setTotalPages(flipbook.options.numPages);
              } else if (flipbook.options?.pages) {
                setTotalPages(flipbook.options.pages.length);
              }
            } catch (e) {
              console.warn("Error in ready:", e);
            }
          });

          flipbook.on('pdfinit', () => {
            try {
              console.log("✅ PDF initialized");
              setIsLoading(false);
              if (flipbook.options?.numPages) {
                setTotalPages(flipbook.options.numPages);
              }
            } catch (e) {
              console.warn("Error in pdfinit:", e);
            }
          });

          flipbook.on('error', (error) => {
            console.error("❌ FlipBook error:", error);
            setIsLoading(false);
          });
        }

        if (window.addEventListener) {
          const handleUnhandledRejection = (event) => {
            const errorMessage = event.reason?.toString() || '';
            const errorStack = event.reason?.stack || '';
            
            if (errorMessage.includes('flipbook') || 
                errorMessage.includes('pdf') || 
                errorMessage.includes('PdfService') ||
                errorStack.includes('flipbook') ||
                errorStack.includes('pdfservice')) {
              console.warn("⚠️ Unhandled rejection:", event.reason);
              
              if (errorMessage.includes('PdfService')) {
                setError("שגיאה בטעינת המגזין");
                setIsLoading(false);
              }
              
              event.preventDefault();
            }
          };
          window.addEventListener('unhandledrejection', handleUnhandledRejection);
          
          return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
          };
        }
      }
    } catch (error) {
      console.error("❌ Failed to initialize:", error);
      setError(`שגיאה: ${error.message}`);
      setIsLoading(false);
      
      if (container?.parentNode) {
        container.parentNode.removeChild(container);
      }
    }

    return () => {
      if (flipbookInstanceRef.current) {
        try {
          if (flipbookInstanceRef.current.destroy) {
            flipbookInstanceRef.current.destroy();
          } else if (flipbookInstanceRef.current.dispose) {
            flipbookInstanceRef.current.dispose();
          }
        } catch (e) {
          console.warn("Warning destroying:", e);
        }
        flipbookInstanceRef.current = null;
      }
      if (flipbookContainerRef.current) {
        flipbookContainerRef.current.innerHTML = '';
      }
    };
  }, [issue?.pdf_url]);

  // קיצורי מקלדת
  useEffect(() => {
    const handleKey = (e) => {
      const flipbook = flipbookInstanceRef.current;
      
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && flipbook?.prevPage) {
        flipbook.prevPage();
      } else if (e.key === "ArrowLeft" && flipbook?.nextPage) {
        flipbook.nextPage();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <ViewerContainer>
      <BookShadowStyles />
      <CloseButton onClick={onClose} title="סגור (ESC)">
        <X size={24} />
      </CloseButton>

      {!isLoading && !error && totalPages && (
        <PageCounter>
          {currentPage} / {totalPages}
        </PageCounter>
      )}

      {isLoading && !error && (
        <LoadingOverlay>
          <Spinner />
          <LoadingText>טוען מגזין...</LoadingText>
        </LoadingOverlay>
      )}

      {error && (
        <LoadingOverlay>
          <div style={{ 
            color: '#ff6b6b', 
            fontSize: '20px', 
            fontWeight: 600, 
            textAlign: 'center',
            fontFamily: 'Assistant, sans-serif'
          }}>
            {error}
          </div>
        </LoadingOverlay>
      )}

      {!error && (
        <FlipbookWrapper>
          <div ref={flipbookContainerRef} style={{ width: '100%', height: '100%' }} />
        </FlipbookWrapper>
      )}
    </ViewerContainer>
  );
}