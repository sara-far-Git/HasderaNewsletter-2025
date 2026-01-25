/**
 * ReaderFooter.jsx
 * פוטר יפה לאזור הקוראים
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { 
  Newspaper, Mail, Phone, MapPin, Facebook, Instagram, 
  Twitter, Heart, ExternalLink, ChevronLeft 
} from "lucide-react";

/* ======================== Styled Components ======================== */
const FooterWrapper = styled.footer`
  margin-top: 4rem;
  margin-left: -1.5rem;
  margin-right: -1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%);
`;

const FooterContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2.5rem;
  margin-bottom: 2.5rem;
`;

const FooterSection = styled.div``;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const LogoIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
`;

const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
`;

const FooterDescription = styled.p`
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
    transform: translateY(-2px);
  }
`;

const SectionTitle = styled.h4`
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 4px;
    height: 18px;
    background: linear-gradient(180deg, #10b981, #059669);
    border-radius: 2px;
  }
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FooterLink = styled.li`
  a, button {
    color: #94a3b8;
    text-decoration: none;
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.2s;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: inherit;

    &:hover {
      color: #10b981;
      transform: translateX(-4px);
    }

    svg {
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover svg {
      opacity: 1;
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #94a3b8;
  font-size: 0.95rem;

  svg {
    color: #10b981;
    flex-shrink: 0;
  }
`;

const FooterBottom = styled.div`
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Copyright = styled.div`
  color: #64748b;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const MadeWith = styled.div`
  color: #64748b;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  svg {
    color: #ef4444;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

/* ======================== Component ======================== */
export default function ReaderFooter() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <FooterWrapper>
      <FooterContent>
        <FooterGrid>
          {/* About Section */}
          <FooterSection>
            <FooterLogo>
              <img src="/logo.png" alt="השדרה" style={{ height: '50px', width: 'auto' }} />
            </FooterLogo>
            <FooterDescription>
              מגזין קהילתי דיגיטלי המחבר בין תושבי השכונה. 
              כתבות, מתכונים, טיפים ועוד - הכל במקום אחד.
            </FooterDescription>
            <SocialLinks>
              <SocialLink href="#" title="פייסבוק">
                <Facebook size={18} />
              </SocialLink>
              <SocialLink href="#" title="אינסטגרם">
                <Instagram size={18} />
              </SocialLink>
              <SocialLink href="#" title="טוויטר">
                <Twitter size={18} />
              </SocialLink>
            </SocialLinks>
          </FooterSection>

          {/* Quick Links */}
          <FooterSection>
            <SectionTitle>קישורים מהירים</SectionTitle>
            <FooterLinks>
              <FooterLink>
                <button onClick={() => navigate("/")}>
                  <ChevronLeft size={14} />
                  דף הבית
                </button>
              </FooterLink>
              <FooterLink>
                <button onClick={() => navigate("/issues")}>
                  <ChevronLeft size={14} />
                  ארכיון גיליונות
                </button>
              </FooterLink>
              <FooterLink>
                <button onClick={() => navigate("/me")}>
                  <ChevronLeft size={14} />
                  אזור אישי
                </button>
              </FooterLink>
            </FooterLinks>
          </FooterSection>

          {/* Sections */}
          <FooterSection>
            <SectionTitle>מדורים</SectionTitle>
            <FooterLinks>
              <FooterLink>
                <button onClick={() => navigate("/sections/recipes")}>
                  <ChevronLeft size={14} />
                  מתכונים
                </button>
              </FooterLink>
              <FooterLink>
                <button onClick={() => navigate("/sections/health")}>
                  <ChevronLeft size={14} />
                  בריאות
                </button>
              </FooterLink>
              <FooterLink>
                <button onClick={() => navigate("/sections/community")}>
                  <ChevronLeft size={14} />
                  קהילה
                </button>
              </FooterLink>
              <FooterLink>
                <button onClick={() => navigate("/sections/culture")}>
                  <ChevronLeft size={14} />
                  תרבות
                </button>
              </FooterLink>
            </FooterLinks>
          </FooterSection>

          {/* Contact */}
          <FooterSection>
            <SectionTitle>יצירת קשר</SectionTitle>
            <ContactInfo>
              <ContactItem>
                <Mail size={16} />
                hasdera@magazine.co.il
              </ContactItem>
              <ContactItem>
                <Phone size={16} />
                054-1234567
              </ContactItem>
              <ContactItem>
                <MapPin size={16} />
                השדרה, ישראל
              </ContactItem>
            </ContactInfo>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <Copyright>
            © {currentYear} מגזין השדרה. כל הזכויות שמורות.
          </Copyright>
          <MadeWith>
            נבנה עם <Heart size={14} /> בישראל
          </MadeWith>
        </FooterBottom>
      </FooterContent>
    </FooterWrapper>
  );
}

