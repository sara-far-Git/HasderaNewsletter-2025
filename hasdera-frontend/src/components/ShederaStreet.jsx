/**
 * ShederaStreet.jsx
 * 🌳 "מדורים" - ריבועים עם פרלקס, רקע קבוע
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { 
  Book, Utensils, Gift, Coffee, Puzzle, ShoppingBag, 
  Star, Sparkles, ChevronDown, ArrowRight, Newspaper,
  TreePine
} from "lucide-react";

// ================ ANIMATIONS ================

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(60px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const scrollHint = keyframes`
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(10px); opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

// ================ STYLED COMPONENTS ================

const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

// Background - completely fixed, no scroll
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
      rgba(15, 23, 42, 0.6) 100%
    );
  }
`;

// Content wrapper
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

// ===== SECTIONS AREA =====

const SectionsArea = styled.section`
  padding: 100px 2rem 200px;
  min-height: 100vh;
`;

const SectionsTitle = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  
  h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 5vw, 3rem);
    color: #f8fafc;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.1rem;
  }
`;

const SectionsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
`;

// Each section card with parallax
const SectionCard = styled.div`
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.04) 100%
  );
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  /* Parallax transform based on scroll */
  transform: translateY(${props => props.$offset}px);
  transition: transform 0.1s ease-out, box-shadow 0.4s ease, border-color 0.4s ease;
  
  /* Entrance animation */
  opacity: ${props => props.$visible ? 1 : 0};
  animation: ${props => props.$visible ? fadeInUp : 'none'} 0.8s ease-out;
  animation-delay: ${props => props.$delay || 0}s;
  animation-fill-mode: both;
  
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
      transparent 0%,
      rgba(255, 255, 255, 0.08) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  &:hover {
    transform: translateY(${props => props.$offset - 10}px) scale(1.02);
    border-color: ${props => props.$color}50;
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.3),
      0 0 50px ${props => props.$color}15;
    
    &::before {
      height: 6px;
    }
    
    &::after {
      opacity: 1;
    }
  }
`;

const CardIcon = styled.div`
  width: 70px;
  height: 70px;
  background: ${props => props.$gradient};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 12px 30px ${props => props.$color}40;
  transition: all 0.4s ease;
  
  svg {
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  
  ${SectionCard}:hover & {
    transform: scale(1.1) rotate(-5deg);
    animation: ${float} 2s ease-in-out infinite;
  }
`;

const CardLabel = styled.span`
  display: inline-block;
  padding: 0.4rem 1rem;
  background: ${props => props.$gradient};
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px ${props => props.$color}40;
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.6rem;
  transition: color 0.3s ease;
  
  ${SectionCard}:hover & {
    color: ${props => props.$color};
  }
`;

const CardDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const CardArrow = styled.div`
  width: 40px;
  height: 40px;
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
    
    svg {
      color: white;
      transform: translateX(-4px);
    }
  }
