/**
 * ShederaStreet.jsx
 * 🌳 "טיול בשדרה" - חוויית רחוב אינטראקטיבית עם פרלקס מטורף!
 * ניווט כמשחק מסלול חי!
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import { 
  Book, Utensils, Gift, Coffee, Puzzle, ShoppingBag, 
  Newspaper, Star, Heart, Sparkles, ChevronDown,
  Trophy, Medal, Zap, TreePine, Home as HomeIcon,
  ArrowRight
} from "lucide-react";

// ================ ANIMATIONS ================

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(2deg); }
  50% { transform: translateY(-5px) rotate(-1deg); }
  75% { transform: translateY(-20px) rotate(1deg); }
`;

const sway = keyframes`
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
`;

const walkingDots = keyframes`
  0% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.3; transform: scale(0.8); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 30px 10px rgba(16, 185, 129, 0.2); }
`;

const glowPulse = keyframes`
  0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 200, 100, 0.5)); }
  50% { filter: drop-shadow(0 0 25px rgba(255, 200, 100, 0.9)); }
`;

const floatSlow = keyframes`
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(-30px) translateX(10px); }
  66% { transform: translateY(-15px) translateX(-5px); }
`;

const birdFly = keyframes`
  0% { transform: translate(0, 0) scaleX(1); }
  25% { transform: translate(150px, -80px) scaleX(1); }
  50% { transform: translate(350px, -40px) scaleX(1); }
  75% { transform: translate(500px, -100px) scaleX(1); }
  100% { transform: translate(700px, 20px) scaleX(1); opacity: 0; }
`;

const leafFall = keyframes`
  0% { transform: translateY(-100px) rotate(0deg) translateX(0); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg) translateX(100px); opacity: 0; }
`;

const scrollDown = keyframes`
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(15px); opacity: 0.3; }
`;

const doorOpen = keyframes`
  0% { transform: perspective(800px) rotateY(0deg); }
  100% { transform: perspective(800px) rotateY(-85deg); }
`;

const lightFlicker = keyframes`
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.7; }
  94% { opacity: 1; }
  96% { opacity: 0.8; }
  97% { opacity: 1; }
`;

// ================ STYLED COMPONENTS ================

const StreetContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: #0f172a;
`;

// Background with the same image as the rest of the site
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
  transform: translateY(${props => props.$scrollY * 0.3}px);
  transition: transform 0.1s linear;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(15, 23, 42, 0.75) 0%,
      rgba(30, 41, 59, 0.6) 30%,
      rgba(15, 23, 42, 0.7) 70%,
      rgba(10, 15, 30, 0.9) 100%
    );
  }
`;

// Parallax Layers
const ParallaxLayer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: ${props => props.$zIndex || 1};
  transform: translateY(${props => props.$offset}px);
  transition: transform 0.05s linear;
`;

// Street Ground Effect
const StreetGround = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(45, 55, 72, 0.5) 30%,
    rgba(26, 32, 44, 0.8) 100%
  );
  z-index: 2;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 60px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255,255,255,0.1) 20%,
      rgba(255,255,255,0.2) 50%,
      rgba(255,255,255,0.1) 80%,
      transparent 100%
    );
  }
`;

// Decorative Trees (Parallax)
const TreesLayer = styled(ParallaxLayer)`
  top: 0;
  height: 100vh;
  display: flex;
  justify-content: space-between;
  padding: 0 5%;
`;

const Tree = styled.div`
  font-size: ${props => props.$size || 80}px;
  opacity: ${props => props.$opacity || 0.4};
  filter: blur(${props => props.$blur || 0}px);
  animation: ${sway} ${props => props.$duration || 8}s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
  margin-top: ${props => props.$top || 20}%;
`;

// Flying Birds
const Bird = styled.div`
  position: fixed;
  font-size: 1.8rem;
  animation: ${birdFly} ${props => props.$duration || 20}s linear infinite;
  animation-delay: ${props => props.$delay || 0}s;
  top: ${props => props.$top || 15}%;
  left: -100px;
  z-index: 50;
  opacity: 0.7;
`;

// Falling Leaves
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

// Street Lamp
const StreetLamp = styled.div`
  position: absolute;
  ${props => props.$side === 'left' ? 'left: -100px;' : 'right: -100px;'}
  width: 60px;
  z-index: 30;
  
  @media (max-width: 1200px) {
    display: none;
  }
`;

const LampPole = styled.div`
  width: 6px;
  height: 150px;
  background: linear-gradient(180deg, #374151 0%, #1f2937 100%);
  margin: 0 auto;
  border-radius: 3px;
  box-shadow: 2px 0 10px rgba(0,0,0,0.3);
`;

const LampHead = styled.div`
  width: 50px;
  height: 30px;
  background: #1f2937;
  border-radius: 8px 8px 0 0;
  margin: 0 auto;
  position: relative;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
`;

const LampLight = styled.div`
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 25px;
  height: 25px;
  background: radial-gradient(circle, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%);
  border-radius: 50%;
  box-shadow: 
    0 0 30px rgba(251, 191, 36, 0.8),
    0 0 60px rgba(251, 191, 36, 0.5),
    0 0 100px rgba(251, 191, 36, 0.3);
  animation: ${glowPulse} 4s ease-in-out infinite, ${lightFlicker} 10s linear infinite;
`;

const LampGlow = styled.div`
  position: absolute;
  bottom: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%);
  pointer-events: none;
`;

// Main Content
const Content = styled.div`
  position: relative;
  z-index: 10;
  padding-top: 80px;
`;

// Welcome Section with Parallax
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
  transform: translateY(${props => props.$offset}px);
  transition: transform 0.1s linear;
  animation: ${fadeInUp} 1s ease-out;
`;

const WelcomeTitle = styled.h1`
  font-family: 'Cormorant Garamond', 'David Libre', serif;
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 300;
  color: #f8fafc;
  margin-bottom: 0.5rem;
  text-shadow: 
    0 4px 30px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(16, 185, 129, 0.3);
  letter-spacing: 0.05em;
`;

const WelcomeSubtitle = styled.p`
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  color: #94a3b8;
  margin-bottom: 3rem;
  max-width: 600px;
  line-height: 1.8;
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
  animation: ${pulse} 3s ease-in-out infinite;
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
  color: #64748b;
  animation: ${scrollDown} 2s ease-in-out infinite;
  
  span {
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
`;

const WalkingDots = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 0.5rem;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: ${walkingDots} 1.5s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
`;

// Street Section Title
const StreetSectionTitle = styled.div`
  text-align: center;
  padding: 4rem 2rem 2rem;
  position: relative;
  
  h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 5vw, 3rem);
    color: #f8fafc;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  }
  
  p {
    color: #94a3b8;
    font-size: 1.1rem;
  }
`;

// Stations Grid with Perspective
const StationsWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  perspective: 1000px;
  position: relative;
`;

const StationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
  transform-style: preserve-3d;
`;

const StationCard = styled.div`
  position: relative;
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.03) 100%
  );
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  animation: ${fadeInUp} 0.8s ease-out both;
  animation-delay: ${props => props.$delay || 0}s;
  overflow: hidden;
  backdrop-filter: blur(20px);
  transform-style: preserve-3d;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$gradient};
    border-radius: 24px 24px 0 0;
    transition: height 0.3s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 40%,
      rgba(255, 255, 255, 0.1) 45%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 55%
    );
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-15px) rotateX(5deg) scale(1.02);
    border-color: ${props => props.$color}60;
    box-shadow: 
      0 30px 60px rgba(0, 0, 0, 0.4),
      0 0 0 1px ${props => props.$color}40,
      0 0 40px ${props => props.$color}20,
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
    &::before {
      height: 6px;
    }
    
    &::after {
      opacity: 1;
    }
  }
`;

const StationIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: ${props => props.$gradient};
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 
    0 15px 40px ${props => props.$color}50,
    inset 0 -3px 10px rgba(0, 0, 0, 0.2),
    inset 0 3px 10px rgba(255, 255, 255, 0.2);
  position: relative;
  transition: all 0.4s ease;
  
  svg {
    color: white;
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
    transition: transform 0.3s ease;
  }
  
  ${StationCard}:hover & {
    transform: scale(1.1) rotate(-5deg);
    
    svg {
      transform: scale(1.1);
    }
  }
`;

const StationLabel = styled.div`
  position: absolute;
  top: -12px;
  right: 20px;
  background: ${props => props.$gradient};
  color: white;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 4px 15px ${props => props.$color}50;
  letter-spacing: 0.05em;
`;

const StationTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.75rem;
  transition: color 0.3s ease;
  
  ${StationCard}:hover & {
    color: ${props => props.$color};
  }
`;

const StationDescription = styled.p`
  color: #94a3b8;
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 1.25rem;
`;

const StationFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const StationBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const StationArrow = styled.div`
  width: 36px;
  height: 36px;
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
      transform: translateX(-3px);
    }
  }
`;

// Easter Eggs
const HiddenElement = styled.div`
  position: fixed;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 40;
  font-size: 1.8rem;
  filter: grayscale(0.3);
  
  &:hover {
    transform: scale(1.4) rotate(10deg);
    filter: grayscale(0) drop-shadow(0 0 15px rgba(255, 255, 255, 0.5));
  }
`;

const EasterEggPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  background: linear-gradient(145deg, rgba(26, 32, 44, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
  border: 2px solid #10b981;
  border-radius: 28px;
  padding: 2.5rem;
  text-align: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out forwards;
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  max-width: 90%;
  width: 380px;
  backdrop-filter: blur(20px);
`;

const EasterEggOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 999;
  backdrop-filter: blur(8px);
  animation: ${fadeIn} 0.2s ease-out;
`;

const EasterEggEmoji = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: ${float} 3s ease-in-out infinite;
`;

const EasterEggTitle = styled.h3`
  color: #10b981;
  font-size: 1.4rem;
  margin-bottom: 0.75rem;
`;

const EasterEggMessage = styled.p`
  color: #e2e8f0;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const EasterEggButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  padding: 0.85rem 2.5rem;
  border-radius: 16px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
  }
`;

// Progress Bar
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
  
  svg {
    color: ${props => props.$color || '#10b981'};
  }
  
  strong {
    color: #f8fafc;
    font-size: 1.1rem;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  max-width: 400px;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, #10b981, #059669, #10b981);
  background-size: 200% 100%;
  border-radius: 10px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
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
  
  svg {
    color: ${props => props.$earned ? '#1a1a2e' : '#64748b'};
  }
  
  &:hover {
    transform: scale(1.15);
  }
`;

// ================ STATIONS DATA ================

const STATIONS = [
  {
    id: 'recipes',
    title: 'דוכן הטעמים',
    description: 'מתכונים מנצחים, טיפים קולינריים וסודות המטבח של השדרה',
    icon: Utensils,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    path: '/recipes',
    label: 'טעים!',
  },
  {
    id: 'stories',
    title: 'הספריה הקטנה',
    description: 'סיפורים מרגשים בהמשכים, קריאה שתלווה אותך כל השבוע',
    icon: Book,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    path: '/stories',
    label: 'פרק חדש',
  },
  {
    id: 'challenges',
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
    title: 'לוח המודעות',
    description: 'קניה, מכירה, שירותים - הכל בתוך הקהילה שלנו',
    icon: ShoppingBag,
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    path: '/market',
    label: 'עסקאות',
  },
];

const EASTER_EGGS = [
  { id: 'bench', emoji: '🪑', message: '"כל יום הוא הזדמנות חדשה להתחיל מחדש" ✨', type: 'quote', top: 45, left: 8 },
  { id: 'cat', emoji: '🐱', message: 'מצאת חתול חמוד! קיבלת קופון 10% הנחה! 🎁', type: 'coupon', top: 60, right: 5 },
  { id: 'flower', emoji: '🌸', message: 'פרח יפה! קיבלת 5 נקודות בונוס! 🌷', type: 'points', top: 35, left: 3 },
  { id: 'bird', emoji: '🕊️', message: 'ציפור המזל! ההגרלה הבאה עליך! 🍀', type: 'luck', top: 25, right: 10 },
];

// ================ COMPONENT ================

export default function ShederaStreet() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [visitedStations, setVisitedStations] = useState(new Set());
  const [points, setPoints] = useState(0);
  const [easterEgg, setEasterEgg] = useState(null);
  const [foundEasterEggs, setFoundEasterEggs] = useState(new Set());
  
  // Parallax scroll handler
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  // Load progress from localStorage
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
      const bonusPoints = egg.type === 'points' ? 5 : 2;
      const newPoints = points + bonusPoints;
      setFoundEasterEggs(newEggs);
      setPoints(newPoints);
      saveProgress(visitedStations, newPoints, newEggs);
    }
    setEasterEgg(egg);
  };
  
  const progress = (visitedStations.size / STATIONS.length) * 100;
  
  // Generate leaves
  const leaves = ['🍂', '🍃', '🌿', '🍀'];
  
  return (
    <StreetContainer>
      {/* Background with parallax */}
      <BackgroundImage $scrollY={scrollY} />
      
      {/* Parallax Trees */}
      <TreesLayer $zIndex={3} $offset={scrollY * 0.15}>
        <Tree $size={100} $opacity={0.25} $blur={2} $top={10} $duration={10}>🌳</Tree>
        <Tree $size={120} $opacity={0.2} $blur={3} $top={5} $duration={12} $delay={1}>🌲</Tree>
      </TreesLayer>
      
      <TreesLayer $zIndex={4} $offset={scrollY * 0.25}>
        <Tree $size={80} $opacity={0.35} $blur={1} $top={15} $duration={9} $delay={0.5}>🌴</Tree>
        <Tree $size={90} $opacity={0.3} $blur={1} $top={20} $duration={11} $delay={2}>🌳</Tree>
      </TreesLayer>
      
      {/* Flying Birds */}
      <Bird $top={12} $duration={25} $delay={0}>🕊️</Bird>
      <Bird $top={8} $duration={30} $delay={8}>🕊️</Bird>
      <Bird $top={18} $duration={22} $delay={15}>🐦</Bird>
      
      {/* Falling Leaves */}
      {[...Array(8)].map((_, i) => (
        <Leaf 
          key={i}
          $left={10 + (i * 12)}
          $size={1 + Math.random()}
          $duration={12 + Math.random() * 8}
          $delay={i * 2}
        >
          {leaves[i % leaves.length]}
        </Leaf>
      ))}
      
      {/* Street Ground */}
      <StreetGround />
      
      {/* Main Content */}
      <Content>
        {/* Welcome Section */}
        <WelcomeSection>
          <WelcomeContent $offset={-scrollY * 0.4}>
            <WelcomeBadge>
              <TreePine size={18} />
              טיול בשדרה
            </WelcomeBadge>
            <WelcomeTitle>ברוכה הבאה לשדרה</WelcomeTitle>
            <WelcomeSubtitle>
              גללי למטה וטיילי ברחוב האינטראקטיבי שלנו.
              <br />
              גלי תכנים מדהימים, צברי נקודות ומצאי הפתעות נסתרות! ✨
            </WelcomeSubtitle>
          </WelcomeContent>
          
          <ScrollHint>
            <span>התחילי לטייל</span>
            <WalkingDots>
              <Dot $delay={0} />
              <Dot $delay={0.2} />
              <Dot $delay={0.4} />
            </WalkingDots>
            <ChevronDown size={28} />
          </ScrollHint>
        </WelcomeSection>
        
        {/* Street Title */}
        <StreetSectionTitle>
          <h2>🏘️ תחנות השדרה</h2>
          <p>לחצי על תחנה כדי להיכנס ולגלות עוד</p>
        </StreetSectionTitle>
        
        {/* Stations */}
        <StationsWrapper>
          {/* Street Lamps */}
          <StreetLamp $side="left" style={{ top: '50px' }}>
            <LampHead>
              <LampLight />
              <LampGlow />
            </LampHead>
            <LampPole />
          </StreetLamp>
          
          <StreetLamp $side="right" style={{ top: '350px' }}>
            <LampHead>
              <LampLight />
              <LampGlow />
            </LampHead>
            <LampPole />
          </StreetLamp>
          
          <StationsGrid>
            {STATIONS.map((station, index) => {
              const Icon = station.icon;
              const isVisited = visitedStations.has(station.id);
              
              return (
                <StationCard
                  key={station.id}
                  $color={station.color}
                  $gradient={station.gradient}
                  $delay={index * 0.1}
                  onClick={() => handleStationClick(station)}
                >
                  <StationLabel $color={station.color} $gradient={station.gradient}>
                    {station.label}
                  </StationLabel>
                  
                  <StationIconWrapper $color={station.color} $gradient={station.gradient}>
                    <Icon size={36} />
                  </StationIconWrapper>
                  
                  <StationTitle $color={station.color}>{station.title}</StationTitle>
                  <StationDescription>{station.description}</StationDescription>
                  
                  <StationFooter>
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
                      <ArrowRight size={18} />
                    </StationArrow>
                  </StationFooter>
                </StationCard>
              );
            })}
          </StationsGrid>
        </StationsWrapper>
        
        {/* Spacer for progress bar */}
        <div style={{ height: '120px' }} />
      </Content>
      
      {/* Hidden Easter Eggs */}
      {EASTER_EGGS.map((egg) => (
        <HiddenElement
          key={egg.id}
          style={{
            top: `${egg.top}%`,
            ...(egg.left !== undefined ? { left: `${egg.left}%` } : {}),
            ...(egg.right !== undefined ? { right: `${egg.right}%` } : {}),
            opacity: foundEasterEggs.has(egg.id) ? 0.3 : 0.7,
          }}
          onClick={() => handleEasterEgg(egg)}
        >
          {egg.emoji}
        </HiddenElement>
      ))}
      
      {/* Progress Bar */}
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
      
      {/* Easter Egg Popup */}
      {easterEgg && (
        <>
          <EasterEggOverlay onClick={() => setEasterEgg(null)} />
          <EasterEggPopup>
            <EasterEggEmoji>{easterEgg.emoji}</EasterEggEmoji>
            <EasterEggTitle>מצאת הפתעה!</EasterEggTitle>
            <EasterEggMessage>{easterEgg.message}</EasterEggMessage>
            <EasterEggButton onClick={() => setEasterEgg(null)}>
              מדהים! 🎉
            </EasterEggButton>
          </EasterEggPopup>
        </>
      )}
    </StreetContainer>
  );
}
