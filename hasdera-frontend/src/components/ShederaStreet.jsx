/**
 * ShederaStreet.jsx
 * 🌳 "מדורים" - ריבועים בזיגזג עם אנימציות חלקות
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css, createGlobalStyle } from "styled-components";
import { 
  Book, Utensils, Gift, Coffee, Puzzle, ShoppingBag, 
  Sparkles, ChevronDown, ArrowRight, Newspaper, TreePine,
  Music, Volume2, VolumeX, Play, Pause
} from "lucide-react";

// ================ ANIMATIONS ================

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const popInLeft = keyframes`
  0% { 
    opacity: 0; 
    transform: translateX(-150px) scale(0.7);
  }
  100% { 
    opacity: 1; 
    transform: translateX(0) scale(1);
  }
`;

const popInRight = keyframes`
  0% { 
    opacity: 0; 
    transform: translateX(150px) scale(0.7);
  }
  100% { 
    opacity: 1; 
    transform: translateX(0) scale(1);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const scrollHint = keyframes`
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(12px); opacity: 0.5; }
`;

// Realistic bird flying across screen - smooth horizontal movement
const birdFlyAcross = keyframes`
  0% {
    transform: translateX(-100px) translateY(0) scaleX(1);
  }
  50% {
    transform: translateX(calc(50vw)) translateY(-20px) scaleX(1);
  }
  100% {
    transform: translateX(calc(100vw + 100px)) translateY(0) scaleX(1);
  }
`;

// Realistic leaf falling - starts from current position and falls down naturally
const leafFall = keyframes`
  0% {
    transform: translateY(0) rotate(0deg) translateX(0);
    opacity: 0.8;
  }
  10% {
    transform: translateY(10vh) rotate(25deg) translateX(15px);
  }
  20% {
    transform: translateY(20vh) rotate(-20deg) translateX(-10px);
  }
  30% {
    transform: translateY(30vh) rotate(35deg) translateX(20px);
  }
  40% {
    transform: translateY(40vh) rotate(-25deg) translateX(-15px);
  }
  50% {
    transform: translateY(50vh) rotate(30deg) translateX(25px);
  }
  60% {
    transform: translateY(60vh) rotate(-30deg) translateX(-20px);
  }
  70% {
    transform: translateY(70vh) rotate(40deg) translateX(30px);
  }
  80% {
    transform: translateY(80vh) rotate(-35deg) translateX(-10px);
    opacity: 0.5;
  }
  90% {
    transform: translateY(90vh) rotate(45deg) translateX(35px);
    opacity: 0.2;
  }
  100% {
    transform: translateY(100vh) rotate(60deg) translateX(40px);
    opacity: 0;
  }
`;


// Enhanced twinkle - more realistic sparkle
const twinkle = keyframes`
  0%, 100% { opacity: 0.1; transform: scale(0.7); filter: brightness(0.8); }
  25% { opacity: 0.6; transform: scale(1.1); filter: brightness(1.2); }
  50% { opacity: 1; transform: scale(1.4); filter: brightness(1.5); }
  75% { opacity: 0.5; transform: scale(1.0); filter: brightness(1.1); }
`;

// Firefly floating movement - gentle, organic
const fireflyFloat = keyframes`
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  20% {
    transform: translate(15px, -20px) scale(1.2);
    opacity: 0.8;
  }
  40% {
    transform: translate(-10px, -35px) scale(0.9);
    opacity: 0.5;
  }
  60% {
    transform: translate(20px, -50px) scale(1.1);
    opacity: 0.9;
  }
  80% {
    transform: translate(-5px, -60px) scale(1);
    opacity: 0.4;
  }
  100% {
    transform: translate(10px, -70px) scale(1.15);
    opacity: 0.6;
  }
`;

// Firefly glow pulse
const fireflyGlow = keyframes`
  0%, 100% {
    opacity: 0.4;
    box-shadow: 0 0 5px rgba(255, 255, 180, 0.5), 0 0 10px rgba(255, 255, 200, 0.3);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 10px rgba(255, 255, 180, 0.8), 0 0 20px rgba(255, 255, 200, 0.5), 0 0 30px rgba(255, 255, 220, 0.3);
  }
`;

// Lantern gentle sway and glow
const lanternSway = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(-1deg);
    filter: brightness(1);
  }
  25% {
    transform: translateY(-3px) rotate(1deg);
    filter: brightness(1.1);
  }
  50% {
    transform: translateY(0) rotate(-1deg);
    filter: brightness(0.95);
  }
  75% {
    transform: translateY(-2px) rotate(1deg);
    filter: brightness(1.05);
  }
`;

const lanternGlow = keyframes`
  0%, 100% {
    opacity: 0.6;
    filter: drop-shadow(0 0 8px rgba(255, 200, 100, 0.6));
  }
  50% {
    opacity: 1;
    filter: drop-shadow(0 0 15px rgba(255, 200, 100, 0.9)) drop-shadow(0 0 25px rgba(255, 220, 120, 0.5));
  }
`;

// Realistic butterfly fluttering - erratic, delicate movement
const floatAround = keyframes`
  0% { transform: translate(0, 0) rotate(0deg) scale(1); }
  5% { transform: translate(8px, -12px) rotate(8deg) scale(1.05); }
  10% { transform: translate(-5px, -8px) rotate(-5deg) scale(0.95); }
  15% { transform: translate(15px, -25px) rotate(12deg) scale(1.1); }
  20% { transform: translate(10px, -15px) rotate(3deg) scale(1); }
  25% { transform: translate(-12px, -30px) rotate(-8deg) scale(1.05); }
  30% { transform: translate(5px, -22px) rotate(6deg) scale(0.98); }
  35% { transform: translate(20px, -35px) rotate(15deg) scale(1.08); }
  40% { transform: translate(12px, -28px) rotate(-3deg) scale(1); }
  45% { transform: translate(-8px, -40px) rotate(-10deg) scale(1.02); }
  50% { transform: translate(18px, -32px) rotate(10deg) scale(1.05); }
  55% { transform: translate(25px, -45px) rotate(5deg) scale(0.95); }
  60% { transform: translate(10px, -38px) rotate(-12deg) scale(1.1); }
  65% { transform: translate(-15px, -42px) rotate(-8deg) scale(1); }
  70% { transform: translate(22px, -48px) rotate(12deg) scale(1.05); }
  75% { transform: translate(8px, -50px) rotate(-5deg) scale(0.98); }
  80% { transform: translate(30px, -55px) rotate(15deg) scale(1.08); }
  85% { transform: translate(15px, -58px) rotate(3deg) scale(1); }
  90% { transform: translate(-10px, -60px) rotate(-10deg) scale(1.02); }
  95% { transform: translate(25px, -62px) rotate(8deg) scale(1.05); }
  100% { transform: translate(0, -65px) rotate(0deg) scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.5); opacity: 0.2; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

// ================ GLOBAL STYLES ================

const SmoothScrollStyles = createGlobalStyle`
  html {
    scroll-behavior: smooth;
  }
  
  body {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

// ================ STYLED COMPONENTS ================

const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  /* Enable 3D perspective for walking effect */
  perspective: 1000px;
  perspective-origin: center center;
  transform-style: preserve-3d;
