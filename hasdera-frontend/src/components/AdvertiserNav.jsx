/**
 * AdvertiserNav.jsx
 * דף בית מפרסמים עם עיצוב פרלקס ותמונות בצדדים
 */

import { useEffect, useState, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import hasederaTheme from '../styles/HasederaTheme';

// 🎨 גופנים גלובליים - נטען דרך index.html
const GlobalFonts = createGlobalStyle`
  /* Fonts are loaded via <link> tag in index.html */
`;

// 🎨 Scrollbar מותאם
const CustomScrollbar = createGlobalStyle`
  ::-webkit-scrollbar {
    width: 10px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(26, 26, 26, 0.5);
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #10b981 0%, #059669 100%);
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #059669 0%, #047857 100%);
  }
`;

// 🎨 תמונת רקע אחת רציפה שמכסה את שני הצדדים
const BackgroundImage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  background-image: url("/image/ChatGPT Image Nov 16, 2025, 08_56_06 PM.png");
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  z-index: 0;
  
  /* שימוש ב-image-rendering כדי לשמור על איכות */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: high-quality;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to right,
      rgba(26,26,26,0.8) 0%,
      rgba(26,26,26,0.5) 25%,
      rgba(26,26,26,0.2) 50%,
      rgba(26,26,26,0.5) 75%,
      rgba(26,26,26,0.8) 100%
    );
  }

  @media (max-width: 968px) {
    display: none;
  }
`;

// 🎨 תמונות פרלקס בצדדים - משמשות רק לגרדיאנט
const SideImage = styled.div`
  position: fixed;
  top: 0;
  width: 25vw;
  height: 100vh;
  z-index: 1;
  ${props => props.$side === 'left' ? 'left: 0;' : 'right: 0;'}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$side === 'left' 
      ? 'linear-gradient(90deg, rgba(26,26,26,0.9) 0%, rgba(26,26,26,0.6) 50%, transparent 100%)'
      : 'linear-gradient(270deg, rgba(26,26,26,0.9) 0%, rgba(26,26,26,0.6) 50%, transparent 100%)'};
  }

  @media (max-width: 968px) {
    display: none;
  }
`;

// 🎨 Wrapper ראשי
const MainWrapper = styled.div`
  position: relative;
  margin: 0 auto;
  max-width: 50vw;
  z-index: 2;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  min-height: 100vh;

  @media (max-width: 968px) {
    max-width: 100vw;
  }
`;

// 🎨 Navbar קבוע
const Navbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1.5rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  opacity: ${props => props.$visible ? 1 : 0};
  transform: translateY(${props => props.$visible ? '0' : '-100%'});
  transition: all 0.3s ease;

  @media (max-width: 968px) {
    padding: 1rem 1.5rem;
  }
`;

const LogoNav = styled.div`
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  font-weight: 400;
  letter-spacing: 3px;
  color: #1a1a1a;

  @media (max-width: 968px) {
    font-size: 1.5rem;
  }
`;

const NavLinks = styled.ul`
  display: flex;
  gap: 3rem;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 968px) {
    display: none;
  }
`;

const NavLink = styled.a`
  font-size: 0.95rem;
  color: #666;
  text-decoration: none;
  letter-spacing: 1px;
  transition: color 0.3s;
  position: relative;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    right: 0;
    width: 0;
    height: 1px;
    background: #10b981;
    transition: width 0.3s;
  }

  &:hover {
    color: #10b981;
  }

  &:hover::after {
    width: 100%;
  }
`;

// 🎨 Hero Section
const HeroSection = styled.section`
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 1 !important;
  transform: none !important;
`;

const HeroContent = styled.div`
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  z-index: 2;
`;

const LogoHero = styled.h1`
  font-family: 'Cormorant Garamond', serif;
  font-size: 6rem;
  font-weight: 300;
  letter-spacing: 8px;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  margin: 0;

  @media (max-width: 968px) {
    font-size: 3rem;
    letter-spacing: 4px;
  }
`;

const WelcomeMessage = styled.div`
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  font-weight: 400;
  letter-spacing: 2px;
  margin-bottom: 2rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  color: white;
  animation: fadeInUp 0.8s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  span {
    color: #10b981;
    font-weight: 500;
  }

  @media (max-width: 968px) {
    font-size: 1.5rem;
    letter-spacing: 1px;
  }
`;

