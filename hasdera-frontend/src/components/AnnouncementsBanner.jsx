/**
 * AnnouncementsBanner.jsx
 * באנר הודעות חגיגיות/מבצעים לקוראים
 */

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { getActiveAnnouncements } from "../Services/announcementsService";

// 🎬 אנימציות
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// 🎨 Styled Components
const BannerContainer = styled.div`
  position: relative;
  width: 100%;
  animation: ${slideIn} 0.5s ease-out;
  margin-bottom: 1.5rem;
`;

const Banner = styled.div`
  background: ${props => props.$bg || 'linear-gradient(135deg, #10b981 0%, #059669 100%)'};
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
    animation: ${shimmer} 3s infinite;
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem 1rem;
  }
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  animation: ${pulse} 2s ease-in-out infinite;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h3`
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: white;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    margin-top: 0.75rem;
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
  background: rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.3);
  }
`;

const NavigationDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const Dot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$active ? '#10b981' : 'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$active ? '#10b981' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
  
  ${BannerContainer}:hover & {
    opacity: 0.7;
  }
  
  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.3);
  }
  
  ${props => props.$left ? 'left: -12px;' : 'right: -12px;'}
  
  @media (max-width: 768px) {
    display: none;
  }
`;

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
    }, 8000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const handleDismiss = (id) => {
    setDismissed(prev => [...prev, id]);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % announcements.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length);
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

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(
    a => !dismissed.includes(a.announcementId)
  );

  if (loading || visibleAnnouncements.length === 0) {
    return null;
  }

  const current = visibleAnnouncements[currentIndex % visibleAnnouncements.length];

  if (!current) return null;

  return (
    <BannerContainer className={className}>
      <Banner $bg={current.backgroundColor}>
        <IconWrapper>{current.icon || '📢'}</IconWrapper>
        
        <Content>
          <Title>{current.title}</Title>
          {current.content && <Description>{current.content}</Description>}
        </Content>
        
        {current.actionText && (
          <ActionButton onClick={() => handleAction(current.actionUrl)}>
            {current.actionText}
            <ExternalLink size={16} />
          </ActionButton>
        )}
        
        <CloseButton onClick={() => handleDismiss(current.announcementId)}>
          <X size={16} />
        </CloseButton>
      </Banner>
      
      {visibleAnnouncements.length > 1 && (
        <>
          <NavButton $left onClick={handlePrev}>
            <ChevronRight size={18} />
          </NavButton>
          <NavButton onClick={handleNext}>
            <ChevronLeft size={18} />
          </NavButton>
          <NavigationDots>
            {visibleAnnouncements.map((_, idx) => (
              <Dot
                key={idx}
                $active={idx === currentIndex % visibleAnnouncements.length}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </NavigationDots>
        </>
      )}
    </BannerContainer>
  );
};

export default AnnouncementsBanner;

