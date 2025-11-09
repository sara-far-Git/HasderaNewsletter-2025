import React from "react";
import styled from "styled-components";
import { Users, Book, MapPin, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 🎨 Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #f9fafb, white);
  display: flex; // הוספנו כדי לאפשר מרכוז אנכי בעתיד אם נרצה
  flex-direction: column;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const HeaderContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const IconBox = styled.div`
  padding: 0.625rem;
  background: #f0fdfa;
  border-radius: 0.75rem;
  
  svg {
    color: #0f766e;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

// === תיקון 1: מיכל הכרטיסיות ===
// הוספנו בחזרה max-width ו-margin כדי למרכז את כל הבלוק
// בדיוק כמו ה-HeaderContent
const GridContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto; // <--- ממורכז את הבלוק אופקית
  padding: 2.5rem 2rem;
  width: 100%; // מוודא שהוא תופס רוחב מלא *עד* המקסימום
`;

// === תיקון 2: רשת הכרטיסיות ===
// שולטים בגודל הכרטיסיות וממרכזים אותן
const Grid = styled.div`
  display: grid;
  gap: 1.75rem;
  justify-content: center; // <--- ממורכז את הכרטיסיות בתוך ה-GridContainer

  /* הגדרת ברירת מחדל (מובייל) */
  grid-template-columns: minmax(0, 380px); // עמודה אחת, מקסימום 380px
  
  /* טאבלט - 2 עמודות */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 320px));
  }
  
  /* מחשב - 3 עמודות */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 350px)); 
    gap: 2rem;
  }
`;

// כרטיס הניווט, מבוסס על רכיב ה-Card שלך
const NavCard = styled.button`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  text-align: right;
  padding: 0;
  width: 100%; // הכרטיס ימלא את התא שלו ברשת
  
  &:hover {
    border-color: #14b8a6;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    transform: translateY(-0.5rem);
  }
`;

// מיכל האייקון, מחליף את התמונה
const CardIconContainer = styled.div`
  aspect-ratio: 16/9; // יחס רחב
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  color: #14b8a6;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  text-align: center;
`;

const CardTitle = styled.h3`
  font-weight: 700;
  color: #111827;
  font-size: 1.125rem;
  margin: 0;
  transition: color 0.2s;
  
  ${NavCard}:hover & {
    color: #0f766e;
  }
`;

// 🔹 רכיב הניווט הראשי
export default function AdvertiserNav() {
  const navigate = useNavigate();

  const goToIssues = () => navigate('/issues');
  const goToPlacement = () => navigate('/advertiser/placement');
  const goToPayment = () => navigate('/advertiser/payment');

  return (
    <Container>
      <Header>
        <HeaderContent>
          <HeaderTitle>
            <IconBox>
              <Users size={24} />
            </IconBox>
            <Title>אזור מפרסמים</Title>
          </HeaderTitle>
        </HeaderContent>
      </Header>
      
      <GridContainer>
        <Grid>
          {/* כרטיס 1: כל הגליונות */}
          <NavCard onClick={goToIssues}>
            <CardIconContainer>
              <Book size={48} strokeWidth={1.5} />
            </CardIconContainer>
            <CardContent>
              <CardTitle>כל הגליונות</CardTitle>
            </CardContent>
          </NavCard>

          {/* כרטיס 2: בחירת מקום */}
          <NavCard onClick={goToPlacement}>
            <CardIconContainer>
              <MapPin size={48} strokeWidth={1.5} />
            </CardIconContainer>
            <CardContent>
              <CardTitle>בחירת מקום בעיתון</CardTitle>
            </CardContent>
          </NavCard>

          {/* כרטיס 3: תשלום */}
          <NavCard onClick={goToPayment}>
            <CardIconContainer>
              <CreditCard size={48} strokeWidth={1.5} />
            </CardIconContainer>
            <CardContent>
              <CardTitle>מעבר לתשלום</CardTitle>
            </CardContent>
          </NavCard>
        </Grid>
      </GridContainer>
    </Container>
  );
}