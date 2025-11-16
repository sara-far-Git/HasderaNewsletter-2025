import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { CalendarDays, ExternalLink, Search, X , Book} from "lucide-react";
import { getIssues } from "../Services/issuesService";
import { useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { Badge as ThemeBadge, Input, PageHeader, PageTitle, Container as ThemeContainer, Grid, Spinner as ThemeSpinner, PrimaryButton as ThemePrimaryButton, SecondaryButton } from "../styles";
import hasederaTheme from "../styles/HasederaTheme";


// 🎯 שימוש בגרסת Worker של pdf.js 4.0.379 (תואמת לגרסאות react-pdf אחרונות)
pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js";

// 🎨 Styled Components עם Theme
const Container = styled(ThemeContainer)`
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background: ${hasederaTheme.colors.background.main};
  position: relative;
  overflow-x: hidden;
`;

const Header = styled(PageHeader)`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid ${hasederaTheme.colors.primary.main}33;
  box-shadow: ${hasederaTheme.shadows.md};
  margin-bottom: 0;
`;

const HeaderContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${hasederaTheme.spacing.xl} ${hasederaTheme.spacing['2xl']};
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${hasederaTheme.spacing.md};
  margin-bottom: ${hasederaTheme.spacing.xl};
`;

const IconBox = styled.div`
  padding: ${hasederaTheme.spacing.md};
  background: ${hasederaTheme.colors.gradient.primary};
  border-radius: ${hasederaTheme.borderRadius.lg};
  box-shadow: ${hasederaTheme.shadows.green};
  animation: float 3s ease-in-out infinite;
  border: 2px solid rgba(255, 215, 0, 0.3);
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  svg {
    color: ${hasederaTheme.colors.text.white};
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
`;

const Title = styled(PageTitle)`
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.dark} 0%, ${hasederaTheme.colors.primary.main} 50%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const BadgeStyled = styled(ThemeBadge)`
  padding: ${hasederaTheme.spacing.sm} ${hasederaTheme.spacing.lg};
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.main}26 0%, ${hasederaTheme.colors.primary.dark}26 100%);
  color: ${hasederaTheme.colors.primary.dark};
  border: 1px solid ${hasederaTheme.colors.primary.main}4d;
  backdrop-filter: blur(10px);
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

const SearchInput = styled(Input)`
  padding: ${hasederaTheme.spacing.md} 3.5rem;
  border: 2px solid ${hasederaTheme.colors.primary.main}4d;
  border-radius: ${hasederaTheme.borderRadius.full};
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: ${hasederaTheme.shadows.base};
  
  &:hover {
    border-color: ${hasederaTheme.colors.primary.main}80;
    box-shadow: ${hasederaTheme.shadows.md};
  }
  
  &:focus {
    border-color: ${hasederaTheme.colors.primary.main};
    box-shadow: 0 0 0 4px ${hasederaTheme.colors.primary.main}33, ${hasederaTheme.shadows.lg};
    transform: translateY(-2px);
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
  padding: 6rem 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const Spinner = styled.div`
  width: ${props => props.$large ? '4rem' : '3.5rem'};
  height: ${props => props.$large ? '4rem' : '3.5rem'};
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorState = styled.div`
  max-width: 48rem;
  margin: 3rem auto;
  padding: 0 1rem;
`;

const ErrorBox = styled.div`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 1.5rem;
  color: #dc2626;
  display: flex;
  gap: 1rem;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.2);
  
  h3 {
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }
  
  p {
    font-size: 1rem;
    margin: 0;
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  max-width: 48rem;
  margin: 6rem auto;
  padding: 0 1rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 2rem;
  padding: 4rem 2rem;
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.1);
  border: 2px solid rgba(34, 197, 94, 0.2);
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 2rem;
  opacity: 0.6;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  color: #22c55e;
`;

const GridContainer = styled(ThemeContainer)`
  padding: ${hasederaTheme.spacing['2xl']} ${hasederaTheme.spacing['2xl']};
`;

const GridStyled = styled(Grid)`
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: ${hasederaTheme.spacing['2xl']};
  
  @media (min-width: ${hasederaTheme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  
  @media (min-width: ${hasederaTheme.breakpoints.lg}) {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: ${hasederaTheme.spacing['2xl']};
  }
  
  @media (min-width: ${hasederaTheme.breakpoints.xl}) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
`;

const Card = styled.button`
  background: transparent;
  border: none;
  border-radius: 0;
  overflow: visible;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-align: right;
  padding: 0;
  position: relative;
  
  &:hover {
    transform: translateY(-8px) scale(1.03);
  }
  
  &:active {
    transform: translateY(-4px) scale(1.01);
  }
`;

const CardImage = styled.div`
  aspect-ratio: 3/4;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.15));
    border-radius: 0.5rem;
  }
  
  ${Card}:hover & img {
    transform: scale(1.05);
    filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.25));
  }
