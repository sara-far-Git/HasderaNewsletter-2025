/**
 * ShederaStreet.jsx
 * 🌳 "השדרה" - עיצוב שדרה אמיתית עם חנויות ועצים
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Book, Utensils, Gift, Coffee, Puzzle, ShoppingBag,
  Sparkles, ArrowLeft, Newspaper, TreePine
} from "lucide-react";
import ReaderNav from "./ReaderNav";

// ================ ANIMATIONS ================

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

const sway = keyframes`
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
`;

const walkIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const signSwing = keyframes`
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
`;

const lampGlow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 15px rgba(255, 200, 100, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(255, 200, 100, 0.9));
  }
`;

const cloudDrift = keyframes`
  0% { transform: translateX(-100px); }
  100% { transform: translateX(calc(100vw + 100px)); }
`;

// ================ STYLED COMPONENTS ================

const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(180deg,
    #87CEEB 0%,
    #B0E0E6 30%,
    #E0F4FF 60%,
    #f0f9ff 100%
  );
`;

// Sky elements
const Sky = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 40vh;
  pointer-events: none;
  z-index: 0;
`;

const Sun = styled.div`
  position: absolute;
  top: 40px;
  right: 80px;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, #FFD700 0%, #FFA500 50%, transparent 70%);
  border-radius: 50%;
  box-shadow: 0 0 60px rgba(255, 200, 0, 0.5);

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    right: 30px;
    top: 20px;
  }
`;

const Cloud = styled.div`
  position: absolute;
  top: ${props => props.$top}px;
  font-size: ${props => props.$size}rem;
  opacity: 0.8;
  animation: ${cloudDrift} ${props => props.$duration}s linear infinite;
  animation-delay: ${props => props.$delay}s;
`;

// Street container
const StreetScene = styled.div`
  position: relative;
  z-index: 1;
  padding-top: 20px;
`;

// Header
const StreetHeader = styled.div`
  text-align: center;
  padding: 2rem 1rem 3rem;
  position: relative;
`;

const StreetSign = styled.div`
  display: inline-block;
  background: linear-gradient(145deg, #2d5a27 0%, #1a3a15 100%);
  padding: 1rem 3rem;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
  animation: ${signSwing} 4s ease-in-out infinite;
  transform-origin: top center;

  &::before {
    content: '';
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 35px;
    background: #4a3728;
    border-radius: 4px;
  }

  h1 {
    color: #fff;
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    font-family: 'Assistant', sans-serif;
  }

  p {
    color: rgba(255,255,255,0.9);
    margin: 0.5rem 0 0;
    font-size: 1rem;
  }
`;

// The Street itself
const StreetWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
`;

// Sidewalk and road
const StreetRoad = styled.div`
  position: relative;
  background: linear-gradient(180deg,
    #d4c4a8 0%,
    #c9b896 50%,
    #bfad84 100%
  );
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow:
    inset 0 2px 10px rgba(0,0,0,0.1),
    0 10px 40px rgba(0,0,0,0.15);

  /* Cobblestone pattern */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(ellipse 30px 20px at 25px 15px, rgba(0,0,0,0.05) 0%, transparent 50%),
      radial-gradient(ellipse 30px 20px at 75px 15px, rgba(0,0,0,0.03) 0%, transparent 50%);
    background-size: 100px 30px;
    border-radius: 20px;
    opacity: 0.5;
  }
`;

// Trees on the sides
const TreesContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  ${props => props.$side === 'left' ? 'left: 0;' : 'right: 0;'}
  width: 120px;
  pointer-events: none;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 100px 0;

  @media (max-width: 900px) {
    display: none;
  }
`;

const Tree = styled.div`
  font-size: ${props => props.$size || '4'}rem;
  text-align: center;
  animation: ${sway} ${props => props.$duration || 5}s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}s;
  filter: drop-shadow(0 10px 10px rgba(0,0,0,0.2));
`;

// Street Lamp
const StreetLamp = styled.div`
  position: absolute;
  ${props => props.$side === 'left' ? 'left: -60px;' : 'right: -60px;'}
  top: ${props => props.$top}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;

  @media (max-width: 900px) {
    display: none;
  }
`;

const LampPost = styled.div`
  width: 8px;
  height: 80px;
  background: linear-gradient(90deg, #3a3a3a, #5a5a5a, #3a3a3a);
  border-radius: 4px;
`;

const LampHead = styled.div`
  width: 40px;
  height: 35px;
  background: linear-gradient(180deg, #2a2a2a 0%, #4a4a4a 100%);
  border-radius: 8px 8px 15px 15px;
  position: relative;
  animation: ${lampGlow} 3s ease-in-out infinite;

  &::after {
    content: '';
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 15px;
    background: radial-gradient(ellipse, #fff8dc 0%, #ffd700 50%, transparent 70%);
    border-radius: 50%;
  }
`;

