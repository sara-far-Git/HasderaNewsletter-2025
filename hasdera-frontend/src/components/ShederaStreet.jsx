/**
 * ShederaStreet.jsx
 * 🌳 "טיול בשדרה" - רחוב אינטראקטיבי עם אלמנטים ריאליסטיים
 * לחיצה על אלמנטים ברחוב מובילה למדורים
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import { ChevronDown, TreePine } from "lucide-react";

// ================ ANIMATIONS ================

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const sway = keyframes`
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const fadeInLeft = keyframes`
  from { opacity: 0; transform: translateX(-80px); }
  to { opacity: 1; transform: translateX(0); }
`;

const fadeInRight = keyframes`
  from { opacity: 0; transform: translateX(80px); }
  to { opacity: 1; transform: translateX(0); }
`;

const scrollHint = keyframes`
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(12px); opacity: 0.5; }
`;

const walkDots = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`;

const birdFly = keyframes`
  0% { transform: translate(0, 0); }
  100% { transform: translate(100vw, -30px); }
`;

const leafFall = keyframes`
  0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
  10% { opacity: 0.7; }
  100% { transform: translateY(100vh) rotate(540deg) translateX(80px); opacity: 0; }
`;

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6)); }
  50% { filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.9)); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
`;

// ================ STYLED COMPONENTS ================

const StreetContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

// Background - always visible street image
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
  transform: scale(1.05) translateY(${props => props.$scrollY * 0.1}px);
  transition: transform 0.1s ease-out;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(15, 23, 42, 0.4) 0%,
      rgba(20, 30, 48, 0.3) 30%,
      rgba(15, 23, 42, 0.35) 60%,
      rgba(10, 15, 30, 0.5) 100%
    );
  }
`;

// Flying elements
const Bird = styled.div`
  position: fixed;
  font-size: 1.8rem;
  animation: ${birdFly} ${props => props.$duration || 25}s linear infinite;
  animation-delay: ${props => props.$delay || 0}s;
  top: ${props => props.$top || 10}%;
  left: -60px;
  z-index: 50;
  opacity: 0.6;
`;

const Leaf = styled.div`
  position: fixed;
  font-size: ${props => props.$size || 1.5}rem;
  animation: ${leafFall} ${props => props.$duration || 18}s linear infinite;
  animation-delay: ${props => props.$delay || 0}s;
  left: ${props => props.$left || 50}%;
  z-index: 45;
  opacity: 0.5;
`;

// Main content
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
  transform: translateY(${props => Math.min(0, -props.$scrollY * 0.4)}px);
  opacity: ${props => Math.max(0, 1 - props.$scrollY / 500)};
  transition: all 0.15s ease-out;
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
  font-size: clamp(3.5rem, 12vw, 7rem);
  font-weight: 300;
  color: #f8fafc;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 40px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.05em;
`;

const WelcomeSubtitle = styled.p`
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
  max-width: 600px;
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
  gap: 1rem;
  color: rgba(255, 255, 255, 0.7);
  animation: ${scrollHint} 2s ease-in-out infinite;
  
  span {
    font-size: 0.95rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
`;

const WalkDots = styled.div`
  display: flex;
  gap: 12px;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  animation: ${walkDots} 1.5s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
`;

// ===== STREET SECTION =====

const StreetSection = styled.section`
  position: relative;
  padding: 0;
`;

// Street elements wrapper - the actual "street" where things are placed
const StreetScene = styled.div`
  position: relative;
  min-height: 400vh; /* Very long street */
  max-width: 1600px;
  margin: 0 auto;
  padding: 100px 0;
`;

// Individual street element
const StreetElement = styled.div`
  position: absolute;
  ${props => props.$left ? `left: ${props.$left};` : ''}
  ${props => props.$right ? `right: ${props.$right};` : ''}
  top: ${props => props.$top};
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: ${props => props.$zIndex || 20};
  
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => {
    if (!props.$visible) return 'translateY(50px) scale(0.8)';
    return 'translateY(0) scale(1)';
  }};
  
  &:hover {
    transform: scale(1.15) translateY(-10px);
    z-index: 100;
  }
`;

const ElementEmoji = styled.div`
  font-size: ${props => props.$size || '5rem'};
  filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.4));
  animation: ${props => props.$animate ? float : 'none'} 4s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
  
  ${StreetElement}:hover & {
    filter: drop-shadow(0 15px 35px rgba(16, 185, 129, 0.5));
  }
`;

const ElementLabel = styled.div`
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  ${StreetElement}:hover & {
    opacity: 1;
    bottom: -45px;
  }
`;

const ElementSparkle = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 1.5rem;
  animation: ${sparkle} 2s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
`;

