/**
 * IssuesList.jsx
 * רשימת גליונות המגזין - עיצוב תואם לדשבורד
 */

import React, { useEffect, useMemo, useState, useRef } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { CalendarDays, Search, X, Book, ArrowLeft, ChevronLeft } from "lucide-react";
import { getIssues } from "../Services/issuesService";
import { api } from "../Services/api.js";
import { useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import hasederaTheme from "../styles/HasederaTheme";
import ReaderNav from "./ReaderNav";

// 🎯 PDF Worker - גרסה יציבה
if (typeof window !== 'undefined') {
  // Use a stable version that matches react-pdf
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// 🎨 גופנים - נטען דרך index.html
const GlobalFonts = createGlobalStyle`
  /* Fonts are loaded via <link> tag in index.html */
`;

// 🎬 אנימציות
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// 🎨 רקע
const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  scroll-behavior: smooth;
`;

const BackgroundImage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("/image/ChatGPT Image Nov 16, 2025, 08_56_06 PM.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      ${hasederaTheme.colors.background.overlay || 'rgba(26, 26, 26, 0.92)'} 0%,
      rgba(26, 26, 26, 0.88) 50%,
      ${hasederaTheme.colors.background.overlay || 'rgba(26, 26, 26, 0.92)'} 100%
    );
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 2rem;
  
  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    padding: 1rem;
  }
`;

// 🎨 Header
const Header = styled.header`
  max-width: 1400px;
  margin: 0 auto 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: ${fadeIn} 0.8s ease-out;
  
  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Logo = styled.div`
  font-family: ${hasederaTheme.typography.fontFamily?.heading || "'Cormorant Garamond', serif"};
  font-size: 2.5rem;
  font-weight: ${hasederaTheme.typography.fontWeight.light};
  color: ${hasederaTheme.colors.text.white};
  letter-spacing: 4px;
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  
  &:hover {
    color: ${hasederaTheme.colors.primary.main};
  }
  
  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    font-size: 1.8rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${hasederaTheme.colors.background.glass || 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${hasederaTheme.colors.border.glass || 'rgba(255, 255, 255, 0.2)'};
  border-radius: ${hasederaTheme.borderRadius.full};
  color: ${hasederaTheme.colors.text.white};
  font-size: 0.95rem;
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  font-family: inherit;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: ${hasederaTheme.colors.primary.main};
    color: ${hasederaTheme.colors.primary.main};
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateX(4px);
  }
`;

// 🎨 Title Section
const TitleSection = styled.div`
  max-width: 1400px;
  margin: 0 auto 3rem;
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.1s;
  animation-fill-mode: both;
`;

const IconBox = styled.div`
  display: inline-flex;
  padding: ${hasederaTheme.spacing.lg};
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: ${hasederaTheme.borderRadius['2xl']};
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  align-items: center;
  justify-content: center;
  
  svg {
    display: block;
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    flex-shrink: 0;
    width: 48px;
    height: 48px;
  }
`;

const PageTitle = styled.h1`
  font-family: ${hasederaTheme.typography.fontFamily?.heading || "'Cormorant Garamond', serif"};
  font-size: ${hasederaTheme.typography.fontSize['5xl'] || '3rem'};
  font-weight: ${hasederaTheme.typography.fontWeight.light};
  color: ${hasederaTheme.colors.text.white};
  margin-bottom: 1rem;
  letter-spacing: 2px;
  
  span {
    color: ${hasederaTheme.colors.primary.main};
  }
  
  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    font-size: ${hasederaTheme.typography.fontSize['3xl']};
  }
`;

const PageSubtitle = styled.p`
  font-size: ${hasederaTheme.typography.fontSize.lg};
  color: ${hasederaTheme.colors.text.whiteSecondary || 'rgba(255, 255, 255, 0.7)'};
  font-weight: ${hasederaTheme.typography.fontWeight.light};
  max-width: 500px;
  margin: 0 auto;
`;

// 🎨 Search
const SearchWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const SearchBox = styled.div`
  position: relative;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${hasederaTheme.colors.text.whiteTertiary || 'rgba(255, 255, 255, 0.5)'};
  transition: ${hasederaTheme.transitions.base};
  display: block;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1.25rem 3.5rem;
  background: ${hasederaTheme.colors.background.glass || 'rgba(255, 255, 255, 0.05)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${hasederaTheme.colors.border.glass || 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${hasederaTheme.borderRadius.full};
  color: ${hasederaTheme.colors.text.white};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-family: inherit;
  transition: ${hasederaTheme.transitions.base};
  
  &::placeholder {
    color: ${hasederaTheme.colors.text.whiteTertiary || 'rgba(255, 255, 255, 0.5)'};
  }
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &:focus {
    outline: none;
    border-color: ${hasederaTheme.colors.primary.main};
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 4px ${hasederaTheme.colors.primary.main}33;
  }
  
  &:focus + ${SearchIcon} {
    color: ${hasederaTheme.colors.primary.main};
  }
`;

const ClearButton = styled.button`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: ${hasederaTheme.colors.text.whiteSecondary || 'rgba(255, 255, 255, 0.7)'};
  border-radius: ${hasederaTheme.borderRadius.full};
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: ${hasederaTheme.colors.text.white};
  }
`;

// 🎨 Loading
const LoadingState = styled.div`
  padding: 6rem 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Spinner = styled.div`
  width: ${props => props.$large ? '4rem' : '2.5rem'};
  height: ${props => props.$large ? '4rem' : '2.5rem'};
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: ${hasederaTheme.colors.primary.main};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.div`
  color: ${hasederaTheme.colors.text.whiteSecondary || 'rgba(255, 255, 255, 0.7)'};
  font-size: ${hasederaTheme.typography.fontSize.lg};
  font-weight: ${hasederaTheme.typography.fontWeight.medium};
`;

// 🎨 Error & Empty States
const StateBox = styled.div`
  max-width: 500px;
  margin: 4rem auto;
  padding: 3rem 2rem;
  background: ${hasederaTheme.colors.background.glass || 'rgba(255, 255, 255, 0.03)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.$error 
    ? 'rgba(239, 68, 68, 0.3)' 
    : hasederaTheme.colors.border.glass || 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${hasederaTheme.borderRadius['2xl']};
  text-align: center;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const StateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: ${props => props.$error 
    ? hasederaTheme.colors.status.error 
    : hasederaTheme.colors.primary.main};
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    display: block;
    width: 4rem;
    height: 4rem;
    flex-shrink: 0;
  }
`;

const StateTitle = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.xl};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${props => props.$error 
    ? hasederaTheme.colors.status.error 
    : hasederaTheme.colors.text.white};
  margin-bottom: 0.5rem;
`;

const StateText = styled.p`
  color: ${hasederaTheme.colors.text.whiteSecondary || 'rgba(255, 255, 255, 0.7)'};
  font-size: ${hasederaTheme.typography.fontSize.base};
`;

// 🎨 Grid
const GridContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 2rem;
  
  @media (min-width: ${hasederaTheme.breakpoints.lg}) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  @media (min-width: ${hasederaTheme.breakpoints.xl}) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
`;

// 🎨 Card - שונה מ-button ל-div כדי למנוע כפתור בתוך כפתור
const Card = styled.div`
  background: ${hasederaTheme.colors.background.glass || 'rgba(255, 255, 255, 0.03)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${hasederaTheme.colors.border.glass || 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${hasederaTheme.borderRadius['2xl']};
  overflow: hidden;
  cursor: pointer;
  text-align: right;
  padding: 0;
  position: relative;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 60px, 0) scale(0.95)'};
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: ${props => props.$delay || '0s'};
  will-change: ${props => props.$visible ? 'auto' : 'transform, opacity'};
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, ${hasederaTheme.colors.primary.main}, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    background: ${hasederaTheme.colors.background.glassLight || 'rgba(255, 255, 255, 0.08)'};
    border-color: ${hasederaTheme.colors.border.glassHover || 'rgba(16, 185, 129, 0.4)'};
    transform: ${props => props.$visible ? 'translate3d(0, -8px, 0) scale(1.02)' : 'translate3d(0, 60px, 0) scale(0.95)'};
    box-shadow: ${hasederaTheme.shadows.card || '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)'};
    
    &::before {
      opacity: 1;
    }
  }