// Shops Grid
const ShopsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  position: relative;
  z-index: 5;
`;

// Individual Shop
const Shop = styled.div`
  background: ${props => props.$bgColor || '#fff'};
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow:
    0 10px 30px rgba(0,0,0,0.15),
    0 5px 15px rgba(0,0,0,0.1);
  animation: ${walkIn} 0.6s ease-out backwards;
  animation-delay: ${props => props.$delay}ms;
  position: relative;

  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow:
      0 20px 50px rgba(0,0,0,0.2),
      0 10px 25px rgba(0,0,0,0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8px;
    background: ${props => props.$gradient};
  }
`;

const ShopAwning = styled.div`
  background: ${props => props.$gradient};
  padding: 1.5rem;
  position: relative;
  overflow: hidden;

  /* Awning stripes effect */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 20px,
      rgba(255,255,255,0.1) 20px,
      rgba(255,255,255,0.1) 40px
    );
  }

  /* Awning bottom edge */
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    right: 0;
    height: 20px;
    background: inherit;
    clip-path: polygon(
      0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%,
      40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%,
      80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%
    );
  }
`;

const ShopIcon = styled.div`
  width: 70px;
  height: 70px;
  background: rgba(255,255,255,0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  position: relative;
  z-index: 1;

  svg {
    color: ${props => props.$color};
    filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
  }

  ${Shop}:hover & {
    animation: ${float} 0.6s ease-in-out;
  }
`;

const ShopContent = styled.div`
  padding: 2rem 1.5rem 1.5rem;
  text-align: center;
  background: #fff;
`;

const ShopName = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem;
`;

const ShopDescription = styled.p`
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 1.25rem;
`;

const ShopButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.$gradient};
  color: white;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px ${props => props.$color}40;

  ${Shop}:hover & {
    transform: scale(1.05);
    box-shadow: 0 6px 20px ${props => props.$color}50;
  }

  svg {
    transition: transform 0.3s ease;
  }

  ${Shop}:hover & svg {
    transform: translateX(-4px);
  }
`;

const ShopBadge = styled.span`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255,255,255,0.95);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.$color};
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  z-index: 2;
`;

// Decorative elements
const Bench = styled.div`
  position: absolute;
  bottom: -20px;
  ${props => props.$side === 'left' ? 'left: 20px;' : 'right: 20px;'}
  font-size: 2rem;

  @media (max-width: 600px) {
    display: none;
  }
`;

const FlowerPot = styled.div`
  position: absolute;
  bottom: -15px;
  left: ${props => props.$left}%;
  font-size: 1.8rem;
  animation: ${sway} 3s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;

  @media (max-width: 600px) {
    display: none;
  }
`;

// Footer area
const StreetEnd = styled.div`
  text-align: center;
  padding: 3rem 1rem 5rem;
  position: relative;
`;

const FooterDecor = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FooterText = styled.p`
  color: #64748b;
  font-size: 1rem;
