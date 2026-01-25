/**
 * AnnouncementsBanner.jsx
 * באנר הודעות חגיגיות/מבצעים לקוראים - עיצוב מגזין מודרני
 */

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { X, ChevronLeft, ChevronRight, ArrowLeft, Sparkles, Gift, Bell, Star } from "lucide-react";
import { getActiveAnnouncements } from "../Services/announcementsService";

// 🎬 אנימציות
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.01); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-5px) rotate(2deg); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
`;

// 🎨 Styled Components
const BannerWrapper = styled.div`
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Banner = styled.div`
  position: relative;
  background: ${props => props.$background || 'linear-gradient(135deg, #10b981 0%, #059669 100%)'};
  border-radius: 24px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, 
      rgba(255,255,255,0.8), 
      rgba(255,255,255,0.2), 
      rgba(255,255,255,0.8));
    background-size: 300% 100%;
    animation: gradientMove 4s linear infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.15) 0%, 
      transparent 50%, 
      rgba(0, 0, 0, 0.1) 100%);
    pointer-events: none;
  }
  
  @keyframes gradientMove {
    0% { background-position: 0% 50%; }
    100% { background-position: 300% 50%; }
  }
`;

const BannerContent = styled.div`
  display: flex;
  align-items: stretch;
  min-height: 120px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const IconSection = styled.div`
  width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.15);
  position: relative;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 1.5rem;
  }
`;

const EmojiIcon = styled.div`
  font-size: 3.5rem;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SparkleDecor = styled.div`
  position: absolute;
  color: rgba(255, 255, 255, 0.6);
  animation: ${sparkle} 2s ease-in-out infinite;
  z-index: 2;
  
  &.top-right {
    top: 15%;
    right: 15%;
    animation-delay: 0.3s;
  }
  
  &.bottom-left {
    bottom: 15%;
    left: 15%;
    animation-delay: 0.6s;
  }
`;

const TextSection = styled.div`
  flex: 1;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    text-align: center;
  }
`;

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.8rem;
  background: ${props => {
    switch(props.$type) {
      case 'promotion': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'holiday': return 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)';
      case 'update': return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
      default: return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    }
  }};
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    margin: 0 auto 0.75rem;
  }
`;

const Title = styled.h3`
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Description = styled.p`
  color: #94a3b8;
  font-size: 1rem;
  margin: 0;
  line-height: 1.6;
  max-width: 500px;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ActionSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1rem 1.25rem 1.5rem;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.75rem;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 14px;
  color: #1a1a2e;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  font-family: inherit;
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    background: #ffffff;
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateX(-4px);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    transform: scale(1.05);
  }
`;

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const NavArrow = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-color: transparent;
    color: white;
    transform: scale(1.05);
  }
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Dot = styled.button`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
    : 'rgba(255, 255, 255, 0.2)'};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$active ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none'};
  
  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      : 'rgba(255, 255, 255, 0.4)'};
    transform: scale(1.2);
  }
`;

const Counter = styled.div`
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
`;

// Type labels
const TYPE_LABELS = {
  news: { label: 'חדשות', icon: Bell },
  promotion: { label: 'מבצע', icon: Gift },
  holiday: { label: 'חג שמח', icon: Star },
  update: { label: 'עדכון', icon: Sparkles },
};

/**
 * קומפוננטת באנר הודעות
 */
const AnnouncementsBanner = ({ className }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await getActiveAnnouncements();
        console.log("📢 Loaded announcements:", data);
        setAnnouncements(data || []);
      } catch (error) {
        console.error("Error loading announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length);
    }, 10000);

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

  // Filter out dismissed announcements - support both camelCase and snake_case
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

  // Support both camelCase and snake_case from API
  const announcementId = current.announcementId || current.announcement_id;
  const backgroundColor = current.backgroundColor || current.background_color;
  const actionText = current.actionText || current.action_text;
  const actionUrl = current.actionUrl || current.action_url;
  const announcementType = current.type || 'news';
  
  const typeInfo = TYPE_LABELS[announcementType] || TYPE_LABELS.news;
  const TypeIcon = typeInfo.icon;

  return (
    <BannerWrapper className={className}>
      <Banner $background={backgroundColor}>
        <CloseButton onClick={() => handleDismiss(announcementId)} aria-label="סגור">
          <X size={18} />
        </CloseButton>
        
        <BannerContent>
          <IconSection>
            <SparkleDecor className="top-right"><Sparkles size={14} /></SparkleDecor>
            <EmojiIcon>{current.icon || '🎉'}</EmojiIcon>
            <SparkleDecor className="bottom-left"><Sparkles size={12} /></SparkleDecor>
          </IconSection>
          
          <TextSection>
            <TypeBadge $type={announcementType}>
              <TypeIcon size={12} />
              {typeInfo.label}
            </TypeBadge>
            <Title>{current.title}</Title>
            {current.content && <Description>{current.content}</Description>}
          </TextSection>
          
          {actionText && (
            <ActionSection>
              <ActionButton onClick={() => handleAction(actionUrl)}>
                {actionText}
                <ArrowLeft size={18} />
              </ActionButton>
            </ActionSection>
          )}
        </BannerContent>
      </Banner>
      
      {visibleAnnouncements.length > 1 && (
        <NavigationContainer>
          <NavArrow onClick={handleNext}>
            <ChevronRight size={18} />
          </NavArrow>
          <DotsContainer>
            {visibleAnnouncements.map((_, idx) => (
              <Dot
                key={idx}
                $active={idx === safeIndex}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </DotsContainer>
          <NavArrow onClick={handlePrev}>
            <ChevronLeft size={18} />
          </NavArrow>
          <Counter>{safeIndex + 1} / {visibleAnnouncements.length}</Counter>
        </NavigationContainer>
      )}
    </BannerWrapper>
  );
};

export default AnnouncementsBanner;
