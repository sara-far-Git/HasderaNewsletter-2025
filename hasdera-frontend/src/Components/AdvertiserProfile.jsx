/**
 * AdvertiserProfile.jsx
 * אזור אישי למפרסמים - הצגת פרטי החשבון והעסק
 */

import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { 
  User, 
  Mail, 
  Building2, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getAdvertiserDashboard } from "../Services/Login";
import { api } from "../Services/api";
import hasederaTheme from "../styles/HasederaTheme";

// 🎬 אנימציות
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// 🎨 Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: ${hasederaTheme.colors.background.dark};
  padding: ${hasederaTheme.spacing.xl};
  direction: rtl;
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const Title = styled.h1`
  font-family: 'Cormorant Garamond', serif;
  font-size: 2.5rem;
  font-weight: 600;
  color: ${hasederaTheme.colors.text.white};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${hasederaTheme.colors.text.secondary};
  margin: 0;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  animation: ${slideIn} 0.6s ease-out;
  animation-delay: ${props => props.$delay || 0}s;
  animation-fill-mode: both;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${hasederaTheme.colors.text.white};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: ${hasederaTheme.colors.gradient.primary};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const EditButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: ${hasederaTheme.colors.text.white};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: ${hasederaTheme.colors.primary.main};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${hasederaTheme.colors.primary.main};
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 0.85rem;
  color: ${hasederaTheme.colors.text.secondary};
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: ${hasederaTheme.colors.text.white};
  word-break: break-word;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: ${hasederaTheme.colors.text.white};
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${hasederaTheme.colors.primary.main};
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: ${hasederaTheme.colors.text.secondary};
  }
`;

