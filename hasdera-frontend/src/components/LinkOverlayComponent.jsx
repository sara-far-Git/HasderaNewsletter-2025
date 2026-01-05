/**
 * LinkOverlayComponent.jsx
 * קומפוננטה לתצוגת קישורים על גבי ה-flipbook
 * תומכת במצב עריכה (Admin) ומצב צפייה (Published)
 */

import React from "react";
import styled, { keyframes } from "styled-components";
import { Link, Edit2, Trash2, Mail, ExternalLink, Phone, MapPin, Calendar, Clock, Star, Heart, ShoppingCart, User, Home } from "lucide-react";

// 🎬 אנימציות
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(20, 184, 166, 0);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(20, 184, 166, 0.5), 0 0 10px rgba(20, 184, 166, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(20, 184, 166, 0.8), 0 0 25px rgba(20, 184, 166, 0.5);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

// 🎯 Link Actions - כפתורי עריכה/מחיקה (רק במצב עריכה)
const LinkActions = styled.div`
  position: absolute;
  top: -40px;
  right: 50%;
  transform: translateX(50%);
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1002;
  background: white;
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: ${props => props.$danger ? '#fee2e2' : '#e0f2fe'};
  color: ${props => props.$danger ? '#dc2626' : '#0284c7'};
  
  &:hover {
    background: ${props => props.$danger ? '#fecaca' : '#bae6fd'};
    transform: scale(1.15);
  }
`;

// 🎯 Link Overlay - מצב עריכה
const EditableLinkOverlay = styled.div`
  position: absolute;
  top: ${props => props.$y}px;
  left: ${props => props.$x}px;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  border: 2px dashed ${props => props.$isEditing ? '#14b8a6' : 'rgba(20, 184, 166, 0.5)'};
  background: ${props => props.$isEditing ? 'rgba(20, 184, 166, 0.1)' : 'rgba(20, 184, 166, 0.05)'};
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, border-color 0.2s;
  user-select: none;
  
  &:hover {
    background: rgba(20, 184, 166, 0.2);
    border-color: #14b8a6;
  }
  
  &:hover ${LinkActions} {
    opacity: 1;
  }
`;

// 🎯 Link Overlay - מצב פרסום (עם אנימציה)
const PublishedLinkOverlay = styled.div`
  position: absolute;
  top: ${props => props.$y}px;
  left: ${props => props.$x}px;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
`;

// 🎯 Badge - מצב עריכה
const EditBadge = styled.div`
  position: absolute;
  top: -12px;
  right: -12px;
  width: 36px;
  height: 36px;
  background: #14b8a6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  z-index: 101;
`;

// 🎯 Badge - מצב פרסום (עם אנימציה)
const PublishedBadge = styled.div`
  position: absolute;
  top: -12px;
  right: -12px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.5);
  z-index: 101;
  animation: ${props => {
    switch(props.$animation) {
      case 'pulse': return pulse;
      case 'glow': return glow;
      case 'bounce': return bounce;
      default: return pulse;
    }
  }} 2s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, transparent 50%);
    animation: ${glow} 2s ease-in-out infinite;
    z-index: -1;
  }
`;

// 🎯 Shimmer effect for published links
const ShimmerOverlay = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(20, 184, 166, 0.1) 25%,
    rgba(20, 184, 166, 0.3) 50%,
    rgba(20, 184, 166, 0.1) 75%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 3s linear infinite;
  pointer-events: none;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: white;
`;

// 📋 רשימת אייקונים זמינים
export const availableIcons = [
  { name: 'Link', component: Link },
  { name: 'ExternalLink', component: ExternalLink },
  { name: 'Mail', component: Mail },
  { name: 'Phone', component: Phone },
  { name: 'MapPin', component: MapPin },
  { name: 'Calendar', component: Calendar },
  { name: 'Clock', component: Clock },
  { name: 'Star', component: Star },
  { name: 'Heart', component: Heart },
  { name: 'ShoppingCart', component: ShoppingCart },
  { name: 'User', component: User },
  { name: 'Home', component: Home },
];

// 📋 רשימת אנימציות זמינות
export const availableAnimations = [
  { name: 'pulse', label: 'פעימה' },
  { name: 'glow', label: 'זוהר' },
  { name: 'bounce', label: 'קפיצה' },
];

/**
 * קומפוננטת קישור בודד
 */
export default function LinkOverlayComponent({
  link,
  isPublished = false,
  isEditing = false,
  onEdit,
  onDelete,
  onClick,
}) {
  const IconComponent = availableIcons.find(icon => icon.name === (link.icon || 'Link'))?.component || Link;
  const animation = link.animation || 'pulse';

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(link);
    } else if (link.url) {
      window.open(link.url, '_blank');
    } else if (link.email) {
      window.location.href = `mailto:${link.email}`;
    }
  };

  // מצב פרסום - רק אייקון עם אנימציה (בלי ריבוע)
  if (isPublished) {
    return (
      <PublishedLinkOverlay
        $x={link.x}
        $y={link.y}
        $width={link.width}
        $height={link.height}
        onClick={handleClick}
        title={link.url || link.email || 'קישור'}
      >
        <PublishedBadge $animation={animation}>
          <IconWrapper>
            <IconComponent size={20} />
          </IconWrapper>
        </PublishedBadge>
      </PublishedLinkOverlay>
    );
  }

  // מצב עריכה - עם כפתורי עריכה/מחיקה
  return (
    <EditableLinkOverlay
      $x={link.x}
      $y={link.y}
      $width={link.width}
      $height={link.height}
      $isEditing={isEditing}
      onClick={handleClick}
    >
      <LinkActions>
        <ActionButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit?.(link);
          }}
          title="ערוך קישור"
        >
          <Edit2 size={16} />
        </ActionButton>
        <ActionButton
          $danger
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.confirm('האם למחוק את הקישור?')) {
              onDelete?.(link.id);
            }
          }}
          title="מחק קישור"
        >
          <Trash2 size={16} />
        </ActionButton>
      </LinkActions>
      <EditBadge>
        <IconWrapper>
          <IconComponent size={18} />
        </IconWrapper>
      </EditBadge>
    </EditableLinkOverlay>
  );
}

/**
 * קומפוננטת מיכל לכל הקישורים
 */
export function LinksContainer({
  links = [],
  isPublished = false,
  editingLinkId = null,
  onEditLink,
  onDeleteLink,
  onClickLink,
}) {
  if (!links || links.length === 0) return null;

  return (
    <>
      {links.map(link => (
        <LinkOverlayComponent
          key={link.id}
          link={link}
          isPublished={isPublished}
          isEditing={editingLinkId === link.id}
          onEdit={onEditLink}
          onDelete={onDeleteLink}
          onClick={onClickLink}
        />
      ))}
    </>
  );
}