`;

// Fixed Background - parallax effect for walking
const FixedBackground = styled.div`
  position: fixed;
  inset: 0;
  background-image: url("/image/ChatGPT Image Nov 16, 2025, 08_56_06 PM.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: 0;
  will-change: transform;
  /* Parallax effect - moves slower (far away) - uses CSS variable */
  transform: translateY(calc(var(--scroll-y, 0px) * 0.3)) translateZ(-200px) scale(1.2);
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(15, 23, 42, 0.4) 0%,
      rgba(20, 30, 48, 0.3) 50%,
      rgba(15, 23, 42, 0.45) 100%
    );
  }
  
  /* Subtle depth effect */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      transparent 0%,
      rgba(15, 23, 42, 0.1) 50%,
      rgba(15, 23, 42, 0.2) 100%
    );
    pointer-events: none;
  }
`;

// ===== 3D ELEMENTS - Parallax walking effect =====

const AnimationLayer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
  /* Parallax layer - moves at medium speed (closer than background) */
  transform-style: preserve-3d;
  transform: translateY(calc(var(--scroll-y, 0px) * 0.5)) translateZ(0);
  transition: transform 0.1s ease-out;
`;

// Realistic bird flying - using emoji with smooth flight animation
const FlyingBird = styled.div`
  position: absolute;
  top: ${props => props.$top}%;
  left: 0;
  font-size: ${props => props.$size || '2rem'};
  opacity: ${props => props.$opacity || 0.7};
  animation: ${birdFlyAcross} ${props => props.$duration || 20}s linear infinite;
  animation-delay: ${props => props.$delay || 0}s;
  will-change: transform;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
`;

