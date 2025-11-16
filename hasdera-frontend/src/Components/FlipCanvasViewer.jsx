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
        // טעינת jQuery קודם
        await loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
        
        // המתנה קצרה כדי ש-jQuery יוגדר
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // וידוא ש-jQuery מוגדר גלובלית
        if (!window.$ || !window.jQuery) {
          // ננסה לחכות עוד קצת
          let attempts = 0;
          while ((!window.$ || !window.jQuery) && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
          }
        }
        
        if (!window.$) {
          throw new Error('jQuery $ not available');
        }
        
        // וידוא ש-jQuery מוגדר גם כ-jQuery (חשוב ל-Turn.js)
        if (!window.jQuery) {
          window.jQuery = window.$;
        }
        
        console.log("✅ jQuery loaded:", {
          '$': typeof window.$,
          'jQuery': typeof window.jQuery
        });
        
        // טעינת Turn.js אחרי jQuery - עם הגדרה מפורשת של jQuery
        const turnScript = document.createElement('script');
        turnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/turn.js/3/turn.min.js';
        
        await new Promise((resolve, reject) => {
          turnScript.onload = () => {
            // המתנה קצרה כדי ש-Turn.js יטען
            setTimeout(() => {
              if (!window.$.fn.turn) {
                reject(new Error('Turn.js not available'));
              } else {
                console.log("✅ Turn.js loaded successfully");
                resolve();
              }
            }, 100);
          };
          turnScript.onerror = reject;
          document.head.appendChild(turnScript);
        });
        
        console.log("✅ jQuery and Turn.js loaded successfully");
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
    if (!numPages || !window.$ || !window.$.fn.turn || !flipbookRef.current) return;

    // Wait for pages to be fully rendered
    const timer = setTimeout(() => {
      const $flipbook = window.$(flipbookRef.current);
      
      // בדיקה שהדפים קיימים
      const pages = $flipbook.find('.page');
      console.log(`📄 Found ${pages.length} pages, expected ${numPages}`);
      
      if (pages.length === 0) {
        console.warn("⚠️ No pages found, retrying...");
        return;
      }
      
      // בדיקה נכונה אם Turn.js כבר מאותחל
      try {
        if ($flipbook.data('turn')) {
          console.log("🔄 Destroying existing Turn.js instance");
          $flipbook.turn('destroy');
        }
      } catch (e) {
        console.log("No existing Turn.js instance to destroy");
      }

      try {
        console.log("🚀 Initializing Turn.js with:", {
          width: pageWidth * 2,
          height: pageHeight,
          pages: numPages,
          direction: 'rtl'
        });
        
        $flipbook.turn({
          width: pageWidth * 2,
          height: pageHeight,
          autoCenter: true,
          direction: 'rtl', // עברית - דפדוף מימין לשמאל
          display: 'double', // שני דפים יחד כמו ספר אמיתי
          acceleration: true,
          elevation: 80,
          gradients: true,
          duration: 600,
          pages: numPages,
          shadows: true,
          when: {
            turning: function(event, page, view) {
              const $page = window.$(view);
              if ($page && $page.length) {
                $page.addClass('turning');
              }
            },
            turned: function(event, page) {
              window.$('.page').removeClass('turning');
              // ב-display: double, Turn.js מחזיר מספר דף זוגי (2, 4, 6...)
              // בדף 2 = דפים 1-2, בדף 4 = דפים 3-4, וכו'
              // ב-RTL: דף 2 = דפים 1-2 (ימין-שמאל), אז currentPage = 1
              const actualPage = page - 1;
              setCurrentPage(actualPage);
              console.log("📖 Turned to page:", page, "-> Displaying pages:", actualPage, "-", actualPage + 1);
            },
            start: function(event, pageObject, corner) {
              const $page = window.$(pageObject);
              if ($page && $page.length) {
                $page.css({
                  'box-shadow': '15px 0 40px rgba(0, 0, 0, 0.4), inset 1px 0 0 rgba(0, 0, 0, 0.1)'
                });
              }
            },
            end: function(event, pageObject) {
              const $page = window.$(pageObject);
              if ($page && $page.length) {
                $page.css({
                  'box-shadow': ''
                });
              }
            }
          }
        });
        
        // התחלה מדף 2 (שזה דפים 1-2 ב-display: double)
        $flipbook.turn('page', 2);
        
        // הוספת אפשרות דפדוף בלחיצה בקצוות העמודים (Turn.js כבר תומך בזה, אבל נוסיף תמיכה נוספת)
        // Turn.js כבר מטפל בלחיצה בקצוות, אבל נוסיף handler נוסף לוודא שזה עובד ב-RTL
        $flipbook.on('click', function(e) {
          const $target = window.$(e.target);
          
          // אם זה לא דף, נבדוק אם זה אזור קצה
          if (!$target.closest('.page, .turn-page').length) {
            return;
          }
          
          const $page = $target.closest('.page, .turn-page');
          if (!$page.length) return;
          
          const pageOffset = $page.offset();
          const pageWidth = $page.width();
          const pageHeight = $page.height();
          const clickX = e.pageX - pageOffset.left;
          const clickY = e.pageY - pageOffset.top;
          
          // גודל אזור הלחיצה בקצוות (RTL - מימין לשמאל)
          const cornerSize = 80;
          
          // קצה ימני עליון או תחתון - דפדוף קדימה (RTL)
          if (clickX > pageWidth - cornerSize) {
            if (clickY < cornerSize || clickY > pageHeight - cornerSize) {
              e.preventDefault();
              e.stopPropagation();
              try {
                $flipbook.turn('next');
              } catch (err) {
                console.log("Error turning next:", err);
              }
              return false;
            }
          }
          
          // קצה שמאלי עליון או תחתון - דפדוף אחורה (RTL)
          if (clickX < cornerSize) {
            if (clickY < cornerSize || clickY > pageHeight - cornerSize) {
              e.preventDefault();
              e.stopPropagation();
              try {
                $flipbook.turn('previous');
              } catch (err) {
                console.log("Error turning previous:", err);
              }
              return false;
            }
          }
        });

        // הוספת CSS גלובלי לדפים (רק פעם אחת)
        if (!document.getElementById('flipbook-viewer-styles')) {
          const style = document.createElement('style');
          style.id = 'flipbook-viewer-styles';
          style.textContent = `
            /* סגנון כללי לדפים */
            .flipbook-viewer-page,
            .turn-page,
            .page {
              background: white;
              position: relative;
              direction: rtl !important; /* עברית */
              text-align: right !important;
            }
            
            /* גבול עדין בצד ימין */
            .flipbook-viewer-page::after,
            .turn-page::after {
              content: '';
              position: absolute;
              right: 0;
              top: 0;
              bottom: 0;
              width: 2px;
              background: linear-gradient(to left, 
                rgba(0, 0, 0, 0.1) 0%, 
                transparent 100%);
              pointer-events: none;
            }
            
            /* מיקום נכון של Turn.js */
            .magazine-viewport {
              direction: rtl !important;
            }
            
            /* דפים של Turn.js */
            .turn-page-wrapper {
              direction: rtl !important;
            }
            
            /* תיקון מיקום העמודים */
            .turn-page {
              float: right !important;
              direction: rtl !important;
            }
          `;
          document.head.appendChild(style);
        }

        // בדיקה שהכל עובד - Turn.js משנה את מבנה ה-DOM אז נבדוק אחרת
        setTimeout(() => {
          try {
            // בדיקה אם Turn.js באמת עובד
            const currentPage = $flipbook.turn('page');
            console.log("✅ Turn.js is working! Current page:", currentPage);
            
            // הוספת מחלקות לדפים (Turn.js יוצר מבנה חדש)
            const pagesAfterInit = $flipbook.find('.page, .turn-page');
            console.log(`📄 Pages after init: ${pagesAfterInit.length}`);
            pagesAfterInit.addClass('flipbook-viewer-page');
          } catch (e) {
            console.error("❌ Error checking Turn.js:", e);
          }
        }, 300);

        console.log("✅ Turn.js initialized successfully");
      } catch (error) {
        console.error("❌ Turn.js initialization error:", error);
        console.error("Error details:", error.stack);
      }
    }, 1000); // הגדלתי את הזמן ל-1000ms כדי לוודא שהדפים מוכנים

    return () => {
      clearTimeout(timer);
      if (window.$ && flipbookRef.current) {
        const $flipbook = window.$(flipbookRef.current);
        try {
          // בדיקה נכונה אם Turn.js מאותחל - ננסה לקרוא את הדף
          try {
            $flipbook.turn('page'); // אם זה עובד, Turn.js מאותחל
            $flipbook.turn('destroy');
          } catch (e) {
            // אם יש שגיאה, Turn.js לא מאותחל - אין צורך להרוס
            console.log("Turn.js not initialized, skipping destroy");
          }
        } catch (e) {
          console.log("Error destroying Turn.js:", e);
        }
      }
    };
  }, [numPages, pageWidth, pageHeight]);

  const goNext = () => {
    if (!window.$ || !flipbookRef.current) {
      return;
    }
    
    try {
      const $flipbook = window.$(flipbookRef.current);
      
      try {
        const currentPage = $flipbook.turn('page');
        // ב-RTL, "next" זה למעשה דפדוף אחורה (מימין לשמאל)
        // אבל Turn.js עם RTL מטפל בזה אוטומטית
        $flipbook.turn('next');
      } catch (e) {
        console.warn("⚠️ Turn.js not ready:", e.message);
      }
    } catch (error) {
      console.error("❌ Error going to next page:", error);
    }
  };

  const goPrev = () => {
    if (!window.$ || !flipbookRef.current) {
      return;
    }
    
    try {
      const $flipbook = window.$(flipbookRef.current);
      
      try {
        const currentPage = $flipbook.turn('page');
        // ב-RTL, "previous" זה למעשה דפדוף קדימה
        $flipbook.turn('previous');
      } catch (e) {
        console.warn("⚠️ Turn.js not ready:", e.message);
      }
    } catch (error) {
      console.error("❌ Error going to previous page:", error);
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
  }, [onClose]); // הוספתי onClose ל-dependencies

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
            <Flipbook ref={flipbookRef} style={{ width: pageWidth * 2, height: pageHeight, direction: 'rtl' }}>
              {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                <PageDiv 
                  key={pageNum} 
                  className="page"
                  style={{ width: pageWidth, height: pageHeight, direction: 'rtl' }}
                >
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
        <NavButton 
          onClick={goPrev} 
          disabled={currentPage <= 1}
          title="דף קודם"
        >
          <ChevronRight size={20} />
          <span>הקודם</span>
        </NavButton>

        <PageIndicator>
          <span style={{ color: '#14b8a6', fontSize: '1.5rem' }}>{currentPage}</span>
          {currentPage < numPages && (
            <span style={{ fontSize: '1rem', opacity: 0.7 }}> - {currentPage + 1}</span>
          )}
          <span> / {numPages || "..."}</span>
        </PageIndicator>

        <NavButton 
          onClick={goNext} 
          disabled={currentPage >= numPages - 1}
          title="דף הבא"
        >
          <span>הבא</span>
          <ChevronLeft size={20} />
        </NavButton>
      </BottomBar>
    </ViewerContainer>
  );
}