// Decorative elements (non-clickable)
const Decoration = styled.div`
  position: absolute;
  ${props => props.$left ? `left: ${props.$left};` : ''}
  ${props => props.$right ? `right: ${props.$right};` : ''}
  top: ${props => props.$top};
  font-size: ${props => props.$size || '4rem'};
  opacity: ${props => props.$opacity || 0.6};
  pointer-events: none;
  animation: ${sway} ${props => props.$duration || 6}s ease-in-out infinite;
  filter: ${props => props.$blur ? `blur(${props.$blur}px)` : 'none'};
  z-index: ${props => props.$zIndex || 5};
  
  @media (max-width: 768px) {
    font-size: ${props => `calc(${props.$size || '4rem'} * 0.7)`};
  }
`;

// Street lamp
const LampPost = styled.div`
  position: absolute;
  ${props => props.$left ? `left: ${props.$left};` : ''}
  ${props => props.$right ? `right: ${props.$right};` : ''}
  top: ${props => props.$top};
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.9;
  z-index: 15;
  
  @media (max-width: 768px) {
    opacity: 0.5;
  }
`;

const LampLight = styled.div`
  font-size: 2.5rem;
  animation: ${glow} 4s ease-in-out infinite;
  margin-bottom: -10px;
`;

const LampPole = styled.div`
  width: 8px;
  height: ${props => props.$height || '120px'};
  background: linear-gradient(180deg, #4b5563 0%, #374151 100%);
  border-radius: 4px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
`;

// Section dividers with text
const SectionDivider = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: ${props => props.$top};
  text-align: center;
  z-index: 30;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.8s ease;
`;

const DividerLine = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    min-width: 50px;
  }
`;

const DividerEmoji = styled.span`
  font-size: 2rem;
`;

const DividerText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

// Click hint tooltip
const ClickHint = styled.div`
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  z-index: 100;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.5s ease;
  pointer-events: none;
  
  span {
    color: #10b981;
    font-weight: 600;
  }
`;

// ================ DATA ================