`;

// ================ DATA ================

const SECTIONS = [
  {
    id: 'recipes',
    title: 'מתכונים',
    description: 'מתכונים טעימים, טיפים קולינריים וסודות המטבח',
    icon: Utensils,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    path: '/recipes',
    label: 'טעים!',
    parallaxSpeed: 0.15,
  },
  {
    id: 'stories',
    title: 'סיפורים בהמשכים',
    description: 'סיפורים מרגשים שילוו אותך לאורך כל השבוע',
    icon: Book,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    path: '/stories',
    label: 'פרק חדש',
    parallaxSpeed: 0.1,
  },
  {
    id: 'challenges',
    title: 'חידות ואתגרים',
    description: 'סודוקו, חידות חשיבה ואתגרים שבועיים',
    icon: Puzzle,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    path: '/challenges',
    label: 'אתגר!',
    parallaxSpeed: 0.2,
  },
  {
    id: 'giveaways',
    title: 'הגרלות',
    description: 'השתתפי בהגרלות שבועיות ותזכי בפרסים מדהימים',
    icon: Gift,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    path: '/giveaways',
    label: 'הגרלה!',
    parallaxSpeed: 0.12,
  },
  {
    id: 'articles',
    title: 'כתבות וטורים',
    description: 'טורים אישיים, כתבות מעמיקות ושיחות מהלב',
    icon: Coffee,
    color: '#92400e',
    gradient: 'linear-gradient(135deg, #b45309, #92400e)',
    path: '/articles',
    label: 'חדש!',
    parallaxSpeed: 0.18,
  },
  {
    id: 'market',
    title: 'לוח קהילתי',
    description: 'קניה, מכירה, שירותים - הכל בתוך הקהילה שלנו',
    icon: ShoppingBag,
    color: '#059669',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    path: '/market',
    label: 'עסקאות',
    parallaxSpeed: 0.08,
  },
  {
    id: 'issues',
    title: 'ארכיון גיליונות',
    description: 'כל הגיליונות הקודמים של השדרה במקום אחד',
    icon: Newspaper,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    path: '/issues',
    label: 'ארכיון',
    parallaxSpeed: 0.14,
  },
];

// ================ COMPONENT ================

export default function ShederaStreet() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [visibleCards, setVisibleCards] = useState(new Set());
  const cardRefs = useRef([]);
  
  // Smooth scroll handler
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  // Intersection Observer for cards appearing
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
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    
    cardRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => observer.disconnect();
  }, []);
  
  const handleCardClick = (section) => {
    navigate(section.path);
  };
  
  // Calculate parallax offset for each card
  const getParallaxOffset = (index, speed) => {
    const cardTop = 800 + (index * 150); // Approximate position
    const relativeScroll = scrollY - cardTop + 500;
    return relativeScroll * speed * -1;
  };
  
  return (
    <PageContainer>
      {/* Fixed Background - doesn't move */}
      <FixedBackground />
      
      <Content>
        {/* Welcome Section */}
        <WelcomeSection>
          <WelcomeContent $scrollY={scrollY}>
            <WelcomeBadge>
              <TreePine size={20} />
              מדורי השדרה
            </WelcomeBadge>
            <WelcomeTitle>המדורים שלנו</WelcomeTitle>
            <WelcomeSubtitle>
              גללי למטה וגלי את כל התכנים המיוחדים שלנו
            </WelcomeSubtitle>
          </WelcomeContent>
          
          <ScrollHint>
            <span>גללי למטה</span>
            <ChevronDown size={32} />
          </ScrollHint>
        </WelcomeSection>
        
        {/* Sections Grid */}
        <SectionsArea>
          <SectionsTitle>
            <h2>✨ בחרי מדור</h2>
            <p>לחצי על כרטיס כדי להיכנס</p>
          </SectionsTitle>
          
          <SectionsGrid>
            {SECTIONS.map((section, index) => {
              const Icon = section.icon;
              const isVisible = visibleCards.has(section.id);
              const parallaxOffset = getParallaxOffset(index, section.parallaxSpeed);
              
              return (
                <SectionCard
                  key={section.id}
                  ref={el => cardRefs.current[index] = el}
                  data-id={section.id}
                  $color={section.color}
                  $gradient={section.gradient}
                  $visible={isVisible}
                  $delay={index * 0.1}
                  $offset={parallaxOffset}
                  onClick={() => handleCardClick(section)}
                >
                  <CardLabel $color={section.color} $gradient={section.gradient}>
                    {section.label}
                  </CardLabel>
                  
                  <CardIcon $color={section.color} $gradient={section.gradient}>
                    <Icon size={32} />
                  </CardIcon>
                  
                  <CardTitle $color={section.color}>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                  
                  <CardFooter>
                    <CardBadge>
                      <Sparkles />
                      לחצי לכניסה
                    </CardBadge>
                    
                    <CardArrow $gradient={section.gradient}>
                      <ArrowRight size={18} />
                    </CardArrow>
                  </CardFooter>
                </SectionCard>
              );
            })}
          </SectionsGrid>
        </SectionsArea>
      </Content>
    </PageContainer>
  );
}
