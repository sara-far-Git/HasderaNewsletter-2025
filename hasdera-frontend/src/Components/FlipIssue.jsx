import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import HTMLFlipBook from "react-pageflip";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight, Home, BookOpen } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// 🎨 Styled Components
const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #1f2937;
  display: flex;
  flex-direction: column;
  direction: rtl;
`;

const Header = styled.header`
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(12px);
  color: white;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(75, 85, 99, 0.5);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
`;

const HeaderContent = styled.div`
  max-width: 96rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(55, 65, 81, 0.8);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(75, 85, 99, 0.9);
  }
`;

const TitleWrapper = styled.div`
  flex: 1;
  text-align: center;
  padding: 0 1rem;
`;

const Title = styled.h1`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
`;

const PageCounter = styled.div`
  padding: 0.5rem 1rem;
  background: rgba(55, 65, 81, 0.8);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: radial-gradient(
      circle at 20% 30%,
      rgba(15, 118, 110, 0.12),
      transparent 50%
    ),
    radial-gradient(circle at 80% 70%, rgba(15, 118, 110, 0.12), transparent 50%);

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const BookWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (min-width: 768px) {
    gap: 2rem;
  }
`;

const NavButton = styled.button`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    padding: 1rem;
  }
`;

const FlipBookContainer = styled.div`
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
  overflow: hidden;
`;

const PageWrapper = styled.div`
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.05);
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const LoadingSpinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 4px solid #14b8a6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  color: #14b8a6;
  font-size: 1.125rem;
  margin-top: 1rem;
`;

const Footer = styled.footer`
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(12px);
  color: white;
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(75, 85, 99, 0.5);
`;

const FooterContent = styled.nav`
  max-width: 96rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 0.75rem;
  }
`;

const FooterButton = styled.button`
  padding: 0.5rem 0.75rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;

  &:hover:not(:disabled) {
    background: #0d9488;
  }

  &:disabled {
    background: rgba(55, 65, 81, 0.8);
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    padding: 0.5rem 1rem;
  }
`;

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1f2937;
  padding: 1.5rem;
`;

const ErrorBox = styled.div`
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  padding: 2rem;
  text-align: center;
  max-width: 28rem;
`;

const ErrorTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
`;

const ErrorText = styled.p`
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

const ErrorButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
`;

const PrimaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #0d9488;
  }
`;

const SecondaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #4b5563;
  }
`;

const DocumentLoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #d1d5db;
`;

