/**
 * ShederaStreet.jsx
 * 🌳 "טיול בשדרה" - חוויית רחוב אינטראקטיבית
 * ניווט כמשחק מסלול חי!
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import { 
  Book, Utensils, Gift, Coffee, Puzzle, ShoppingBag, 
  Newspaper, Star, Heart, Sparkles, ChevronDown,
  Trophy, Medal, Zap
} from "lucide-react";

// ================ ANIMATIONS ================

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const swing = keyframes`
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
`;

const fly = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(100px, -50px) rotate(10deg); }
  50% { transform: translate(200px, -20px) rotate(-5deg); }
  75% { transform: translate(300px, -60px) rotate(15deg); }
  100% { transform: translate(400px, 0) rotate(0deg); opacity: 0; }
`;

const blow = keyframes`
  0% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(50px) rotate(15deg); }
  50% { transform: translateX(100px) rotate(-10deg); }
  75% { transform: translateX(150px) rotate(20deg); }
  100% { transform: translateX(200px) rotate(5deg); opacity: 0; }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 5px rgba(255, 200, 100, 0.5)); }
  50% { filter: drop-shadow(0 0 20px rgba(255, 200, 100, 0.8)); }
`;

const doorOpen = keyframes`
  0% { transform: perspective(500px) rotateY(0deg); }
  100% { transform: perspective(500px) rotateY(-80deg); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scrollIndicator = keyframes`
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(10px); opacity: 0.5; }
`;

// ================ STYLED COMPONENTS ================

const StreetContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, 
    #1a1a2e 0%, 
    #16213e 30%, 
    #1a1a2e 60%,
    #0f0f1a 100%
  );
  overflow-x: hidden;
  position: relative;
`;

const Sky = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 40vh;
  background: linear-gradient(180deg, 
    ${props => props.$isDark ? '#0a0a15' : '#1e3a5f'} 0%, 
    ${props => props.$isDark ? '#1a1a2e' : '#2d5a87'} 100%
  );
  z-index: 0;
  transition: background 1s ease;
`;

const Stars = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: ${props => props.$isDark ? 1 : 0};
  transition: opacity 1s ease;
`;

const StarDot = styled.div`
  position: absolute;
  width: ${props => props.$size || 2}px;
  height: ${props => props.$size || 2}px;
  background: white;
  border-radius: 50%;
  top: ${props => props.$top}%;
  left: ${props => props.$left}%;
  animation: ${twinkle} ${props => props.$duration || 2}s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
`;

const Moon = styled.div`
  position: absolute;
  top: 10%;
  right: 15%;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle at 30% 30%, #fffde7, #ffd54f);
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(255, 213, 79, 0.5);
  opacity: ${props => props.$isDark ? 1 : 0};
  transition: opacity 1s ease;
`;

const StreetContent = styled.div`
  position: relative;
  z-index: 1;
  padding-top: 100px;
`;

const WelcomeSection = styled.section`
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  animation: ${fadeInUp} 1s ease-out;
`;

const WelcomeTitle = styled.h1`
  font-family: 'Cormorant Garamond', serif;
  font-size: 4rem;
  font-weight: 300;
  color: #f8fafc;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.25rem;
  color: #94a3b8;
  margin-bottom: 3rem;
  max-width: 500px;
`;

const ScrollHint = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  animation: ${scrollIndicator} 2s ease-in-out infinite;
  
  svg {
    color: #10b981;
  }
`;

// ===== STREET ELEMENTS =====

const StreetPath = styled.div`
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const LampPost = styled.div`
  position: absolute;
  ${props => props.$side === 'left' ? 'left: -60px;' : 'right: -60px;'}
  top: ${props => props.$top || 0}px;
  width: 40px;
  height: 200px;
  z-index: 5;
  
  @media (max-width: 900px) {
    display: none;
  }
`;

const LampPole = styled.div`
  width: 8px;
  height: 180px;
  background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
  margin: 0 auto;
  border-radius: 4px;
`;

const LampHead = styled.div`
  width: 30px;
  height: 25px;
  background: #1a202c;
  border-radius: 5px 5px 0 0;
  margin: 0 auto;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    background: ${props => props.$lit ? 'radial-gradient(circle, #ffd54f, #ff9800)' : '#374151'};
    border-radius: 50%;
    box-shadow: ${props => props.$lit ? '0 0 30px rgba(255, 200, 100, 0.8), 0 0 60px rgba(255, 200, 100, 0.4)' : 'none'};
    animation: ${props => props.$lit ? glow : 'none'} 3s ease-in-out infinite;
  }
`;

// ===== STATIONS (התחנות) =====

const StationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  padding: 4rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Station = styled.div`
  position: relative;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.08) 0%, 
    rgba(255, 255, 255, 0.02) 100%
  );
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: ${fadeInUp} 0.6s ease-out;
  animation-delay: ${props => props.$delay || 0}s;
  animation-fill-mode: both;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.$gradient};
    border-radius: 24px 24px 0 0;
  }
  
  &:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: ${props => props.$color};
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 0 1px ${props => props.$color}40,
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  &:hover .station-icon {
    animation: ${bounce} 0.5s ease-in-out;
  }
  
  &:hover .door {
    animation: ${doorOpen} 0.5s ease-out forwards;
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
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 30px ${props => props.$color}40;
  
  svg {
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
`;

const StationTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.5rem;
`;

const StationDescription = styled.p`
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const StationBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.75rem;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
`;

// ===== LIVING ELEMENTS =====

const Bird = styled.div`
  position: fixed;
  top: ${props => props.$top || 15}%;
  left: -50px;
  font-size: 1.5rem;
  animation: ${fly} ${props => props.$duration || 15}s linear infinite;
  animation-delay: ${props => props.$delay || 0}s;
  z-index: 10;
  opacity: 0.7;
`;

const FlyingNewspaper = styled.div`
  position: fixed;
  bottom: 20%;
  left: -100px;
  font-size: 2rem;
  animation: ${blow} 20s linear infinite;
  animation-delay: ${props => props.$delay || 0}s;
  z-index: 5;
  opacity: 0.5;
`;

const SwingingSign = styled.div`
  position: absolute;
  top: -30px;
  right: 20px;
  background: #8b4513;
  color: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  animation: ${swing} 3s ease-in-out infinite;
  transform-origin: top center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 10px;
    background: #5d3a1a;
  }
`;

// ===== EASTER EGGS =====

const HiddenElement = styled.div`
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 15;
  
  &:hover {
    transform: scale(1.2);
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  }
`;

const EasterEggPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #10b981;
  border-radius: 24px;
  padding: 2rem;
  text-align: center;
  z-index: 1000;
  animation: ${pulse} 0.3s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  max-width: 90%;
  width: 350px;
`;

const EasterEggOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  backdrop-filter: blur(5px);
`;

// ===== PROGRESS BAR =====

const ProgressSection = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 15, 26, 0.95);
  backdrop-filter: blur(10px);
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

const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  max-width: 400px;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 10px;
  transition: width 0.5s ease;
`;

const ProgressStats = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
  
  svg {
    color: ${props => props.$color || '#10b981'};
  }
  
  strong {
    color: #f8fafc;
  }
`;

const BadgesList = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Badge = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$earned 
    ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
    : 'rgba(255, 255, 255, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$earned ? 1 : 0.3};
  
  svg {
    color: ${props => props.$earned ? '#1a1a2e' : '#64748b'};
  }
`;

// ================ COMPONENT ================

const STATIONS = [
  {
    id: 'recipes',
    title: 'דוכן הטעמים',
    description: 'מתכונים טעימים וטיפים קולינריים מהשדרה',
    icon: Utensils,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    path: '/recipes',
    signText: 'טעימות!',
  },
  {
    id: 'stories',
    title: 'הספריה הקטנה',
    description: 'סיפורים בהמשכים, קריאה מרתקת לכל השבוע',
    icon: Book,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    path: '/stories',
    signText: 'פרק חדש!',
  },
  {
    id: 'challenges',
    title: 'חדר האתגרים',
    description: 'חידות, סודוקו ואתגרי חשיבה שבועיים',
    icon: Puzzle,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    path: '/challenges',
    signText: 'אתגר!',
  },
  {
    id: 'giveaways',
    title: 'קיוסק ההגרלות',
    description: 'השתתפי בהגרלות שבועיות ותזכי בפרסים',
    icon: Gift,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    path: '/giveaways',
    signText: 'הגרלה!',
  },
  {
    id: 'articles',
    title: 'בית הקפה',
    description: 'טורים, כתבות ושיחות קפה עם הכותבות',
    icon: Coffee,
    color: '#78350f',
    gradient: 'linear-gradient(135deg, #92400e, #78350f)',
    path: '/articles',
    signText: 'חדש!',
  },
  {
    id: 'market',
    title: 'לוח המודעות',
    description: 'קניה, מכירה, שירותים - הכל בקהילה',
    icon: ShoppingBag,
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    path: '/market',
    signText: 'עסקאות!',
  },
];

const EASTER_EGGS = [
  { id: 'bench', emoji: '🪑', message: '💫 "כל יום הוא הזדמנות חדשה להתחיל מחדש"', type: 'quote' },
  { id: 'cat', emoji: '🐱', message: '🎁 מצאת קופון! 10% הנחה על פרסום', type: 'coupon' },
  { id: 'flower', emoji: '🌸', message: '🌷 יום נפלא! קיבלת 5 נקודות בונוס', type: 'points' },
  { id: 'bird', emoji: '🕊️', message: '✨ ציפור מזל! ההגרלה הבאה עליך', type: 'luck' },
];

export default function ShederaStreet() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [visitedStations, setVisitedStations] = useState(new Set());
  const [points, setPoints] = useState(0);
  const [easterEgg, setEasterEgg] = useState(null);
  const [foundEasterEggs, setFoundEasterEggs] = useState(new Set());
  
  // Check time for dark mode
  useEffect(() => {
    const hour = new Date().getHours();
    setIsDarkMode(hour < 6 || hour >= 19);
  }, []);
  
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
  
  // Save progress
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
    // Navigate or open modal
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
  
  // Generate random stars
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 1 + Math.random() * 2,
    duration: 1 + Math.random() * 3,
    delay: Math.random() * 2,
  }));
  
  return (
    <StreetContainer>
      {/* Sky with stars/moon */}
      <Sky $isDark={isDarkMode}>
        <Stars $isDark={isDarkMode}>
          {stars.map(star => (
            <StarDot
              key={star.id}
              $top={star.top}
              $left={star.left}
              $size={star.size}
              $duration={star.duration}
              $delay={star.delay}
            />
          ))}
        </Stars>
        <Moon $isDark={isDarkMode} />
      </Sky>
      
      {/* Flying birds */}
      <Bird $top={10} $duration={18} $delay={0}>🕊️</Bird>
      <Bird $top={20} $duration={22} $delay={5}>🕊️</Bird>
      <Bird $top={8} $duration={15} $delay={10}>🕊️</Bird>
      
      {/* Flying newspaper */}
      <FlyingNewspaper $delay={3}>📰</FlyingNewspaper>
      
      <StreetContent>
        {/* Welcome Section */}
        <WelcomeSection>
          <WelcomeTitle>ברוכה הבאה לשדרה</WelcomeTitle>
          <WelcomeSubtitle>
            טיילי ברחוב האינטראקטיבי שלנו, גלי תכנים מדהימים וצברי נקודות!
          </WelcomeSubtitle>
          <ScrollHint>
            <span>גללי למטה להתחיל את הטיול</span>
            <ChevronDown size={24} />
          </ScrollHint>
        </WelcomeSection>
        
        {/* Street with lamp posts */}
        <StreetPath>
          <LampPost $side="left" $top={0}>
            <LampHead $lit={isDarkMode} />
            <LampPole />
          </LampPost>
          <LampPost $side="right" $top={200}>
            <LampHead $lit={isDarkMode} />
            <LampPole />
          </LampPost>
          
          {/* Stations Grid */}
          <StationsGrid>
            {STATIONS.map((station, index) => {
              const Icon = station.icon;
              const isVisited = visitedStations.has(station.id);
              
              return (
                <Station
                  key={station.id}
                  $color={station.color}
                  $gradient={station.gradient}
                  $delay={index * 0.1}
                  onClick={() => handleStationClick(station)}
                >
                  <SwingingSign>{station.signText}</SwingingSign>
                  
                  <StationIcon 
                    className="station-icon"
                    $color={station.color}
                    $gradient={station.gradient}
                  >
                    <Icon size={32} />
                  </StationIcon>
                  
                  <StationTitle>{station.title}</StationTitle>
                  <StationDescription>{station.description}</StationDescription>
                  
                  {isVisited && (
                    <StationBadge>
                      <Star size={12} />
                      ביקרת כאן
                    </StationBadge>
                  )}
                </Station>
              );
            })}
          </StationsGrid>
          
          {/* Hidden Easter Eggs */}
          {EASTER_EGGS.map((egg, i) => (
            <HiddenElement
              key={egg.id}
              style={{
                bottom: `${20 + i * 15}%`,
                [i % 2 === 0 ? 'left' : 'right']: '5%',
                fontSize: '1.5rem',
                opacity: foundEasterEggs.has(egg.id) ? 0.3 : 0.7,
              }}
              onClick={() => handleEasterEgg(egg)}
            >
              {egg.emoji}
            </HiddenElement>
          ))}
        </StreetPath>
      </StreetContent>
      
      {/* Progress Bar */}
      <ProgressSection>
        <ProgressStats>
          <StatItem $color="#fbbf24">
            <Zap size={18} />
            <strong>{points}</strong> נקודות
          </StatItem>
          <StatItem $color="#10b981">
            <Star size={18} />
            <strong>{visitedStations.size}/{STATIONS.length}</strong> תחנות
          </StatItem>
        </ProgressStats>
        
        <ProgressBar>
          <ProgressFill $progress={progress} />
        </ProgressBar>
        
        <BadgesList>
          <Badge $earned={visitedStations.size >= 1} title="מתחילה">
            <Medal size={16} />
          </Badge>
          <Badge $earned={visitedStations.size >= 3} title="חוקרת">
            <Star size={16} />
          </Badge>
          <Badge $earned={visitedStations.size >= STATIONS.length} title="מומחית!">
            <Trophy size={16} />
          </Badge>
        </BadgesList>
      </ProgressSection>
      
      {/* Easter Egg Popup */}
      {easterEgg && (
        <>
          <EasterEggOverlay onClick={() => setEasterEgg(null)} />
          <EasterEggPopup>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {easterEgg.emoji}
            </div>
            <h3 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>
              מצאת הפתעה!
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
              {easterEgg.message}
            </p>
            <button
              onClick={() => setEasterEgg(null)}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '12px',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              מדהים! 🎉
            </button>
          </EasterEggPopup>
        </>
      )}
    </StreetContainer>
  );
}

