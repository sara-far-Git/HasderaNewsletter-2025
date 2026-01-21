/**
 * FlipCanvasViewer.jsx
 * צופה מגזין מתקדם עם Real3D FlipBook
 * גרסה מתוקנת - איקונים + הסתרת ממשק Real3D
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { useNavigate } from "react-router-dom";
import { Link as LinkIcon, Mail, ExternalLink, Phone, MapPin, Calendar, Clock, Star, Heart, ShoppingCart, User } from "lucide-react";

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

const Logo = styled.div`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.8rem;
  font-weight: 300;
  color: white;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover { color: #10b981; }
  
  @media (max-width: 768px) { font-size: 1.4rem; }
`;

const HeaderCenter = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IssueTitle = styled.h1`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 1px;
  margin: 0;
  
  @media (max-width: 768px) { display: none; }
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  pointer-events: auto; /* ✅ מאפשר events */
  
  /* וידוא שהספר מוצג */
  & > div {
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
  }
`;

// ============================================
// 🎯 Link Overlay Components (צד קוראים בלבד, ללא גרירה)
const LinkOverlay = styled.div`
  position: absolute;
  top: ${props => props.y}px;
  left: ${props => props.x}px;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: 2px solid rgba(20, 184, 166, 0.6);
  background: rgba(20, 184, 166, 0.08);
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  user-select: none;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  
  &:hover {
    background: rgba(20, 184, 166, 0.2);
    border-color: #14b8a6;
    transform: translateY(-1px) scale(1.01);
  }
`;

const LinkBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  background: #14b8a6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const LinkIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

// איקונים זמינים לקישורים (תואם AdminFlipbookViewer)
const availableIcons = [
  { name: 'Link', component: LinkIcon },
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
];

// 🎯 חצי ניווט מותאמים אישית
// ============================================
const NavigationArrow = styled.button`
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  display: flex !important;
  visibility: visible !important;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.85);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(16, 185, 129, 0.6);
  border-radius: 50%;
  color: white;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  z-index: 10002;
  transition: all 0.3s ease;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  pointer-events: ${props => props.$disabled ? 'auto' : 'auto'};
  font-size: 24px;
  font-weight: bold;
  
  ${props => props.$side === 'right' ? 'right: 30px;' : 'left: 30px;'}
  
  &:hover:not(:disabled) {
    background: rgba(16, 185, 129, 1);
    border-color: white;
    transform: translateY(-50%) scale(1.15);
    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.7);
  }
  
  &:active:not(:disabled) {
    transform: translateY(-50%) scale(0.95);
  }
  
  &:disabled {
    cursor: not-allowed;
    background: rgba(100, 100, 100, 0.5);
    border-color: rgba(100, 100, 100, 0.3);
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    ${props => props.$side === 'right' ? 'right: 15px;' : 'left: 15px;'}
  }
`;

// ============================================
// 🎯 אזורי לחיצה פשוטים בצדי העמודים
// ============================================
const ClickZone = styled.div`
  position: fixed;
  top: 74px;
  ${props =>
    props.$side === 'right'
      ? 'right: 0;'
      : props.$isFirstPage
        ? 'left: calc(50% - 90px);'
        : 'left: 0;'
  }
  width: 180px;
  height: calc(100vh - 74px);
  cursor: ${props => props.$disabled ? 'default' : 'pointer'};
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
  z-index: 9999;
  
  /* רקע שקוף עם אפקט hover עדין */
  background: transparent;
  transition: background 0.3s ease;
  
  &:hover {
    background: ${props => props.$disabled ? 'transparent' : 
      props.$side === 'right' 
        ? 'linear-gradient(to right, transparent 0%, rgba(16, 185, 129, 0.08) 100%)' 
        : 'linear-gradient(to left, transparent 0%, rgba(16, 185, 129, 0.08) 100%)'
    };
  }
  
  @media (max-width: 768px) {
    width: 120px;
  }
`;

// ============================================
// 🎯 אפקט עיקול פינה מותאם אישית
// ============================================
const PageCurlOverlay = styled.div`
  position: fixed;
  top: 74px;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10000;
