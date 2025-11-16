import React, { useEffect, useRef, useState, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import styled from "styled-components";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// 🎨 Styled Components
const ViewerContainer = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  flex-direction: column;
  z-index: 9999;
  overflow: hidden;
  direction: rtl; /* עברית - RTL */
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  direction: rtl; /* עברית - RTL */
`;

const IssueTitle = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
  }
`;

const BookStage = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  perspective: 2500px;
  perspective-origin: center center;
  background: 
    radial-gradient(circle at 20% 50%, rgba(0, 0, 0, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(0, 0, 0, 0.3) 0%, transparent 50%),
    linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
`;

const FlipbookContainer = styled.div`
  position: relative;
  transform-style: preserve-3d;
  
  /* צל עמוק כמו בספר אמיתי */
  &::before {
    content: '';
    position: absolute;
    inset: -20px;
    background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, transparent 70%);
    z-index: -1;
    filter: blur(30px);
  }
`;

const Flipbook = styled.div`
  margin: 0 auto;
  transform-style: preserve-3d;
  direction: rtl; /* עברית - דפדוף מימין לשמאל */
  
  /* סגנון דפים כמו בספר עברי אמיתי */
  .page {
    background: white;
    box-shadow: 
      inset 1px 0 0 rgba(0, 0, 0, 0.1), /* צל בצד ימין (RTL) */
      0 0 20px rgba(0, 0, 0, 0.1);
    border-left: 1px solid rgba(0, 0, 0, 0.05); /* גבול בצד ימין */
    cursor: pointer; /* סמן עכבר כמו בספר אמיתי */
    position: relative;
  }
  
  /* אזורי לחיצה בקצוות - מוסתרים אבל פעילים */
  .page::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 50px;
    height: 50px;
    background: transparent;
    cursor: pointer;
    z-index: 10;
  }
  
  .page::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 50px;
    height: 50px;
    background: transparent;
    cursor: pointer;
    z-index: 10;
  }
  
  /* דף שמתהפך - צל דינמי (מימין לשמאל) */
  .page.turning {
    box-shadow: 
      10px 0 30px rgba(0, 0, 0, 0.3), /* צל בצד ימין */
      inset 1px 0 0 rgba(0, 0, 0, 0.1);
  }
  
  /* צד שמאל של הספר (דף זוגי) */
  .page.even {
    border-right: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  /* סגנון Turn.js */
  .turn-page {
    background: white;
    direction: rtl;
  }
`;

const PageDiv = styled.div`
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  direction: rtl; /* עברית - תוכן הדף */
  
  /* צל עדין על הדף */
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.02);
  
  /* גבול עדין בצד ימין (RTL) */
  &::before {
    content: '';
    position: absolute;
    right: 0; /* שינוי מ-left ל-right */
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, 
      transparent 0%, 
      rgba(0, 0, 0, 0.05) 20%, 
      rgba(0, 0, 0, 0.05) 80%, 
      transparent 100%);
    z-index: 1;
    pointer-events: none;
  }
  
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
`;

const BottomBar = styled.div`
  padding: 1.5rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  direction: rtl; /* עברית - RTL */
`;

const NavButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const PageIndicator = styled.div`
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(26, 26, 46, 0.95);
  gap: 1rem;
  z-index: 100;
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