`;

const CardImage = styled.div`
  aspect-ratio: 3/4;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }
  
  ${Card}:hover & img {
    transform: scale(1.05);
  }
`;

const Placeholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: ${hasederaTheme.colors.text.whiteTertiary || 'rgba(255, 255, 255, 0.5)'};
  padding: 2rem 1rem;
  
  svg {
    opacity: 0.5;
  }
  
  div {
    font-size: ${hasederaTheme.typography.fontSize.sm};
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardTitle = styled.h3`
  font-family: ${hasederaTheme.typography.fontFamily?.heading || "'Cormorant Garamond', serif"};
  font-weight: ${hasederaTheme.typography.fontWeight.medium};
  color: ${hasederaTheme.colors.text.white};
  font-size: ${hasederaTheme.typography.fontSize.xl};
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: ${hasederaTheme.transitions.base};
  
  ${Card}:hover & {
    color: ${hasederaTheme.colors.primary.light};
  }
`;

const CardDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${hasederaTheme.colors.text.whiteSecondary || 'rgba(255, 255, 255, 0.7)'};
  font-size: ${hasederaTheme.typography.fontSize.sm};
  margin-bottom: 1rem;
  
  svg {
    color: ${hasederaTheme.colors.primary.main};
  }
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid ${hasederaTheme.colors.border.glass || 'rgba(255, 255, 255, 0.1)'};
`;

