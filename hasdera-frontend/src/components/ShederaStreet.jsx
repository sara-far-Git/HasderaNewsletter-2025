/**
 * ShederaStreet.jsx
 * 🌳 "מדורים" - ריבועים בזיגזג שמופיעים בגלילה
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { 
  Book, Utensils, Gift, Coffee, Puzzle, ShoppingBag, 
  Sparkles, ChevronDown, ArrowRight, Newspaper, TreePine
} from "lucide-react";

// ================ ANIMATIONS ================

const fadeInLeft = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-120px) rotate(-3deg); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0) rotate(0deg); 
  }
`;

const fadeInRight = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(120px) rotate(3deg); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0) rotate(0deg); 
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const scrollHint = keyframes`
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(12px); opacity: 0.5; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
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
      rgba(15, 23, 42, 0.5) 0%,
      rgba(20, 30, 48, 0.4) 50%,
      rgba(15, 23, 42, 0.55) 100%
    );
  }
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
  padding: 0 2rem 200px;
`;

// Zigzag container - each card takes full width but aligns left/right
const ZigzagContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 120px; /* Big gap between cards */
`;

// Card wrapper for zigzag alignment
const CardWrapper = styled.div`
  display: flex;
  justify-content: ${props => props.$side === 'left' ? 'flex-start' : 'flex-end'};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

// The card itself
const SectionCard = styled.div`
  width: 100%;
  max-width: 450px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.04) 100%
  );
  border-radius: 28px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  /* Animation based on visibility and side */
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => {
    if (!props.$visible) {
      return props.$side === 'left' ? 'translateX(-100px)' : 'translateX(100px)';
    }
    return 'translateX(0)';
  }};
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  
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
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  &:hover {
    transform: translateX(0) scale(1.03) translateY(-5px);
    border-color: ${props => props.$color}50;
    box-shadow: 
      0 30px 60px rgba(0, 0, 0, 0.35),
      0 0 60px ${props => props.$color}20;
    
    &::before {
      height: 7px;
    }
    
    &::after {
      opacity: 1;
    }
  }
`;

const CardIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${props => props.$gradient};
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 15px 40px ${props => props.$color}45;
  transition: all 0.4s ease;
  
  svg {
    color: white;
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
  }
  
  ${SectionCard}:hover & {
    transform: scale(1.1) rotate(-5deg);
    animation: ${float} 2s ease-in-out infinite;
  }
`;

const CardLabel = styled.span`
  display: inline-block;
  padding: 0.5rem 1.2rem;
  background: ${props => props.$gradient};
  color: white;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  box-shadow: 0 5px 15px ${props => props.$color}45;
`;

const CardTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.75rem;
  transition: color 0.3s ease;
  
  ${SectionCard}:hover & {
    color: ${props => props.$color};
  }
`;

const CardDescription = styled.p`
  color: rgba(255, 255, 255, 0.75);
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.75rem;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const CardArrow = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
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
      transform: translateX(-4px);
    }
  }
`;

// Connector line between cards
const ConnectorLine = styled.div`
  position: absolute;
  width: 3px;
  height: 80px;
  background: linear-gradient(
    180deg,
    ${props => props.$fromColor}50 0%,
    ${props => props.$toColor}50 100%
  );
  left: 50%;
  transform: translateX(-50%);
  bottom: -100px;
  border-radius: 3px;
  opacity: ${props => props.$visible ? 0.6 : 0};
  transition: opacity 0.5s ease;
  
  @media (max-width: 768px) {
    display: none;
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
  
  // Intersection Observer
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
              const nextSection = SECTIONS[index + 1];
              
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
                      <Icon size={36} />
                    </CardIcon>
                    
                    <CardTitle $color={section.color}>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                    
                    <CardFooter>
                      <CardBadge>
                        <Sparkles />
                        לחצי לכניסה
                      </CardBadge>
                      
                      <CardArrow $gradient={section.gradient}>
                        <ArrowRight size={20} />
                      </CardArrow>
                    </CardFooter>
                    
                    {/* Connector line to next card */}
                    {nextSection && (
                      <ConnectorLine 
                        $fromColor={section.color}
                        $toColor={nextSection.color}
                        $visible={isVisible}
                      />
                    )}
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
