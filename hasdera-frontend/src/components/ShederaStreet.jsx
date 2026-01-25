/**
 * ShederaStreet.jsx
 * 🌳 "מדורים" - ריבועים בזיגזג שמופיעים בפתאומיות + אלמנטים תלת מימדיים
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
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
    transform: translateX(-200px) scale(0.5) rotate(-10deg);
    filter: blur(10px);
  }
  60% {
    transform: translateX(20px) scale(1.05) rotate(2deg);
  }
  100% { 
    opacity: 1; 
    transform: translateX(0) scale(1) rotate(0deg);
    filter: blur(0);
  }
`;

const popInRight = keyframes`
  0% { 
    opacity: 0; 
    transform: translateX(200px) scale(0.5) rotate(10deg);
    filter: blur(10px);
  }
  60% {
    transform: translateX(-20px) scale(1.05) rotate(-2deg);
  }
  100% { 
    opacity: 1; 
    transform: translateX(0) scale(1) rotate(0deg);
    filter: blur(0);
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
    transform: translate(0, 0) scaleX(-1); 
    opacity: 0;
  }
  5% { opacity: 0.7; }
  50% { 
    transform: translate(50vw, -30px) scaleX(-1); 
  }
  95% { opacity: 0.7; }
  100% { 
    transform: translate(100vw, 10px) scaleX(-1); 
    opacity: 0;
  }
`;

const leafFall = keyframes`
  0% { 
    transform: translateY(-100px) rotate(0deg) translateX(0); 
    opacity: 0; 
  }
  10% { opacity: 0.8; }
  50% { transform: translateY(50vh) rotate(360deg) translateX(50px); }
  100% { 
    transform: translateY(110vh) rotate(720deg) translateX(-30px); 
    opacity: 0; 
  }
`;

const sway = keyframes`
  0%, 100% { transform: rotate(-3deg) translateX(0); }
  50% { transform: rotate(3deg) translateX(10px); }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
`;

const floatSlow = keyframes`
  0%, 100% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(-20px) translateX(10px); }
  50% { transform: translateY(-10px) translateX(-5px); }
  75% { transform: translateY(-30px) translateX(5px); }
`;

// ================ STYLED COMPONENTS ================

const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

// Fixed Background
const FixedBackground = styled.div`
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
      180deg,
      rgba(15, 23, 42, 0.45) 0%,
      rgba(20, 30, 48, 0.35) 50%,
      rgba(15, 23, 42, 0.5) 100%
    );
  }
`;

// ===== 3D ELEMENTS =====

const Bird = styled.div`
  position: fixed;
  font-size: ${props => props.$size || 2}rem;
  z-index: 60;
  animation: ${birdFly} ${props => props.$duration || 20}s linear infinite;
  animation-delay: ${props => props.$delay || 0}s;
  top: ${props => props.$top || 15}%;
  left: -60px;
  pointer-events: none;
`;

const Leaf = styled.div`
  position: fixed;
  font-size: ${props => props.$size || 1.5}rem;
  z-index: 55;
  animation: ${leafFall} ${props => props.$duration || 15}s linear infinite;
  animation-delay: ${props => props.$delay || 0}s;
  left: ${props => props.$left || 50}%;
  top: -50px;
  pointer-events: none;
`;

const FloatingTree = styled.div`
  position: fixed;
  font-size: ${props => props.$size || 4}rem;
  opacity: ${props => props.$opacity || 0.3};
  z-index: 5;
  animation: ${sway} ${props => props.$duration || 8}s ease-in-out infinite;
  ${props => props.$left ? `left: ${props.$left};` : ''}
  ${props => props.$right ? `right: ${props.$right};` : ''}
  top: ${props => props.$top || '20%'};
  pointer-events: none;
  filter: blur(${props => props.$blur || 0}px);
`;

const Sparkle = styled.div`
  position: fixed;
  font-size: 1.2rem;
  z-index: 50;
  animation: ${twinkle} ${props => props.$duration || 3}s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
  top: ${props => props.$top};
  left: ${props => props.$left};
  pointer-events: none;
  opacity: 0.6;
`;

const FloatingElement = styled.div`
  position: fixed;
  font-size: ${props => props.$size || 2}rem;
  z-index: 45;
  animation: ${floatSlow} ${props => props.$duration || 10}s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
  ${props => props.$left ? `left: ${props.$left};` : ''}
  ${props => props.$right ? `right: ${props.$right};` : ''}
  top: ${props => props.$top};
  opacity: ${props => props.$opacity || 0.5};
  pointer-events: none;
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
  transform: translateY(${props => Math.min(0, -props.$scrollY * 0.3)}px);
  opacity: ${props => Math.max(0, 1 - props.$scrollY / 600)};
  transition: all 0.1s ease-out;
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

// Card - completely invisible until triggered
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
  
  /* Completely invisible until visible */
  opacity: 0;
  visibility: hidden;
  transform: ${props => props.$side === 'left' ? 'translateX(-200px)' : 'translateX(200px)'} scale(0.5);
  
  /* When visible - animate in */
  ${props => props.$visible && props.$side === 'left' && css`
    visibility: visible;
    opacity: 1;
    transform: translateX(0) scale(1);
    animation: ${popInLeft} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  `}
  
  ${props => props.$visible && props.$side === 'right' && css`
    visibility: visible;
    opacity: 1;
    transform: translateX(0) scale(1);
    animation: ${popInRight} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
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
    transform: scale(1.04) translateY(-8px);
    border-color: ${props => props.$color}60;
    box-shadow: 
      0 35px 70px rgba(0, 0, 0, 0.4),
      0 0 80px ${props => props.$color}25;
    
    &::before {
      height: 8px;
    }
    
    &::after {
      opacity: 1;
    }
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
    animation: ${float} 1.5s ease-in-out infinite;
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
  
  svg {
    width: 16px;
    height: 16px;
  }
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

// Leaves data
const LEAVES = ['🍂', '🍃', '🌿', '🍀', '🌸'];

// ================ COMPONENT ================

export default function ShederaStreet() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [visibleCards, setVisibleCards] = useState(new Set());
  const cardRefs = useRef([]);
  
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  // Intersection Observer - trigger when card enters viewport
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
      { threshold: 0.25, rootMargin: '0px 0px -150px 0px' }
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
      
      {/* 3D Elements - Birds */}
      <Bird $top={8} $duration={25} $delay={0} $size={2}>🕊️</Bird>
      <Bird $top={18} $duration={35} $delay={8} $size={1.8}>🐦</Bird>
      <Bird $top={5} $duration={30} $delay={18} $size={2.2}>🕊️</Bird>
      <Bird $top={25} $duration={28} $delay={25} $size={1.6}>🐦</Bird>
      
      {/* 3D Elements - Falling Leaves */}
      {[...Array(10)].map((_, i) => (
        <Leaf
          key={i}
          $left={5 + i * 10}
          $size={1.2 + Math.random() * 0.8}
          $duration={12 + Math.random() * 10}
          $delay={i * 2.5}
        >
          {LEAVES[i % LEAVES.length]}
        </Leaf>
      ))}
      
      {/* 3D Elements - Trees */}
      <FloatingTree $left="3%" $top="15%" $size="5rem" $opacity={0.25} $duration={10} $blur={1}>🌳</FloatingTree>
      <FloatingTree $right="5%" $top="25%" $size="4rem" $opacity={0.2} $duration={12} $blur={2}>🌲</FloatingTree>
      <FloatingTree $left="8%" $top="50%" $size="6rem" $opacity={0.3} $duration={9}>🌴</FloatingTree>
      <FloatingTree $right="4%" $top="60%" $size="5rem" $opacity={0.25} $duration={11} $blur={1}>🌳</FloatingTree>
      <FloatingTree $left="5%" $top="80%" $size="4rem" $opacity={0.2} $duration={8}>🌲</FloatingTree>
      
      {/* 3D Elements - Sparkles */}
      <Sparkle $top="20%" $left="15%" $duration={2.5} $delay={0}>✨</Sparkle>
      <Sparkle $top="35%" $left="85%" $duration={3} $delay={1}>✨</Sparkle>
      <Sparkle $top="55%" $left="10%" $duration={2.8} $delay={0.5}>✨</Sparkle>
      <Sparkle $top="70%" $left="90%" $duration={3.2} $delay={1.5}>✨</Sparkle>
      <Sparkle $top="85%" $left="20%" $duration={2.6} $delay={2}>✨</Sparkle>
      
      {/* 3D Elements - Floating */}
      <FloatingElement $right="8%" $top="40%" $size="2.5rem" $opacity={0.4} $duration={15}>🦋</FloatingElement>
      <FloatingElement $left="6%" $top="65%" $size="2rem" $opacity={0.35} $duration={18} $delay={5}>🌸</FloatingElement>
      
      <Content>
        {/* Welcome */}
        <WelcomeSection>
          <WelcomeContent $scrollY={scrollY}>
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
                        <Sparkles />
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
