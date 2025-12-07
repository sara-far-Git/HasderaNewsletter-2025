/**
 * AdminFlipbookViewer.jsx
 * צופה מגזין מתקדם עם Real3D FlipBook לאזור הניהול
 * כולל אפשרות להוספת קישורים ואנימציות
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Link, X, Save, Send, Edit2, Plus, Trash2, Zap, Mail, ExternalLink, Phone, MapPin, Calendar, Clock, Star, Heart, ShoppingCart, User, Home } from "lucide-react";
import { getIssueById, updateIssueMetadata, publishIssue } from "../Services/issuesService";

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

const fadeOut = keyframes`
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
`;

const blink = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
`;

// 🎨 CSS גלובלי - כולל הסתרת ממשק Real3D
const FlipbookStyles = createGlobalStyle`
  /* ========================================
     הסתרת ממשק Real3D המובנה
     ======================================== */
  
  /* הסתרת ה-header/toolbar של Real3D */
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
  
  /* הסתרת כפתורי fullscreen, share וכו' של Real3D */
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
  .flipbook-btn-autoplay,
  .flipbook-btn-sound,
  .flipbook-zoom-menu,
  .flipbook-currentPage,
  .flipbook-page-input,
  .flipbook-total-pages {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* הסתרת חצי הניווט של Real3D - נשתמש בחצים שלנו */
  .flipbook-nav,
  .flipbook-left-arrow,
  .flipbook-right-arrow,
  .flipbook-arrow,
  .flipbook-btn-prev,
  .flipbook-btn-next,
  .flipbook-first-arrow,
  .flipbook-last-arrow,
  .flipbook-side-buttons,
  [class*="flipbook-arrow"],
  [class*="flipbook-btn-prev"],
  [class*="flipbook-btn-next"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  /* ========================================
     סגנונות כלליים לספר
     ======================================== */
  
  .flipbook-page3,
  .flipbook-page3-inner {
    transform-style: preserve-3d !important;
    -webkit-transform-style: preserve-3d !important;
  }

  .flipbook-page3-inner * {
    backface-visibility: visible !important;
    -webkit-backface-visibility: visible !important;
  }

  /* סמן עכבר */
  .flipbook-bookLayer,
  .flipbook-book-webgl,
  .flipbook-book-webgl canvas {
    cursor: default !important;
  }
  
  /* וידוא שהספר מוצג */
  .flipbook,
  .flipbook-book,
  .flipbook-bookLayer,
  .flipbook-book-webgl {
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
  }

  .flipbook-hidden {
    display: none !important;
  }
  
  /* וידוא שה-container של הספר מוצג */
  .flipbook-container,
  .flipbook-wrapper,
  .flipbook-viewport {
    visibility: visible !important;
    opacity: 1 !important;
  }
  
  /* תיקון איקונים בתוך העמודים */
  .flipbook-page-html img,
  .flipbook-page-html svg,
  .flipbook-page-html [class*="icon"],
  .flipbook-page-html [class*="Icon"],
  .flipbook-page-html canvas,
  .flipbook-page-html .htmlContent img,
  .flipbook-page-html .htmlContent svg {
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    max-width: 100% !important;
    height: auto !important;
  }
  
  /* וידוא שאיקונים בתוך PDF מוצגים */
  .flipbook-page-html *,
  .flipbook-page-html .htmlContent * {
    visibility: visible !important;
  }

  .flipbook-page-html svg,
  .flipbook-page-html .htmlContent svg {
    display: inline-block !important;
    width: auto !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: 100% !important;
    fill: currentColor !important;
  }
  
  /* וידוא ש-images בתוך PDF מוצגים */
  .flipbook-page-html img,
  .flipbook-page-html .htmlContent img {
    display: inline-block !important;
    visibility: visible !important;
    opacity: 1 !important;
    max-width: 100% !important;
    height: auto !important;
  }
  
  /* וידוא שה-canvas של PDF מוצג */
  .flipbook-page-html canvas,
  .flipbook-bookLayer canvas {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 100% !important;
    height: auto !important;
  }
`;

// 🎨 Main Container
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
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeInUp} 0.5s ease-out;
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
`;

const HeaderTitle = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  letter-spacing: 1px;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant',
})`
  padding: 0.5rem 1rem;
  background: ${props => {
    if (props.$variant === 'primary') return 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)';
    if (props.$variant === 'success') return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (props.$variant === 'danger') return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageCounter = styled.div`
  padding: 0.5rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: 'Assistant', sans-serif;
  
  span {
    color: #10b981;
    font-weight: 600;
  }
`;

// 🔧 תיקון: הסרת סגנונות SVG מה-IconButton
const IconButton = styled.button`
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  
  &:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: #10b981;
    color: #10b981;
    transform: scale(1.05);
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
  top: 74px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  visibility: visible !important;
  opacity: 1 !important;
  overflow: visible !important;
`;

const FlipbookContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  
  /* וידוא שהספר מוצג */
  & > div {
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
  }
`;

// ============================================
// 🎯 חצי ניווט מותאמים אישית
// ============================================
const NavigationArrow = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'side' && prop !== 'disabled',
})`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  display: flex !important;
  visibility: visible !important;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  z-index: 10002;
  transition: all 0.3s ease;
  opacity: ${props => props.$disabled ? 0.4 : 1};
  pointer-events: ${props => props.$disabled ? 'auto' : 'auto'};
  
  ${props => props.$side === 'right' ? 'right: 30px;' : 'left: 30px;'}
  
  &:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.8);
    border-color: #10b981;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 25px rgba(16, 185, 129, 0.5);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-50%) scale(0.95);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    ${props => props.$side === 'right' ? 'right: 15px;' : 'left: 15px;'}
  }
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
  gap: 2rem;
`;

const Spinner = styled.div`
  width: 64px;
  height: 64px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  font-family: 'Assistant', sans-serif;
`;

// 🎨 Error
const ErrorBox = styled.div`
  max-width: 400px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 24px;
  text-align: center;
`;

const ErrorTitle = styled.h3`
  color: #ef4444;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  font-family: 'Assistant', sans-serif;
`;

const ErrorMessage = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

const RetryButton = styled.button`
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 50px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
`;

// 🔧 איקונים
const ZoomInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
    <path d="M11 8v6"/>
    <path d="M8 11h6"/>
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
    <path d="M8 11h6"/>
  </svg>
);

const MaximizeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
    <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
    <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
    <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18"/>
    <path d="M6 6l12 12"/>
  </svg>
);

// 🔧 חצי ניווט
const ChevronLeftIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// 🎯 Link Overlay Component
const LinkOverlay = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isEditing',
})`
  position: absolute;
  top: ${props => props.y}px;
  left: ${props => props.x}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: 2px dashed ${props => props.$isEditing ? '#14b8a6' : 'rgba(20, 184, 166, 0.5)'};
  background: ${props => props.$isEditing ? 'rgba(20, 184, 166, 0.1)' : 'rgba(20, 184, 166, 0.05)'};
  cursor: grab;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  user-select: none;
  
  &:hover {
    background: rgba(20, 184, 166, 0.2);
    border-color: #14b8a6;
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const LinkBadge = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isBlinking',
})`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 32px;
  height: 32px;
  background: #14b8a6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  animation: ${props => props.$isBlinking ? blink : 'none'} 1.5s ease-in-out infinite;
  z-index: 101;
`;

const LinkIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: white;
`;