const OpenLink = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${hasederaTheme.colors.primary.main};
  font-size: ${hasederaTheme.typography.fontSize.sm};
  font-weight: ${hasederaTheme.typography.fontWeight.medium};
  transition: ${hasederaTheme.transitions.base};
  
  ${Card}:hover & {
    gap: 0.75rem;
    color: ${hasederaTheme.colors.primary.light};
  }
`;

const ArrowCircle = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${hasederaTheme.borderRadius.full};
  background: ${hasederaTheme.colors.gradient.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${hasederaTheme.colors.text.white};
  transition: ${hasederaTheme.transitions.base};
  box-shadow: ${hasederaTheme.shadows.green};
  
  ${Card}:hover & {
    transform: scale(1.1);
    box-shadow: ${hasederaTheme.shadows.greenHover};
  }
`;

// 🎨 PDF Cover
const PDFCoverWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PDFLoading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: ${hasederaTheme.colors.text.whiteSecondary || 'rgba(255, 255, 255, 0.7)'};
  font-size: ${hasederaTheme.typography.fontSize.sm};
`;

// 🎨 Footer
const Footer = styled.footer`
  max-width: 1400px;
  margin: 4rem auto 0;
  padding: 2rem 0;
  border-top: 1px solid ${hasederaTheme.colors.border.glass || 'rgba(255, 255, 255, 0.1)'};
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  animation: ${fadeIn} 0.8s ease-out;
  animation-delay: 0.5s;
  animation-fill-mode: both;
`;

const FooterButton = styled.button`
  padding: 1rem 2rem;
  background: ${hasederaTheme.colors.background.glass || 'rgba(255, 255, 255, 0.05)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${hasederaTheme.colors.border.glass || 'rgba(255, 255, 255, 0.1)'};
  border-radius: ${hasederaTheme.borderRadius.full};
  color: ${hasederaTheme.colors.text.white};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-family: inherit;
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: ${hasederaTheme.colors.primary.main};
    color: ${hasederaTheme.colors.primary.main};
  }
