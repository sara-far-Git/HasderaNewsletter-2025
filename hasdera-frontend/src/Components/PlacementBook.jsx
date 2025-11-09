import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import HTMLFlipBook from "react-pageflip";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight, Home, BookOpen, Plus, Tag } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// --- Styled Components (ללא שינוי, למעט הרחבות) ---

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #1f2937;
  display: flex;
  flex-direction: column;
  direction: rtl;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
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
  direction: rtl;

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

// רכיב לכיסוי כל עמוד עם כפתור לחיץ
const PageOverlayButton = styled.button`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(20, 184, 166, 0.05); // צבע שקוף עדין
  border: 3px dashed transparent;
  cursor: pointer;
  z-index: 5; // מעל שכבת ה-PDF
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #14b8a6;
  font-size: 1.2rem;
  font-weight: 700;
  
  &:hover {
    background: rgba(20, 184, 166, 0.2);
    border-color: #14b8a6;
  }
`;

const PageWrapper = styled.div`
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.05);
  position: relative; // חיוני למיקום ה-Overlay
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

// --- רכיב מודל קנייה חדש ---

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  text-align: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const ModalDetails = styled.p`
  color: #4b5563;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const ModalButton = styled.button`
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;

  &:hover {
    background: #0d9488;
  }
`;

const ModalCloseButton = styled.button`
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;

  &:hover {
    background: #e5e7eb;
  }