const STREET_ELEMENTS = [
  // ====== SECTION 1: כניסה לשדרה ======
  {
    id: 'welcome-tree',
    type: 'decoration',
    emoji: '🌳',
    top: '5%',
    left: '10%',
    size: '6rem',
    opacity: 0.7,
    duration: 8,
  },
  {
    id: 'welcome-tree2',
    type: 'decoration',
    emoji: '🌲',
    top: '3%',
    right: '8%',
    size: '5rem',
    opacity: 0.6,
    duration: 10,
  },
  {
    id: 'lamp1',
    type: 'lamp',
    top: '8%',
    left: '25%',
    height: '100px',
  },
  
  // ====== ספסל - לוח מודעות ======
  {
    id: 'bench',
    type: 'clickable',
    emoji: '🪑',
    label: 'לוח קהילתי',
    top: '12%',
    left: '15%',
    size: '5rem',
    path: '/market',
    animate: true,
  },
  
  // ====== עץ גדול ======
  {
    id: 'big-tree',
    type: 'decoration',
    emoji: '🌳',
    top: '15%',
    right: '20%',
    size: '8rem',
    opacity: 0.8,
    duration: 7,
  },
  
  // ====== דוכן פירות - מתכונים ======
  {
    id: 'fruit-stand',
    type: 'clickable',
    emoji: '🍎',
    label: 'מתכונים טעימים',
    top: '20%',
    right: '25%',
    size: '5.5rem',
    path: '/recipes',
    animate: true,
    sparkle: true,
  },
  
  // ====== Section Divider ======
  {
    id: 'divider1',
    type: 'divider',
    top: '25%',
    emoji: '🛤️',
    text: 'ממשיכים בטיול...',
  },
  
  // ====== פרחים ======
  {
    id: 'flowers1',
    type: 'decoration',
    emoji: '🌸',
    top: '28%',
    left: '5%',
    size: '3rem',
    opacity: 0.6,
  },
  {
    id: 'flowers2',
    type: 'decoration',
    emoji: '🌺',
    top: '30%',
    right: '8%',
    size: '3.5rem',
    opacity: 0.5,
  },
  
  // ====== ספריה - סיפורים ======
  {
    id: 'library',
    type: 'clickable',
    emoji: '📚',
    label: 'סיפורים בהמשכים',
    top: '32%',
    left: '30%',
    size: '5.5rem',
    path: '/stories',
    animate: true,
  },
  
  // ====== פנס נוסף ======
  {
    id: 'lamp2',
    type: 'lamp',
    top: '35%',
    right: '15%',
    height: '110px',
  },
  
  // ====== שיח ======
  {
    id: 'bush1',
    type: 'decoration',
    emoji: '🌿',
    top: '38%',
    left: '8%',
    size: '4rem',
    opacity: 0.5,
  },
  
  // ====== קיוסק - הגרלות ======
  {
    id: 'kiosk',
    type: 'clickable',
    emoji: '🎁',
    label: 'הגרלות ופרסים',
    top: '42%',
    right: '22%',
    size: '6rem',
    path: '/giveaways',
    animate: true,
    sparkle: true,
  },
  
  // ====== עצים נוספים ======
  {
    id: 'palm',
    type: 'decoration',
    emoji: '🌴',
    top: '45%',
    left: '12%',
    size: '7rem',
    opacity: 0.6,
    duration: 9,
  },
  
  // ====== Section Divider ======
  {
    id: 'divider2',
    type: 'divider',
    top: '50%',
    emoji: '☀️',
    text: 'עוד קצת לטייל...',
  },
  
  // ====== בית קפה - כתבות ======
  {
    id: 'cafe',
    type: 'clickable',
    emoji: '☕',
    label: 'טורים וכתבות',
    top: '55%',
    left: '25%',
    size: '5.5rem',
    path: '/articles',
    animate: true,
  },
  
  // ====== עץ ======
  {
    id: 'tree3',
    type: 'decoration',
    emoji: '🌳',
    top: '58%',
    right: '10%',
    size: '6rem',
    opacity: 0.7,
    duration: 8,
  },
  
  // ====== פנס ======
  {
    id: 'lamp3',
    type: 'lamp',
    top: '60%',
    left: '18%',
    height: '90px',
  },
  
  // ====== פאזל - אתגרים ======
  {
    id: 'puzzle',
    type: 'clickable',
    emoji: '🧩',
    label: 'חידות ואתגרים',
    top: '65%',
    right: '30%',
    size: '5.5rem',
    path: '/challenges',
    animate: true,
    sparkle: true,
  },
  
  // ====== פרחים נוספים ======
  {
    id: 'flowers3',
    type: 'decoration',
    emoji: '🌻',
    top: '68%',
    left: '6%',
    size: '4rem',
    opacity: 0.6,
  },
  {
    id: 'flowers4',
    type: 'decoration',
    emoji: '🌷',
    top: '70%',
    right: '5%',
    size: '3.5rem',
    opacity: 0.5,
  },
  
  // ====== Section Divider ======
  {
    id: 'divider3',
    type: 'divider',
    top: '75%',
    emoji: '🌟',
    text: 'כמעט סיימנו!',
  },
  
  // ====== עוד עצים ======
  {
    id: 'tree4',
    type: 'decoration',
    emoji: '🌲',
    top: '78%',
    left: '15%',
    size: '5.5rem',
    opacity: 0.6,
    duration: 11,
  },
  
  // ====== עיתון - גיליונות ======
  {
    id: 'newspaper',
    type: 'clickable',
    emoji: '📰',
    label: 'ארכיון גיליונות',
    top: '82%',
    left: '35%',
    size: '5.5rem',
    path: '/issues',
    animate: true,
  },
  
  // ====== פנס אחרון ======
  {
    id: 'lamp4',
    type: 'lamp',
    top: '85%',
    right: '20%',
    height: '100px',
  },
  
  // ====== סוף הרחוב ======
  {
    id: 'end-tree1',
    type: 'decoration',
    emoji: '🌳',
    top: '90%',
    left: '10%',
    size: '6rem',
    opacity: 0.7,
  },
  {
    id: 'end-tree2',
    type: 'decoration',
    emoji: '🌲',
    top: '92%',
    right: '12%',
    size: '5rem',
    opacity: 0.6,
  },
  
  // ====== בית - דף הבית ======
  {
    id: 'home',
    type: 'clickable',
    emoji: '🏠',
    label: 'חזרה הביתה',
    top: '95%',
    left: '45%',
    size: '6rem',
    path: '/',
    animate: true,
  },
];

// ================ COMPONENT ================