// Falling leaves - appear at different heights naturally
const LeafElement = styled.div`
  position: absolute;
  top: ${props => props.$startTop || 0}%;
  left: ${props => props.$left}%;
  font-size: ${props => props.$size}rem;
  animation: ${leafFall} ${props => props.$duration}s linear infinite;
  animation-delay: ${props => props.$delay}s;
  will-change: transform;
`;


// Sparkles - pure CSS
const SparkleElement = styled.div`
  position: absolute;
  top: ${props => props.$top};
  left: ${props => props.$left};
  font-size: 1.3rem;
  animation: ${twinkle} ${props => props.$duration}s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  will-change: transform, opacity;
`;

// Floating elements - butterflies, flowers
const FloatingItem = styled.div`
  position: absolute;
  top: ${props => props.$top};
  ${props => props.$left ? `left: ${props.$left};` : ''}
  ${props => props.$right ? `right: ${props.$right};` : ''}
  font-size: ${props => props.$size};
  opacity: ${props => props.$opacity};
  animation: ${floatAround} ${props => props.$duration}s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  will-change: transform;
`;


// Light beams - decorative
const LightBeam = styled.div`
  position: absolute;
  top: 0;
  left: ${props => props.$left}%;
  width: 100px;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08) 0%,
    transparent 40%
  );
  transform: rotate(${props => props.$rotate}deg);
  animation: ${pulse} ${props => props.$duration}s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
`;

// Stars
const StarElement = styled.div`
  position: absolute;
  top: ${props => props.$top};
  left: ${props => props.$left};
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: ${twinkle} ${props => props.$duration}s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

// Spinning element
const SpinningElement = styled.div`
  position: absolute;
  top: ${props => props.$top};
  ${props => props.$left ? `left: ${props.$left};` : ''}
  ${props => props.$right ? `right: ${props.$right};` : ''}
  font-size: ${props => props.$size};
  opacity: ${props => props.$opacity};
  animation: ${spin} ${props => props.$duration}s linear infinite;
`;

// Magical firefly element
const FireflyElement = styled.div`
  position: absolute;
  top: ${props => props.$top};
  left: ${props => props.$left};
  width: ${props => props.$size || '6px'};
  height: ${props => props.$size || '6px'};
  background: radial-gradient(circle, rgba(255, 255, 180, 1) 0%, rgba(255, 255, 100, 0.8) 40%, transparent 70%);
  border-radius: 50%;
  animation: ${fireflyFloat} ${props => props.$duration}s ease-in-out infinite,
             ${fireflyGlow} 2s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s, ${props => (props.$delay || 0) * 0.3}s;
  will-change: transform, opacity;
  pointer-events: none;
`;

// Lantern with glow effect
const LanternElement = styled.div`
  position: absolute;
  top: ${props => props.$top};
  left: ${props => props.$left};
  font-size: ${props => props.$size || '2rem'};
  animation: ${lanternSway} ${props => props.$duration}s ease-in-out infinite,
             ${lanternGlow} 3s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s, ${props => (props.$delay || 0) * 0.5}s;
  will-change: transform, filter;
  filter: drop-shadow(0 0 10px rgba(255, 200, 100, 0.7));
`;

const Content = styled.div`
  position: relative;
  z-index: 10;
  /* Content moves at normal speed (closest layer) */
  transform: translateZ(100px);
  transform-style: preserve-3d;
`;

// ===== WELCOME SECTION =====

const WelcomeSection = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  position: relative;
`;