`;

const PrimaryButton = styled.button`
  padding: 1rem 2rem;
  background: ${hasederaTheme.colors.gradient.primary};
  border: none;
  border-radius: ${hasederaTheme.borderRadius.full};
  color: ${hasederaTheme.colors.text.white};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  font-family: inherit;
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  box-shadow: ${hasederaTheme.shadows.green};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${hasederaTheme.shadows.greenHover};
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

// Memoized PDF options to prevent unnecessary reloads
const pdfOptions = {
  cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
  standardFontDataUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/",
};

const buildIssuePdfProxyUrl = (issueId) => {
  if (!issueId) return "";
  const base = api.defaults.baseURL;
  if (!base) return `/api/issues/${issueId}/pdf`;
  return `${base}/issues/${issueId}/pdf`;
};

const isPresignedExpired = (url) => {
  try {
    const parsed = new URL(url);
    const amzDate = parsed.searchParams.get("X-Amz-Date");
    const amzExpires = parsed.searchParams.get("X-Amz-Expires");
    if (!amzDate || !amzExpires) return false;

    const yyyy = Number(amzDate.slice(0, 4));
    const mm = Number(amzDate.slice(4, 6)) - 1;
    const dd = Number(amzDate.slice(6, 8));
    const hh = Number(amzDate.slice(9, 11));
    const min = Number(amzDate.slice(11, 13));
    const ss = Number(amzDate.slice(13, 15));
    const issuedAt = new Date(Date.UTC(yyyy, mm, dd, hh, min, ss));
    const expiresSeconds = Number(amzExpires || 0);
    if (!issuedAt.getTime() || !expiresSeconds) return false;

    const expiresAt = new Date(issuedAt.getTime() + expiresSeconds * 1000);
    return Date.now() > expiresAt.getTime();
  } catch {
    return false;
  }
};

const resolveIssuePdfUrl = (issue) => {
  if (!issue) return "";
  const url =
    issue.pdf_url ||
    issue.pdfUrl ||
    issue.file_url ||
    issue.fileUrl ||
    "";

  if (!url) return "";
  if (url.startsWith("pending-upload-")) return "";
  if (url.startsWith("/uploads/")) return "";
  if (url.startsWith("/api/issues/draft-file/")) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (isPresignedExpired(url)) return "";
    return url;
  }

  // fallback to proxy when URL is relative but we have an issue id
  const issueId = issue.issue_id || issue.issueId || issue.id;
  return buildIssuePdfProxyUrl(issueId);
};


const normalizeIssueForViewer = (issue) => {
  if (!issue) return issue;
  const issueId = issue.issue_id || issue.issueId || issue.id;
  const pdfCandidate =
    issue.pdf_url ||
    issue.pdfUrl ||
    issue.file_url ||
    issue.fileUrl ||
    "";
  const resolvedPdf =
    pdfCandidate && !isPresignedExpired(pdfCandidate)
      ? pdfCandidate
      : (issueId ? buildIssuePdfProxyUrl(issueId) : issue.file_url || issue.fileUrl || "");

  return {
    ...issue,
    pdf_url: resolvedPdf,
    fileUrl: issue.fileUrl || issue.file_url || issue.pdfUrl || issue.pdf_url || "",
  };
};

function PDFCover({ pdfUrl, title, shouldLoad }) {
  // Memoize options to prevent re-renders
  const memoizedOptions = useMemo(() => pdfOptions, []);
  const [retryCount, setRetryCount] = useState(0);

  // Don't load PDF until card is visible
  if (!shouldLoad) {
    return (
      <PDFLoading>
        <CalendarDays size={40} opacity={0.2} />
        <div style={{ fontSize: '0.85rem' }}>ממתין...</div>
      </PDFLoading>
    );
  }

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
            {retryCount < 2 && (
              <button
                onClick={() => {
                  setRetryCount(prev => prev + 1);
                }}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                נסה שוב
              </button>
            )}
          </PDFLoading>
        }
        options={memoizedOptions}
        onLoadError={(error) => {
          console.error('PDF load error:', error);
        }}
        key={retryCount}
      >
        <Page
          pageNumber={1}
          width={280}
          renderMode="canvas"
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </PDFCoverWrapper>
  );
}

