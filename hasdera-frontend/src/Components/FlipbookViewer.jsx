import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PageFlip } from "page-flip";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function FlipbookViewer({ fileUrl }) {
  const flipBookRef = useRef(null);
  const containerRef = useRef(null);
  const pageFlipInstance = useRef(null);
  
  const [numPages, setNumPages] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageWidth, setPageWidth] = useState(400);
  const [pageHeight, setPageHeight] = useState(565);
  const [pagesRendered, setPagesRendered] = useState(0);

  const pdfOptions = useMemo(
    () => ({
      cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }),
    []
  );

  const fileConfig = useMemo(() => ({ url: fileUrl }), [fileUrl]);

  // חישוב גודל עמודים
  useEffect(() => {
    const calculatePageSize = () => {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight - 160;
      const aspectRatio = 0.707;

      let width, height;
      if (containerWidth / 2 / containerHeight > aspectRatio) {
        height = Math.min(containerHeight * 0.85, 800);
        width = height * aspectRatio;
      } else {
        width = Math.min(containerWidth * 0.38, 450);
        height = width / aspectRatio;
      }
      setPageWidth(width);
      setPageHeight(height);
    };
    calculatePageSize();
    window.addEventListener("resize", calculatePageSize);
    return () => window.removeEventListener("resize", calculatePageSize);
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: total }) => {
    console.log("✅ PDF loaded, pages:", total);
    setNumPages(total);
  }, []);

  // 🔥 תיקון: אתחול PageFlip מיד כשיש מספיק עמודים (לא כולם!)
  useEffect(() => {
    // מאתחל כשיש לנו את ה-PDF ולפחות 3 עמודים ראשונים
    const minPagesToInit = Math.min(3, numPages || 3);
    
    if (numPages && pagesRendered >= minPagesToInit && flipBookRef.current && !pageFlipInstance.current) {
      console.log("🎯 Initializing PageFlip for RTL...", { numPages, pagesRendered });
      
      // המתנה קצרה כדי שה-DOM יהיה מוכן
      setTimeout(() => {
        try {
          const pageFlip = new PageFlip(flipBookRef.current, {
            width: pageWidth,
            height: pageHeight,
            size: "fixed",
            minWidth: 315,
            maxWidth: 1000,
            minHeight: 400,
            maxHeight: 1533,
            maxShadowOpacity: 0.8,
            showCover: true,
            mobileScrollSupport: true,
            swipeDistance: 30,
            clickEventForward: true,
            useMouseEvents: true,
            usePortrait: false,
            startPage: 0,
            drawShadow: true,
            flippingTime: 1000,
            autoSize: false,
            showPageCorners: true,
            disableFlipByClick: false,
          });

          const pages = document.querySelectorAll(".page-item");
          console.log("📄 Found pages:", pages.length);
          
          if (pages.length > 0) {
            pageFlip.loadFromHTML(pages);
            
            pageFlip.on("flip", (e) => {
              const rtlPageNum = numPages - e.data;
              setCurrentPage(rtlPageNum);
              console.log("📖 Current RTL page:", rtlPageNum);
            });

            pageFlipInstance.current = pageFlip;
            setIsLoading(false);
            console.log("✅ PageFlip initialized for RTL");
          }
        } catch (error) {
          console.error("❌ PageFlip initialization error:", error);
          // גם אם יש שגיאה, תצא ממצב טעינה
          setIsLoading(false);
        }
      }, 300);
    }
  }, [numPages, pagesRendered, pageWidth, pageHeight]);

  const handlePageRender = useCallback(() => {
    setPagesRendered((prev) => {
      const newCount = prev + 1;
      console.log(`📄 Page rendered: ${newCount}`);
      return newCount;
    });
  }, []);

  // כפתורי ניווט RTL
  const goNext = () => {
    if (pageFlipInstance.current) {
      pageFlipInstance.current.flipNext();
    }
  };

  const goPrev = () => {
    if (pageFlipInstance.current) {
      pageFlipInstance.current.flipPrev();
    }
  };

  if (!fileUrl) {
    return (
      <div className="loading-container">
        <div className="loading-text">לא הועבר קובץ PDF</div>
      </div>
    );
  }

  // הפיכת סדר העמודים! - הספר יתחיל מהעמוד האחרון
  const reversedPages = useMemo(() => {
    if (!numPages) return [];
    return Array.from({ length: numPages }, (_, i) => numPages - i);
  }, [numPages]);

  return (
    <div className="book-container">
      <div className="book-background">
        <div className="wood-texture"></div>
      </div>

      {/* כפתורי ניווט */}
      {!isLoading && numPages && (
        <>
          <div className="navigation-controls">
            <button onClick={goNext} className="nav-button">
              <span className="nav-text">הבא</span>
              <span>→</span>
            </button>

            <div className="page-indicator">
              <span className="current-page">{currentPage || 1}</span>
              <span className="separator">/</span>
              <span className="total-pages">{numPages}</span>
            </div>

            <button onClick={goPrev} className="nav-button">
              <span>←</span>
              <span className="nav-text">הקודם</span>
            </button>
          </div>

          <div className="book-info">
            <span className="book-title">הסדרה - גיליון דיגיטלי</span>
          </div>
        </>
      )}

      {/* מצב טעינה */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div className="loading-text">
            טוען עמודים... ({pagesRendered}/{numPages || "?"})
          </div>
        </div>
      )}

      {/* הספר - עם עמודים הפוכים! */}
      <div className="book-wrapper" ref={containerRef}>
        <Document
          file={fileConfig}
          options={pdfOptions}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="pdf-loading">
              <div className="spinner"></div>
              <div className="loading-text">טוען PDF...</div>
            </div>
          }
          error={
            <div className="pdf-loading" style={{ color: '#ef4444' }}>
              <div className="loading-text">שגיאה בטעינת PDF</div>
            </div>
          }
        >
          <div ref={flipBookRef} className="flipbook">
            {reversedPages.map((pageNum, index) => (
              <div 
                key={pageNum} 
                className={`page-item ${index === 0 ? "hard-cover" : ""}`}
                data-density={index === 0 ? "hard" : "soft"}
              >
                <div className="page-content">
                  <Page
                    pageNumber={pageNum}
                    width={pageWidth}
                    height={pageHeight}
                    renderMode="canvas"
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onRenderSuccess={handlePageRender}
                    canvasBackground="white"
                    loading={
                      <div style={{
                        width: pageWidth,
                        height: pageHeight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f5f5f5'
                      }}>
                        <div className="spinner" style={{ width: 30, height: 30 }}></div>
                      </div>
                    }
                  />
                  {index !== 0 && (
                    <div className="page-number">{pageNum}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Document>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .book-container {
          width: 100vw;
          height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 2500px;
          direction: rtl;
        }

        .book-background {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #8b7355 0%, #6b5644 50%, #5a4434 100%);
          z-index: 0;
        }

        .wood-texture {
          position: absolute;
          inset: 0;
          background-image: 
            repeating-linear-gradient(
              90deg,
              rgba(139, 115, 85, 0.1) 0px,
              rgba(139, 115, 85, 0.1) 2px,
              transparent 2px,
              transparent 4px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(90, 68, 52, 0.05) 0px,
              rgba(90, 68, 52, 0.05) 1px,
              transparent 1px,
              transparent 3px
            );
          opacity: 0.6;
        }

        .book-wrapper {
          position: relative;
          z-index: 10;
          filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.5));
        }

        .flipbook {
          position: relative;
        }

        .page-item {
          background: linear-gradient(
            to right,
            #faf8f3 0%,
            #ffffff 5%,
            #ffffff 95%,
            #f5f3ee 100%
          );
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.03);
          overflow: hidden;
          position: relative;
        }

        .page-item.hard-cover {
          background: linear-gradient(
            135deg,
            #2c3e50 0%,
            #34495e 50%,
            #2c3e50 100%
          ) !important;
          box-shadow: 
            inset 0 0 50px rgba(0, 0, 0, 0.3),
            0 5px 20px rgba(0, 0, 0, 0.4) !important;
        }

        .page-content {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-content canvas {
          display: block;
          max-width: 100%;
          max-height: 100%;
        }

        /* תמיכה בטקסט עברי */
        .react-pdf__Page__textContent {
          direction: rtl !important;
          text-align: right !important;
        }

        .react-pdf__Page__textContent span {
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }

        /* מספר עמוד */
        .page-number {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: #999;
          font-family: 'Georgia', serif;
          z-index: 10;
        }

        /* טקסטורת נייר */
        .page-item:not(.hard-cover)::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.01) 2px,
              rgba(0, 0, 0, 0.01) 3px
            );
          pointer-events: none;
          z-index: 1;
        }

        .loading-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          background: rgba(255, 255, 255, 0.95);
          padding: 40px 60px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .navigation-controls {
          position: absolute;
          top: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          gap: 20px;
          align-items: center;
          direction: rtl;
        }

        .nav-button {
          padding: 12px 24px;
          background: rgba(44, 62, 80, 0.95);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .nav-button:hover {
          background: rgba(52, 73, 94, 0.95);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .page-indicator {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 25px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #2c3e50;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .current-page {
          font-size: 20px;
          color: #e74c3c;
        }

        .separator {
          font-size: 16px;
          color: #95a5a6;
        }

        .total-pages {
          font-size: 16px;
          color: #7f8c8d;
        }

        .book-info {
          position: absolute;
          top: 30px;
          right: 30px;
          z-index: 100;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .book-title {
          font-size: 16px;
          font-weight: 700;
          color: #2c3e50;
        }

        .loading-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #8b7355 0%, #6b5644 50%, #5a4434 100%);
        }

        .pdf-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(102, 126, 234, 0.3);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          color: #2c3e50;
          font-size: 18px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .nav-button .nav-text {
            display: none;
          }

          .book-info {
            top: 10px;
            right: 10px;
            padding: 8px 16px;
          }

          .book-title {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