const WelcomeContent = styled.div`
  animation: ${float} 4s ease-in-out infinite;
`;

const WelcomeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 50px;
  color: #10b981;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
`;

const WelcomeTitle = styled.h1`
  font-family: 'Cormorant Garamond', 'David Libre', serif;
  font-size: clamp(3rem, 10vw, 6rem);
  font-weight: 300;
  color: #f8fafc;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 40px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.05em;
`;

const WelcomeSubtitle = styled.p`
  font-size: clamp(1rem, 3vw, 1.3rem);
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 3rem;
  max-width: 550px;
  line-height: 1.8;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const ScrollHint = styled.div`
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  animation: ${scrollHint} 2s ease-in-out infinite;
  
  span {
    font-size: 0.9rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
`;

// ===== ZIGZAG SECTIONS =====

const SectionsArea = styled.section`
  padding: 0 2rem 250px;
`;

const ZigzagContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 150px;
`;

const CardWrapper = styled.div`
  display: flex;
  justify-content: ${props => props.$side === 'left' ? 'flex-start' : 'flex-end'};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

// Card with smooth appearance
const SectionCard = styled.div`
  width: 100%;
  max-width: 480px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.14) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border-radius: 28px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  backdrop-filter: blur(25px);
  position: relative;
  overflow: hidden;
  will-change: transform, opacity;
  
  /* Invisible until visible */
  opacity: 0;
  visibility: hidden;
  transform: ${props => props.$side === 'left' ? 'translateX(-100px)' : 'translateX(100px)'};
  
  ${props => props.$visible && props.$side === 'left' && css`
    visibility: visible;
    animation: ${popInLeft} 0.6s ease-out forwards;
  `}
  
  ${props => props.$visible && props.$side === 'right' && css`
    visibility: visible;
    animation: ${popInRight} 0.6s ease-out forwards;
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: ${props => props.$gradient};
    border-radius: 28px 28px 0 0;
    transition: height 0.3s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(255, 255, 255, 0.12) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  &:hover {
    transform: scale(1.03) translateY(-8px);
    border-color: ${props => props.$color}60;
    box-shadow: 
      0 35px 70px rgba(0, 0, 0, 0.4),
      0 0 80px ${props => props.$color}20;
    
    &::before { height: 8px; }
    &::after { opacity: 1; }
  }
`;

const CardIcon = styled.div`
  width: 85px;
  height: 85px;
  background: ${props => props.$gradient};
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 18px 45px ${props => props.$color}50;
  transition: all 0.4s ease;
  
  svg {
    color: white;
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35));
  }
  
  ${SectionCard}:hover & {
    transform: scale(1.15) rotate(-8deg);
    animation: ${bounce} 0.5s ease-in-out;
  }
`;

const CardLabel = styled.span`
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background: ${props => props.$gradient};
  color: white;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  box-shadow: 0 6px 20px ${props => props.$color}50;
`;

const CardTitle = styled.h3`
  font-size: 1.9rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.75rem;
  transition: color 0.3s ease;
  
  ${SectionCard}:hover & {
    color: ${props => props.$color};
  }
`;

const CardDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.75rem;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
`;

const CardBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.95rem;
`;

const CardArrow = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  svg {
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
  }
  
  ${SectionCard}:hover & {
    background: ${props => props.$gradient};
    transform: scale(1.1);
    
    svg {
      color: white;
      transform: translateX(-5px);
    }
  }
`;

// ================ DATA ================