// 🎯 Main Component
export default function FlipCanvasViewer({ issue, onClose }) {
  const flipbookRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pageWidth, setPageWidth] = useState(400);
  const [pageHeight, setPageHeight] = useState(565);

  const pdfOptions = useMemo(
    () => ({
      cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }),
    []
  );

  // Load jQuery and Turn.js
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        // בדיקה אם הסקריפט כבר נטען
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          // אם הסקריפט כבר קיים, נחכה שהוא יסתיים לטעון
          if (src.includes('jquery')) {
            if (window.jQuery && window.$) {
              resolve();
              return;
            }
            // נחכה ש-jQuery יטען
            const checkJQuery = setInterval(() => {
              if (window.jQuery && window.$) {
                clearInterval(checkJQuery);
                resolve();
              }
            }, 50);
            setTimeout(() => {
              clearInterval(checkJQuery);
              if (window.jQuery && window.$) {
                resolve();
              } else {
                reject(new Error('jQuery failed to load'));
              }
            }, 5000);
            return;
          }
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          // עבור jQuery, נחכה שהוא יוגדר גלובלית
          if (src.includes('jquery')) {
            const checkJQuery = setInterval(() => {
              if (window.jQuery && window.$) {
                clearInterval(checkJQuery);
                // הגדרת jQuery גלובלית גם כ-jQuery
                if (!window.jQuery) {
                  window.jQuery = window.$;
                }
                resolve();
              }
            }, 50);
            setTimeout(() => {
              clearInterval(checkJQuery);
              if (window.jQuery && window.$) {
                resolve();
              } else {
                reject(new Error('jQuery failed to initialize'));
              }
            }, 5000);
          } else {
            resolve();
          }
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const init = async () => {
      try {
        await loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/turn.js/3/turn.min.js');
        console.log("✅ jQuery and Turn.js loaded");
      } catch (error) {
        console.error("❌ Failed to load libraries:", error);
      }
    };

    init();
  }, []);

  // Calculate page size
  useEffect(() => {
    const calculateSize = () => {
      const containerWidth = window.innerWidth - 200;
      const containerHeight = window.innerHeight - 250;
      const aspectRatio = 0.707;

      let width, height;
      if (containerWidth / 2 / containerHeight > aspectRatio) {
        height = Math.min(containerHeight, 800);
        width = height * aspectRatio;
      } else {
        width = Math.min(containerWidth / 2, 450);
        height = width / aspectRatio;
      }
      
      setPageWidth(Math.floor(width));
      setPageHeight(Math.floor(height));
    };

    calculateSize();
    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, []);

  const onDocumentLoadSuccess = ({ numPages: total }) => {
    console.log("✅ PDF loaded, pages:", total);
    setNumPages(total);
    setIsLoading(false);
  };

  // Initialize Turn.js after pages are rendered
  useEffect(() => {
    if (!numPages || !window.$ || !window.$.fn.turn) return;

    // Wait a bit for all pages to render
    const timer = setTimeout(() => {
      const $flipbook = window.$(flipbookRef.current);
      
      if ($flipbook.turn('is')) {
        $flipbook.turn('destroy');
      }

      try {
        $flipbook.turn({
          width: pageWidth * 2,
          height: pageHeight,
          autoCenter: true,
          direction: 'rtl', // 🔥 זה המפתח! RTL!
          display: 'double',
          acceleration: true,
          elevation: 50,
          gradients: true,
          when: {
            turned: function(event, page) {
              setCurrentPage(page);
              console.log("📖 Current page:", page);
            }
          }
        });

        console.log("✅ Turn.js initialized with RTL");
      } catch (error) {
        console.error("❌ Turn.js error:", error);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (window.$ && flipbookRef.current) {
        const $flipbook = window.$(flipbookRef.current);
        if ($flipbook.turn && $flipbook.turn('is')) {
          $flipbook.turn('destroy');
        }
      }
    };
  }, [numPages, pageWidth, pageHeight]);

  const goNext = () => {
    if (window.$ && flipbookRef.current) {
      window.$(flipbookRef.current).turn('next');
    }
  };

  const goPrev = () => {
    if (window.$ && flipbookRef.current) {
      window.$(flipbookRef.current).turn('previous');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <ViewerContainer>
      <TopBar>
        <IssueTitle>{issue?.title || "גליון דיגיטלי"}</IssueTitle>
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>
      </TopBar>

      <BookStage>
        {isLoading && (
          <LoadingOverlay>
            <Spinner />
            <LoadingText>טוען PDF...</LoadingText>
          </LoadingOverlay>
        )}

        <FlipbookContainer>
          <Document
            file={issue?.pdf_url}
            options={pdfOptions}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Flipbook ref={flipbookRef} style={{ width: pageWidth * 2, height: pageHeight }}>
              {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                <PageDiv key={pageNum} style={{ width: pageWidth, height: pageHeight }}>
                  <Page
                    pageNumber={pageNum}
                    width={pageWidth}
                    height={pageHeight}
                    renderMode="canvas"
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    canvasBackground="white"
                  />
                </PageDiv>
              ))}
            </Flipbook>
          </Document>
        </FlipbookContainer>
      </BookStage>

      <BottomBar>
        <NavButton onClick={goPrev} disabled={currentPage <= 1}>
          <ChevronRight size={20} />
          <span>הקודם</span>
        </NavButton>

        <PageIndicator>
          <span style={{ color: '#14b8a6', fontSize: '1.5rem' }}>{currentPage}</span>
          <span> / {numPages || "..."}</span>
        </PageIndicator>

        <NavButton onClick={goNext} disabled={currentPage >= numPages}>
          <span>הבא</span>
          <ChevronLeft size={20} />
        </NavButton>
      </BottomBar>
    </ViewerContainer>
  );
}