`;

const CurlZone = styled.div`
  position: absolute;
  width: 150px;
  height: 100%;
  pointer-events: auto;
  cursor: pointer;
  
  ${props => props.$side === 'right' ? 'right: 0;' : 'left: 0;'}
  
  /* Visual indicator - subtle background */
  background: ${props => props.$side === 'right' 
    ? 'linear-gradient(to right, transparent 0%, rgba(16, 185, 129, 0.05) 100%)' 
    : 'linear-gradient(to left, transparent 0%, rgba(16, 185, 129, 0.05) 100%)'
  };
  transition: background 0.3s ease;
  
  &:hover {
    background: ${props => props.$side === 'right' 
      ? 'linear-gradient(to right, transparent 0%, rgba(16, 185, 129, 0.15) 100%)' 
      : 'linear-gradient(to left, transparent 0%, rgba(16, 185, 129, 0.15) 100%)'
    };
  }
`;

const CurlEffect = styled.div`
  position: absolute;
  bottom: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: bottom right;
  
  ${props => props.$side === 'right' ? `
    right: 0;
    transform-origin: bottom right;
  ` : `
    left: 0;
    transform-origin: bottom left;
  `}
  
  ${props => props.$active && `
    width: ${props.$curlSize || 80}px;
    height: ${props.$curlSize || 80}px;
  `}
`;

const CurlPage = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    ${props => props.$side === 'right' ? '135deg' : '225deg'},
    #f5f5f5 0%,
    #e8e8e8 50%,
    #d0d0d0 100%
  );
  border-radius: ${props => props.$side === 'right' ? '0 0 0 100%' : '0 0 100% 0'};
  box-shadow: 
    ${props => props.$side === 'right' 
      ? '-3px -3px 10px rgba(0,0,0,0.2), inset 2px 2px 5px rgba(255,255,255,0.8)' 
      : '3px -3px 10px rgba(0,0,0,0.2), inset -2px 2px 5px rgba(255,255,255,0.8)'
    };
  transform: ${props => props.$side === 'right' 
    ? 'rotateY(-20deg) rotateZ(5deg)' 
    : 'rotateY(20deg) rotateZ(-5deg)'
  };
  transform-style: preserve-3d;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      ${props => props.$side === 'right' ? '135deg' : '225deg'},
      transparent 40%,
      rgba(0,0,0,0.1) 100%
    );
    border-radius: inherit;
  }
  
  &::after {
    content: '';
    position: absolute;
    ${props => props.$side === 'right' ? 'left: 0; top: 0;' : 'right: 0; top: 0;'}
    width: 50%;
    height: 100%;
    background: linear-gradient(
      ${props => props.$side === 'right' ? 'to right' : 'to left'},
      rgba(0,0,0,0.15) 0%,
      transparent 100%
    );
  }
`;

const CurlShadow = styled.div`
  position: absolute;
  bottom: -10px;
  width: 120%;
  height: 30px;
  background: radial-gradient(
    ellipse at center,
    rgba(0,0,0,0.3) 0%,
    transparent 70%
  );
  filter: blur(5px);
  transform: ${props => props.$side === 'right' 
    ? 'translateX(-10%) skewX(-20deg)' 
    : 'translateX(10%) skewX(20deg)'
  };
  opacity: ${props => props.$active ? 1 : 0};
  transition: opacity 0.25s ease;
  
  ${props => props.$side === 'right' ? 'right: 0;' : 'left: 0;'}
`;

// 🎯 Corner Curl Indicator - סימן קבוע בפינה
const CornerIndicator = styled.div`
  position: absolute;
  bottom: 20px;
  width: 40px;
  height: 40px;
  pointer-events: none;
  opacity: ${props => props.$show ? 0.6 : 0};
  transition: opacity 0.3s ease;
  
  ${props => props.$side === 'right' ? 'right: 20px;' : 'left: 20px;'}
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      ${props => props.$side === 'right' ? '135deg' : '225deg'},
      #f0f0f0 0%,
      #d0d0d0 100%
    );
    border-radius: ${props => props.$side === 'right' ? '0 0 0 100%' : '0 0 100% 0'};
    box-shadow: ${props => props.$side === 'right' 
      ? '-2px -2px 6px rgba(0,0,0,0.15)' 
      : '2px -2px 6px rgba(0,0,0,0.15)'
    };
    animation: gentlePulse 2s ease-in-out infinite;
  }
  
  @keyframes gentlePulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
`;