const CursorIcon = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 10001;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: #14b8a6;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.1s ease-out;
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const IconOption = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'selected',
})`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: 2px solid ${props => props.$selected ? '#14b8a6' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.$selected ? 'rgba(20, 184, 166, 0.1)' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  color: ${props => props.$selected ? '#14b8a6' : '#6b7280'};
  
  &:hover {
    border-color: #14b8a6;
    background: rgba(20, 184, 166, 0.1);
    color: #14b8a6;
    transform: scale(1.1);
  }
`;

const LinkModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const LinkModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  direction: rtl;
  display: flex;
  flex-direction: column;
`;

const ModalTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #14b8a6;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

// ============================================
// 🔹 Main Component
// ============================================
export default function AdminFlipbookViewer({ issueId, onClose, issue: propIssue, slots: propSlots, showSlotsManagement = false }) {
  const navigate = useNavigate();
  const flipbookContainerRef = useRef(null);
  const flipbookInstanceRef = useRef(null);
  const [issue, setIssue] = useState(propIssue || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slots, setSlots] = useState(propSlots || null);
  
  // 🎯 Link Management
  const [links, setLinks] = useState([]);
  const [editingLink, setEditingLink] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkForm, setLinkForm] = useState({ 
    type: 'url', // 'url' or 'mailto'
    url: '', 
    email: '', // for mailto links
    icon: 'Link', // default icon name
    page: 1, 
    x: 0, 
    y: 0, 
    width: 100, 
    height: 50 
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPublished, setIsPublished] = useState(false);
  const [isDraggingLink, setIsDraggingLink] = useState(false);
  const [draggingLinkId, setDraggingLinkId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPlacingLink, setIsPlacingLink] = useState(false);
  const flipbookWrapperRef = useRef(null);
  
  // 💾 Save States
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // טעינת הגיליון
  useEffect(() => {
    const loadIssue = async () => {
      if (!issueId) {
        console.error('❌ AdminFlipbookViewer: issueId is missing!', issueId);
        return;
      }
      
      console.log('🔍 AdminFlipbookViewer: Loading issue with ID:', issueId);
      try {
        const data = await getIssueById(issueId);
        console.log('✅ AdminFlipbookViewer: Issue loaded:', data);
        console.log('✅ Setting issue state - IssueId:', data.issueId, 'PdfUrl:', data.PdfUrl);
        setIssue(data);
        console.log('✅ Issue state set, useEffect should trigger with new issue data');
        
        // טעינת קישורים ואנימציות אם יש
        console.log('📄 AdminFlipbookViewer: Checking for Summary...');
        console.log('📄 AdminFlipbookViewer: data.Summary:', data.Summary);
        console.log('📄 AdminFlipbookViewer: data.summary:', data.summary);
        console.log('📄 AdminFlipbookViewer: Full data object:', JSON.stringify(data, null, 2));
        
        if (data.Summary || data.summary) {
          try {
            const summary = data.Summary || data.summary;
            console.log('📄 AdminFlipbookViewer: Raw Summary:', summary);
            console.log('📄 AdminFlipbookViewer: Summary type:', typeof summary);
            console.log('📄 AdminFlipbookViewer: Summary length:', summary?.length);
            
            const metadata = JSON.parse(summary);
            console.log('📄 AdminFlipbookViewer: Parsed metadata:', metadata);
            console.log('📄 AdminFlipbookViewer: metadata.links:', metadata.links);
            console.log('📄 AdminFlipbookViewer: metadata.links type:', typeof metadata.links);
            console.log('📄 AdminFlipbookViewer: Is array?', Array.isArray(metadata.links));
            
            if (metadata.links && Array.isArray(metadata.links)) {
              console.log('🔗 AdminFlipbookViewer: Loaded links:', metadata.links);
              console.log('🔗 AdminFlipbookViewer: Links count:', metadata.links.length);
              // הבאק-אנד מחזיר קישורים עם lowercase keys (id, page, x, y וכו')
              // נוודא שכל קישור יש לו את כל השדות הנדרשים
              const normalizedLinks = metadata.links.map((link, index) => {
                console.log(`🔗 Link ${index}:`, link);
                return {
                  id: link.id || link.Id || String(Date.now() + index),
                  page: link.page || link.Page || 1,
                  x: link.x || link.X || 0,
                  y: link.y || link.Y || 0,
                  width: link.width || link.Width || 100,
                  height: link.height || link.Height || 50,
                  url: link.url || link.Url || '',
                  icon: link.icon || link.Icon || 'Link',
                  email: link.email || link.Email || ''
                };
              });
              console.log('🔗 AdminFlipbookViewer: Normalized links:', normalizedLinks);
              setLinks(normalizedLinks);
            } else {
              console.log('⚠️ AdminFlipbookViewer: No links found or links is not an array');
              console.log('⚠️ AdminFlipbookViewer: metadata.links value:', metadata.links);
              setLinks([]);
            }
          } catch (e) {
            console.error('❌ Error parsing metadata:', e);
            console.error('❌ Error stack:', e.stack);
            console.error('❌ Summary content:', data.Summary || data.summary);
            setLinks([]);
          }
        } else {
          console.log('⚠️ AdminFlipbookViewer: No Summary field found in issue data');
          console.log('⚠️ AdminFlipbookViewer: Available fields:', Object.keys(data));
          setLinks([]);
        }
      } catch (error) {
        console.error('❌ Error loading issue:', error);
        setError(`שגיאה בטעינת הגיליון: ${error.message}`);
      }
    };
    
    loadIssue();
  }, [issueId]);

  // בדיקת ספרייה
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
        setError("הספרייה לא נטענה כראוי");
        setIsLoading(false);
      }
    }, 10000);

    return () => clearInterval(checkFlipBook);
  }, []);

  // פונקציה נפרדת לאתחול ה-FlipBook
  const initializeFlipBook = useCallback((pdfUrl) => {
    console.log('🎯 initializeFlipBook called with URL:', pdfUrl);
    
    if (!flipbookContainerRef.current) {
      console.warn('⚠️ Flipbook container not available');
      return;
    }
    
    console.log('✅ Flipbook container available');
    
    // הגנה מפני טעינה חוזרת - רק אם ה-FlipBook באמת פעיל
    if (flipbookInstanceRef.current && flipbookInstanceRef.current.options?.pdfUrl === pdfUrl) {
      // נבדוק אם ה-FlipBook באמת פעיל
      try {
        const currentPage = flipbookInstanceRef.current.getCurrentPageNumber?.() || 0;
        const totalPages = flipbookInstanceRef.current.options?.numPages || 0;
        console.log('🔍 Checking existing FlipBook - currentPage:', currentPage, 'totalPages:', totalPages);
        if (currentPage > 0 || totalPages > 0) {
          console.log('⚠️ FlipBook already initialized with same URL and is active, skipping...');
          return;
        }
          } catch (e) {
        // אם יש שגיאה, נמשיך עם טעינה מחדש
        console.log('⚠️ FlipBook instance exists but may be inactive, reinitializing...', e);
      }
    }
    
    console.log('🚀 Proceeding with FlipBook initialization...');
    
    if (flipbookInstanceRef.current) {
      try {
        flipbookInstanceRef.current.destroy?.() || flipbookInstanceRef.current.dispose?.();
      } catch (e) {}
      flipbookInstanceRef.current = null;
    }

    flipbookContainerRef.current.innerHTML = '';

    let flipbook;
    let container;

    try {
      container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      flipbookContainerRef.current.appendChild(container);

      const options = {
        pdfUrl: pdfUrl,
        rightToLeft: true,
        startPage: 0,
        backgroundColor: '#1a1a1a',
        backgroundTransparent: false,
        pdfAutoLinks: true,
        pdfTextLayer: true,
        htmlLayer: true,
        pdfAnnotationLayer: true,
        sound: true,
        flipSound: true,
        loadAllPages: false,
        loadPagesF: 3,
        loadPagesB: 2,
        viewMode: 'webgl',
        pageFlipDuration: 1,
        lights: true,
        lightIntensity: 0.6,
        shadows: true,
        shadowOpacity: 0.35,
        pageRoughness: 0.9,
        pageHardness: 1.2,
        coverHardness: 2.5,
        pageSegmentsW: 20,
        pageMiddleShadowSize: 5,
        zoomMin: 0.85,
        responsiveView: true,
        bookMargin: 20,
        rotateCameraOnMouseDrag: false,
        pageDragDisabled: false,
        pageClickAreaWdith: '15%',
        cornerCurl: true,
        // הוספת אפשרויות לטיפול ב-PDF פגום
        pdfDisableAutoFetch: false,
        pdfDisableStream: false,
        pdfDisableRange: false,
        
        // 🔧 הסתרת כל הממשק המובנה של Real3D
        sideNavigationButtons: false,
        btnFirst: { enabled: false },
        btnLast: { enabled: false },
        btnPrev: { enabled: false },
        btnNext: { enabled: false },
        btnZoomIn: { enabled: false },
        btnZoomOut: { enabled: false },
        btnZoomDropdown: { enabled: false },
        btnFullscreen: { enabled: false },
        btnToc: { enabled: false },
        btnShare: { enabled: false },
        btnDownload: { enabled: false },
        btnPrint: { enabled: false },
        btnSearch: { enabled: false },
        btnThumb: { enabled: false },
        btnAutoplay: { enabled: false },
        btnSound: { enabled: false },
        hideMenu: true,
        menu2Transparent: true,
        menu2OverBook: false,
        menuFloating: false,
        currentPage: { enabled: false },
        skin: 'dark',
        cover: true,
        backCover: true,
      };

      if (window.FlipBook) {
        console.log('📚 Creating FlipBook with options:', options);
        flipbook = new window.FlipBook(container, options);
        console.log('✅ FlipBook created:', flipbook);
      } else if (window.FLIPBOOK?.Main) {
        console.log('📚 Creating FLIPBOOK.Main with options:', options);
        flipbook = new window.FLIPBOOK.Main(options, container);
        console.log('✅ FLIPBOOK.Main created:', flipbook);
      } else {
        console.error('❌ No FlipBook library found!');
        setError("הספרייה לא נטענה");
        setIsLoading(false);
        return;
      }

      if (flipbook) {
        flipbookInstanceRef.current = flipbook;
        console.log('📖 Flipbook instance saved to ref');

        if (flipbook.on) {
          flipbook.on('pagechange', () => {
            const page = flipbook.getCurrentPageNumber?.();
            if (page) setCurrentPage(page);
          });

          // הוספת timeout לטעינת ה-PDF
          const timeoutId = setTimeout(() => {
            console.warn('⚠️ PDF loading timeout - checking status');
            const pages = flipbook.options?.numPages || flipbook.options?.pages?.length || 0;
            if (pages > 0) {
              console.log(`✅ PDF loaded with ${pages} pages`);
              setIsLoading(false);
              setTotalPages(pages);
            } else {
              console.warn('⚠️ PDF still loading after timeout - may be an issue with the PDF file');
            }
          }, 15000); // 15 שניות timeout

          flipbook.on('ready', () => {
            console.log('✅ Flipbook ready event fired');
            clearTimeout(timeoutId);
            setIsLoading(false);
            isInitializingRef.current = false; // שחרור ההגנה
            const pages = flipbook.options?.numPages || flipbook.options?.pages?.length || 0;
            setTotalPages(pages);
            console.log(`📄 Total pages: ${pages}`);
          });

          flipbook.on('pdfinit', () => {
            console.log('✅ PDF initialized');
            clearTimeout(timeoutId);
            setIsLoading(false);
            isInitializingRef.current = false; // שחרור ההגנה
            const pages = flipbook.options?.numPages || 0;
            setTotalPages(pages);
            console.log(`📄 Total pages after pdfinit: ${pages}`);
          });

          flipbook.on('error', (err) => {
            console.error('❌ FlipBook error:', err);
            console.error('❌ Error type:', typeof err);
            console.error('❌ Error keys:', err ? Object.keys(err) : 'no error object');
            isInitializingRef.current = false; // שחרור ההגנה גם בשגיאה
            
            let errorMessage = "שגיאה בטעינת המגזין";
            
            // בדיקה אם זה שגיאת PDF
            const errorStr = err?.message || err?.toString() || JSON.stringify(err) || '';
            console.error('❌ Error string:', errorStr);
            
            if (errorStr.includes('Invalid PDF') || 
                errorStr.includes('PDF structure') || 
                errorStr.includes('InvalidPDFException') ||
                errorStr.includes('invalid pdf') ||
                errorStr.includes('InvalidPDF')) {
              errorMessage = "שגיאה בפורמט הקובץ PDF. הקובץ עשוי להיות פגום או לא תקין. אנא נסה להעלות את הקובץ מחדש.";
            } else if (errorStr.includes('NetworkError') || 
                       errorStr.includes('Failed to fetch') ||
                       errorStr.includes('CORS') ||
                       errorStr.includes('network')) {
              errorMessage = "שגיאה בטעינת הקובץ מהשרת. אנא ודא שהשרת זמין ונסה שוב.";
            } else if (errorStr.includes('timeout') || errorStr.includes('Timeout')) {
              errorMessage = "זמן הטעינה פג. הקובץ גדול מדי או שיש בעיה בחיבור. אנא נסה שוב.";
            } else if (err && err.message) {
              errorMessage = `שגיאה בטעינת המגזין: ${err.message}`;
            }
            
            console.error('❌ Error details:', { err, errorStr, pdfUrl, errorMessage });
            setError(errorMessage);
            setIsLoading(false);
            clearTimeout(timeoutId);
          });
        }
      }
    } catch (err) {
      console.error('❌ Error initializing FlipBook:', err);
      let errorMessage = "שגיאה באתחול המגזין";
      
      const errorStr = err?.message || err?.toString() || '';
      if (errorStr.includes('Invalid PDF') || 
          errorStr.includes('PDF structure') || 
          errorStr.includes('InvalidPDFException')) {
        errorMessage = "שגיאה בפורמט הקובץ PDF. הקובץ עשוי להיות פגום או לא תקין. אנא נסה להעלות את הקובץ מחדש.";
      } else if (err.message) {
        errorMessage = `שגיאה: ${err.message}`;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  // אתחול FlipBook
  // הגנה מפני טעינה חוזרת
  const isInitializingRef = useRef(false);
  const lastPdfUrlRef = useRef(null);

  useEffect(() => {
    console.log('🔍 useEffect triggered - issue:', issue);
    console.log('🔍 useEffect - issueId:', issue?.IssueId, 'pdfUrl:', issue?.PdfUrl, 'fileUrl:', issue?.FileUrl);
    console.log('🔍 useEffect - issue object keys:', issue ? Object.keys(issue) : 'null');
    
    if (!issue) {
      console.log('⚠️ No issue, returning');
      return;
    }
    
    // בדיקה נוספת - אם אין ID, זה אומר שה-issue עדיין לא נטען במלואו
    if (!issue.IssueId && !issue.issueId && !issue.issue_id) {
      console.log('⚠️ Issue has no ID yet, returning');
      return;
    }
    
    let pdfUrl = issue.PdfUrl || issue.FileUrl || issue.pdf_url || issue.Pdf_url || issue.pdfUrl || issue.fileUrl || issue.FileUrl || issue.File_url;
    console.log('📄 PDF URL from issue:', pdfUrl);
    if (!pdfUrl) {
      console.log('⚠️ No PDF URL, returning');
      return;
    }
    if (!flipbookContainerRef.current) {
      console.log('⚠️ No flipbook container, waiting for it to mount...');
      // נחכה קצת שה-container יותקן - אבל לא נעדכן את ה-state כדי למנוע לולאה אינסופית
      const checkContainer = setInterval(() => {
        if (flipbookContainerRef.current && !isInitializingRef.current) {
          clearInterval(checkContainer);
          console.log('✅ Flipbook container mounted, will retry on next render');
          // לא נעדכן את ה-state - ה-useEffect ירוץ שוב אוטומטית כשה-container יהיה זמין
          // פשוט נחזור ונחכה שה-useEffect ירוץ שוב
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkContainer);
        if (!flipbookContainerRef.current) {
          console.error('❌ Flipbook container still not available after timeout');
          setError('הקונטיינר לא זמין. אנא רענן את הדף.');
        }
      }, 5000);
      return;
    }
    if (!window.FlipBook && !window.FLIPBOOK) {
      console.log('⚠️ FlipBook library not loaded, waiting...');
      // נחכה קצת ונבדוק שוב - אבל לא נעדכן את ה-state כדי למנוע לולאה אינסופית
      const checkLibrary = setInterval(() => {
        if ((window.FlipBook || window.FLIPBOOK) && !isInitializingRef.current) {
          clearInterval(checkLibrary);
          console.log('✅ FlipBook library loaded, will retry on next render');
          // לא נעדכן את ה-state - ה-useEffect ירוץ שוב אוטומטית כשה-library תהיה זמינה
          // פשוט נחזור ונחכה שה-useEffect ירוץ שוב
        }
      }, 500);
      
      setTimeout(() => {
        clearInterval(checkLibrary);
        if (!window.FlipBook && !window.FLIPBOOK) {
          console.error('❌ FlipBook library still not loaded after timeout');
          setError('הספרייה לא נטענה. אנא רענן את הדף.');
        }
      }, 10000);
      return;
    }
    
    // אם אנחנו כבר בתהליך טעינה, לא נטען שוב
    if (isInitializingRef.current) {
      console.log('⚠️ Already initializing FlipBook, skipping...');
      return;
    }
    
    // אם ה-URL לא השתנה ויש לנו FlipBook פעיל, לא נטען שוב
    if (lastPdfUrlRef.current === pdfUrl && flipbookInstanceRef.current) {
      // נבדוק אם ה-FlipBook באמת פעיל
      try {
        const currentPage = flipbookInstanceRef.current.getCurrentPageNumber?.() || 0;
        if (currentPage > 0) {
          console.log('⚠️ PDF URL unchanged and FlipBook already initialized and active, skipping...');
          return;
        }
      } catch (e) {
        // אם יש שגיאה, נמשיך עם טעינה מחדש
        console.log('⚠️ FlipBook instance exists but may be inactive, reinitializing...');
      }
    }
    
    console.log('🚀 Starting FlipBook initialization...');
    console.log('🔍 Last PDF URL:', lastPdfUrlRef.current, 'Current PDF URL:', pdfUrl);
    
    // בדיקה נוספת - אם ה-URL זהה ואנחנו כבר בתהליך טעינה, לא נטען שוב
    if (lastPdfUrlRef.current === pdfUrl && isInitializingRef.current) {
      console.log('⚠️ Same URL and already initializing, skipping...');
      return;
    }
    
    isInitializingRef.current = true;
    lastPdfUrlRef.current = pdfUrl;
    
    console.log('📄 Original PDF URL from issue:', pdfUrl);
    
    // טיפול בקבצי טיוטה - המרה ל-URL מלא
    // הגדרת checkPdfPromise לפני ה-try block כדי שיהיה זמין תמיד
    let checkPdfPromise;
    
    try {
      // ננסה לקבל את ה-API URL מה-env או מה-API service
      let apiBaseUrl = import.meta.env.VITE_API_URL;
      
      // אם אין VITE_API_URL, נשתמש בפורט הנכון מה-API service (5055)
      if (!apiBaseUrl) {
        // נשתמש בפורט 5055 (הפורט ב-launchSettings.json וב-api.js)
        const currentOrigin = window.location.origin;
        // נחליף את הפורט ל-5055
        apiBaseUrl = currentOrigin.replace(':5173', ':5055').replace('5173', '5055');
        // אם זה לא עבד, ננסה פשוט להחליף את הפורט
        if (apiBaseUrl === currentOrigin) {
          apiBaseUrl = currentOrigin.replace(/:\d+/, ':5055');
        }
      }
      
      console.log('🌐 API Base URL:', apiBaseUrl);
      
      // אם זה קובץ טיוטה (pending-upload או draft-file), נמיר ל-URL מלא
      // אבל רק אם זה לא URL מלא כבר
      if (pdfUrl.startsWith('pending-upload-')) {
        const tempFileName = pdfUrl.replace('pending-upload-', '');
        pdfUrl = `${apiBaseUrl}/api/issues/draft-file/${tempFileName}`;
        console.log('🔧 Converted pending-upload to full URL:', pdfUrl);
      } else if (pdfUrl.startsWith('/api/issues/draft-file/')) {
        // אם זה URL יחסי, נמיר אותו ל-URL מלא
        pdfUrl = `${apiBaseUrl}${pdfUrl}`;
        console.log('🔧 Converted relative draft file URL to full URL:', pdfUrl);
      } else if (pdfUrl.startsWith('/uploads/')) {
        // אם זה URL יחסי, נמיר אותו ל-URL מלא
        pdfUrl = `${apiBaseUrl}${pdfUrl}`;
        console.log('🔧 Converted relative uploads URL to full URL:', pdfUrl);
      } else if (pdfUrl.includes('/api/issues/draft-file/') && !pdfUrl.startsWith('http')) {
        // אם ה-URL מכיל את הנתיב אבל לא מתחיל ב-http, נמיר אותו
        pdfUrl = `${apiBaseUrl}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`;
        console.log('🔧 Converted draft file path to full URL:', pdfUrl);
      } else if (pdfUrl.includes('localhost:5000')) {
        // אם ה-URL מכיל localhost:5000, נחליף אותו ל-5055
        pdfUrl = pdfUrl.replace('localhost:5000', 'localhost:5055').replace(':5000', ':5055');
        console.log('🔧 Fixed port from 5000 to 5055:', pdfUrl);
      }
      
      console.log('✅ Final PDF URL:', pdfUrl);
      
      // בדיקה שהקובץ נגיש לפני טעינה
      console.log('🔍 Checking PDF accessibility:', pdfUrl);
      setIsLoading(true);
      
      // ננסה לבדוק שהקובץ נגיש ושהוא PDF תקין
      // נשתמש ב-Promise כדי לוודא שהבדיקה מסתיימת לפני טעינת ה-FlipBook
      // עבור קבצים גדולים, נטען רק את ה-bytes הראשונים לבדיקה
      // הוספת Authorization header עבור קבצי טיוטה שדורשים אימות
      const token = localStorage.getItem('hasdera_token');
      const headers = {
        'Range': 'bytes=0-1023' // נטען רק את ה-1024 bytes הראשונים לבדיקה
      };
      if (token && (pdfUrl.includes('/api/issues/draft-file/') || pdfUrl.includes('/uploads/'))) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      checkPdfPromise = fetch(pdfUrl, { 
        method: 'GET', 
        mode: 'cors',
        cache: 'no-cache',
        headers: headers
      })
        .then(checkResponse => {
          console.log('📥 PDF check response:', {
            status: checkResponse.status,
            statusText: checkResponse.statusText,
            contentType: checkResponse.headers.get('content-type'),
            contentLength: checkResponse.headers.get('content-length'),
            acceptRanges: checkResponse.headers.get('accept-ranges')
          });
          
          // 206 = Partial Content (תמיכה ב-Range requests)
          // 200 = OK (השרת לא תומך ב-Range requests, אבל זה בסדר)
          if (!checkResponse.ok && checkResponse.status !== 206) {
            throw new Error(`HTTP ${checkResponse.status}: ${checkResponse.statusText}`);
          }
          
          const contentType = checkResponse.headers.get('content-type');
          if (contentType && !contentType.includes('application/pdf')) {
            console.warn('⚠️ Content-Type is not PDF:', contentType);
          }
          
          // בדיקה שה-bytes הראשונים הם %PDF
          return checkResponse.arrayBuffer().then(firstBytes => {
            const bytes = new Uint8Array(firstBytes);
            console.log(`📊 Received ${bytes.length} bytes for PDF header check`);
            
            if (bytes.length >= 4) {
              const pdfHeader = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
              console.log(`🔍 PDF header check: "${pdfHeader}"`);
              
              if (pdfHeader === '%PDF') {
                console.log('✅ PDF file is valid and accessible');
                return true;
              } else {
                console.warn('⚠️ PDF header check failed. First bytes:', pdfHeader);
                console.log(`🔍 First 20 bytes (hex): ${Array.from(bytes.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
                
                // נבדוק אם יש BOM או תווים נוספים
                for (let i = 0; i < Math.min(10, bytes.length - 4); i++) {
                  const header = String.fromCharCode(bytes[i], bytes[i+1], bytes[i+2], bytes[i+3]);
                  if (header === '%PDF') {
                    console.log(`✅ PDF header found at offset ${i}`);
                    return true;
                  }
                }
                const errorMsg = 'Invalid PDF structure - PDF header not found. הקובץ PDF פגום או לא תקין. אנא נסה להעלות את הקובץ מחדש.';
                console.error('❌', errorMsg);
                throw new Error(errorMsg);
              }
            } else {
              const errorMsg = 'File too small to be a valid PDF. הקובץ קטן מדי להיות PDF תקין.';
              console.error('❌', errorMsg);
              throw new Error(errorMsg);
            }
          });
        })
        .catch(err => {
          console.error('❌ PDF file check failed:', err);
          // אם זה pre-signed URL מ-S3, ננסה בלי בדיקה
          if (pdfUrl.includes('s3.amazonaws.com') || pdfUrl.includes('amazonaws.com')) {
            console.log('⚠️ S3 URL detected, skipping validation check');
            return true; // נמשיך עם טעינת ה-FlipBook
          }
          
          // אם זה שגיאת Range request (206), ננסה בלי Range request
          if (err.message && (err.message.includes('Range') || err.message.includes('206'))) {
            console.log('⚠️ Range request failed, will try without Range header');
            // ננסה שוב בלי Range request, אבל עם Authorization header
            const retryHeaders = {};
            if (token && (pdfUrl.includes('/api/issues/draft-file/') || pdfUrl.includes('/uploads/'))) {
              retryHeaders['Authorization'] = `Bearer ${token}`;
            }
            return fetch(pdfUrl, { 
              method: 'GET', 
              mode: 'cors',
              cache: 'no-cache',
              headers: retryHeaders
            })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              return response.arrayBuffer().then(buffer => {
                const bytes = new Uint8Array(buffer);
                if (bytes.length >= 4) {
                  const pdfHeader = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
                  if (pdfHeader === '%PDF') {
                    console.log('✅ PDF file is valid (without Range request)');
                    return true;
                  }
                }
                throw new Error('Invalid PDF structure - PDF header not found');
              });
            })
            .catch(retryErr => {
              console.error('❌ Retry without Range also failed:', retryErr);
              throw retryErr;
            });
          }
          
          // אם זה שגיאת PDF structure, נציג הודעה ברורה יותר
          if (err.message && err.message.includes('Invalid PDF structure')) {
            throw new Error('הקובץ PDF פגום או לא תקין. אנא נסה להעלות את הקובץ מחדש.');
          }
          throw err;
        });
      
      // תיקון encoding כפול ב-URL
      // אם ה-URL מכיל %25 (encoding כפול), ננסה לתקן אותו
      if (pdfUrl.includes('%25')) {
        console.log('🔧 Fixing double encoding in URL:', pdfUrl);
        
        // נחלץ את ה-path מה-URL לפני ה-query string
        const urlParts = pdfUrl.split('?');
        let pathPart = urlParts[0];
        const queryPart = urlParts[1] || '';
        
        // ננסה לעשות decode ל-path כמה פעמים
        let attempts = 0;
        while (pathPart.includes('%25') && attempts < 10) {
          const beforeDecode = pathPart;
          try {
            pathPart = decodeURIComponent(pathPart);
            // אם לא השתנה, נעצור
            if (beforeDecode === pathPart) break;
          } catch (e) {
            // אם יש שגיאה, ננסה להחליף ידנית
            pathPart = pathPart.replace(/%25/g, '%');
            try {
              pathPart = decodeURIComponent(pathPart);
            } catch (e2) {
              break;
            }
          }
          attempts++;
        }
        
        // אם עדיין יש %25, נחליף ידנית
        if (pathPart.includes('%25')) {
          pathPart = pathPart.replace(/%25/g, '%');
          try {
            pathPart = decodeURIComponent(pathPart);
          } catch (e) {
            // אם יש שגיאה, נמשיך עם ה-path כמו שהוא
          }
        }
        
        // נבנה את ה-URL מחדש
        const fixedUrl = queryPart ? `${pathPart}?${queryPart}` : pathPart;
        console.log('✅ Fixed URL:', fixedUrl);
        pdfUrl = fixedUrl;
      }
    } catch (e) {
      console.error('❌ Error fixing URL encoding:', e);
      // נמשיך עם ה-URL המקורי אם יש שגיאה
      // אם checkPdfPromise לא הוגדר, נגדיר אותו כ-Promise שמתממש מיד
      if (!checkPdfPromise) {
        checkPdfPromise = Promise.resolve(true);
      }
    }
    
    // אם checkPdfPromise עדיין לא הוגדר (בגלל שגיאה ב-try), נגדיר אותו
    if (!checkPdfPromise) {
      console.warn('⚠️ checkPdfPromise not defined, skipping PDF validation');
      checkPdfPromise = Promise.resolve(true);
    }
    
    if (flipbookInstanceRef.current) {
      try {
        flipbookInstanceRef.current.destroy?.() || flipbookInstanceRef.current.dispose?.();
      } catch (e) {}
      flipbookInstanceRef.current = null;
    }

    // הוספת token ל-URL עבור קבצי טיוטה (FlipBook לא תומך ב-custom headers)
    let finalPdfUrl = pdfUrl;
    const token = localStorage.getItem('hasdera_token');
    
    // וידוא שה-URL הוא URL מלא תקין
    try {
      // אם זה לא URL מלא, ננסה ליצור אותו
      if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
        const apiBaseUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5173', ':5000');
        if (pdfUrl.startsWith('/')) {
          finalPdfUrl = `${apiBaseUrl}${pdfUrl}`;
        } else {
          finalPdfUrl = `${apiBaseUrl}/${pdfUrl}`;
        }
        console.log('🔧 Converted to full URL:', finalPdfUrl);
      } else {
        finalPdfUrl = pdfUrl;
      }
      
      // הוספת token ל-URL עבור קבצי טיוטה
      if (token && (finalPdfUrl.includes('/api/issues/draft-file/') || finalPdfUrl.includes('/uploads/'))) {
        const urlObj = new URL(finalPdfUrl);
        urlObj.searchParams.set('token', token);
        finalPdfUrl = urlObj.toString();
        console.log('🔧 Added token to PDF URL for FlipBook:', finalPdfUrl);
      }
    } catch (urlError) {
      console.error('❌ Error processing PDF URL:', urlError);
      console.error('❌ Original URL:', pdfUrl);
      setError('שגיאה בעיבוד כתובת הקובץ PDF. אנא בדוק שהשרת רץ ונסה שוב.');
      setIsLoading(false);
      return;
    }
    
    console.log('✅ Final PDF URL for FlipBook:', finalPdfUrl);
    console.log('🔍 checkPdfPromise:', checkPdfPromise);
    
    // נחכה לבדיקת ה-PDF לפני טעינת ה-FlipBook
    if (!checkPdfPromise) {
      console.error('❌ checkPdfPromise is undefined! Initializing FlipBook directly...');
      initializeFlipBook(finalPdfUrl);
      isInitializingRef.current = false;
      return;
    }
    
    checkPdfPromise
      .then(() => {
        // אם הבדיקה הצליחה, נטען את ה-FlipBook
        console.log('✅ PDF validation passed, initializing FlipBook');
        initializeFlipBook(finalPdfUrl);
        isInitializingRef.current = false;
      })
      .catch(err => {
        console.error('❌ PDF validation failed:', err);
        const errorMessage = err.message || err.toString();
        
        // אם זה קובץ טיוטה מהשרת המקומי, ננסה לטעון אותו ישירות גם אם הבדיקה נכשלה
        // אולי הבעיה היא עם Range requests או עם הבדיקה עצמה
        if (pdfUrl.includes('/api/issues/draft-file/') || pdfUrl.includes('/uploads/')) {
          console.log('⚠️ Draft file validation failed, but will try to load anyway');
          console.log('⚠️ This might be a Range request issue or the PDF might be valid despite the check failing');
          // ננסה לטעון את הקובץ ישירות ל-FlipBook
          console.log('🚀 Initializing FlipBook despite validation failure...');
          initializeFlipBook(finalPdfUrl);
          isInitializingRef.current = false;
          return;
        }
        
        let userMessage = "שגיאה בטעינת הקובץ PDF.";
        
        if (errorMessage.includes('Invalid PDF structure') || 
            errorMessage.includes('PDF header not found') ||
            errorMessage.includes('פגום')) {
          userMessage = "הקובץ PDF פגום או לא תקין. אנא נסה להעלות את הקובץ מחדש.";
        } else if (errorMessage.includes('HTTP')) {
          userMessage = `שגיאה בטעינת הקובץ מהשרת (${errorMessage}). אנא ודא שהשרת זמין ונסה שוב.`;
        } else {
          userMessage = `שגיאה בטעינת הקובץ PDF: ${errorMessage}. אנא נסה להעלות את הקובץ מחדש.`;
        }
        
        setError(userMessage);
        setIsLoading(false);
        isInitializingRef.current = false;
      });
  }, [
    issue?.IssueId ?? issue?.issueId ?? issue?.issue_id ?? null,
    issue?.PdfUrl ?? issue?.pdfUrl ?? issue?.pdf_url ?? null,
    issue?.FileUrl ?? issue?.fileUrl ?? issue?.file_url ?? null
  ]); // תלויים ב-properties של issue כדי שירוץ כשה-issue נטען

  // Cleanup function
  useEffect(() => {
    return () => {
      if (flipbookInstanceRef.current) {
        try {
          flipbookInstanceRef.current.destroy?.() || flipbookInstanceRef.current.dispose?.();
        } catch (e) {}
      }
    };
  }, []);

  // 🔧 פונקציות ניווט
  const goToPrevPage = useCallback(() => {
    flipbookInstanceRef.current?.prevPage?.();
  }, []);

  const goToNextPage = useCallback(() => {
    flipbookInstanceRef.current?.nextPage?.();
  }, []);

  // קיצורי מקלדת
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        isFullscreen ? document.exitFullscreen?.() : onClose?.();
      } else if (e.key === "ArrowRight") goToPrevPage();
      else if (e.key === "ArrowLeft") goToNextPage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, isFullscreen, goToPrevPage, goToNextPage]);

  // Fullscreen
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.();
  };

  const handleClose = () => onClose ? onClose() : navigate('/admin/issues');

  // Available icons for links
  const availableIcons = [
    { name: 'Link', component: Link },
    { name: 'Mail', component: Mail },
    { name: 'ExternalLink', component: ExternalLink },
    { name: 'Phone', component: Phone },
    { name: 'MapPin', component: MapPin },
    { name: 'Calendar', component: Calendar },
    { name: 'Clock', component: Clock },
    { name: 'Star', component: Star },
    { name: 'Heart', component: Heart },
    { name: 'ShoppingCart', component: ShoppingCart },
    { name: 'User', component: User },
    { name: 'Home', component: Home },
  ];

  // 🎯 Link Management Functions
  const handleAddLink = () => {
    setIsPlacingLink(true);
  };

  const handlePlaceLinkOnPage = (e) => {
    if (!isPlacingLink || !flipbookWrapperRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = flipbookWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 50; // מרכז על הלחיצה
    const y = e.clientY - rect.top - 25;
    
    setIsPlacingLink(false);
    setIsAddingLink(true);
    setLinkForm({ 
      type: 'url',
      url: '', 
      email: '',
      icon: 'Link',
      page: currentPage || 1, 
      x: Math.max(0, x), 
      y: Math.max(0, y), 
      width: 100, 
      height: 50 
    });
    setShowLinkModal(true);
  };

  const handleMouseMoveOnPage = (e) => {
    if (isPlacingLink) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleEditLink = (link) => {
    setEditingLink(link);
    // אם זה mailto link, נחלץ את המייל מה-URL
    if (link.url && link.url.startsWith('mailto:')) {
      const email = link.url.replace('mailto:', '').split('?')[0];
      setLinkForm({ ...link, type: 'mailto', email: email, url: '', icon: link.icon || 'Link' });
    } else {
      setLinkForm({ ...link, type: 'url', email: '', icon: link.icon || 'Link' });
    }
    setShowLinkModal(true);
  };

  const handleDeleteLink = (linkId) => {
    setLinks(links.filter(l => l.id !== linkId));
  };

  const handleSaveLink = () => {
    // אם זה mailto, נבנה את ה-URL
    let finalUrl = '';
    if (linkForm.type === 'mailto') {
      if (!linkForm.email) {
        alert('אנא הזן כתובת מייל');
        return;
      }
      finalUrl = `mailto:${linkForm.email}`;
    } else {
      if (!linkForm.url) {
        alert('אנא הזן כתובת URL');
        return;
      }
      finalUrl = linkForm.url;
    }
    
    const linkToSave = {
      ...linkForm,
      url: finalUrl,
      id: editingLink ? editingLink.id : Date.now()
    };
    
    if (editingLink) {
      setLinks(links.map(l => l.id === editingLink.id ? linkToSave : l));
      setEditingLink(null);
    } else {
      setLinks([...links, linkToSave]);
    }
    
    setShowLinkModal(false);
    setIsAddingLink(false);
    setIsPlacingLink(false);
    setLinkForm({ 
      type: 'url',
      url: '', 
      email: '',
      icon: 'Link',
      page: 1, 
      x: 0, 
      y: 0, 
      width: 100, 
      height: 50 
    });
  };

  const handleLinkClick = (link) => {
    if (!link.url) return;
    
    // אם זה mailto, נפתח את תוכנת המייל
    if (link.url.startsWith('mailto:')) {
      window.location.href = link.url;
      return;
    }
    
    // אם זה URL רגיל, נפתח אותו בחלון חדש
    try {
      // וידוא שה-URL מתחיל ב-http:// או https://
      let urlToOpen = link.url;
      if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
        urlToOpen = `https://${urlToOpen}`;
      }
      window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening link:', error);
      alert('שגיאה בפתיחת הקישור');
    }
  };

  // 🖱️ Drag & Drop Functions
  const handleLinkMouseDown = (e, linkId) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLink(true);
    setDraggingLinkId(linkId);
    
    const link = links.find(l => l.id === linkId);
    if (link && flipbookWrapperRef.current) {
      const rect = flipbookWrapperRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - link.x,
        y: e.clientY - rect.top - link.y
      });
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingLink || !draggingLinkId || !flipbookWrapperRef.current) return;
    
    const rect = flipbookWrapperRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    setLinks(links.map(link => 
      link.id === draggingLinkId 
        ? { ...link, x: Math.max(0, newX), y: Math.max(0, newY) }
        : link
    ));
  }, [isDraggingLink, draggingLinkId, dragOffset, links]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingLink(false);
    setDraggingLinkId(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (isDraggingLink) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingLink, handleMouseMove, handleMouseUp]);

  // 💾 Save Functions
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Ensure links are properly formatted with all required properties
      const formattedLinks = (links || []).map(link => ({
        Id: String(link.id || link.Id || ''),
        Page: Number(link.page || link.Page || 1),
        X: Number(link.x || link.X || 0),
        Y: Number(link.y || link.Y || 0),
        Width: Number(link.width || link.Width || 100),
        Height: Number(link.height || link.Height || 50),
        Url: String(link.url || link.Url || ''),
        Icon: link.icon || link.Icon || 'Link',
        Email: link.email || link.Email || ''
      }));
      
      const dataToSend = {
        Title: issue?.Title || issue?.title || '',
        Links: formattedLinks,
        Animations: [],
      };
      console.log('💾 Saving draft with data:', dataToSend);
      console.log('💾 Links to save:', formattedLinks);
      await updateIssueMetadata(issueId, dataToSend);
      
      // טעינה מחדש של הנתונים כדי לראות את הקישורים שנשמרו
      const updatedData = await getIssueById(issueId);
      setIssue(updatedData);
      
      // טעינת קישורים מה-metadata המעודכן
      if (updatedData.Summary || updatedData.summary) {
        try {
          const summary = updatedData.Summary || updatedData.summary;
          const metadata = JSON.parse(summary);
          if (metadata.links && Array.isArray(metadata.links)) {
            console.log('🔗 AdminFlipbookViewer: Reloaded links after save:', metadata.links);
            // הבאק-אנד מחזיר קישורים עם lowercase keys (id, page, x, y וכו')
            setLinks(metadata.links);
          } else {
            // אם אין קישורים, נאפס את המערך
            console.log('🔗 AdminFlipbookViewer: No links found in metadata, clearing links');
            setLinks([]);
          }
        } catch (e) {
          console.error('Error parsing metadata after save:', e);
          setLinks([]);
        }
      } else {
        // אם אין Summary בכלל, נאפס את הקישורים
        console.log('🔗 AdminFlipbookViewer: No Summary found, clearing links');
        setLinks([]);
      }
      
      alert('טיוטה נשמרה בהצלחה!');
      
      // חזרה לעמוד הגיליונות
      if (onClose) {
        onClose();
      } else {
        navigate('/admin/issues');
      }
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      if (error.response?.data?.errors) {
        console.error('❌ Validation errors:', JSON.stringify(error.response.data.errors, null, 2));
      }
      alert('שגיאה בשמירת הטיוטה');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Ensure links are properly formatted with all required properties
      const formattedLinks = (links || []).map(link => ({
        Id: String(link.id || link.Id || ''),
        Page: Number(link.page || link.Page || 1),
        X: Number(link.x || link.X || 0),
        Y: Number(link.y || link.Y || 0),
        Width: Number(link.width || link.Width || 100),
        Height: Number(link.height || link.Height || 50),
        Url: String(link.url || link.Url || ''),
        Icon: link.icon || link.Icon || 'Link',
        Email: link.email || link.Email || ''
      }));
      
      const dataToSend = {
        Title: issue?.Title || issue?.title || '',
        Links: formattedLinks,
        Animations: [],
      };
      console.log('📤 Publishing with data:', dataToSend);
      await updateIssueMetadata(issueId, dataToSend);
      await publishIssue(issueId);
      alert('הגיליון פורסם בהצלחה!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error publishing:', error);
      alert('שגיאה בפרסום הגיליון');
    } finally {
      setIsPublishing(false);
    }
  };

  // האם להראות עיקול בצד מסוים
  const canGoNext = totalPages ? currentPage < totalPages : false;
  const canGoPrev = currentPage > 1;

  if (!issue) {
    return (
      <LoadingOverlay>
        <Spinner />
        <LoadingText>טוען גיליון...</LoadingText>
      </LoadingOverlay>
    );
  }

  return (
    <ViewerContainer>
      <FlipbookStyles />
      <BackgroundImage />
      
      {/* Header */}
      <Header>
        <HeaderTitle>{issue?.Title || issue?.title || 'גיליון'}</HeaderTitle>
        
        <HeaderActions>
          <ActionButton onClick={handleAddLink} $variant="primary">
            <Plus size={18} />
            הוסף קישור
          </ActionButton>
          <ActionButton onClick={handleSaveDraft} disabled={isSaving} $variant="primary">
            <Save size={18} />
            {isSaving ? 'שומר...' : 'שמור טיוטה'}
          </ActionButton>
          <ActionButton onClick={handlePublish} disabled={isPublishing} $variant="success">
            <Send size={18} />
            {isPublishing ? 'מפרסם...' : 'פרסם'}
          </ActionButton>
          <IconButton onClick={() => flipbookInstanceRef.current?.zoomOut?.()} title="הקטן">
            <ZoomOutIcon />
          </IconButton>
          <IconButton onClick={() => flipbookInstanceRef.current?.zoomIn?.()} title="הגדל">
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={toggleFullscreen} title="מסך מלא">
            <MaximizeIcon />
          </IconButton>
          <IconButton onClick={() => navigate('/admin/issues')} title="חזרה לניהול גליונות">
            <HomeIcon />
          </IconButton>
          <CloseButton onClick={handleClose} title="סגור (ESC)">
            <CloseIcon />
          </CloseButton>
        </HeaderActions>
      </Header>

      {/* 🔧 חצי ניווט מותאמים אישית - תמיד מוצגים */}
      {!isLoading && !error && (
        <>
          {/* חץ ימין - עמוד קודם (RTL) */}
          <NavigationArrow 
            $side="right" 
            $disabled={!canGoPrev}
            onClick={canGoPrev ? goToPrevPage : undefined}
            title={canGoPrev ? "עמוד קודם" : "אין עמוד קודם"}
            aria-label={canGoPrev ? "עמוד קודם" : "אין עמוד קודם"}
            disabled={!canGoPrev}
          >
            <ChevronRightIcon />
          </NavigationArrow>
          
          {/* חץ שמאל - עמוד הבא (RTL) */}
          <NavigationArrow 
            $side="left" 
            $disabled={!canGoNext}
            onClick={canGoNext ? goToNextPage : undefined}
            title={canGoNext ? "עמוד הבא" : "אין עמוד הבא"}
            aria-label={canGoNext ? "עמוד הבא" : "אין עמוד הבא"}
            disabled={!canGoNext}
          >
            <ChevronLeftIcon />
          </NavigationArrow>
        </>
      )}

      {/* Loading */}
      {isLoading && !error && (
        <LoadingOverlay>
          <Spinner />
          <LoadingText>טוען את המגזין...</LoadingText>
        </LoadingOverlay>
      )}

      {/* Error */}
      {error && (
        <LoadingOverlay>
          <ErrorBox>
            <ErrorTitle>שגיאה בטעינה</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton onClick={() => window.location.reload()}>נסי שוב</RetryButton>
          </ErrorBox>
        </LoadingOverlay>
      )}

      {/* Cursor Icon when placing link */}
      {isPlacingLink && (
        <CursorIcon style={{ left: mousePosition.x, top: mousePosition.y }}>
          <Link size={32} />
        </CursorIcon>
      )}

      {/* FlipBook */}
      {!error && (
        <FlipbookWrapper 
          ref={flipbookWrapperRef}
          onClick={handlePlaceLinkOnPage}
          onMouseMove={handleMouseMoveOnPage}
          style={{ cursor: isPlacingLink ? 'crosshair' : 'default' }}
        >
          <FlipbookContainer ref={flipbookContainerRef} />
          
          {/* Link Overlays - רק עבור העמוד הנוכחי, רק אחרי שהעיתון נטען */}
          {!isLoading && !error && totalPages && links
            .filter(link => link.page === currentPage)
            .map(link => {
              const IconComponent = availableIcons.find(icon => icon.name === (link.icon || 'Link'))?.component || Link;
              return (
                <LinkOverlay
                  key={link.id}
                  x={link.x}
                  y={link.y}
                  width={link.width}
                  height={link.height}
                  $isEditing={editingLink?.id === link.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleLinkMouseDown(e, link.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDraggingLink) {
                      // לחיצה כפולה פותחת את הקישור
                      if (e.detail === 2) {
                        handleLinkClick(link);
                      } else {
                        // לחיצה אחת פותחת את מודל העריכה
                      handleEditLink(link);
                      }
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (!isDraggingLink) {
                      handleLinkClick(link);
                    }
                  }}
                  style={{ cursor: isDraggingLink && draggingLinkId === link.id ? 'grabbing' : 'pointer' }}
                >
                  <LinkBadge $isBlinking={isPublished}>
                    <LinkIconWrapper>
                      <IconComponent size={18} />
                    </LinkIconWrapper>
                  </LinkBadge>
                </LinkOverlay>
              );
            })}
          
          {/* הודעת מיקום קישור */}
          {isPlacingLink && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '50%',
              transform: 'translateX(50%)',
              background: 'rgba(20, 184, 166, 0.9)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              zIndex: 1000,
              pointerEvents: 'none'
            }}>
              לחץ על הדף כדי למקם קישור
            </div>
          )}
        </FlipbookWrapper>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <LinkModal onClick={() => setShowLinkModal(false)}>
          <LinkModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{isAddingLink ? 'הוסף קישור' : 'ערוך קישור'}</ModalTitle>
            
            <FormGroup>
              <Label>סוג קישור</Label>
              <select
                value={linkForm.type}
                onChange={(e) => setLinkForm({ ...linkForm, type: e.target.value, url: '', email: '' })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  direction: 'rtl'
                }}
              >
                <option value="url">קישור לאתר (URL)</option>
                <option value="mailto">קישור למייל (Email)</option>
              </select>
            </FormGroup>

            {linkForm.type === 'mailto' ? (
              <FormGroup>
                <Label>כתובת מייל</Label>
                <Input
                  type="email"
                  value={linkForm.email}
                  onChange={(e) => setLinkForm({ ...linkForm, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </FormGroup>
            ) : (
              <FormGroup>
                <Label>כתובת URL</Label>
                <Input
                  type="url"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </FormGroup>
            )}
            <FormGroup>
              <Label>עמוד</Label>
              <Input
                type="number"
                value={linkForm.page}
                onChange={(e) => setLinkForm({ ...linkForm, page: parseInt(e.target.value) })}
                min={1}
                max={totalPages || 100}
              />
            </FormGroup>
            <FormGroup>
              <Label>מיקום X</Label>
              <Input
                type="number"
                value={linkForm.x}
                onChange={(e) => setLinkForm({ ...linkForm, x: parseInt(e.target.value) })}
              />
            </FormGroup>
            <FormGroup>
              <Label>מיקום Y</Label>
              <Input
                type="number"
                value={linkForm.y}
                onChange={(e) => setLinkForm({ ...linkForm, y: parseInt(e.target.value) })}
              />
            </FormGroup>
            <FormGroup>
              <Label>רוחב</Label>
              <Input
                type="number"
                value={linkForm.width}
                onChange={(e) => setLinkForm({ ...linkForm, width: parseInt(e.target.value) })}
              />
            </FormGroup>
            <FormGroup>
              <Label>גובה</Label>
              <Input
                type="number"
                value={linkForm.height}
                onChange={(e) => setLinkForm({ ...linkForm, height: parseInt(e.target.value) })}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>בחר איקון</Label>
              <IconGrid>
                {availableIcons.map(icon => {
                  const IconComponent = icon.component;
                  return (
                    <IconOption
                      key={icon.name}
                      $selected={linkForm.icon === icon.name}
                      onClick={() => setLinkForm({ ...linkForm, icon: icon.name })}
                      type="button"
                    >
                      <IconComponent size={24} />
                    </IconOption>
                  );
                })}
              </IconGrid>
            </FormGroup>
            
            <ButtonGroup>
              <ActionButton onClick={() => {
                setShowLinkModal(false);
                setIsAddingLink(false);
                setIsPlacingLink(false);
                setEditingLink(null);
              }}>
                ביטול
              </ActionButton>
              <ActionButton onClick={handleSaveLink} $variant="primary">
                שמור
              </ActionButton>
              {editingLink && (
                <ActionButton onClick={() => {
                  handleDeleteLink(editingLink.id);
                  setShowLinkModal(false);
                  setEditingLink(null);
                }} $variant="danger">
                  <Trash2 size={16} />
                  מחק
                </ActionButton>
              )}
            </ButtonGroup>
          </LinkModalContent>
        </LinkModal>
      )}
    </ViewerContainer>
  );
}