const SECTIONS = [
  {
    id: 'recipes',
    title: 'מתכונים',
    description: 'מתכונים טעימים, טיפים קולינריים וסודות המטבח שלנו',
    icon: Utensils,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    path: '/sections/recipes',
    label: '🍳 טעים!',
  },
  {
    id: 'stories',
    title: 'סיפורים בהמשכים',
    description: 'סיפורים מרגשים שילוו אותך לאורך כל השבוע',
    icon: Book,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    path: '/sections/stories',
    label: '📚 פרק חדש',
  },
  {
    id: 'challenges',
    title: 'חידות ואתגרים',
    description: 'סודוקו, חידות חשיבה ואתגרים שבועיים מאתגרים',
    icon: Puzzle,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    path: '/sections/challenges',
    label: '🧩 אתגר!',
  },
  {
    id: 'giveaways',
    title: 'הגרלות ופרסים',
    description: 'השתתפי בהגרלות שבועיות ותזכי בפרסים מדהימים',
    icon: Gift,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    path: '/sections/giveaways',
    label: '🎁 הגרלה!',
  },
  {
    id: 'articles',
    title: 'כתבות וטורים',
    description: 'טורים אישיים, כתבות מעמיקות ושיחות מהלב',
    icon: Coffee,
    color: '#92400e',
    gradient: 'linear-gradient(135deg, #b45309, #92400e)',
    path: '/sections/articles',
    label: '☕ חדש!',
  },
  {
    id: 'market',
    title: 'לוח קהילתי',
    description: 'קניה, מכירה, שירותים - הכל בתוך הקהילה שלנו',
    icon: ShoppingBag,
    color: '#059669',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    path: '/sections/market',
    label: '🛍️ עסקאות',
  },
  {
    id: 'issues',
    title: 'ארכיון גיליונות',
    description: 'כל הגיליונות הקודמים של השדרה במקום אחד',
    icon: Newspaper,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    path: '/issues',
    label: '📰 ארכיון',
  },
];

const LEAVES = ['🍂', '🍃', '🌿', '🍀', '🌸', '🌺'];

// ================ MUSIC CONTROLS ================

const MusicControls = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: ${fadeIn} 1s ease-out;
`;

const MusicButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(16, 185, 129, 0.4);
  color: #10b981;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
  
  &:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: rgba(16, 185, 129, 0.6);
    transform: scale(1.1);
    box-shadow: 0 6px 30px rgba(16, 185, 129, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const VolumeButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.1);
  }
`;

const VolumeSlider = styled.input`
  width: 56px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #10b981;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  }
  
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #10b981;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  }
`;

// ================ COMPONENT ================