`;

// --- רכיב PageWithOverlay ---
// עוטף את עמוד ה-PDF בשכבת-על לחיצה
const PageWithOverlay = React.forwardRef(({ pageNumber, width, height, onClick }, ref) => (
  <PageWrapper ref={ref} data-density={pageNumber === 1 ? "hard" : "soft"}>
    <PageOverlayButton onClick={() => onClick(pageNumber)} title={`לחץ לרכישת עמוד ${pageNumber}`}>
      <Tag size={24} style={{ marginLeft: '8px' }} />
      בחר עמוד {pageNumber}
    </PageOverlayButton>

    <Page
      pageNumber={pageNumber}
      width={width}
      height={height}
      renderMode="canvas"
      renderTextLayer={false}
      renderAnnotationLayer={false}
      loading={
        <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>טוען עמוד {pageNumber}...</div>
      }
      error={
        <div style={{ color: "#ef4444", fontSize: "0.875rem" }}>שגיאה</div>
      }
    />
  </PageWrapper>
));


// --- רכיב המודל ---
const BuyModal = ({ pageNumber, onClose, onConfirm }) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>רכישת עמוד פרסום</ModalTitle>
        <ModalDetails>
          בחרת לרכוש את **עמוד מספר {pageNumber}** במגזין.
          האם תרצה להמשיך לבחירת גודל המודעה והתשלום?
        </ModalDetails>
        <ModalButton onClick={() => onConfirm(pageNumber)}>
          מעבר לבחירת מודעה
        </ModalButton>
        <ModalCloseButton onClick={onClose}>
          ביטול וחזרה לספר
        </ModalCloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};


// 🔹 Main Component (שם שונה ל-PlacementBook)
export default function PlacementBook() {
  const navigate = useNavigate();
  // נניח שיש לנו issue ב-location.state כמו קודם. אם לא, נשתמש בנתוני דמה
  const location = useLocation();
  const initialIssue = location.state || {
    pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // URL דמה
    title: "בחירת מיקום פרסומי",
    initial_pages: 10, // מספר עמודים התחלתי לדוגמה
  };

  const bookRef = useRef(null);

  const [numPages, setNumPages] = useState(initialIssue.initial_pages || 1);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageWidth, setPageWidth] = useState(520);
  const [pageHeight, setPageHeight] = useState(520 * 1.414);
  const [isLoading, setIsLoading] = useState(false); // כרגע אין טעינת PDF אמיתית
  const [selectedPage, setSelectedPage] = useState(null); // לניהול מצב המודל

  const pdfOptions = useMemo(
    () => ({
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
      standardFontDataUrl:
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/",
    }),
    []
  );

  // --- לוגיקת גודל רספונסיבי (נשארת כפי שהיא) ---
  useEffect(() => {
    // ... לוגיקת חישוב גדלים רספונסיבית
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
  // --------------------------------------------------


  // 🖱️ פונקציות ניווט
  const goToNextPage = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);
  const goToPrevPage = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const goToFirstPage = useCallback(() => bookRef.current?.pageFlip()?.flip(0), []);
  const goToLastPage = useCallback(() => bookRef.current?.pageFlip()?.flip(numPages), [numPages]);

  const handleFlip = useCallback((event) => {
    setCurrentPage(event.data);
  }, []);

  const getRealPageNumber = useCallback(() => {
    if (!numPages) return 1;
    // HTMLFlipBook נותן את מספר הממרח (spread) הנוכחי. 
    // אם זו עטיפה, זה עמוד 1. אחרת, זה currentPage * 2 + 1 (למעט כשיש שני עמודים).
    // נשתמש במספר העמודים של הספרייה לצורך המונה:
    const realCurrentPage = bookRef.current?.pageFlip()?.getCurrentPageIndex() || 0;
    return realCurrentPage + 1;
  }, []);

  // 🛒 לוגיקת בחירת ורכישת עמוד
  const openBuyModal = useCallback((pageNumber) => {
    // מונע פתיחת מודל בעמוד הראשון שהוא הכריכה
    if (pageNumber > 0) { 
      setSelectedPage(pageNumber);
    }
  }, []);

  const handleConfirmBuy = useCallback((pageNumber) => {
    // לוגיקת מעבר למסך הרכישה הסופי (Placement / Payment)
    setSelectedPage(null); // סגירת המודל
    console.log(`User confirmed purchase for page: ${pageNumber}`);
    // דוגמה לניווט למסך הבא עם פרטי העמוד שנבחר
    navigate('/advertiser/payment', { state: { page: pageNumber, issueTitle: initialIssue.title } });
  }, [initialIssue.title, navigate]);

  // ➕ לוגיקת הוספת עמודים
  const addPages = useCallback((count = 2) => {
    // נניח שמוסיפים זוג עמודים (כדי לשמור על פורמט הספר)
    setNumPages(prev => prev + count);
    // ניתן להוסיף כאן לוגיקה שתשלח בקשה לשרת להוספת עמודים לקובץ ה-PDF בפועל
    console.log(`Added ${count} pages. New total pages: ${numPages + count}`);
  }, [numPages]);
  
  // 📄 רינדור עמודי הספר
  const renderPages = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= numPages; i++) {
      pages.push(
        <PageWithOverlay
          key={`page-${i}`}
          pageNumber={i}
          width={pageWidth}
          height={pageHeight}
          onClick={openBuyModal} // העמודים כולם לחיצים
        />
      );
    }
    
    // אם מספר העמודים אי-זוגי, נוסיף עמוד ריק בסוף כדי לשמור על תבנית הספר (spread)
    if (numPages % 2 !== 0 && numPages > 0) {
      pages.push(
        <PageWrapper key="blank-last-page" data-density="hard">
            <div style={{ color: '#9ca3af', textAlign: 'center' }}>
                עמוד ריק
            </div>
        </PageWrapper>
      );
    }

    return pages;
  }, [numPages, pageWidth, pageHeight, openBuyModal]);


  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/advertiser')} aria-label="חזרה לאזור מפרסמים">
            <Home size={16} />
            <span>חזרה לאזור מפרסמים</span>
          </BackButton>

          <TitleWrapper>
            <Title>{initialIssue.title}</Title>
          </TitleWrapper>

          <PageCounter>
            {`${getRealPageNumber()} / ${numPages}`}
          </PageCounter>
        </HeaderContent>
      </Header>

      <MainContent>
        {/* Document משמש רק כמעטפת לשימוש ב-pdfjs */}
        <Document 
          file={initialIssue.pdf_url}
          options={pdfOptions}
          onLoadSuccess={() => setIsLoading(false)} // נניח שהוא תמיד טוען בהצלחה לצורך הדגמה
          loading={null}
        >
          <BookWrapper>
            <NavButton
              onClick={goToPrevPage}
              disabled={getRealPageNumber() === numPages || isLoading}
              title="עמוד קודם"
              aria-label="עמוד קודם"
            >
              <ArrowLeft size={24} />
            </NavButton>

            <FlipBookContainer>
              <HTMLFlipBook
                ref={bookRef}
                width={pageWidth}
                height={pageHeight}
                size="fixed"
                mobileScrollSupport={true}
                onFlip={handleFlip}
                className="placement-book"
                clickEventForward={true}
                useMouseEvents={true}
                direction="rtl"
                showCover={true}
                startPage={0}
              >
                {renderPages}
              </HTMLFlipBook>
            </FlipBookContainer>

            <NavButton
              onClick={goToNextPage}
              disabled={getRealPageNumber() === 1 || isLoading}
              title="עמוד הבא"
              aria-label="עמוד הבא"
            >
              <ArrowRight size={24} />
            </NavButton>
          </BookWrapper>
        </Document>
      </MainContent>

      <Footer>
        <FooterContent>
          <FooterButton onClick={() => addPages(2)}>
            <Plus size={16} />
            הוסף 2 עמודים
          </FooterButton>

          <FooterButton onClick={goToLastPage} disabled={isLoading}>
            <ChevronsRight size={16} />
            אחרון
          </FooterButton>

          <FooterButton onClick={goToNextPage} disabled={getRealPageNumber() === 1 || isLoading}>
            <ArrowRight size={16} />
            הבא
          </FooterButton>

          <PageCounter style={{ background: '#14b8a6', color: 'white' }}>
            {`${getRealPageNumber()} / ${numPages}`}
          </PageCounter>

          <FooterButton onClick={goToPrevPage} disabled={getRealPageNumber() === numPages || isLoading}>
            קודם
            <ArrowLeft size={16} />
          </FooterButton>

          <FooterButton onClick={goToFirstPage} disabled={isLoading}>
            ראשון
            <ChevronsLeft size={16} />
          </FooterButton>
        </FooterContent>
      </Footer>
      
      {/* 🛒 הצגת מודל קנייה */}
      {selectedPage !== null && (
        <BuyModal 
          pageNumber={selectedPage}
          onClose={() => setSelectedPage(null)}
          onConfirm={handleConfirmBuy}
        />
      )}
    </Container>
  );
}