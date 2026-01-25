/**
 * AnnouncementsBanner.jsx
 * באנר הודעות - עיצוב נקי ואלגנטי עם אנימציית קונפטי
 */

import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { X, ChevronLeft, ChevronRight, ArrowLeft, Bell, Gift, Star, Info } from "lucide-react";
import { getActiveAnnouncements } from "../Services/announcementsService";

// אנימציות
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
`;

// אנימציית קונפטי - חלקיקים עולים ונעלמים
const confettiFall = keyframes`
  0% { 
    opacity: 1;
    transform: translateY(0) rotate(0deg) scale(1);
  }
  100% { 
    opacity: 0;
    transform: translateY(-80px) rotate(180deg) scale(0.5);
  }
`;

const confettiPop = keyframes`
  0% { 
    opacity: 0;
    transform: scale(0);
  }
  20% { 
    opacity: 1;
    transform: scale(1.2);
  }
  100% { 
    opacity: 0;
    transform: scale(0) translateY(-60px);
  }
`;

// Styled Components
const BannerWrapper = styled.div`
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.4s ease-out;
  position: relative;
`;

const ConfettiContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 20;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const ConfettiPiece = styled.div`
  position: absolute;
  width: ${props => props.$size || 8}px;
  height: ${props => props.$size || 8}px;
  background: ${props => props.$color};
  border-radius: ${props => props.$shape === 'circle' ? '50%' : '2px'};
  top: 50%;
  left: ${props => props.$left}%;
  animation: ${confettiPop} 1.2s ease-out forwards;
  animation-delay: ${props => props.$delay}s;
  opacity: 0;
`;

const Banner = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
  }
`;

const AccentBar = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background: ${props => props.$color || '#10b981'};
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  gap: 1.25rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 1.25rem;
  }
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$bgColor || 'rgba(16, 185, 129, 0.15)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    color: ${props => props.$color || '#10b981'};
  }
  
  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
  }
`;

const TextContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const TypeLabel = styled.span`
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${props => props.$color || '#10b981'};
  margin-bottom: 0.25rem;
`;

const Title = styled.h3`
  color: #f8fafc;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Description = styled.p`
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: ${props => props.$color || '#10b981'};
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    filter: brightness(1.1);
    transform: translateX(-2px);
  }
  
  svg {
    transition: transform 0.2s ease;
  }
  
  &:hover svg {
    transform: translateX(-3px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #94a3b8;
  }
`;

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const NavButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #f8fafc;
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const Dot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$active ? '#10b981' : 'rgba(255, 255, 255, 0.15)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#10b981' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const Counter = styled.span`
  color: #64748b;
  font-size: 0.8rem;
  margin-right: 0.5rem;
`;

// הגדרות סוגי הודעות
const TYPE_CONFIG = {
  news: { 
    label: 'חדשות', 
    icon: Bell, 
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    showConfetti: false
  },
  promotion: { 
    label: 'מבצע', 
    icon: Gift, 
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    showConfetti: true
  },
  holiday: { 
    label: 'חג שמח', 
    icon: Star, 
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    showConfetti: true
  },
  update: { 
    label: 'עדכון', 
    icon: Info, 
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    showConfetti: false
  },
};

// קונפטי - צבעים מגוונים
const CONFETTI_COLORS = ['#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

// יצירת חלקיקי קונפטי
const generateConfettiPieces = (count = 12) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: 10 + (i * 7) + Math.random() * 5,
    delay: i * 0.05,
    size: 6 + Math.random() * 6,
    shape: Math.random() > 0.5 ? 'circle' : 'square'
  }));
};

// קומפוננטת קונפטי
const Confetti = ({ show }) => {
  const [pieces] = useState(() => generateConfettiPieces(14));
  
  if (!show) return null;
  
  return (
    <ConfettiContainer>
      {pieces.map(piece => (
        <ConfettiPiece
          key={piece.id}
          $color={piece.color}
          $left={piece.left}
          $delay={piece.delay}
          $size={piece.size}
          $shape={piece.shape}
        />
      ))}
    </ConfettiContainer>
  );
};

const AnnouncementsBanner = ({ className }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await getActiveAnnouncements();
        setAnnouncements(data || []);
      } catch (error) {
        console.error("Error loading announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const handleDismiss = (id) => {
    setDismissed(prev => [...prev, id]);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % visibleAnnouncements.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + visibleAnnouncements.length) % visibleAnnouncements.length);
  };

  const handleAction = (url) => {
    if (url) {
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    }
  };

  const visibleAnnouncements = announcements.filter(a => {
    const id = a.announcementId || a.announcement_id;
    return !dismissed.includes(id);
  });

  if (loading || visibleAnnouncements.length === 0) {
    return null;
  }

  const safeIndex = currentIndex % visibleAnnouncements.length;
  const current = visibleAnnouncements[safeIndex];

  if (!current) return null;

  const announcementId = current.announcementId || current.announcement_id;
  const actionText = current.actionText || current.action_text;
  const actionUrl = current.actionUrl || current.action_url;
  const announcementType = current.type || 'news';
  
  const config = TYPE_CONFIG[announcementType] || TYPE_CONFIG.news;
  const TypeIcon = config.icon;

  return (
    <BannerWrapper className={className}>
      {/* קונפטי למבצעים וחגים */}
      <Confetti show={config.showConfetti} />
      
      <Banner>
        <AccentBar $color={config.color} />
        
        <CloseButton onClick={() => handleDismiss(announcementId)} aria-label="סגור">
          <X size={16} />
        </CloseButton>
        
        <BannerContent>
          <IconContainer $color={config.color} $bgColor={config.bgColor}>
            <TypeIcon size={22} />
          </IconContainer>
          
          <TextContent>
            <TypeLabel $color={config.color}>{config.label}</TypeLabel>
            <Title>{current.title}</Title>
            {current.content && <Description>{current.content}</Description>}
          </TextContent>
          
          {actionText && (
            <ActionButton 
              $color={config.color}
              onClick={() => handleAction(actionUrl)}
            >
              {actionText}
              <ArrowLeft size={16} />
            </ActionButton>
          )}
        </BannerContent>
      </Banner>
      
      {visibleAnnouncements.length > 1 && (
        <NavigationContainer>
          <NavButton onClick={handleNext}>
            <ChevronRight size={16} />
          </NavButton>
          <DotsContainer>
            {visibleAnnouncements.map((_, idx) => (
              <Dot
                key={idx}
                $active={idx === safeIndex}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </DotsContainer>
          <NavButton onClick={handlePrev}>
            <ChevronLeft size={16} />
          </NavButton>
          <Counter>{safeIndex + 1} / {visibleAnnouncements.length}</Counter>
        </NavigationContainer>
      )}
    </BannerWrapper>
  );
};

export default AnnouncementsBanner;