// 🔹 Main Component
export default function IssuesList({ showAdvertiserActions = true, showReaderNav = false }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [visibleCards, setVisibleCards] = useState(new Set());
  const cardRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await getIssues(1, 100, true); // publishedOnly=true - רק גליונות שפורסמו
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

  // Intersection Observer for card animations - optimized
  useEffect(() => {
    if (loading || filtered.length === 0) return;

    // Show first 6 cards immediately (above the fold)
    const initialVisible = new Set();
    filtered.slice(0, 6).forEach((it) => {
      initialVisible.add(`card-${it.issue_id}`);
    });
    setVisibleCards(initialVisible);

    // Track which cards are already visible to avoid duplicate updates
    const observedCards = new Set();
    initialVisible.forEach(id => observedCards.add(id));

    // Use requestAnimationFrame to batch updates
    const pendingUpdates = new Set();
    let rafId = null;

    const flushUpdates = () => {
      if (pendingUpdates.size > 0) {
        setVisibleCards(prev => {
          const next = new Set(prev);
          pendingUpdates.forEach(id => {
            next.add(id);
            observedCards.add(id);
          });
          return next;
        });
        pendingUpdates.clear();
      }
      rafId = null;
    };

    const observerOptions = {
      threshold: 0.01,
      rootMargin: '150px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cardId = entry.target.getAttribute('data-card-id');
          if (cardId && !observedCards.has(cardId)) {
            pendingUpdates.add(cardId);
            
            if (!rafId) {
              rafId = requestAnimationFrame(flushUpdates);
            }
            
            setTimeout(() => {
              observer.unobserve(entry.target);
            }, 1000);
          }
        }
      });
    }, observerOptions);

    // Delay to ensure DOM is ready, then observe all cards
    const timeoutId = setTimeout(() => {
      filtered.forEach((it, index) => {
        const cardId = `card-${it.issue_id}`;
        const ref = cardRefs.current[cardId];
        // Skip first 6 as they're already visible
        if (ref && index >= 6 && !observedCards.has(cardId)) {
          observer.observe(ref);
        }
      });
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
      Object.values(cardRefs.current).forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [filtered, loading]);

  // Reset visible cards when filter changes - but show first 6 immediately
  useEffect(() => {
    if (filtered.length > 0) {
      const initialVisible = new Set();
      filtered.slice(0, 6).forEach((it) => {
        initialVisible.add(`card-${it.issue_id}`);
      });
      setVisibleCards(initialVisible);
    } else {
      setVisibleCards(new Set());
    }
    // Clear refs for filtered out cards
    Object.keys(cardRefs.current).forEach(key => {
      if (!filtered.some(it => `card-${it.issue_id}` === key)) {
        delete cardRefs.current[key];
      }
    });
  }, [query, filtered]);

  const openIssue = (it) => {
    console.log("🧪 issue clicked:", it);
    navigate(`/issues/${it.issue_id}`, { state: normalizeIssueForViewer(it) });
  };

  return (
    <>
      <GlobalFonts />
      <PageWrapper>
        <BackgroundImage />
        
        {/* Navigation */}
        {showReaderNav ? (
          <ReaderNav />
        ) : (
          <Header>
            <Logo onClick={() => navigate('/')}><img src="/logo.png" alt="השדרה" style={{ height: '40px', width: 'auto', backgroundColor: 'white', padding: '4px 8px', borderRadius: '8px' }} /></Logo>
            {showAdvertiserActions && (
              <BackButton onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={18} />
                חזרה לאזור המפרסמים
              </BackButton>
            )}
          </Header>
        )}

        <ContentWrapper>

          {/* Title */}
          <TitleSection>
            <IconBox>
              <Book size={32} />
            </IconBox>
            <PageTitle>גליונות <span>המגזין</span></PageTitle>
            <PageSubtitle>
              {showAdvertiserActions ? "עלעלי בגליונות, בחרי מיקום לפרסום" : "עייני בארכיון הגליונות"}
            </PageSubtitle>
          </TitleSection>

          {/* Search */}
          <SearchWrapper>
            <SearchBox>
              <SearchInput 
                type="text"
                placeholder="חיפוש לפי שם או תאריך..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <SearchIcon size={20} />
              {query && (
                <ClearButton onClick={() => setQuery("")}>
                  <X size={16} />
                </ClearButton>
              )}
            </SearchBox>
          </SearchWrapper>

          {/* Loading */}
          {loading && (
            <LoadingState>
              <Spinner $large />
              <LoadingText>טוען גליונות...</LoadingText>
            </LoadingState>
          )}

          {/* Error */}
          {!loading && error && (
            <StateBox $error>
              <StateIcon $error>
                <CalendarDays size={48} />
              </StateIcon>
              <StateTitle $error>שגיאה בטעינת גליונות</StateTitle>
              <StateText>{error}</StateText>
            </StateBox>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <StateBox>
              <StateIcon>
                <Search size={48} />
              </StateIcon>
              <StateTitle>לא נמצאו תוצאות</StateTitle>
              {query && <StateText>נסי לחפש משהו אחר</StateText>}
            </StateBox>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <GridContainer>
              <Grid>
                {filtered.map((it, index) => {
                  const cardId = `card-${it.issue_id}`;
                  const isVisible = visibleCards.has(cardId);
                  // Reduced delay for smoother performance
                  const delay = `${Math.min(index * 0.05, 0.4)}s`;
                  
                  return (
                    <Card 
                      key={it.issue_id}
                      ref={el => {
                        if (el) cardRefs.current[cardId] = el;
                      }}
                      data-card-id={cardId}
                      $visible={isVisible}
                      $delay={delay}
                      onClick={() => openIssue(it)}
                    >
                      <CardImage>
                        {it.coverImage ? (
                          <img src={it.coverImage} alt={it.title} />
                        ) : resolveIssuePdfUrl(it) ? (
                          <PDFCover 
                            pdfUrl={resolveIssuePdfUrl(it)} 
                            title={it.title}
                            shouldLoad={isVisible}
                          />
                        ) : (
                          <Placeholder>
                            <CalendarDays size={48} />
                            <div>אין תמונת שער</div>
                          </Placeholder>
                        )}
                      </CardImage>
                      <CardContent>
                        <CardTitle>{it.title}</CardTitle>
                        <CardDate>
                          <CalendarDays size={16} />
                          <span>{formatDateHeb(it.issueDate)}</span>
                        </CardDate>
                        <CardFooter>
                          <OpenLink>
                            <span>פתיחה</span>
                            <ChevronLeft size={16} />
                          </OpenLink>
                          <ArrowCircle>
                            <ChevronLeft size={18} />
                          </ArrowCircle>
                        </CardFooter>
                      </CardContent>
                    </Card>
                  );
                })}
              </Grid>
            </GridContainer>
          )}

          {/* Footer */}
          {showAdvertiserActions && (
            <Footer>
              <FooterButton onClick={() => navigate("/dashboard")}>
                חזרה לאזור המפרסמים
              </FooterButton>
              <PrimaryButton onClick={() => navigate("/advertiser/placement")}>
                הזמנת מיקום חדש
              </PrimaryButton>
            </Footer>
          )}
        </ContentWrapper>
      </PageWrapper>
    </>
  );
}