`;

// ================ DATA ================

const SHOPS = [
  {
    id: 'recipes',
    title: 'מתכונים',
    description: 'מתכונים טעימים וסודות המטבח שלנו',
    icon: Utensils,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    bgColor: '#fffbeb',
    path: '/sections/recipes',
    badge: 'טעים!',
    emoji: '🍳',
  },
  {
    id: 'stories',
    title: 'סיפורים בהמשכים',
    description: 'סיפורים מרגשים שילוו אותך כל השבוע',
    icon: Book,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    bgColor: '#f5f3ff',
    path: '/sections/stories',
    badge: 'פרק חדש',
    emoji: '📚',
  },
  {
    id: 'challenges',
    title: 'חידות ואתגרים',
    description: 'סודוקו, חידות חשיבה ואתגרים מאתגרים',
    icon: Puzzle,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    bgColor: '#fdf2f8',
    path: '/sections/challenges',
    badge: 'אתגר!',
    emoji: '🧩',
  },
  {
    id: 'giveaways',
    title: 'הגרלות ופרסים',
    description: 'השתתפי בהגרלות ותזכי בפרסים מדהימים',
    icon: Gift,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    bgColor: '#ecfdf5',
    path: '/sections/giveaways',
    badge: 'הגרלה!',
    emoji: '🎁',
  },
  {
    id: 'articles',
    title: 'כתבות וטורים',
    description: 'טורים אישיים, כתבות מעמיקות ושיחות מהלב',
    icon: Coffee,
    color: '#92400e',
    gradient: 'linear-gradient(135deg, #b45309, #92400e)',
    bgColor: '#fef3e2',
    path: '/sections/articles',
    badge: 'חדש!',
    emoji: '☕',
  },
  {
    id: 'market',
    title: 'לוח קהילתי',
    description: 'קניה, מכירה, שירותים - הכל בקהילה שלנו',
    icon: ShoppingBag,
    color: '#059669',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    bgColor: '#ecfdf5',
    path: '/sections/market',
    badge: 'עסקאות',
    emoji: '🛍️',
  },
  {
    id: 'issues',
    title: 'ארכיון גיליונות',
    description: 'כל הגיליונות הקודמים של השדרה',
    icon: Newspaper,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    bgColor: '#eef2ff',
    path: '/issues',
    badge: 'ארכיון',
    emoji: '📰',
  },
];

// ================ COMPONENT ================

export default function ShederaStreet() {
  const navigate = useNavigate();

  const handleShopClick = (shop) => {
    navigate(shop.path);
  };

  return (
    <PageContainer>
      <ReaderNav />

      {/* Sky */}
      <Sky>
        <Sun />
        <Cloud $top={30} $size={4} $duration={45} $delay={0}>☁️</Cloud>
        <Cloud $top={60} $size={3} $duration={55} $delay={15}>☁️</Cloud>
        <Cloud $top={20} $size={3.5} $duration={50} $delay={30}>☁️</Cloud>
      </Sky>

      {/* Trees on sides */}
      <TreesContainer $side="left">
        <Tree $size={5} $duration={6} $delay={0}>🌳</Tree>
        <Tree $size={4} $duration={5} $delay={1}>🌲</Tree>
        <Tree $size={5.5} $duration={7} $delay={0.5}>🌳</Tree>
        <Tree $size={4} $duration={5.5} $delay={1.5}>🌴</Tree>
      </TreesContainer>

      <TreesContainer $side="right">
        <Tree $size={4.5} $duration={5.5} $delay={0.5}>🌲</Tree>
        <Tree $size={5} $duration={6.5} $delay={0}>🌳</Tree>
        <Tree $size={4} $duration={5} $delay={1}>🌳</Tree>
        <Tree $size={5} $duration={6} $delay={0.8}>🌲</Tree>
      </TreesContainer>

      <StreetScene>
        {/* Street Sign Header */}
        <StreetHeader>
          <StreetSign>
            <h1>🌳 השדרה 🌳</h1>
            <p>ברוכים הבאים למדורי המגזין</p>
          </StreetSign>
        </StreetHeader>

        <StreetWrapper>
          {/* The Street with shops */}
          <StreetRoad>
            {/* Street Lamps */}
            <StreetLamp $side="left" $top={50}>
              <LampHead />
              <LampPost />
            </StreetLamp>
            <StreetLamp $side="right" $top={300}>
              <LampHead />
              <LampPost />
            </StreetLamp>

            {/* Shops Grid */}
            <ShopsRow>
              {SHOPS.map((shop, index) => {
                const Icon = shop.icon;
                return (
                  <Shop
                    key={shop.id}
                    $gradient={shop.gradient}
                    $bgColor={shop.bgColor}
                    $delay={index * 100}
                    onClick={() => handleShopClick(shop)}
                  >
                    <ShopBadge $color={shop.color}>
                      {shop.emoji} {shop.badge}
                    </ShopBadge>

                    <ShopAwning $gradient={shop.gradient}>
                      <ShopIcon $color={shop.color}>
                        <Icon size={32} />
                      </ShopIcon>
                    </ShopAwning>

                    <ShopContent>
                      <ShopName>{shop.title}</ShopName>
                      <ShopDescription>{shop.description}</ShopDescription>
                      <ShopButton $gradient={shop.gradient} $color={shop.color}>
                        <Sparkles size={16} />
                        כניסה לחנות
                        <ArrowLeft size={16} />
                      </ShopButton>
                    </ShopContent>
                  </Shop>
                );
              })}
            </ShopsRow>

            {/* Decorative elements */}
            <Bench $side="left">🪑</Bench>
            <Bench $side="right">🪑</Bench>
            <FlowerPot $left={30} $delay={0}>🌷</FlowerPot>
            <FlowerPot $left={50} $delay={0.5}>🌻</FlowerPot>
            <FlowerPot $left={70} $delay={1}>🌺</FlowerPot>
          </StreetRoad>
        </StreetWrapper>

        {/* Street End */}
        <StreetEnd>
          <FooterDecor>
            <span>🌸</span>
            <span>🌳</span>
            <span>🦋</span>
            <span>🌳</span>
            <span>🌸</span>
          </FooterDecor>
          <FooterText>תודה שביקרת בשדרה שלנו! 💚</FooterText>
        </StreetEnd>
      </StreetScene>
    </PageContainer>
  );
}
