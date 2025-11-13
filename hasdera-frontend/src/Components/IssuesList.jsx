import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { CalendarDays, ExternalLink, Search, X , Book} from "lucide-react";
import { getIssues } from "../Services/issuesService";
import { useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";


// 🎯 שימוש בגרסת Worker של pdf.js 4.0.379 (תואמת לגרסאות react-pdf אחרונות)
pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js";

// 🎨 Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #f9fafb, white);
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const HeaderContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const IconBox = styled.div`
  padding: 0.625rem;
  background: #f0fdfa;
  border-radius: 0.75rem;
  
  svg {
    color: #0f766e;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Badge = styled.span`
  padding: 0.375rem 1rem;
  background: #f0fdfa;
  color: #0f766e;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const SearchWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const SearchBox = styled.div`
  position: relative;
  width: 100%;
  max-width: 42rem;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    border-color: #d1d5db;
  }
  
  &:focus {
    border-color: #14b8a6;
    box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.375rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #4b5563;
  }
`;

const LoadingState = styled.div`
  padding: 5rem 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: ${props => props.large ? '3.5rem' : '3rem'};
  height: ${props => props.large ? '3.5rem' : '3rem'};
  border: 4px solid #14b8a6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorState = styled.div`
  max-width: 48rem;
  margin: 2.5rem auto;
  padding: 0 1rem;
`;

const ErrorBox = styled.div`
  padding: 1.5rem;
  background: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 1rem;
  color: #991b1b;
  display: flex;
  gap: 0.75rem;
  
  h3 {
    font-weight: 600;
    margin: 0 0 0.25rem 0;
  }
  
  p {
    font-size: 0.875rem;
    margin: 0;
  }
`;

const EmptyState = styled.div`
  max-width: 48rem;
  margin: 5rem auto;
  padding: 0 1rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 4.5rem;
  margin-bottom: 1.5rem;
`;

const GridContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.75rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const Card = styled.button`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  text-align: right;
  padding: 0;
  
  &:hover {
    border-color: #14b8a6;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    transform: translateY(-0.5rem);
  }
`;

const CardImage = styled.div`
  aspect-ratio: 3/4;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }
  
  ${Card}:hover & img {
    transform: scale(1.05);
  }
`;

const Placeholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
  padding: 1rem;
  
  svg {
    opacity: 0.3;
  }
  
  div {
    font-size: 0.75rem;
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s;
  
  ${Card}:hover & {
    opacity: 1;
  }
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const CardTitle = styled.h3`
  font-weight: 700;
  color: #111827;
  font-size: 1rem;
  line-height: 1.4;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
  
  ${Card}:hover & {
    color: #0f766e;
  }
`;

const CardDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
  border-top: 1px solid #f3f4f6;
`;

const OpenLink = styled.span`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #0f766e;
  font-size: 0.875rem;
  font-weight: 600;
  transition: gap 0.2s;
  
  ${Card}:hover & {
    gap: 0.625rem;
  }
`;

const ArrowCircle = styled.div`
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: #f0fdfa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 700;
  transition: all 0.2s;
  
  ${Card}:hover & {
    background: #14b8a6;
    color: white;
  }
`;

const PDFCoverWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PDFLoading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const Footer = styled.footer`
  max-width: 1280px;
  margin: 3rem auto 0;
  padding: 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
`;

const FooterButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    border-color: #14b8a6;
    background: #f0fdfa;
    color: #0f766e;
  }
`;

const PrimaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #0d9488;
  }
`;

// 🔹 Helper functions
function formatDateHeb(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function PDFCover({ pdfUrl, title }) {
  return (
    <PDFCoverWrapper>
      <Document
        file={pdfUrl}
        loading={
          <PDFLoading>
            <Spinner />
            <div>טוען שער...</div>
          </PDFLoading>
        }
        error={
          <PDFLoading>
            <CalendarDays size={40} opacity={0.4} />
            <div>שגיאה בטעינת שער</div>
          </PDFLoading>
        }
        options={{
          cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
          standardFontDataUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/",
        }}
      >
        <Page
          pageNumber={1}
          width={250}
          renderMode="canvas"
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </PDFCoverWrapper>
  );
}

// 🔹 Main Component
export default function IssuesList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await getIssues();
        if (!on) return;
        rows.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
        setIssues(rows);
      } catch (e) {
        setError(`לא ניתן לטעון גליונות (${e.message})`);
      } finally {
        setLoading(false);
      }
    })();
    return () => (on = false);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return issues;
    return issues.filter((x) =>
      [x.title, formatDateHeb(x.issueDate)].some((f) =>
        (f || "").toLowerCase().includes(q.toLowerCase())
      )
    );
  }, [issues, query]);

  const openIssue = (it) => {
    console.log("🧪 issue clicked:", it);
    navigate(`/issues/${it.issue_id}`, { state: it });
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <HeaderTitle>
            <IconBox> <Book size={24} /> </IconBox>
            <Title>כל הגליונות</Title>
          </HeaderTitle>
        </HeaderContent>
      </Header>
      <SearchWrapper>
        <SearchBox>
          <SearchIcon />
          <SearchInput 
            type="text"
            placeholder="חפש גליון שער..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <ClearButton onClick={() => setQuery("")}>
              <X size={16} />
            </ClearButton>
          )}
        </SearchBox>
      </SearchWrapper>
      {loading && (
        <LoadingState>
          <Spinner />
          <div>טוען גליונות...</div>
        </LoadingState>
      )}
      {!loading && error && (
        <ErrorState>
          <ErrorBox>
            <CalendarDays size={40} opacity={0.4} />
            <div>שגיאה בטעינת גליונות</div>
          </ErrorBox>
        </ErrorState>
      )}  
      {!loading && !error && filtered.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <Search size={40} opacity={0.4} />
          </EmptyIcon>
          <div>לא נמצאו תוצאות</div>
        </EmptyState>
      )}
      {!loading && !error && filtered.length > 0 && (
        <GridContainer>
          <Grid>
              {filtered.map((it) => (
              <Card key={it.issue_id} onClick={() => openIssue(it)}>
                <CardImage>
                  {it.coverImage ? (
                    <img src={it.coverImage} alt={it.title} />
                  ) : it.pdf_url ? (
                    <PDFCover pdfUrl={it.pdf_url} title={it.title} />
                  ) : (
                    <Placeholder>
                      <CalendarDays size={48} />
                      <div>אין תמונת שער</div>
                    </Placeholder>
                  )}
                  <Overlay />
                </CardImage>
                <CardContent>
                  <CardTitle>{it.title}</CardTitle>
                  <CardDate>
                    <CalendarDays size={16} />
                    <span>{formatDateHeb(it.issueDate)}</span>
                  </CardDate>
                </CardContent>
                <CardFooter>
                  <OpenLink>
                    <span>פתיחה</span>
                    <ExternalLink size={16} />
                  </OpenLink>
                  <ArrowCircle>
                    <span>←</span>
                  </ArrowCircle>
                </CardFooter>
              </Card>
            ))}
          </Grid>
        </GridContainer>
      )}
      <Footer>
        <FooterButton onClick={() => navigate("/")}>חזרה לדף הבית</FooterButton>
        <PrimaryButton onClick={() => navigate("/issues/new")}>יצירת גליון חדש</PrimaryButton>
      </Footer>
    </Container>
  );
}