const Tagline = styled.p`
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 3px;
  margin-bottom: 3rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  margin: 0 0 3rem 0;
  min-height: 2rem;

  @media (max-width: 968px) {
    font-size: 1rem;
    letter-spacing: 2px;
  }
`;

const RotatingWords = styled.span`
  display: inline-block;
  position: relative;
  min-width: 150px;
  height: 1.5em;
  vertical-align: bottom;
  text-align: center;
`;

const RotatingWord = styled.span`
  position: absolute;
  right: 0;
  left: 0;
  opacity: 0;
  color: #10b981;
  font-weight: 600;
  animation: fadeWords 16s infinite;
  animation-delay: ${props => props.$delay || '0s'};

  @keyframes fadeWords {
    0% {
      opacity: 0;
    }
    5% {
      opacity: 1;
    }
    20% {
      opacity: 1;
    }
    25% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 0.9rem;
  letter-spacing: 2px;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-10px);
    }
    60% {
      transform: translateX(-50%) translateY(-5px);
    }
  }
`;

// 🎨 Sections
const Section = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 6rem 0;
  background: transparent;
  opacity: ${props => props.$isHero ? 1 : (props.$visible ? 1 : 0)};
  transform: ${props => props.$isHero ? 'none' : (props.$visible ? 'translateY(0) scale(1)' : 'translateY(100px) scale(0.95)')};
  transition: ${props => props.$isHero ? 'none' : 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1), transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'};

  &:nth-child(even) {
    background: rgba(250, 250, 250, 0.5);
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 3rem;
  width: 100%;

  @media (max-width: 968px) {
    padding: 0 1.5rem;
  }
`;

const SectionLabel = styled.div`
  font-size: 0.85rem;
  color: #10b981;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 1rem;
  font-weight: 600;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'translateX(0)' : 'translateX(-50px)'};
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: ${props => props.$visible ? '0.2s' : '0s'};
`;

const SectionTitle = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: 3.5rem;
  font-weight: 300;
  color: #1a1a1a;
  margin-bottom: 2rem;
  letter-spacing: 2px;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(30px)'};
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: ${props => props.$visible ? '0.3s' : '0s'};
  margin: 0 0 2rem 0;

  @media (max-width: 968px) {
    font-size: 2.5rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  line-height: 1.8;
  max-width: 700px;
  margin-bottom: 3rem;
  font-weight: 300;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(20px)'};
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: ${props => props.$visible ? '0.4s' : '0s'};
  margin: 0 0 3rem 0;
`;

// 🎨 Dashboard Preview Cards
const DashboardPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 4rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 3rem 2rem;
  border: 1px solid rgba(229, 229, 229, 0.5);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'translateY(0) rotateX(0deg)' : 'translateY(60px) rotateX(10deg)'};
  transition-delay: ${props => props.$delay || '0s'};
  margin: ${props => props.$margin || '0'};
  grid-column: ${props => props.$fullWidth ? '1 / -1' : 'auto'};
  text-align: ${props => props.$center ? 'center' : 'right'};

  &:hover {
    transform: ${props => props.$clickable ? 'translateY(-5px)' : 'none'};
    box-shadow: ${props => props.$clickable ? '0 20px 40px rgba(0, 0, 0, 0.1)' : 'none'};
    border-color: ${props => props.$clickable ? '#10b981' : 'rgba(229, 229, 229, 0.5)'};
  }
`;

const CardNumber = styled.div`
  font-family: 'Cormorant Garamond', serif;
  font-size: 4rem;
  font-weight: 300;
  color: #10b981;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
  letter-spacing: 0.5px;
  margin: 0 0 1rem 0;
`;

const CardDesc = styled.p`
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
  margin: 0;
`;

// 🎨 Analytics Grid
const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  margin-top: 4rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ChartPlaceholder = styled.div`
  background: linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(220, 252, 231, 0.9) 100%);
  backdrop-filter: blur(10px);
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #047857;
  font-size: 1.1rem;
  border: 1px solid rgba(209, 250, 229, 0.5);
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'scale(1)' : 'scale(0.95)'};
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: ${props => props.$delay || '0s'};
`;

const StatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StatItem = styled.div`
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-right: 3px solid #10b981;
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'translateX(0) scale(1)' : 'translateX(-60px) scale(0.9)'};
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: ${props => props.$delay || '0s'};
`;

const StatValue = styled.div`
  font-family: 'Cormorant Garamond', serif;
  font-size: 3rem;
  font-weight: 300;
  color: #10b981;
  margin-bottom: 0.5rem;
  display: inline-block;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  letter-spacing: 1px;