// 🔹 Main Component
export default function FlipIssue() {
  const location = useLocation();
  const navigate = useNavigate();
  const issue = location.state;

  const bookRef = useRef(null);
  const documentRef = useRef(null);

  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageWidth, setPageWidth] = useState(520);
  const [pageHeight, setPageHeight] = useState(520 * 1.414);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDocumentReady, setIsDocumentReady] = useState(false);

  const pdfOptions = useMemo(
    () => ({
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
      standardFontDataUrl:
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/",
    }),
    []
  );

  // חישוב גדלים רספונסיבי
  useEffect(() => {
    const onResize = () => {
      const vw = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      );
      const vh = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      );

      let w;
      if (vw < 640) w = Math.min(360, vw * 0.85);
      else if (vw < 1024) w = Math.min(460, vw * 0.42);
      else w = Math.min(560, vw * 0.34);

      const maxByHeight = (vh - 200) / 1.414;
      w = Math.min(w, maxByHeight);

      setPageWidth(w);
      setPageHeight(w * 1.414);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleDocumentLoadSuccess = useCallback((pdf) => {
    console.log("PDF loaded successfully:", pdf.numPages, "pages");
    documentRef.current = pdf;
    setNumPages(pdf.numPages);
    setIsDocumentReady(true);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleDocumentLoadError = useCallback((error) => {
    console.error("Error loading PDF:", error);
    setError("שגיאה בטעינת הקובץ. אנא נסה שוב.");
    setIsLoading(false);
    setIsDocumentReady(false);
    documentRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (documentRef.current) {
        documentRef.current.destroy?.();
        documentRef.current = null;
      }
    };
  }, []);

  // 🔄 פונקציות ניווט - מותאמות לעברית
  const goToNextPage = useCallback(() => {
    if (!bookRef.current || currentPage === 0) return;
    bookRef.current.pageFlip().flipPrev();  // הפוך את הכיוון
  }, [currentPage]);

  const goToPrevPage = useCallback(() => {
    if (!bookRef.current) return;
    const maxSpread = Math.ceil(numPages / 2) - 1;
    if (currentPage >= maxSpread) return;
    bookRef.current.pageFlip().flipNext();  // הפוך את הכיוון
  }, [currentPage, numPages]);

  const goToFirstPage = useCallback(() => {
    if (!bookRef.current) return;
    bookRef.current.pageFlip().flip(Math.ceil(numPages / 2) - 1);  // קפיצה לעמוד האחרון בספר
  }, [numPages]);

  const goToLastPage = useCallback(() => {
    if (!bookRef.current) return;
    bookRef.current.pageFlip().flip(0);  // קפיצה לעמוד הראשון בספר
  }, []);

  const handleFlip = useCallback((event) => {
    if (event.data && typeof event.data === 'number') {
      setCurrentPage(event.data);
      console.log("Page flipped to:", event.data);
    }
  }, []);

  const getRealPageNumber = useCallback(() => {
    if (!numPages) return 1;
    return numPages - (currentPage * 2);
  }, [currentPage, numPages]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!bookRef.current || !isDocumentReady) return;

      switch (e.key) {
        case "ArrowLeft":    // בעברית - זה הולך קדימה (הבא)
        case "ArrowUp":
          e.preventDefault();
          goToPrevPage();  // שינוי הכיוון
          break;
        case "ArrowRight":   // בעברית - זה הולך אחורה (הקודם)
        case "ArrowDown":
          e.preventDefault();
          goToNextPage();  // שינוי הכיוון
          break;
        case "Home":
          e.preventDefault();
          goToFirstPage();
          break;
        case "End":
          e.preventDefault();
          goToLastPage();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextPage, goToPrevPage, goToFirstPage, goToLastPage, isDocumentReady]);

  // 📖 רינדור עמודים - מסודר לעברית (מימין לשמאל)
  const renderPages = useMemo(() => {
    if (!numPages) return [];
    
    const pages = [];
    const isEven = numPages % 2 === 0;
    
    // מוסיף את העמוד הראשון (הכריכה)
    pages.push(
      <PageWrapper 
        key="page-1"
        className="cover"
        style={{
          direction: 'rtl',
          position: 'relative'
        }}
      >
        <div style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative',
          transform: 'rotate(180deg)'
        }}>
          <Page
            pageNumber={1}
            width={pageWidth}
            height={pageHeight}
            renderMode="canvas"
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={
              <LoadingWrapper>
                <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  טוען כריכה...
                </div>
              </LoadingWrapper>
            }
          />
        </div>
      </PageWrapper>
    );
    
    // מוסיף את שאר העמודים
    for (let i = 2; i <= numPages; i++) {
      pages.push(
        <PageWrapper 
          key={`page-${i}`}
          style={{
            direction: 'rtl',
            position: 'relative'
          }}
        >
          <div style={{ 
            width: '100%', 
            height: '100%', 
            position: 'relative',
            transform: 'rotate(180deg)'
          }}>
            <Page
              pageNumber={i}
              width={pageWidth}
              height={pageHeight}
              renderMode="canvas"
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <LoadingWrapper>
                  <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                    טוען עמוד {i}...
                  </div>
                </LoadingWrapper>
              }
            />
          </div>
        </PageWrapper>
      );
    }
    
    // אם יש מספר אי זוגי של עמודים, מוסיף עמוד ריק בסוף
    if (!isEven) {
      pages.push(
        <PageWrapper key="blank-last" style={{ background: '#f3f4f6' }}>
          <div style={{ width: pageWidth, height: pageHeight }} />
        </PageWrapper>
      );
    }
    
    return pages;
  }, [numPages, pageWidth, pageHeight]);

  if (!issue || !issue.pdf_url) {
    return (
      <ErrorContainer>
        <ErrorBox>
          <ErrorTitle>לא סופק קובץ PDF</ErrorTitle>
          <ErrorText>לא נמצא קובץ PDF לתצוגה</ErrorText>
          <PrimaryButton onClick={() => navigate(-1)}>
            חזרה לעמוד הקודם
          </PrimaryButton>
        </ErrorBox>
      </ErrorContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorBox>
          <ErrorTitle>שגיאה</ErrorTitle>
          <ErrorText>{error}</ErrorText>
          <ErrorButtons>
            <PrimaryButton
              onClick={() => {
                setError(null);
                setIsLoading(true);
                setIsDocumentReady(false);
              }}
            >
              נסה שוב
            </PrimaryButton>
            <SecondaryButton onClick={() => navigate(-1)}>
              חזרה
            </SecondaryButton>
          </ErrorButtons>
        </ErrorBox>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate(-1)} aria-label="חזרה לעמוד הקודם">
            <ArrowRight size={16} />
            <span>חזרה</span>
          </BackButton>

          <TitleWrapper>
            <Title>{issue.title || "מגזין דיגיטלי"}</Title>
          </TitleWrapper>

          <PageCounter>
            {numPages ? `${getRealPageNumber()} / ${numPages}` : "..."}
          </PageCounter>
        </HeaderContent>
      </Header>

      <MainContent>
        <Document
          file={issue.pdf_url}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleDocumentLoadError}
          loading={
            <DocumentLoadingWrapper>
              <LoadingSpinner />
              <LoadingText>טוען PDF...</LoadingText>
            </DocumentLoadingWrapper>
          }
          options={pdfOptions}
        >
          {isDocumentReady && numPages && (
            <BookWrapper>
              <NavButton
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                title="עמוד קודם"
                aria-label="עמוד קודם"
              >
                <ArrowRight size={24} />
              </NavButton>

              <FlipBookContainer>
                <HTMLFlipBook
                  ref={bookRef}
                  width={pageWidth}
                  height={pageHeight}
                  size="fixed"
                  minWidth={300}
                  maxWidth={700}
                  minHeight={420}
                  maxHeight={990}
                  maxShadowOpacity={0.5}
                  showCover={true}
                  mobileScrollSupport={true}
                  swipeDistance={30}
                  flippingTime={800}
                  usePortrait={false}
                  startPage={0}
                  drawShadow={true}
                  onFlip={handleFlip}
                  className="magazine-book"
                  clickEventForward={true}
                  useMouseEvents={true}
                  showPageCorners={true}
                  style={{
                    direction: 'rtl',
                    transform: 'rotate(180deg)',
                    transformOrigin: 'center center'
                  }}
                >
                  {renderPages}
                </HTMLFlipBook>
              </FlipBookContainer>

              <NavButton
                onClick={goToNextPage}
                disabled={currentPage >= Math.ceil(numPages / 2) - 1}
                title="עמוד הבא"
                aria-label="עמוד הבא"
              >
                <ArrowLeft size={24} />
              </NavButton>
            </BookWrapper>
          )}
        </Document>
      </MainContent>

      <Footer>
        <FooterContent>
          <FooterButton
            onClick={goToFirstPage}
            disabled={currentPage === 0}
            aria-label="עמוד ראשון"
          >
            <ChevronsRight size={16} />
            <span>ראשון</span>
          </FooterButton>

          <FooterButton
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            aria-label="עמוד קודם"
          >
            <ArrowRight size={16} />
            <span>קודם</span>
          </FooterButton>

          <PageCounter>
            {numPages ? `${getRealPageNumber()} / ${numPages}` : "..."}
          </PageCounter>

          <FooterButton
            onClick={goToNextPage}
            disabled={currentPage >= Math.ceil(numPages / 2) - 1}
            aria-label="עמוד הבא"
          >
            <span>הבא</span>
            <ArrowLeft size={16} />
          </FooterButton>

          <FooterButton
            onClick={goToLastPage}
            disabled={currentPage >= Math.ceil(numPages / 2) - 1}
            aria-label="עמוד אחרון"
          >
            <span>אחרון</span>
            <ChevronsLeft size={16} />
          </FooterButton>
        </FooterContent>
      </Footer>
    </Container>
  );
}