`;

const Placeholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  padding: 2rem 1rem;
  
  svg {
    opacity: 0.5;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
  
  div {
    font-size: 0.875rem;
    font-weight: 500;
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(34, 197, 94, 0.1) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
  z-index: 1;
  pointer-events: none;
  
  ${Card}:hover & {
    opacity: 1;
  }
`;

const CardContent = styled.div`
  padding: 1.25rem 0.5rem;
  background: transparent;
  position: relative;
  z-index: 2;
`;

const CardTitle = styled.h3`
  font-weight: 700;
  color: #1a1a2e;
  font-size: 1.125rem;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s;
  
  ${Card}:hover & {
    color: #16a34a;
    transform: translateX(-4px);
  }
`;

const CardDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  font-weight: 500;
  
  svg {
    color: #22c55e;
  }
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(34, 197, 94, 0.2);
`;

const OpenLink = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #16a34a;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s;
  
  ${Card}:hover & {
    gap: 0.75rem;
    color: #22c55e;
    transform: translateX(-4px);
  }
`;

const ArrowCircle = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  border: 2px solid rgba(255, 215, 0, 0.3);
  
  ${Card}:hover & {
    transform: scale(1.15) rotate(-5deg);
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
    border-color: rgba(255, 215, 0, 0.5);
  }
`;

const PDFCoverWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const PDFLoading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 1;
  position: relative;
  
  div {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const Footer = styled.footer`
  max-width: 1400px;
  margin: 4rem auto 0;
  padding: 3rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
`;

const FooterButton = styled(SecondaryButton)`
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing['2xl']};
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: ${hasederaTheme.shadows.base};
  
  &:hover {
    border-color: rgba(34, 197, 94, 0.5);
    background: rgba(255, 255, 255, 1);
    color: #22c55e;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(34, 197, 94, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const PrimaryButtonStyled = styled(ThemePrimaryButton)`
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing['2xl']};
  border: 2px solid rgba(255, 215, 0, 0.3);
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
          <Spinner $large />
          <div style={{ 
            color: 'white', 
            fontSize: '1.25rem', 
            fontWeight: 600,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            טוען גליונות...
          </div>
        </LoadingState>
      )}
      {!loading && error && (
        <ErrorState>
          <ErrorBox>
            <CalendarDays size={48} style={{ color: '#dc2626', opacity: 0.8 }} />
            <div>
              <h3>שגיאה בטעינת גליונות</h3>
              <p>{error}</p>
            </div>
          </ErrorBox>
        </ErrorState>
      )}  
      {!loading && !error && filtered.length === 0 && (
        <EmptyState>
          <EmptyIcon>
            <Search size={64} />
          </EmptyIcon>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: 600, 
            color: '#16a34a',
            marginTop: '1rem'
          }}>
            לא נמצאו תוצאות
          </div>
          {query && (
            <div style={{ 
              fontSize: '1rem', 
              color: '#6b7280',
              marginTop: '0.5rem'
            }}>
              נסה לחפש משהו אחר
            </div>
          )}
        </EmptyState>
      )}
      {!loading && !error && filtered.length > 0 && (
        <GridContainer>
          <GridStyled>
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
          </GridStyled>
        </GridContainer>
      )}
      <Footer>
        <FooterButton onClick={() => navigate("/")}>חזרה לדף הבית</FooterButton>
        <PrimaryButtonStyled onClick={() => navigate("/issues/new")}>יצירת גליון חדש</PrimaryButtonStyled>
      </Footer>
    </Container>
  );
}