`;

// 🎨 CTA Section
const CtaSection = styled.section`
  background: #1a1a1a;
  color: white;
  text-align: center;
  padding: 8rem 3rem;
`;

const CtaTitle = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: 3rem;
  font-weight: 300;
  margin-bottom: 2rem;
  letter-spacing: 2px;
  margin: 0 0 2rem 0;

  @media (max-width: 968px) {
    font-size: 2rem;
  }
`;

const CtaButton = styled.button`
  display: inline-block;
  padding: 1.2rem 3rem;
  background: #10b981;
  color: white;
  text-decoration: none;
  font-size: 1rem;
  letter-spacing: 2px;
  transition: all 0.3s;
  border: 2px solid #10b981;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: transparent;
    color: #10b981;
  }
`;

export default function AdvertiserNav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [navbarVisible, setNavbarVisible] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [countedElements, setCountedElements] = useState(new Set());
  const sectionRefs = useRef({});

  // קבלת שם המשתמש
  const userName = user?.fullName || user?.email?.split('@')[0] || 'משתמש';

  // Smooth scroll handler
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      const targetPosition = target.offsetTop - 80;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1200;
      let start = null;

      const easeInOutCubic = (t) => {
        return t < 0.5 
          ? 4 * t * t * t 
          : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      };

      function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);
        
        window.scrollTo(0, startPosition + distance * ease);
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      }
      
      requestAnimationFrame(animation);
    }
  };

  // Navbar visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      setNavbarVisible(scrolled > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Count Up Animation
  const animateCountUp = (element, target) => {
    const duration = 4500;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target.toLocaleString('he-IL') + (target > 999 ? '+' : '');
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current).toLocaleString('he-IL');
      }
    }, 16);
  };

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({
            ...prev,
            [entry.target.id]: true
          }));

          // Animate count up for stat values
          setTimeout(() => {
            const countElements = entry.target.querySelectorAll('[data-count]');
            countElements.forEach(element => {
              const elementId = element.getAttribute('data-count-id');
              if (!countedElements.has(elementId)) {
                const target = parseInt(element.getAttribute('data-count'));
                setCountedElements(prev => new Set([...prev, elementId]));
                animateCountUp(element, target);
              }
            });
          }, 300);
        } else {
          // Reset when leaving view
          setVisibleSections(prev => ({
            ...prev,
            [entry.target.id]: false
          }));
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, [countedElements]);

  return (
    <>
      <GlobalFonts />
      <CustomScrollbar />
      
      <BackgroundImage />
      <SideImage $side="left" />
      <SideImage $side="right" />

      <MainWrapper>
        <Navbar $visible={navbarVisible}>
          <LogoNav><img src="/logo.png" alt="השדרה" style={{ height: '35px', width: 'auto', backgroundColor: 'white', padding: '4px 8px', borderRadius: '8px' }} /></LogoNav>
          <NavLinks>
            <li>
              <NavLink onClick={(e) => handleSmoothScroll(e, 'overview')}>המדורים</NavLink>
            </li>
            <li>
              <NavLink onClick={(e) => handleSmoothScroll(e, 'analytics')}>אודות</NavLink>
            </li>
            <li>
              <NavLink onClick={(e) => handleSmoothScroll(e, 'ads')}>למפרסמים</NavLink>
            </li>
            <li>
              <NavLink onClick={(e) => handleSmoothScroll(e, 'placement')}>איך זה עובד</NavLink>
            </li>
          </NavLinks>
        </Navbar>

        <HeroSection $isHero>
          <HeroContent>
            <WelcomeMessage>
              שלום <span>{userName}</span> 👋
            </WelcomeMessage>
            <LogoHero><img src="/logo.png" alt="השדרה" style={{ height: '120px', width: 'auto', backgroundColor: 'white', padding: '10px 16px', borderRadius: '16px' }} /></LogoHero>
            <Tagline>
              מגזין{' '}
              <RotatingWords>
                <RotatingWord $delay="0s">למשפחה</RotatingWord>
                <RotatingWord $delay="4s">לבריאות</RotatingWord>
                <RotatingWord $delay="8s">לטעם</RotatingWord>
                <RotatingWord $delay="12s">לחיים</RotatingWord>
              </RotatingWords>
            </Tagline>
          </HeroContent>
          <ScrollIndicator>גלול למטה ↓</ScrollIndicator>
        </HeroSection>

        <Section 
          id="overview" 
          data-section 
          $visible={visibleSections.overview}
        >
          <Container>
            <SectionLabel $visible={visibleSections.overview}>מדורי המגזין</SectionLabel>
            <SectionTitle $visible={visibleSections.overview}>כל שבוע, עולם שלם</SectionTitle>
            <SectionSubtitle $visible={visibleSections.overview}>
              מגזין השדרה מביא לך את כל מה שחשוב - ממשפחה ועד עסקים, מטעמים ועד בריאות
            </SectionSubtitle>
            
            <DashboardPreview>
              <PreviewCard 
                $visible={visibleSections.overview}
                $delay="0.3s"
              >
                <CardNumber>משפחה</CardNumber>
                <CardTitle>משפחה בשדרה</CardTitle>
                <CardDesc>טיפים מעשיים לחינוך, יחסים ושגרת הבית. כתבות שנוגעות בלב ומחזקות את הקשר המשפחתי.</CardDesc>
              </PreviewCard>
              <PreviewCard 
                $visible={visibleSections.overview}
                $delay="0.5s"
              >
                <CardNumber>בריאות</CardNumber>
                <CardTitle>בריאות בשדרה</CardTitle>
                <CardDesc>מידע אמין על בריאות הגוף והנפש. מומחים מובילים משתפים בעצות לאורח חיים בריא ומאוזן.</CardDesc>
              </PreviewCard>
              <PreviewCard 
                $visible={visibleSections.overview}
                $delay="0.7s"
              >
                <CardNumber>טעימות</CardNumber>
                <CardTitle>טעימות בשדרה</CardTitle>
                <CardDesc>מתכונים מנצחים, טיפים למטבח וסיפורים של טעם. כל מה שצריך להכין ארוחות מושלמות.</CardDesc>
              </PreviewCard>
            </DashboardPreview>
          </Container>
        </Section>

        <Section 
          id="analytics" 
          data-section 
          $visible={visibleSections.analytics}
        >
          <Container>
            <SectionLabel $visible={visibleSections.analytics}>עוד מדורים</SectionLabel>
            <SectionTitle $visible={visibleSections.analytics}>תוכן שמעשיר</SectionTitle>
            <SectionSubtitle $visible={visibleSections.analytics}>
              מסחר, חינוך ופנאי - כל מה שצריך לחיים טובים יותר
            </SectionSubtitle>
            
            <AnalyticsGrid>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <PreviewCard 
                  $visible={visibleSections.analytics}
                  $delay="0.3s"
                  $margin="0"
                >
                  <CardNumber>מסחר</CardNumber>
                  <CardTitle>מסחר בשדרה</CardTitle>
                  <CardDesc>עדכונים על עסקים מקומיים, מבצעים בלעדיים והטבות למנויות המגזין. כל מה שצריך לקניה חכמה.</CardDesc>
                </PreviewCard>
                <PreviewCard 
                  $visible={visibleSections.analytics}
                  $delay="0.5s"
                  $margin="0"
                >
                  <CardNumber>חינוך</CardNumber>
                  <CardTitle>חינוך בשדרה</CardTitle>
                  <CardDesc>קורסים, סדנאות והרצאות שמרחיבות אופקים. כלים להתפתחות אישית ומקצועית לכל המשפחה.</CardDesc>
                </PreviewCard>
              </div>
              <StatsList>
                <StatItem 
                  $visible={visibleSections.analytics}
                  $delay="0.3s"
                >
                  <StatValue data-count="5000" data-count-id="count-1">0</StatValue>
                  <StatLabel>קוראות קבועות</StatLabel>
                </StatItem>
                <StatItem 
                  $visible={visibleSections.analytics}
                  $delay="0.5s"
                >
                  <StatValue data-count="52" data-count-id="count-2">0</StatValue>
                  <StatLabel>גליונות בשנה</StatLabel>
                </StatItem>
                <StatItem 
                  $visible={visibleSections.analytics}
                  $delay="0.7s"
                >
                  <StatValue data-count="100" data-count-id="count-3">0</StatValue>
                  <StatLabel>מפרסמות מרוצות</StatLabel>
                </StatItem>
              </StatsList>
            </AnalyticsGrid>
          </Container>
        </Section>

        <Section 
          id="ads" 
          data-section 
          $visible={visibleSections.ads}
        >
          <Container>
            <SectionLabel $visible={visibleSections.ads}>למפרסמים</SectionLabel>
            <SectionTitle $visible={visibleSections.ads}>הצטרפי למשפחת השדרה</SectionTitle>
            <SectionSubtitle $visible={visibleSections.ads}>
              פרסמי את העסק שלך במגזין המוביל לנשים חרדיות. הגיעי ל-5,000 קוראות קבועות בכל שבוע.
            </SectionSubtitle>
            
            <DashboardPreview>
              <PreviewCard 
                $visible={visibleSections.ads}
                $delay="0.3s"
              >
                <CardNumber>•</CardNumber>
                <CardTitle>קהל ממוקד</CardTitle>
                <CardDesc>נשים חרדיות איכותיות שקוראות כל שבוע ומחפשות מוצרים ושירותים מתאימים</CardDesc>
              </PreviewCard>
              <PreviewCard 
                $visible={visibleSections.ads}
                $delay="0.5s"
              >
                <CardNumber>•</CardNumber>
                <CardTitle>חשיפה מקסימלית</CardTitle>
                <CardDesc>המגזין מופץ במייל ישירות למנויות - שיעור קריאה גבוה ומעורבות אמיתית</CardDesc>
              </PreviewCard>
              <PreviewCard 
                $visible={visibleSections.ads}
                $delay="0.7s"
              >
                <CardNumber>•</CardNumber>
                <CardTitle>תמורה אמיתית</CardTitle>
                <CardDesc>מחירים הוגנים, מעקב אחר ביצועים ושירות אישי לכל מפרסם</CardDesc>
              </PreviewCard>
            </DashboardPreview>
          </Container>
        </Section>

        <Section 
          id="placement" 
          data-section 
          $visible={visibleSections.placement}
        >
          <Container>
            <SectionLabel $visible={visibleSections.placement}>איך זה עובד</SectionLabel>
            <SectionTitle $visible={visibleSections.placement}>ארבעה שלבים פשוטים</SectionTitle>
            <SectionSubtitle $visible={visibleSections.placement}>
              מהעיצוב ועד לפרסום - התהליך שלנו קל, מהיר ומקצועי
            </SectionSubtitle>
            
            <DashboardPreview>
              <PreviewCard 
                $visible={visibleSections.placement}
                $delay="0.3s"
              >
                <CardNumber>1</CardNumber>
                <CardTitle>בחרי מדור</CardTitle>
                <CardDesc>משפחה, בריאות, טעימות, מסחר או חינוך - בחרי את המדור המתאים לעסק שלך</CardDesc>
              </PreviewCard>
              <PreviewCard 
                $visible={visibleSections.placement}
                $delay="0.5s"
              >
                <CardNumber>2</CardNumber>
                <CardTitle>העלי עיצוב</CardTitle>
                <CardDesc>יש לך עיצוב מוכן? מעולה! צריכה עזרה? אנחנו כאן</CardDesc>
              </PreviewCard>
              <PreviewCard 
                $visible={visibleSections.placement}
                $delay="0.7s"
                $clickable
                onClick={() => navigate('/advertiser/placement')}
              >
                <CardNumber>3</CardNumber>
                <CardTitle>בחרי מיקום</CardTitle>
                <CardDesc>ראי תצוגה מקדימה של הגיליון ובחרי את המיקום הכי טוב</CardDesc>
              </PreviewCard>
            </DashboardPreview>
            
            <DashboardPreview style={{ marginTop: '2rem' }}>
              <PreviewCard 
                $visible={visibleSections.placement}
                $delay="0.9s"
                $fullWidth
                $center
              >
                <CardNumber>4</CardNumber>
                <CardTitle>פרסמי!</CardTitle>
                <CardDesc>תשלום מהיר ובטוח, והמודעה שלך תופיע בגיליון הבא. פשוט ככה.</CardDesc>
              </PreviewCard>
            </DashboardPreview>
          </Container>
        </Section>

        <CtaSection>
          <CtaTitle>מוכנה לפרסם בשדרה?</CtaTitle>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            הצטרפי ל-100+ מפרסמות מרוצות שבחרו בשדרה
          </p>
          <CtaButton onClick={() => navigate('/Navbar')}>
            התחילי עכשיו
          </CtaButton>
        </CtaSection>
      </MainWrapper>
    </>
  );
}