// 🎨 Navigation Hint
const NavigationHint = styled.div`
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-family: 'Assistant', sans-serif;
  z-index: 10002;
  animation: ${fadeInUp} 0.5s ease-out, ${fadeOut} 0.5s ease-out 4s forwards;
  pointer-events: none;
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

// 🔧 תיקון: איקונים כ-inline SVG עם סגנונות מובנים
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

// ============================================
// 🔹 Main Component
// ============================================
export default function FlipCanvasViewer({ issue, onClose }) {
  const navigate = useNavigate();
  const flipbookContainerRef = useRef(null);
  const flipbookInstanceRef = useRef(null);
  const lastPageRef = useRef(1); // ✅ שמירת העמוד האחרון שהצגנו
  const trackedPageRef = useRef(1); // 🔄 Track actual page being displayed (independent from state)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [links, setLinks] = useState([]);

  // טעינת קישורים מה-metadata
  useEffect(() => {
    if (issue?.Summary || issue?.summary) {
      try {
        const summary = issue.Summary || issue.summary;
        const metadata = JSON.parse(summary);
        if (metadata.links && Array.isArray(metadata.links)) {
          console.log('🔗 FlipCanvasViewer: Loaded links from metadata:', metadata.links);
          const normalizedLinks = metadata.links.map((link, index) => {
            const normalized = {
              id: String(link.id || link.Id || Date.now() + index),
              page: Number(link.page || link.Page || 1),
              x: Number(link.x || link.X || 0),
              y: Number(link.y || link.Y || 0),
              width: Number(link.width || link.Width || 100),
              height: Number(link.height || link.Height || 50),
              url: String(link.url || link.Url || ''),
              icon: link.icon || link.Icon || 'Link',
              email: link.email || link.Email || ''
            };
            console.log('🔗 FlipCanvasViewer: Normalized link:', normalized);
            return normalized;
          });
          setLinks(normalizedLinks);
        }
      } catch (e) {
        console.error('Error parsing metadata:', e);
      }
    }
  }, [issue?.Summary, issue?.summary]);

  // הסתרת רמז
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

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

  // אתחול FlipBook
  useEffect(() => {
    if (!issue?.pdf_url || !flipbookContainerRef.current) return;
    if (!window.FlipBook && !window.FLIPBOOK) return;
    
    // ✅ תיקון: המרת pending-upload ל-URL מלא
    let pdfUrl = issue.pdf_url;
    if (pdfUrl.startsWith('pending-upload-')) {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 
                        window.location.origin.replace(':5173', ':5055').replace(/:\d+/, ':5055') ||
                        'http://localhost:5055';
      const tempFileName = pdfUrl.replace('pending-upload-', '');
      pdfUrl = `${apiBaseUrl}/api/issues/draft-file/${tempFileName}`;
      console.log('🔧 FlipCanvasViewer: Converted pending-upload to API URL:', pdfUrl);
    }
    
    // ✅ הוספת token לURL עבור draft-file endpoints
    if (pdfUrl.includes('/api/issues/draft-file/')) {
      const token = localStorage.getItem('hasdera_token');
      if (token) {
        const urlObj = new URL(pdfUrl);
        urlObj.searchParams.set('token', token);
        pdfUrl = urlObj.toString();
        console.log('🔧 Added token to draft-file URL');
      }
    }
    
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
        pdfTextLayer: false, // כבוי לביצועים
        htmlLayer: false, // כבוי לביצועים
        pdfAnnotationLayer: false, // כבוי לביצועים
        sound: false, // כבוי לביצועים
        flipSound: false, // כבוי לביצועים
        loadAllPages: false,
        loadPagesF: 2,
        loadPagesB: 1,
        viewMode: 'webgl',
        // 🔧 הגדרות לטעינה ישירה מ-S3 ללא שרת PHP
        pdfServiceUrl: null,
        usePdfjsLib: true,
        pdfBrowserViewerIfMobile: false,
        pdfDisableAutoFetch: false,
        pdfDisableStream: false,
        pdfDisableRange: false,
        pageFlipDuration: 0.5,
        lights: false,
        lightIntensity: 0,
        shadows: false,
        shadowOpacity: 0,
        pageRoughness: 0,
        pageHardness: 1,
        coverHardness: 1.5,
        pageSegmentsW: 10,
        pageMiddleShadowSize: 0,
        zoomMin: 0.85,
        responsiveView: true,
        bookMargin: 20,
        rotateCameraOnMouseDrag: false,
        pageDragDisabled: false,
        pageClickAreaWdith: '15%',
        cornerCurl: true,
        
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

        // ✅ הוסף event listener לחסום click propagation בFlipBook container
        if (flipbookContainerRef.current) {
          const handleContainerClick = (e) => {
            // אל תחסום את ה-events מ-FlipBook עצמו, רק אל תעביר אותם הלאה
            e.stopPropagation?.();
          };
          
          flipbookContainerRef.current.addEventListener('click', handleContainerClick, true);
          flipbookContainerRef.current.addEventListener('mousedown', handleContainerClick, true);
        }

        if (flipbook.on) {
          flipbook.on('pagechange', () => {
            const page = flipbook.getCurrentPageNumber?.();
            console.log('📄 pagechange event fired, page:', page);
            if (page) {
              trackedPageRef.current = page; // 🔄 Update tracked page immediately
              lastPageRef.current = page; // ✅ שמור את העמוד בRef
              setCurrentPage(page);
              console.log('✅ Updated currentPage state to:', page, 'tracked:', trackedPageRef.current);
            }
          });

          flipbook.on('ready', () => {
            console.log('✅ Flipbook ready event fired');
            setIsLoading(false);
            setTotalPages(flipbook.options?.numPages || flipbook.options?.pages?.length);
            
            // ✅ אם יש עמוד שנשמר, חזור אליו
            if (lastPageRef.current > 1) {
              try {
                flipbook.goToPage?.(lastPageRef.current);
                console.log('📖 Restored to page:', lastPageRef.current);
              } catch (e) {
                console.log('⚠️ Could not restore page:', e);
              }
            }
          });

          flipbook.on('pdfinit', () => {
            setIsLoading(false);
            setTotalPages(flipbook.options?.numPages);
          });

          flipbook.on('error', () => {
            setError("שגיאה בטעינת המגזין");
            setIsLoading(false);
          });
        }
      }
    } catch (err) {
      setError(`שגיאה: ${err.message}`);
      setIsLoading(false);
    }

    return () => {
      if (flipbookInstanceRef.current) {
        try {
          flipbookInstanceRef.current.destroy?.() || flipbookInstanceRef.current.dispose?.();
        } catch (e) {}
      }
    };
  }, [issue?.pdf_url]); // ✅ סיר את currentPage מכאן - זה גרם ללולאה אינסופית!

  // 🔧 פונקציות ניווט - משתמשות ב-getCurrentPageNumber + goToPage של הספרייה
  const goToPrevPage = useCallback(() => {
    const flipbook = flipbookInstanceRef.current;
    if (!flipbook) return;

    const current = flipbook.getCurrentPageNumber?.() || trackedPageRef.current || 1;
    console.log('⬅️ goToPrevPage: current from flipbook =', current);

    if (current <= 1) {
      console.log('⬅️ Already at first page');
      return;
    }

    const target = current - 1;
    console.log('⬅️ Going to page', target);
    trackedPageRef.current = target;
    setCurrentPage(target);
    flipbook.goToPage?.(target);
  }, []);

  const goToNextPage = useCallback(() => {
    const flipbook = flipbookInstanceRef.current;
    if (!flipbook) return;

    const current = flipbook.getCurrentPageNumber?.() || trackedPageRef.current || 1;
    const maxPages = flipbook.options?.numPages || totalPages || 999;
    console.log('➡️ goToNextPage: current from flipbook =', current, ', max =', maxPages);

    if (current >= maxPages) {
      console.log('➡️ Already at last page');
      return;
    }

    const target = current + 1;
    console.log('➡️ Going to page', target);
    trackedPageRef.current = target;
    setCurrentPage(target);
    flipbook.goToPage?.(target);
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

  // 🎯 טיפול בעיקול פינה
  const toggleFullscreen = () => {
    document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.();
  };

  const handleClose = () => onClose ? onClose() : navigate('/issues');

  // האם להראות עיקול בצד מסוים
  const canGoNext = totalPages ? currentPage < totalPages : false;
  const canGoPrev = currentPage > 1;

  return (
    <ViewerContainer>
      <FlipbookStyles />
      <BackgroundImage />
      
      {/* Header */}
      <Header>
        <Logo onClick={() => navigate('/')}>השדרה</Logo>
        
        <HeaderCenter>
          {issue?.title && <IssueTitle>{issue.title}</IssueTitle>}
          {!isLoading && !error && totalPages && (
            <PageCounter>
              עמוד <span>{currentPage}</span> מתוך <span>{totalPages}</span>
            </PageCounter>
          )}
        </HeaderCenter>
        
        <HeaderActions>
          <IconButton onClick={() => flipbookInstanceRef.current?.zoomOut?.()} title="הקטן">
            <ZoomOutIcon />
          </IconButton>
          <IconButton onClick={() => flipbookInstanceRef.current?.zoomIn?.()} title="הגדל">
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={toggleFullscreen} title="מסך מלא">
            <MaximizeIcon />
          </IconButton>
          <IconButton onClick={() => navigate('/admin/issues')} title="חזור לעריכה">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={() => navigate('/dashboard')} title="דשבורד">
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (canGoPrev) goToPrevPage();
            }}
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (canGoNext) goToNextPage();
            }}
            title={canGoNext ? "עמוד הבא" : "אין עמוד הבא"}
            aria-label={canGoNext ? "עמוד הבא" : "אין עמוד הבא"}
            disabled={!canGoNext}
          >
            <ChevronLeftIcon />
          </NavigationArrow>
        </>
      )}

      {/* Navigation hint */}
      {!isLoading && !error && showHint && currentPage === 1 && (
        <NavigationHint>
          השתמשי בחצים לדפדוף בעמודים
        </NavigationHint>
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

      {/* FlipBook */}
      {!error && (
        <FlipbookWrapper>
          <FlipbookContainer ref={flipbookContainerRef} />

          {/* קישורים אינטראקטיביים על גבי העיתון */}
          {!isLoading && !error && totalPages && (
            (() => {
              const filteredLinks = (links || []).filter(link => Number(link.page) === Number(currentPage));
              console.log('🔗 FlipCanvasViewer: Rendering links for page', currentPage, 'count:', filteredLinks.length);
              return filteredLinks.map(link => {
                const IconComponent = availableIcons.find(icon => icon.name === (link.icon || 'Link'))?.component || LinkIcon;
                return (
                  <LinkOverlay
                    key={link.id}
                    x={link.x}
                    y={link.y}
                    width={link.width}
                    height={link.height}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!link.url) return;
                      // טיפול ב-mailto
                      if (link.url.startsWith('mailto:')) {
                        window.location.href = link.url;
                        return;
                      }
                      try {
                        let urlToOpen = link.url;
                        if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
                          urlToOpen = `https://${urlToOpen}`;
                        }
                        window.open(urlToOpen, '_blank', 'noopener,noreferrer');
                      } catch (err) {
                        console.error('Error opening link:', err);
                      }
                    }}
                    title={link.url}
                  >
                    <LinkBadge>
                      <LinkIconWrapper>
                        <IconComponent size={18} />
                      </LinkIconWrapper>
                    </LinkBadge>
                  </LinkOverlay>
                );
              });
            })()
          )}
        </FlipbookWrapper>
      )}

      {/* אזורי לחיצה בקצוות העמודים */}
      {!isLoading && !error && (
        <>
          {/* אזור לחיצה ימני - עמוד קודם (RTL) */}
          <ClickZone 
            $side="right"
            $disabled={!canGoPrev}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (canGoPrev) goToPrevPage();
            }}
            title={canGoPrev ? "לחץ לעמוד הקודם" : ""}
          />
          
          {/* אזור לחיצה שמאלי - עמוד הבא (RTL) */}
          <ClickZone 
            $side="left"
            $isFirstPage={currentPage === 1}
            $disabled={!canGoNext}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (canGoNext) goToNextPage();
            }}
            title={canGoNext ? "לחץ לעמוד הבא" : ""}
          />
        </>
      )}
    </ViewerContainer>
  );
}