export default function ShederaStreet() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [showClickHint, setShowClickHint] = useState(false);
  const elementRefs = useRef({});
  
  // Scroll handler
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  // Show click hint after scrolling a bit
  useEffect(() => {
    if (scrollY > 300 && scrollY < 1500) {
      setShowClickHint(true);
    } else {
      setShowClickHint(false);
    }
  }, [scrollY]);
  
  // Intersection Observer for elements appearing
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.dataset.id;
            setVisibleElements(prev => new Set([...prev, id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    Object.values(elementRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => observer.disconnect();
  }, []);
  
  const handleElementClick = (element) => {
    if (element.path) {
      navigate(element.path);
    }
  };
  
  const leaves = ['🍂', '🍃', '🌿'];
  
  return (
    <StreetContainer>
      {/* Background - always visible */}
      <BackgroundImage $scrollY={scrollY} />
      
      {/* Flying birds */}
      <Bird $top={8} $duration={30} $delay={0}>🕊️</Bird>
      <Bird $top={15} $duration={40} $delay={12}>🐦</Bird>
      <Bird $top={5} $duration={35} $delay={25}>🕊️</Bird>
      
      {/* Falling leaves */}
      {[...Array(8)].map((_, i) => (
        <Leaf 
          key={i}
          $left={10 + (i * 12)}
          $size={1.2 + Math.random() * 0.6}
          $duration={16 + Math.random() * 8}
          $delay={i * 4}
        >
          {leaves[i % leaves.length]}
        </Leaf>
      ))}
      
      <Content>
        {/* Welcome Section */}
        <WelcomeSection>
          <WelcomeContent $scrollY={scrollY}>
            <WelcomeBadge>
              <TreePine size={20} />
              טיול בשדרה
            </WelcomeBadge>
            <WelcomeTitle>ברוכה הבאה</WelcomeTitle>
            <WelcomeSubtitle>
              גללי למטה וטיילי ברחוב שלנו
              <br />
              לחצי על האלמנטים כדי להיכנס למדורים 🚶‍♀️
            </WelcomeSubtitle>
          </WelcomeContent>
          
          <ScrollHint>
            <span>התחילי לטייל</span>
            <WalkDots>
              <Dot $delay={0} />
              <Dot $delay={0.2} />
              <Dot $delay={0.4} />
            </WalkDots>
            <ChevronDown size={36} />
          </ScrollHint>
        </WelcomeSection>
        
        {/* Street Scene - all elements positioned absolutely */}
        <StreetSection>
          <StreetScene>
            {STREET_ELEMENTS.map((element) => {
              const isVisible = visibleElements.has(element.id);
              
              // Clickable element
              if (element.type === 'clickable') {
                return (
                  <StreetElement
                    key={element.id}
                    ref={el => elementRefs.current[element.id] = el}
                    data-id={element.id}
                    $top={element.top}
                    $left={element.left}
                    $right={element.right}
                    $visible={isVisible}
                    $zIndex={30}
                    onClick={() => handleElementClick(element)}
                  >
                    {element.sparkle && (
                      <ElementSparkle $delay={Math.random()}>✨</ElementSparkle>
                    )}
                    <ElementEmoji 
                      $size={element.size}
                      $animate={element.animate}
                      $delay={Math.random() * 2}
                    >
                      {element.emoji}
                    </ElementEmoji>
                    <ElementLabel>{element.label}</ElementLabel>
                  </StreetElement>
                );
              }
              
              // Lamp post
              if (element.type === 'lamp') {
                return (
                  <LampPost
                    key={element.id}
                    ref={el => elementRefs.current[element.id] = el}
                    data-id={element.id}
                    $top={element.top}
                    $left={element.left}
                    $right={element.right}
                    style={{ opacity: isVisible ? 0.9 : 0, transition: 'opacity 0.8s ease' }}
                  >
                    <LampLight>💡</LampLight>
                    <LampPole $height={element.height} />
                  </LampPost>
                );
              }
              
              // Divider
              if (element.type === 'divider') {
                return (
                  <SectionDivider
                    key={element.id}
                    ref={el => elementRefs.current[element.id] = el}
                    data-id={element.id}
                    $top={element.top}
                    $visible={isVisible}
                  >
                    <DividerLine>
                      <DividerEmoji>{element.emoji}</DividerEmoji>
                    </DividerLine>
                    <DividerText>{element.text}</DividerText>
                  </SectionDivider>
                );
              }
              
              // Decoration
              return (
                <Decoration
                  key={element.id}
                  ref={el => elementRefs.current[element.id] = el}
                  data-id={element.id}
                  $top={element.top}
                  $left={element.left}
                  $right={element.right}
                  $size={element.size}
                  $opacity={isVisible ? element.opacity : 0}
                  $duration={element.duration}
                  $blur={element.blur}
                  $zIndex={element.zIndex}
                  style={{ transition: 'opacity 0.8s ease' }}
                >
                  {element.emoji}
                </Decoration>
              );
            })}
          </StreetScene>
        </StreetSection>
      </Content>
      
      {/* Click hint */}
      <ClickHint $visible={showClickHint}>
        💡 <span>לחצי</span> על האלמנטים כדי להיכנס למדורים!
      </ClickHint>
    </StreetContainer>
  );
}