export default function ShederaStreet() {
  const navigate = useNavigate();
  const [visibleCards, setVisibleCards] = useState(new Set());
  const cardRefs = useRef([]);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // Default volume: 30%
  const [isMuted, setIsMuted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef(null);
  
  // Enable smooth scrolling on mount
  useEffect(() => {
    // Add smooth scroll to html
    document.documentElement.style.scrollBehavior = 'smooth';
    document.body.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = '';
      document.body.style.scrollBehavior = '';
    };
  }, []);
  
  // Walking effect - parallax on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Update CSS variables for parallax effect
      document.documentElement.style.setProperty('--scroll-y', `${currentScrollY}px`);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Intersection Observer for cards
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.id;
            setVisibleCards(prev => new Set([...prev, id]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    );
    
    cardRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => observer.disconnect();
  }, []);
  
  const handleCardClick = (section) => {
    navigate(section.path);
  };
  
  // Music controls
  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing music:', error);
      // Some browsers require user interaction first
    }
  };
  
  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  
  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
    }
  }, [volume]);
  
  // Try to autoplay on mount (only once)
  useEffect(() => {
    if (!audioRef.current) return;
    
    // Try to autoplay on mount (may require user interaction in some browsers)
    const tryAutoplay = async () => {
      try {
        // Wait for audio to be ready
        if (audioRef.current.readyState >= 2) {
          await audioRef.current.play();
          setIsPlaying(true);
        } else {
          // Wait for audio to load
          audioRef.current.addEventListener('canplay', async () => {
            try {
              await audioRef.current.play();
              setIsPlaying(true);
            } catch (error) {
              console.log('Autoplay blocked, user interaction required');
            }
          }, { once: true });
        }
      } catch (error) {
        // Autoplay blocked - user will need to click play button
        console.log('Autoplay blocked, user interaction required');
      }
    };
    
    // Small delay to ensure audio element is ready
    const timer = setTimeout(() => {
      tryAutoplay();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []); // Run only once on mount
  
  return (
    <>
      <SmoothScrollStyles />
      
      {/* Background Music */}
      <audio
        ref={audioRef}
        preload="auto"
        loop
        volume={volume}
      >
        <source src="/music/Slow-calm-relaxing-music.mp3" type="audio/mpeg" />
      </audio>
      
      {/* Music Controls */}
      <MusicControls>
        <MusicButton onClick={togglePlay} title={isPlaying ? 'עצור מוזיקה' : 'הפעל מוזיקה'}>
          {isPlaying ? <Pause size={24} /> : <Music size={24} />}
        </MusicButton>
        <VolumeButton onClick={toggleMute} title={isMuted ? 'הפעל קול' : 'השתק'}>
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </VolumeButton>
        <VolumeSlider
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          title={`עוצמה: ${Math.round(volume * 100)}%`}
        />
      </MusicControls>
      <PageContainer ref={containerRef}>
        <FixedBackground />
      
      {/* Animation Layer - all pure CSS, no JS updates */}
      <AnimationLayer>
        {/* Natural falling leaves - appear at different heights throughout the screen */}
        {[...Array(20)].map((_, i) => {
          // Distribute leaves naturally across the screen height (0% to 100%)
          const startTop = (i * 5) % 100; // Spread across entire screen height
          const leftPosition = 5 + (i * 4.5); // Spread across width
          const duration = 12 + (i % 7) * 2; // Varying speeds
          const delay = i * 0.8; // Staggered timing
          
          return (
            <LeafElement
              key={`leaf-${i}`}
              $left={leftPosition}
              $startTop={startTop}
              $size={1.2 + (i % 4) * 0.2}
              $duration={duration}
              $delay={delay}
            >
              {LEAVES[i % LEAVES.length]}
            </LeafElement>
          );
        })}
        
        {/* Sparkles */}
        <SparkleElement $top="18%" $left="12%" $duration={2.5} $delay={0}>✨</SparkleElement>
        <SparkleElement $top="30%" $left="88%" $duration={3} $delay={0.5}>✨</SparkleElement>
        <SparkleElement $top="48%" $left="8%" $duration={2.8} $delay={1}>✨</SparkleElement>
        <SparkleElement $top="62%" $left="92%" $duration={3.2} $delay={1.5}>✨</SparkleElement>
        <SparkleElement $top="78%" $left="15%" $duration={2.6} $delay={2}>✨</SparkleElement>
        <SparkleElement $top="88%" $left="85%" $duration={2.9} $delay={0.8}>✨</SparkleElement>
        
        {/* Floating items */}
        <FloatingItem $right="7%" $top="35%" $size="2.5rem" $opacity={0.5} $duration={12} $delay={0}>🦋</FloatingItem>
        <FloatingItem $left="5%" $top="58%" $size="2rem" $opacity={0.45} $duration={15} $delay={3}>🦋</FloatingItem>
        <FloatingItem $right="10%" $top="70%" $size="2.2rem" $opacity={0.4} $duration={14} $delay={6}>🌸</FloatingItem>
        <FloatingItem $left="8%" $top="25%" $size="1.8rem" $opacity={0.35} $duration={16} $delay={2}>🌺</FloatingItem>
        
        {/* Light beams */}
        <LightBeam $left={20} $rotate={-15} $duration={8} $delay={0} />
        <LightBeam $left={70} $rotate={15} $duration={10} $delay={2} />
        
        {/* Stars */}
        <StarElement $top="10%" $left="25%" $duration={2} $delay={0} />
        <StarElement $top="18%" $left="75%" $duration={2.5} $delay={0.5} />
        <StarElement $top="35%" $left="15%" $duration={3} $delay={1} />
        <StarElement $top="50%" $left="85%" $duration={2.2} $delay={1.5} />
        <StarElement $top="70%" $left="20%" $duration={2.8} $delay={0.3} />
        <StarElement $top="82%" $left="80%" $duration={2.4} $delay={0.8} />
        
        {/* Spinning flowers */}
        <SpinningElement $left="2%" $top="40%" $size="1.5rem" $opacity={0.3} $duration={20}>🌼</SpinningElement>
        <SpinningElement $right="3%" $top="65%" $size="1.3rem" $opacity={0.25} $duration={25}>🌻</SpinningElement>
        
        {/* Magical fireflies */}
        <FireflyElement $top="25%" $left="8%" $size="5px" $duration={8} $delay={0} />
        <FireflyElement $top="35%" $left="15%" $size="7px" $duration={10} $delay={2} />
        <FireflyElement $top="45%" $left="5%" $size="4px" $duration={12} $delay={4} />
        <FireflyElement $top="55%" $left="12%" $size="6px" $duration={9} $delay={1} />
        <FireflyElement $top="65%" $left="7%" $size="5px" $duration={11} $delay={3} />
        <FireflyElement $top="75%" $left="18%" $size="4px" $duration={8} $delay={5} />
        <FireflyElement $top="30%" $left="85%" $size="6px" $duration={10} $delay={1.5} />
        <FireflyElement $top="40%" $left="90%" $size="5px" $duration={12} $delay={3.5} />
        <FireflyElement $top="50%" $left="82%" $size="7px" $duration={9} $delay={0.5} />
        <FireflyElement $top="60%" $left="88%" $size="4px" $duration={11} $delay={2.5} />
        <FireflyElement $top="70%" $left="92%" $size="5px" $duration={8} $delay={4.5} />
        <FireflyElement $top="80%" $left="84%" $size="6px" $duration={10} $delay={1} />
        
        {/* Glowing lanterns along the path */}
        <LanternElement $left="6%" $top="20%" $size="2rem" $duration={4} $delay={0}>🏮</LanternElement>
        <LanternElement $left="12%" $top="50%" $size="1.8rem" $duration={5} $delay={1}>🏮</LanternElement>
        <LanternElement $left="8%" $top="80%" $size="2rem" $duration={4.5} $delay={0.5}>🏮</LanternElement>
        <LanternElement $left="88%" $top="25%" $size="1.9rem" $duration={5.5} $delay={1.5}>🏮</LanternElement>
        <LanternElement $left="92%" $top="60%" $size="2rem" $duration={4.2} $delay={0.8}>🏮</LanternElement>
        <LanternElement $left="86%" $top="85%" $size="1.7rem" $duration={5.2} $delay={1.2}>🏮</LanternElement>
      </AnimationLayer>
      
      <Content>
        {/* Welcome */}
        <WelcomeSection>
          <WelcomeContent>
            <WelcomeBadge>
              <TreePine size={20} />
              מדורי השדרה
            </WelcomeBadge>
            <WelcomeTitle>המדורים שלנו</WelcomeTitle>
            <WelcomeSubtitle>
              גללי למטה וגלי את כל התכנים המיוחדים
            </WelcomeSubtitle>
          </WelcomeContent>
          
          <ScrollHint>
            <span>גללי למטה</span>
            <ChevronDown size={32} />
          </ScrollHint>
        </WelcomeSection>
        
        {/* Zigzag Cards */}
        <SectionsArea>
          <ZigzagContainer>
            {SECTIONS.map((section, index) => {
              const Icon = section.icon;
              const isVisible = visibleCards.has(section.id);
              const side = index % 2 === 0 ? 'left' : 'right';
              
              return (
                <CardWrapper key={section.id} $side={side}>
                  <SectionCard
                    ref={el => cardRefs.current[index] = el}
                    data-id={section.id}
                    $color={section.color}
                    $gradient={section.gradient}
                    $visible={isVisible}
                    $side={side}
                    onClick={() => handleCardClick(section)}
                  >
                    <CardLabel $color={section.color} $gradient={section.gradient}>
                      {section.label}
                    </CardLabel>
                    
                    <CardIcon $color={section.color} $gradient={section.gradient}>
                      <Icon size={38} />
                    </CardIcon>
                    
                    <CardTitle $color={section.color}>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                    
                    <CardFooter>
                      <CardBadge>
                        <Sparkles size={16} />
                        לחצי לכניסה
                      </CardBadge>
                      
                      <CardArrow $gradient={section.gradient}>
                        <ArrowRight size={22} />
                      </CardArrow>
                    </CardFooter>
                  </SectionCard>
                </CardWrapper>
              );
            })}
          </ZigzagContainer>
        </SectionsArea>
      </Content>
      </PageContainer>
    </>
  );
}