const PasswordInput = styled.div`
  position: relative;
  width: 100%;
  
  input {
    padding-right: 3rem;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${hasederaTheme.colors.text.secondary};
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${hasederaTheme.colors.text.white};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${hasederaTheme.colors.gradient.primary};
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const CancelButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  margin-right: 0.75rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 10px;
  color: ${hasederaTheme.colors.primary.main};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ErrorMessage = styled(SuccessMessage)`
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: ${hasederaTheme.colors.text.secondary};
`;

// 🔹 Main Component
export default function AdvertiserProfile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({
    personal: false,
    business: false,
    password: false
  });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // טעינת נתוני הפרופיל
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getAdvertiserDashboard();
        
        setProfileData(data);
        setFormData({
          fullName: data.Business?.contactName || user?.fullName || '',
          email: user?.email || '',
          phone: data.Business?.phone || '',
          businessName: data.Business?.businessName || '',
          businessType: data.Business?.businessType || '',
          address: data.Business?.address || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('שגיאה בטעינת פרופיל:', error);
        setMessage({ type: 'error', text: 'שגיאה בטעינת הפרופיל' });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleEdit = (section) => {
    setEditing(prev => ({ ...prev, [section]: true }));
    setMessage({ type: '', text: '' });
  };

  const handleCancel = (section) => {
    setEditing(prev => ({ ...prev, [section]: false }));
    // שחזור נתונים מקוריים
    if (profileData) {
      setFormData(prev => ({
        ...prev,
        fullName: profileData.Business?.contactName || user?.fullName || prev.fullName,
        email: user?.email || prev.email,
        phone: profileData.Business?.phone || prev.phone,
        businessName: profileData.Business?.businessName || prev.businessName,
        businessType: profileData.Business?.businessType || prev.businessType,
        address: profileData.Business?.address || prev.address
      }));
    }
    setMessage({ type: '', text: '' });
  };

  const handleSave = async (section) => {
    try {
      setMessage({ type: '', text: '' });
      
      if (section === 'password') {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
          setMessage({ type: 'error', text: 'יש למלא את כל השדות' });
          return;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'הסיסמאות לא תואמות' });
          return;
        }
        
        if (formData.newPassword.length < 6) {
          setMessage({ type: 'error', text: 'הסיסמה חייבת להכיל לפחות 6 תווים' });
          return;
        }
        
        // כאן תהיה קריאה ל-API לשינוי סיסמה
        // await api.post('/User/change-password', { ... });
        setMessage({ type: 'success', text: 'הסיסמה עודכנה בהצלחה' });
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        setEditing(prev => ({ ...prev, password: false }));
        return;
      }
      
      // עדכון פרטים אישיים או עסקיים
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        businessName: formData.businessName,
        businessType: formData.businessType,
        address: formData.address
      };
      
      // כאן תהיה קריאה ל-API לעדכון
      // await api.put('/User/profile', updateData);
      
      setMessage({ type: 'success', text: 'הפרטים עודכנו בהצלחה' });
      setEditing(prev => ({ ...prev, [section]: false }));
      
      // רענון נתונים
      const data = await getAdvertiserDashboard();
      setProfileData(data);
      
    } catch (error) {
      console.error('שגיאה בעדכון:', error);
      setMessage({ type: 'error', text: 'שגיאה בעדכון הפרטים' });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>טוען נתונים...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>אזור אישי</Title>
        <Subtitle>נהל את פרטי החשבון והעסק שלך</Subtitle>
      </Header>

      <Content>
        {/* פרטים אישיים */}
        <Card $delay={0.1}>
          <CardHeader>
            <CardTitle>
              <IconWrapper>
                <User />
              </IconWrapper>
              פרטים אישיים
            </CardTitle>
            {!editing.personal && (
              <EditButton onClick={() => handleEdit('personal')}>
                <Edit size={16} />
                ערוך
              </EditButton>
            )}
          </CardHeader>

          <InfoGrid>
            <InfoItem>
              <InfoIcon>
                <User />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>שם מלא</InfoLabel>
                {editing.personal ? (
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="הכנס שם מלא"
                  />
                ) : (
                  <InfoValue>{formData.fullName || 'לא הוגדר'}</InfoValue>
                )}
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <Mail />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>אימייל</InfoLabel>
                <InfoValue>{formData.email || 'לא הוגדר'}</InfoValue>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <Phone />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>טלפון</InfoLabel>
                {editing.personal ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="הכנס מספר טלפון"
                    type="tel"
                  />
                ) : (
                  <InfoValue>{formData.phone || 'לא הוגדר'}</InfoValue>
                )}
              </InfoContent>
            </InfoItem>
          </InfoGrid>

          {editing.personal && (
            <>
              <ButtonGroup>
                <Button onClick={() => handleSave('personal')}>
                  <Save size={18} />
                  שמור שינויים
                </Button>
                <CancelButton onClick={() => handleCancel('personal')}>
                  <X size={18} />
                  ביטול
                </CancelButton>
              </ButtonGroup>
              {message.text && (
                message.type === 'success' ? (
                  <SuccessMessage>
                    <CheckCircle />
                    {message.text}
                  </SuccessMessage>
                ) : (
                  <ErrorMessage>
                    <AlertCircle />
                    {message.text}
                  </ErrorMessage>
                )
              )}
            </>
          )}
        </Card>

        {/* פרטי העסק */}
        <Card $delay={0.2}>
          <CardHeader>
            <CardTitle>
              <IconWrapper>
                <Building2 />
              </IconWrapper>
              פרטי העסק
            </CardTitle>
            {!editing.business && (
              <EditButton onClick={() => handleEdit('business')}>
                <Edit size={16} />
                ערוך
              </EditButton>
            )}
          </CardHeader>

          <InfoGrid>
            <InfoItem>
              <InfoIcon>
                <Building2 />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>שם העסק</InfoLabel>
                {editing.business ? (
                  <Input
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="הכנס שם העסק"
                  />
                ) : (
                  <InfoValue>{formData.businessName || 'לא הוגדר'}</InfoValue>
                )}
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <Building2 />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>סוג עסק</InfoLabel>
                {editing.business ? (
                  <Input
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    placeholder="הכנס סוג עסק"
                  />
                ) : (
                  <InfoValue>{formData.businessType || 'לא הוגדר'}</InfoValue>
                )}
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <MapPin />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>כתובת</InfoLabel>
                {editing.business ? (
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="הכנס כתובת"
                  />
                ) : (
                  <InfoValue>{formData.address || 'לא הוגדר'}</InfoValue>
                )}
              </InfoContent>
            </InfoItem>
          </InfoGrid>

          {editing.business && (
            <>
              <ButtonGroup>
                <Button onClick={() => handleSave('business')}>
                  <Save size={18} />
                  שמור שינויים
                </Button>
                <CancelButton onClick={() => handleCancel('business')}>
                  <X size={18} />
                  ביטול
                </CancelButton>
              </ButtonGroup>
              {message.text && (
                message.type === 'success' ? (
                  <SuccessMessage>
                    <CheckCircle />
                    {message.text}
                  </SuccessMessage>
                ) : (
                  <ErrorMessage>
                    <AlertCircle />
                    {message.text}
                  </ErrorMessage>
                )
              )}
            </>
          )}
        </Card>

        {/* שינוי סיסמה */}
        <Card $delay={0.3}>
          <CardHeader>
            <CardTitle>
              <IconWrapper>
                <Eye />
              </IconWrapper>
              שינוי סיסמה
            </CardTitle>
            {!editing.password && (
              <EditButton onClick={() => handleEdit('password')}>
                <Edit size={16} />
                שנה סיסמה
              </EditButton>
            )}
          </CardHeader>

          {editing.password ? (
            <InfoGrid>
              <InfoItem>
                <InfoIcon>
                  <Eye />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>סיסמה נוכחית</InfoLabel>
                  <PasswordInput>
                    <Input
                      type={showPassword.current ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="הכנס סיסמה נוכחית"
                    />
                    <PasswordToggle onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}>
                      {showPassword.current ? <EyeOff /> : <Eye />}
                    </PasswordToggle>
                  </PasswordInput>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <InfoIcon>
                  <Eye />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>סיסמה חדשה</InfoLabel>
                  <PasswordInput>
                    <Input
                      type={showPassword.new ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="הכנס סיסמה חדשה"
                    />
                    <PasswordToggle onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}>
                      {showPassword.new ? <EyeOff /> : <Eye />}
                    </PasswordToggle>
                  </PasswordInput>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <InfoIcon>
                  <Eye />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>אישור סיסמה</InfoLabel>
                  <PasswordInput>
                    <Input
                      type={showPassword.confirm ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="הכנס שוב את הסיסמה החדשה"
                    />
                    <PasswordToggle onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}>
                      {showPassword.confirm ? <EyeOff /> : <Eye />}
                    </PasswordToggle>
                  </PasswordInput>
                </InfoContent>
              </InfoItem>
            </InfoGrid>
          ) : (
            <InfoGrid>
              <InfoItem>
                <InfoIcon>
                  <Eye />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>סיסמה</InfoLabel>
                  <InfoValue>••••••••</InfoValue>
                </InfoContent>
              </InfoItem>
            </InfoGrid>
          )}

          {editing.password && (
            <>
              <ButtonGroup>
                <Button onClick={() => handleSave('password')}>
                  <Save size={18} />
                  שמור סיסמה
                </Button>
                <CancelButton onClick={() => handleCancel('password')}>
                  <X size={18} />
                  ביטול
                </CancelButton>
              </ButtonGroup>
              {message.text && (
                message.type === 'success' ? (
                  <SuccessMessage>
                    <CheckCircle />
                    {message.text}
                  </SuccessMessage>
                ) : (
                  <ErrorMessage>
                    <AlertCircle />
                    {message.text}
                  </ErrorMessage>
                )
              )}
            </>
          )}
        </Card>

        {/* סטטיסטיקות */}
        {profileData && (
          <Card $delay={0.4}>
            <CardHeader>
              <CardTitle>
                <IconWrapper>
                  <Calendar />
                </IconWrapper>
                סטטיסטיקות
              </CardTitle>
            </CardHeader>

            <InfoGrid>
              <InfoItem>
                <InfoIcon>
                  <Building2 />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>מספר פרסומות פעילות</InfoLabel>
                  <InfoValue>{profileData.Ads?.length || 0}</InfoValue>
                </InfoContent>
              </InfoItem>

              <InfoItem>
                <InfoIcon>
                  <Calendar />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>תאריך הרשמה</InfoLabel>
                  <InfoValue>
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('he-IL')
                      : 'לא זמין'}
                  </InfoValue>
                </InfoContent>
              </InfoItem>
            </InfoGrid>
          </Card>
        )}
      </Content>
    </Container>
  );
}

