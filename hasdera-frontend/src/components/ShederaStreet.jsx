/**
 * ShederaStreet.jsx
 * 🌳 "טיול בשדרה" - חוויית רחוב אינטראקטיבית עם גלילה חלקה!
 * אלמנטים מופיעים תוך כדי גלילה
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import { 
  Book, Utensils, Gift, Coffee, Puzzle, ShoppingBag, 
  Star, Sparkles, ChevronDown, Trophy, Medal, Zap, 
  TreePine, ArrowRight, Armchair, Store, Building2
} from "lucide-react";

// ================ ANIMATIONS ================

const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(80px) scale(0.9); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
`;

const fadeInLeft = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-100px) rotate(-5deg); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0) rotate(0deg); 
  }
`;

const fadeInRight = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(100px) rotate(5deg); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0) rotate(0deg); 
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
`;

const sway = keyframes`
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
`;

const walkingDots = keyframes`
  0% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.3; transform: scale(0.8); }
`;

const birdFly = keyframes`
  0% { transform: translate(0, 0); }
  100% { transform: translate(calc(100vw + 100px), -50px); opacity: 0; }
`;

const leafFall = keyframes`
  0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
  10% { opacity: 0.8; }
  100% { transform: translateY(100vh) rotate(720deg) translateX(50px); opacity: 0; }
`;

const scrollHint = keyframes`
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(12px); opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

// ================ STYLED COMPONENTS ================

const StreetContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: #0f172a;
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
  z-index: 0;
  transform: translateY(${props => props.$scrollY * 0.2}px) scale(1.1);
  transition: transform 0.1s ease-out;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(15, 23, 42, 0.7) 0%,
      rgba(30, 41, 59, 0.5) 40%,
      rgba(15, 23, 42, 0.6) 70%,
      rgba(10, 15, 30, 0.85) 100%
    );
  }
`;

// Street Path (the road itself)
const StreetPath = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 100%;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(55, 65, 81, 0.2) 50%,
      rgba(55, 65, 81, 0.4) 100%
    );
    clip-path: polygon(35% 0%, 65% 0%, 90% 100%, 10% 100%);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 100%;
    background: repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.3) 0px,
      rgba(255, 255, 255, 0.3) 30px,
      transparent 30px,
      transparent 60px
    );
  }
`;

// Flying Elements
const Bird = styled.div`
  position: fixed;
  font-size: 2rem;
  animation: ${birdFly} ${props => props.$duration || 20}s linear infinite;
  animation-delay: ${props => props.$delay || 0}s;
  top: ${props => props.$top || 15}%;
  left: -80px;
  z-index: 50;
  opacity: 0.7;
`;

const Leaf = styled.div`
  position: fixed;
  font-size: ${props => props.$size || 1.5}rem;
  animation: ${leafFall} ${props => props.$duration || 15}s linear infinite;
  animation-delay: ${props => props.$delay || 0}s;
  left: ${props => props.$left || 50}%;
  top: 0;
  z-index: 45;
  opacity: 0.6;
`;

// Main Content
const Content = styled.div`
  position: relative;
  z-index: 10;
`;

// Welcome Section
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
  transform: translateY(${props => Math.min(0, -props.$scrollY * 0.5)}px);
  opacity: ${props => Math.max(0, 1 - props.$scrollY / 400)};
  transition: transform 0.1s ease-out, opacity 0.1s ease-out;
`;

const WelcomeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 50px;
  color: #10b981;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  animation: ${glow} 3s ease-in-out infinite;
`;

const WelcomeTitle = styled.h1`
  font-family: 'Cormorant Garamond', 'David Libre', serif;
  font-size: clamp(3rem, 10vw, 6rem);
  font-weight: 300;
  color: #f8fafc;
  margin-bottom: 0.5rem;
  text-shadow: 
    0 4px 30px rgba(0, 0, 0, 0.5),
    0 0 80px rgba(16, 185, 129, 0.2);
  letter-spacing: 0.05em;
`;

const WelcomeSubtitle = styled.p`
  font-size: clamp(1rem, 3vw, 1.4rem);
  color: #94a3b8;
  margin-bottom: 3rem;
  max-width: 600px;
  line-height: 1.8;
`;

const ScrollHint = styled.div`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #64748b;
  animation: ${scrollHint} 2s ease-in-out infinite;
  
  span {
    font-size: 0.9rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
`;

const WalkingDots = styled.div`
  display: flex;
  gap: 10px;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  animation: ${walkingDots} 1.5s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
`;

// ===== STREET STATIONS =====

const StationsSection = styled.section`
  padding: 0 2rem 200px;
  position: relative;
`;

const StationWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

// Each station on the street
const StreetStation = styled.div`
  display: flex;
  align-items: center;
  gap: 3rem;
  padding: 4rem 0;
  position: relative;
  flex-direction: ${props => props.$side === 'right' ? 'row-reverse' : 'row'};
  
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => {
    if (!props.$visible) {
      return props.$side === 'right' 
        ? 'translateX(100px)' 
        : 'translateX(-100px)';
    }
    return 'translateX(0)';
  }};
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

const StreetElement = styled.div`
  font-size: 6rem;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.4));
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: ${float} 4s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.2) rotate(5deg);
    filter: drop-shadow(0 15px 40px rgba(16, 185, 129, 0.4));
  }
  
  @media (max-width: 768px) {
    font-size: 4rem;
  }
`;

const StationCard = styled.div`
  flex: 1;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.03) 100%
  );
  border-radius: 28px;
  padding: 2rem 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$gradient};
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-8px);
    border-color: ${props => props.$color}50;
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.3),
      0 0 60px ${props => props.$color}20;
    
    &::after {
      opacity: 1;
    }
  }
`;

const StationIcon = styled.div`
  width: 70px;
  height: 70px;
  background: ${props => props.$gradient};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  box-shadow: 0 12px 35px ${props => props.$color}40;
  transition: all 0.4s ease;
  
  svg {
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  
  ${StationCard}:hover & {
    transform: scale(1.1) rotate(-5deg);
  }
  
  @media (max-width: 768px) {
    margin: 0 auto 1.25rem;
  }
`;

const StationLabel = styled.span`
  display: inline-block;
  padding: 0.4rem 1rem;
  background: ${props => props.$gradient};
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  box-shadow: 0 4px 15px ${props => props.$color}40;
`;

const StationTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.6rem;
  transition: color 0.3s ease;
  
  ${StationCard}:hover & {
    color: ${props => props.$color};
  }
`;

const StationDescription = styled.p`
  color: #94a3b8;
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
`;

const StationAction = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StationBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const StationArrow = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  svg {
    color: #64748b;
    transition: all 0.3s ease;
  }
  
  ${StationCard}:hover & {
    background: ${props => props.$gradient};
    
    svg {
      color: white;
      transform: translateX(-4px);
    }
  }
`;

// Street Decorations
const StreetDecor = styled.div`
  position: absolute;
  ${props => props.$left ? `left: ${props.$left};` : ''}
  ${props => props.$right ? `right: ${props.$right};` : ''}
  top: ${props => props.$top || '50%'};
  font-size: ${props => props.$size || '3rem'};
  opacity: 0.4;
  animation: ${sway} ${props => props.$duration || 6}s ease-in-out infinite;
  pointer-events: none;
  
  @media (max-width: 1200px) {
    display: none;
  }
`;

const LampPost = styled.div`
  position: absolute;
  ${props => props.$side === 'left' ? 'left: -120px;' : 'right: -120px;'}
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.8;
  
  @media (max-width: 1200px) {
    display: none;
  }
`;

const LampLight = styled.div`
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, #fef3c7, #fbbf24);
  border-radius: 50%;
  box-shadow: 
    0 0 30px rgba(251, 191, 36, 0.8),
    0 0 60px rgba(251, 191, 36, 0.4);
  margin-bottom: 5px;
`;

const LampPole = styled.div`
  width: 6px;
  height: 150px;
  background: linear-gradient(180deg, #475569, #334155);
  border-radius: 3px;
`;

// Easter Eggs
const EasterEgg = styled.div`
  position: fixed;
  cursor: pointer;
  font-size: 2rem;
  z-index: 40;
  opacity: ${props => props.$found ? 0.3 : 0.7};
  transition: all 0.4s ease;
  filter: ${props => props.$found ? 'grayscale(1)' : 'none'};
  
  &:hover {
    transform: scale(1.3) rotate(10deg);
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
  }
`;

const EasterEggPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(145deg, rgba(26, 32, 44, 0.98), rgba(15, 23, 42, 0.98));
  border: 2px solid #10b981;
  border-radius: 28px;
  padding: 2.5rem;
  text-align: center;
  z-index: 1000;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  max-width: 90%;
  width: 380px;
  backdrop-filter: blur(20px);
  animation: ${pulse} 0.3s ease-out;
`;

const EasterEggOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 999;
  backdrop-filter: blur(8px);
`;

const PopupEmoji = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: ${bounce} 1s ease-in-out infinite;
`;

const PopupTitle = styled.h3`
  color: #10b981;
  font-size: 1.4rem;
  margin-bottom: 0.75rem;
`;

const PopupMessage = styled.p`
  color: #e2e8f0;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const PopupButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  padding: 0.9rem 2.5rem;
  border-radius: 16px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
  }
`;

// Progress Section
const ProgressSection = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 15, 30, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 2rem;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
`;

const ProgressStats = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #94a3b8;
  font-size: 0.95rem;
  
  svg { color: ${props => props.$color || '#10b981'}; }
  strong { color: #f8fafc; font-size: 1.1rem; }
`;

const ProgressBar = styled.div`
  flex: 1;
  max-width: 400px;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 10px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: ${shimmer} 2s infinite;
  }
`;

const BadgesList = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Badge = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${props => props.$earned 
    ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
    : 'rgba(255, 255, 255, 0.08)'};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$earned ? 1 : 0.4};
  transition: all 0.3s ease;
  box-shadow: ${props => props.$earned ? '0 4px 15px rgba(251, 191, 36, 0.4)' : 'none'};
  
  svg { color: ${props => props.$earned ? '#1a1a2e' : '#64748b'}; }
  
  &:hover { transform: scale(1.15); }
`;

// ================ DATA ================

const STATIONS = [
  {
    id: 'recipes',
    emoji: '🍳',
    title: 'דוכן הטעמים',
    description: 'מתכונים מנצחים, טיפים קולינריים וסודות המטבח',
    icon: Utensils,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    path: '/recipes',
    label: 'טעים!',
  },
  {
    id: 'stories',
    emoji: '📚',
    title: 'הספריה הקטנה',
    description: 'סיפורים מרגשים בהמשכים שילוו אותך כל השבוע',
    icon: Book,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    path: '/stories',
    label: 'פרק חדש',
  },
  {
    id: 'challenges',
    emoji: '🧩',
    title: 'חדר האתגרים',
    description: 'חידות, סודוקו ואתגרי חשיבה שיפעילו את המוח',
    icon: Puzzle,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    path: '/challenges',
    label: 'אתגר!',
  },
  {
    id: 'giveaways',
    emoji: '🎁',
    title: 'קיוסק ההגרלות',
    description: 'השתתפי בהגרלות שבועיות והמזל יחייך אליך!',
    icon: Gift,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    path: '/giveaways',
    label: 'הגרלה!',
  },
  {
    id: 'articles',
    emoji: '☕',
    title: 'בית הקפה',
    description: 'טורים אישיים, כתבות מעמיקות ושיחות מהלב',
    icon: Coffee,
    color: '#92400e',
    gradient: 'linear-gradient(135deg, #b45309, #92400e)',
    path: '/articles',
    label: 'חדש!',
  },
  {
    id: 'market',
    emoji: '🏪',
    title: 'לוח המודעות',
    description: 'קניה, מכירה, שירותים - הכל בתוך הקהילה',
    icon: ShoppingBag,
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    path: '/market',
    label: 'עסקאות',
  },
];

const EASTER_EGGS = [
  { id: 'bench', emoji: '🪑', message: '"כל יום הוא הזדמנות חדשה" ✨', top: 35, left: 5 },
  { id: 'cat', emoji: '🐱', message: 'חתול! קופון 10% הנחה! 🎁', top: 55, right: 8 },
  { id: 'flower', emoji: '🌸', message: '5 נקודות בונוס! 🌷', top: 75, left: 10 },
  { id: 'bird', emoji: '🕊️', message: 'ציפור המזל! 🍀', top: 20, right: 15 },
];

// ================ COMPONENT ================

export default function ShederaStreet() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [visibleStations, setVisibleStations] = useState(new Set());
  const [visitedStations, setVisitedStations] = useState(new Set());
  const [points, setPoints] = useState(0);
  const [easterEgg, setEasterEgg] = useState(null);
  const [foundEasterEggs, setFoundEasterEggs] = useState(new Set());
  const stationRefs = useRef([]);
  
  // Smooth scroll handler
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  // Intersection Observer for stations appearing
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.id;
            setVisibleStations(prev => new Set([...prev, id]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    );
    
    stationRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('shederaStreet');
    if (saved) {
      const data = JSON.parse(saved);
      setVisitedStations(new Set(data.visited || []));
      setPoints(data.points || 0);
      setFoundEasterEggs(new Set(data.easterEggs || []));
    }
  }, []);
  
  const saveProgress = (visited, pts, eggs) => {
    localStorage.setItem('shederaStreet', JSON.stringify({
      visited: Array.from(visited),
      points: pts,
      easterEggs: Array.from(eggs),
    }));
  };
  
  const handleStationClick = (station) => {
    const newVisited = new Set(visitedStations);
    if (!newVisited.has(station.id)) {
      newVisited.add(station.id);
      const newPoints = points + 10;
      setVisitedStations(newVisited);
      setPoints(newPoints);
      saveProgress(newVisited, newPoints, foundEasterEggs);
    }
    navigate(station.path);
  };
  
  const handleEasterEgg = (egg) => {
    if (!foundEasterEggs.has(egg.id)) {
      const newEggs = new Set(foundEasterEggs);
      newEggs.add(egg.id);
      const newPoints = points + 5;
      setFoundEasterEggs(newEggs);
      setPoints(newPoints);
      saveProgress(visitedStations, newPoints, newEggs);
    }
    setEasterEgg(egg);
  };
  
  const progress = (visitedStations.size / STATIONS.length) * 100;
  const leaves = ['🍂', '🍃', '🌿', '🍀'];
  
  return (
    <StreetContainer>
      {/* Background */}
      <BackgroundImage $scrollY={scrollY} />
      
      {/* Street Path */}
      <StreetPath />
      
      {/* Flying Birds */}
      <Bird $top={10} $duration={28} $delay={0}>🕊️</Bird>
      <Bird $top={20} $duration={35} $delay={10}>🐦</Bird>
      
      {/* Falling Leaves */}
      {[...Array(6)].map((_, i) => (
        <Leaf 
          key={i}
          $left={15 + (i * 14)}
          $size={1.2 + Math.random() * 0.8}
          $duration={14 + Math.random() * 6}
          $delay={i * 3}
        >
          {leaves[i % leaves.length]}
        </Leaf>
      ))}
      
      <Content>
        {/* Welcome Section */}
        <WelcomeSection>
          <WelcomeContent $scrollY={scrollY}>
            <WelcomeBadge>
              <TreePine size={18} />
              טיול בשדרה
            </WelcomeBadge>
            <WelcomeTitle>ברוכה הבאה לשדרה</WelcomeTitle>
            <WelcomeSubtitle>
              גללי למטה וטיילי ברחוב שלנו 🚶‍♀️
              <br />
              לחצי על התחנות כדי להיכנס לתכנים!
            </WelcomeSubtitle>
          </WelcomeContent>
          
          <ScrollHint>
            <span>גללי למטה</span>
            <WalkingDots>
              <Dot $delay={0} />
              <Dot $delay={0.2} />
              <Dot $delay={0.4} />
            </WalkingDots>
            <ChevronDown size={32} />
          </ScrollHint>
        </WelcomeSection>
        
        {/* Stations */}
        <StationsSection>
          <StationWrapper>
            {STATIONS.map((station, index) => {
              const Icon = station.icon;
              const isVisited = visitedStations.has(station.id);
              const isVisible = visibleStations.has(station.id);
              const side = index % 2 === 0 ? 'left' : 'right';
              
              return (
                <StreetStation
                  key={station.id}
                  ref={el => stationRefs.current[index] = el}
                  data-id={station.id}
                  $side={side}
                  $visible={isVisible}
                >
                  {/* Lamp Posts */}
                  {index % 2 === 0 && (
                    <LampPost $side="left" style={{ top: '20px' }}>
                      <LampLight />
                      <LampPole />
                    </LampPost>
                  )}
                  
                  {/* Street Element (emoji) */}
                  <StreetElement 
                    $delay={index * 0.2}
                    onClick={() => handleStationClick(station)}
                  >
                    {station.emoji}
                  </StreetElement>
                  
                  {/* Station Card */}
                  <StationCard
                    $color={station.color}
                    $gradient={station.gradient}
                    onClick={() => handleStationClick(station)}
                  >
                    <StationLabel $color={station.color} $gradient={station.gradient}>
                      {station.label}
                    </StationLabel>
                    
                    <StationIcon $color={station.color} $gradient={station.gradient}>
                      <Icon size={32} />
                    </StationIcon>
                    
                    <StationTitle $color={station.color}>{station.title}</StationTitle>
                    <StationDescription>{station.description}</StationDescription>
                    
                    <StationAction>
                      {isVisited ? (
                        <StationBadge>
                          <Star size={14} />
                          ביקרת כאן
                        </StationBadge>
                      ) : (
                        <StationBadge style={{ background: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8' }}>
                          <Sparkles size={14} />
                          +10 נקודות
                        </StationBadge>
                      )}
                      
                      <StationArrow $gradient={station.gradient}>
                        <ArrowRight size={20} />
                      </StationArrow>
                    </StationAction>
                  </StationCard>
                  
                  {/* Decorative Trees */}
                  {index % 3 === 0 && (
                    <StreetDecor $right="-80px" $top="30%" $size="4rem" $duration={8}>
                      🌳
                    </StreetDecor>
                  )}
                </StreetStation>
              );
            })}
          </StationWrapper>
        </StationsSection>
        
        {/* Spacer */}
        <div style={{ height: '150px' }} />
      </Content>
      
      {/* Easter Eggs */}
      {EASTER_EGGS.map(egg => (
        <EasterEgg
          key={egg.id}
          $found={foundEasterEggs.has(egg.id)}
          style={{
            top: `${egg.top}%`,
            ...(egg.left !== undefined ? { left: `${egg.left}%` } : {}),
            ...(egg.right !== undefined ? { right: `${egg.right}%` } : {}),
          }}
          onClick={() => handleEasterEgg(egg)}
        >
          {egg.emoji}
        </EasterEgg>
      ))}
      
      {/* Easter Egg Popup */}
      {easterEgg && (
        <>
          <EasterEggOverlay onClick={() => setEasterEgg(null)} />
          <EasterEggPopup>
            <PopupEmoji>{easterEgg.emoji}</PopupEmoji>
            <PopupTitle>מצאת הפתעה!</PopupTitle>
            <PopupMessage>{easterEgg.message}</PopupMessage>
            <PopupButton onClick={() => setEasterEgg(null)}>
              מדהים! 🎉
            </PopupButton>
          </EasterEggPopup>
        </>
      )}
      
      {/* Progress */}
      <ProgressSection>
        <ProgressStats>
          <StatItem $color="#fbbf24">
            <Zap size={20} />
            <strong>{points}</strong> נקודות
          </StatItem>
          <StatItem $color="#10b981">
            <Star size={20} />
            <strong>{visitedStations.size}/{STATIONS.length}</strong> תחנות
          </StatItem>
        </ProgressStats>
        
        <ProgressBar>
          <ProgressFill $progress={progress} />
        </ProgressBar>
        
        <BadgesList>
          <Badge $earned={visitedStations.size >= 1} title="מתחילה">
            <Medal size={18} />
          </Badge>
          <Badge $earned={visitedStations.size >= 3} title="חוקרת">
            <Star size={18} />
          </Badge>
          <Badge $earned={visitedStations.size >= STATIONS.length} title="מומחית!">
            <Trophy size={18} />
          </Badge>
        </BadgesList>
      </ProgressSection>
    </StreetContainer>
  );
}
