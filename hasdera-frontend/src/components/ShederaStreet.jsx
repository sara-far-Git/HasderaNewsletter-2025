/**
 * ShederaStreet.jsx
 * 🌳 "מדורים" - ריבועים בזיגזג עם אנימציות חלקות
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import { 
  Book, Utensils, Gift, Coffee, Puzzle, ShoppingBag, 
  Sparkles, ChevronDown, ArrowRight, Newspaper, TreePine
} from "lucide-react";

// ================ ANIMATIONS ================

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

const birdFly = keyframes`
  0% { 
    transform: translate(-100px, 0); 
  }
  100% { 
    transform: translate(calc(100vw + 100px), -50px); 
  }
`;

const wingFlap = keyframes`
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.4); }
`;

const leafFall = keyframes`
  0% { 
    transform: translateY(-100px) rotate(0deg) translateX(0); 
    opacity: 0; 
  }
  10% { opacity: 0.7; }
  100% { 
    transform: translateY(100vh) rotate(720deg) translateX(100px); 
    opacity: 0; 
  }
`;

const sway = keyframes`
  0%, 100% { transform: rotate(-4deg); }
  50% { transform: rotate(4deg); }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.3); }
`;

const floatAround = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(15px, -20px) rotate(5deg); }
  50% { transform: translate(-10px, -10px) rotate(-5deg); }
  75% { transform: translate(20px, -25px) rotate(10deg); }
`;

const cloudMove = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  10% { opacity: 0.4; }
  90% { opacity: 0.4; }
  100% { transform: translateX(100vw); opacity: 0; }
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

// ================ STYLED COMPONENTS ================

const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

// Fixed Background - completely static, no JS
const FixedBackground = styled.div`
  position: fixed;
  inset: 0;
  background-image: url("/image/ChatGPT Image Nov 16, 2025, 08_56_06 PM.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: 0;
  will-change: auto;

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
`;

// ===== 3D ELEMENTS - All CSS only, no JS =====

const AnimationLayer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
`;

// Animated Bird with flapping wings - pure CSS
const BirdWrapper = styled.div`
  position: absolute;
  top: ${props => props.$top}%;
  left: 0;
  animation: ${birdFly} ${props => props.$duration}s linear infinite;
  animation-delay: ${props => props.$delay}s;
  will-change: transform;
`;

const BirdBody = styled.div`
  position: relative;
  width: 35px;
  height: 14px;
  background: #1e293b;
  border-radius: 50% 25% 25% 50%;
  
  &::before {
    content: '';
    position: absolute;
    right: -10px;
    top: -3px;
    width: 16px;
    height: 16px;
    background: #1e293b;
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    right: -18px;
    top: 4px;
    border-left: 12px solid #f59e0b;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
  }
`;

const BirdWing = styled.div`
  position: absolute;
  top: -10px;
  left: 10px;
  width: 22px;
  height: 18px;
  background: #475569;
  border-radius: 50% 50% 0 0;
  transform-origin: bottom center;
  animation: ${wingFlap} 0.12s ease-in-out infinite;
  will-change: transform;
`;

const BirdTail = styled.div`
  position: absolute;
  left: -14px;
  top: 3px;
  border-right: 18px solid #334155;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
`;

// Falling leaves - pure CSS
const LeafElement = styled.div`
  position: absolute;
  top: 0;
  left: ${props => props.$left}%;
  font-size: ${props => props.$size}rem;
  animation: ${leafFall} ${props => props.$duration}s linear infinite;
  animation-delay: ${props => props.$delay}s;
  will-change: transform;
`;

// Swaying trees - pure CSS
const TreeElement = styled.div`
  position: absolute;
  top: ${props => props.$top};
  ${props => props.$left ? `left: ${props.$left};` : ''}
  ${props => props.$right ? `right: ${props.$right};` : ''}
  font-size: ${props => props.$size};
  opacity: ${props => props.$opacity};
  animation: ${sway} ${props => props.$duration}s ease-in-out infinite;
  filter: blur(${props => props.$blur || 0}px);
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

// Clouds - slow moving
const CloudElement = styled.div`
  position: absolute;
  top: ${props => props.$top};
  font-size: ${props => props.$size};
  opacity: 0.35;
  animation: ${cloudMove} ${props => props.$duration}s linear infinite;
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

const Content = styled.div`
  position: relative;
  z-index: 10;
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
    path: '/recipes',
    label: '🍳 טעים!',
  },
  {
    id: 'stories',
    title: 'סיפורים בהמשכים',
    description: 'סיפורים מרגשים שילוו אותך לאורך כל השבוע',
    icon: Book,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    path: '/stories',
    label: '📚 פרק חדש',
  },
  {
    id: 'challenges',
    title: 'חידות ואתגרים',
    description: 'סודוקו, חידות חשיבה ואתגרים שבועיים מאתגרים',
    icon: Puzzle,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    path: '/challenges',
    label: '🧩 אתגר!',
  },
  {
    id: 'giveaways',
    title: 'הגרלות ופרסים',
    description: 'השתתפי בהגרלות שבועיות ותזכי בפרסים מדהימים',
    icon: Gift,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    path: '/giveaways',
    label: '🎁 הגרלה!',
  },
  {
    id: 'articles',
    title: 'כתבות וטורים',
    description: 'טורים אישיים, כתבות מעמיקות ושיחות מהלב',
    icon: Coffee,
    color: '#92400e',
    gradient: 'linear-gradient(135deg, #b45309, #92400e)',
    path: '/articles',
    label: '☕ חדש!',
  },
  {
    id: 'market',
    title: 'לוח קהילתי',
    description: 'קניה, מכירה, שירותים - הכל בתוך הקהילה שלנו',
    icon: ShoppingBag,
    color: '#059669',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    path: '/market',
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

// ================ COMPONENT ================

export default function ShederaStreet() {
  const navigate = useNavigate();
  const [visibleCards, setVisibleCards] = useState(new Set());
  const cardRefs = useRef([]);
  
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
  
  return (
    <PageContainer>
      <FixedBackground />
      
      {/* Animation Layer - all pure CSS, no JS updates */}
      <AnimationLayer>
        {/* Birds with flapping wings */}
        <BirdWrapper $top={8} $duration={18} $delay={0}>
          <BirdBody><BirdWing /><BirdTail /></BirdBody>
        </BirdWrapper>
        <BirdWrapper $top={15} $duration={25} $delay={6}>
          <BirdBody><BirdWing /><BirdTail /></BirdBody>
        </BirdWrapper>
        <BirdWrapper $top={5} $duration={22} $delay={12}>
          <BirdBody><BirdWing /><BirdTail /></BirdBody>
        </BirdWrapper>
        <BirdWrapper $top={22} $duration={30} $delay={20}>
          <BirdBody><BirdWing /><BirdTail /></BirdBody>
        </BirdWrapper>
        
        {/* Falling leaves */}
        {[...Array(12)].map((_, i) => (
          <LeafElement
            key={`leaf-${i}`}
            $left={8 + i * 8}
            $size={1.3 + (i % 3) * 0.3}
            $duration={14 + (i % 5) * 3}
            $delay={i * 2}
          >
            {LEAVES[i % LEAVES.length]}
          </LeafElement>
        ))}
        
        {/* Trees */}
        <TreeElement $left="3%" $top="12%" $size="5rem" $opacity={0.3} $duration={8} $blur={1}>🌳</TreeElement>
        <TreeElement $right="4%" $top="20%" $size="4rem" $opacity={0.25} $duration={10} $blur={2}>🌲</TreeElement>
        <TreeElement $left="6%" $top="45%" $size="6rem" $opacity={0.35} $duration={7}>🌴</TreeElement>
        <TreeElement $right="5%" $top="55%" $size="5rem" $opacity={0.3} $duration={9} $blur={1}>🌳</TreeElement>
        <TreeElement $left="4%" $top="75%" $size="4.5rem" $opacity={0.25} $duration={11}>🌲</TreeElement>
        <TreeElement $right="6%" $top="85%" $size="5rem" $opacity={0.3} $duration={8}>🌴</TreeElement>
        
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
        
        {/* Clouds */}
        <CloudElement $top="8%" $size="4rem" $duration={60} $delay={0}>☁️</CloudElement>
        <CloudElement $top="15%" $size="3rem" $duration={80} $delay={20}>☁️</CloudElement>
        <CloudElement $top="5%" $size="3.5rem" $duration={70} $delay={40}>☁️</CloudElement>
        
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
  );
}
