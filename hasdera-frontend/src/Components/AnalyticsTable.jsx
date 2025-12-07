/**
 * AnalyticsTable.jsx
 * אנליטיקות אישיות למפרסם - הצגת נתונים על המודעות של המפרסם המחובר
 */

import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { 
  BarChart3, 
  Eye, 
  MousePointerClick, 
  Users, 
  TrendingUp,
  Clock,
  Calendar,
  FileText,
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getAdvertiserAnalytics } from "../Services/analyticsService";
import { getAdvertiserDashboard } from "../Services/Login";
import { deleteCreative, updateCreative } from "../Services/creativesService";
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

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
  padding: 2rem;
  direction: rtl;
`;

const Header = styled.div`
  max-width: 1400px;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  animation: ${slideIn} 0.6s ease-out;
  animation-delay: ${props => props.$delay || 0}s;
  animation-fill-mode: both;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.$gradient || hasederaTheme.colors.gradient.primary};
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

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${hasederaTheme.colors.text.white};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${hasederaTheme.colors.text.secondary};
`;

const StatChange = styled.div`
  font-size: 0.85rem;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const Content = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const TableCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  animation: ${slideIn} 0.6s ease-out;
  animation-delay: 0.3s;
  animation-fill-mode: both;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const TableTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${hasederaTheme.colors.text.white};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: right;
  font-weight: 600;
  color: ${hasederaTheme.colors.text.secondary};
  font-size: 0.9rem;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(-4px);
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${hasederaTheme.colors.text.white};
  font-size: 0.95rem;
`;

const AdNameCell = styled(TableCell)`
  font-weight: 500;
  color: ${hasederaTheme.colors.text.white};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: ${hasederaTheme.colors.primary.main};
  }
`;

const NumberCell = styled(TableCell)`
  text-align: center;
  font-weight: 600;
  color: ${hasederaTheme.colors.primary.main};
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 2rem;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: ${hasederaTheme.colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 1.1rem;
  color: ${hasederaTheme.colors.text.white};
  font-weight: 500;
  letter-spacing: 1px;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const LoadingDots = styled.span`
  display: inline-block;
  width: 1.5em;
  text-align: left;
  
  &::after {
    content: '...';
    display: inline-block;
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${hasederaTheme.colors.text.secondary};
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.3rem;
  color: ${hasederaTheme.colors.text.white};
  margin-bottom: 0.5rem;
`;

const EmptyStateText = styled.p`
  font-size: 1rem;
  color: ${hasederaTheme.colors.text.secondary};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 2rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: ${hasederaTheme.colors.background.dark};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${fadeInUp} 0.4s ease-out;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${hasederaTheme.colors.text.white};
  margin: 0;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${hasederaTheme.colors.text.white};
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const AdDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const DetailItem = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
`;

const DetailLabel = styled.div`
  font-size: 0.85rem;
  color: ${hasederaTheme.colors.text.secondary};
  margin-bottom: 0.5rem;
`;

const DetailValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${hasederaTheme.colors.text.white};
`;

const AnalyticsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AnalyticsItem = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const AnalyticsLabel = styled.div`
  font-size: 0.85rem;
  color: ${hasederaTheme.colors.text.secondary};
`;

const AnalyticsValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${hasederaTheme.colors.text.white};
`;

const PublishedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
  
  ${props => props.$published ? `
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
  ` : `
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.3);
  `}
`;

const AdCard = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(-4px);
  }
`;

const AdCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const AdCardTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${hasederaTheme.colors.text.white};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AdCardMeta = styled.div`
  font-size: 0.9rem;
  color: ${hasederaTheme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AdCardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const EditButton = styled(ActionButton)`
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
  
  &:hover {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
  }
`;

const DeleteButton = styled(ActionButton)`
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  
  &:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.5);
  }
`;

// 🔹 Main Component
export default function AnalyticsTable() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [selectedAdAnalytics, setSelectedAdAnalytics] = useState([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalClicks: 0,
    totalUniqueReaders: 0,
    averageCTR: 0
  });

  // טעינת נתוני אנליטיקות של המפרסם
  const loadAnalytics = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // קבלת אנליטיקות מהבקנד (שקורא לשירות Python)
        const advertiserId = user?.advertiserId || user?.id;
        
        if (advertiserId) {
          // טעינה מ-dashboard כדי לקבל את כל המודעות (גם ללא מיקום)
          let dashboardAds = [];
          try {
            const dashboardData = await getAdvertiserDashboard();
            dashboardAds = dashboardData?.ads || dashboardData?.Ads || [];
          } catch (dashboardError) {
            console.error('שגיאה בטעינת dashboard:', dashboardError);
          }
          
          // טעינת אנליטיקות (אם יש)
          let allAnalytics = [];
          let analyticsAds = [];
          try {
            const analyticsData = await getAdvertiserAnalytics(advertiserId);
            allAnalytics = analyticsData.analytics || [];
            analyticsAds = analyticsData.ads || [];
          } catch (error) {
            console.error('שגיאה בטעינת אנליטיקות:', error);
          }
          
          // שילוב המודעות - dashboard ads הם המקור האמין ביותר
          const finalAds = analyticsAds.length > 0 ? analyticsAds : dashboardAds;
          
          setAds(finalAds);
          setAnalytics(allAnalytics);
          
          // חישוב סטטיסטיקות
          const totalViews = allAnalytics.reduce((sum, a) => sum + (a.views || a.uniqueReaders || 0), 0);
          const totalClicks = allAnalytics.reduce((sum, a) => sum + (a.clicksTotal || 0), 0);
          const totalUnique = new Set(allAnalytics.map(a => a.uniqueReaders).filter(Boolean)).size;
          const avgCTR = allAnalytics.length > 0 
            ? allAnalytics.reduce((sum, a) => sum + (parseFloat(a.ctr) || 0), 0) / allAnalytics.length
            : 0;
          
          setStats({
            totalViews,
            totalClicks,
            totalUniqueReaders: totalUnique,
            averageCTR: avgCTR
          });
        } else {
          setAds([]);
          setAnalytics([]);
          setStats({
            totalViews: 0,
            totalClicks: 0,
            totalUniqueReaders: 0,
            averageCTR: 0
          });
        }
      } catch (error) {
        console.error('שגיאה בטעינת אנליטיקות:', error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const handleAdClick = (adId) => {
    const ad = ads.find(a => 
      a.adplacementId === adId || 
      a.orderId === adId || 
      a.order?.orderId === adId
    );
    if (ad) {
      const adAnalytics = analytics.filter(a => 
        a.adId === adId || 
        a.adId === ad.adplacementId || 
        a.adId === ad.orderId ||
        a.adId === ad.order?.orderId
      );
      setSelectedAd(ad);
      setSelectedAdAnalytics(adAnalytics);
    }
  };

  const closeModal = () => {
    setSelectedAd(null);
    setSelectedAdAnalytics([]);
  };

  const handleEditAd = async (e, ad) => {
    e.stopPropagation();
    const creativeId = ad.creativeId || ad.creative?.creativeId;
    if (!creativeId) {
      alert('לא ניתן לערוך מודעה זו');
      return;
    }
    
    // פתיחת input file לעריכה
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      try {
        await updateCreative(creativeId, file);
        alert('מודעה עודכנה בהצלחה');
        // טעינה מחדש של הנתונים
        await loadAnalytics();
      } catch (error) {
        console.error('שגיאה בעדכון מודעה:', error);
        alert('שגיאה בעדכון המודעה');
      }
    };
    input.click();
  };

  const handleDeleteAd = async (e, ad) => {
    e.stopPropagation();
    const creativeId = ad.creativeId || ad.creative?.creativeId;
    if (!creativeId) {
      alert('לא ניתן למחוק מודעה זו');
      return;
    }
    
    if (window.confirm('האם אתה בטוח שברצונך למחוק את המודעה?')) {
      try {
        await deleteCreative(creativeId);
        alert('מודעה נמחקה בהצלחה');
        // טעינה מחדש של הנתונים
        await loadAnalytics();
      } catch (error) {
        console.error('שגיאה במחיקת מודעה:', error);
        alert('שגיאה במחיקת המודעה');
      }
    }
  };

  // קבוצת אנליטיקות לפי מודעה
  const analyticsByAd = ads.reduce((acc, ad) => {
    const adId = ad.adplacementId || ad.orderId || ad.order?.orderId;
    if (adId) {
      acc[adId] = {
        ad,
        analytics: analytics.filter(a => 
          a.adId === adId || 
          a.adId === ad.adplacementId || 
          a.adId === ad.orderId
        )
      };
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <Spinner />
          <LoadingText>
            טוען נתונים<LoadingDots />
          </LoadingText>
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>אנליטיקות אישיות</Title>
        <Subtitle>נתונים מפורטים על המודעות שלך</Subtitle>
      </Header>

      {/* סטטיסטיקות כלליות */}
      <StatsGrid>
        <StatCard $delay={0.1}>
          <StatHeader>
            <StatIcon $gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
              <Eye />
            </StatIcon>
          </StatHeader>
          <StatValue>
            {ads.length > 0 && analytics.length === 0 ? (
              <span style={{ fontSize: '0.9rem', color: '#10b981' }}>ממתין לפרסום</span>
            ) : (
              stats.totalViews.toLocaleString()
            )}
          </StatValue>
          <StatLabel>סה"כ צפיות</StatLabel>
        </StatCard>

        <StatCard $delay={0.2}>
          <StatHeader>
            <StatIcon $gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)">
              <MousePointerClick />
            </StatIcon>
          </StatHeader>
          <StatValue>
            {ads.length > 0 && analytics.length === 0 ? (
              <span style={{ fontSize: '0.9rem', color: '#3b82f6' }}>ממתין לפרסום</span>
            ) : (
              stats.totalClicks.toLocaleString()
            )}
          </StatValue>
          <StatLabel>סה"כ קליקים</StatLabel>
        </StatCard>

        <StatCard $delay={0.3}>
          <StatHeader>
            <StatIcon $gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
              <Users />
            </StatIcon>
          </StatHeader>
          <StatValue>
            {ads.length > 0 && analytics.length === 0 ? (
              <span style={{ fontSize: '0.9rem', color: '#8b5cf6' }}>ממתין לפרסום</span>
            ) : (
              stats.totalUniqueReaders.toLocaleString()
            )}
          </StatValue>
          <StatLabel>קוראים ייחודיים</StatLabel>
        </StatCard>

        <StatCard $delay={0.4}>
          <StatHeader>
            <StatIcon $gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
              <TrendingUp />
            </StatIcon>
          </StatHeader>
          <StatValue>
            {ads.length > 0 && analytics.length === 0 ? (
              <span style={{ fontSize: '0.9rem', color: '#f59e0b' }}>ממתין לפרסום</span>
            ) : (
              `${stats.averageCTR.toFixed(2)}%`
            )}
          </StatValue>
          <StatLabel>CTR ממוצע</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* רשימת כל המודעות */}
      <Content>
        <TableCard>
          <TableHeader>
            <TableTitle>
              <BarChart3 size={24} />
              כל המודעות שלך
            </TableTitle>
          </TableHeader>

          {ads.length === 0 ? (
            <EmptyState>
              <EmptyStateTitle>אין מודעות עדיין</EmptyStateTitle>
              <EmptyStateText>
                העלה מודעה ראשונה כדי להתחיל.
              </EmptyStateText>
            </EmptyState>
          ) : (
            <div style={{ padding: '1rem' }}>
              {ads.length > 0 && analytics.length === 0 && (
                <div style={{ 
                  padding: '1rem', 
                  marginBottom: '1rem', 
                  background: 'rgba(251, 191, 36, 0.1)', 
                  border: '1px solid rgba(251, 191, 36, 0.3)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <EmptyStateTitle style={{ marginBottom: '0.5rem' }}>משתמש חדש</EmptyStateTitle>
                  <EmptyStateText style={{ margin: 0 }}>
                    העלה מודעה שתתפרסם ונוכל להתחיל ביצירה.
                  </EmptyStateText>
                </div>
              )}
              {ads.map((ad) => {
                const adId = ad.adplacementId || ad.orderId || ad.order?.orderId || ad.creativeId;
                const adAnalytics = analytics.filter(a => 
                  a.adId === adId || 
                  a.adId === ad.adplacementId || 
                  a.adId === ad.orderId ||
                  a.adId === ad.creativeId
                );
                const hasAnalytics = adAnalytics.length > 0;
                // נסיון לקבל creative - המבנה מהשרת: ad.creative ישירות
                const creative = ad.creative || ad.order?.creatives?.[0];
                
                const issueDate = ad.issue?.issueDate || ad.issue?.issue_date;
                const isPublished = issueDate && new Date(issueDate) <= new Date();
                
                // בדיקה אם ה-fileUrl תקין (לא pending-upload)
                const isValidFileUrl = creative?.fileUrl && 
                  !creative.fileUrl.startsWith('pending-upload-') && 
                  (creative.fileUrl.startsWith('http://') || creative.fileUrl.startsWith('https://'));
                
                return (
                  <AdCard key={adId} onClick={() => handleAdClick(adId)}>
                    <AdCardHeader>
                      <AdCardTitle>
                        {isValidFileUrl ? (
                          <>
                            <img 
                              src={creative.fileUrl} 
                              alt="מודעה" 
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                              onError={(e) => {
                                try {
                                  e.target.style.display = 'none';
                                  const fallback = e.target.nextElementSibling;
                                  if (fallback) {
                                    fallback.style.display = 'flex';
                                  }
                                } catch (err) {
                                  // Silent fail
                                }
                              }}
                            />
                            <div style={{ 
                              display: 'none',
                              width: '60px', 
                              height: '60px', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px'
                            }}>
                              <FileText size={24} />
                            </div>
                          </>
                        ) : (
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px'
                          }}>
                            <FileText size={24} />
                          </div>
                        )}
                        {ad.slot?.name || (ad.hasPlacement === false ? 'ממתין לבחירת מיקום' : `מודעה #${adId}`)}
                      </AdCardTitle>
                      <ChevronRight size={20} />
                    </AdCardHeader>
                    
                    <PublishedBadge $published={isPublished && hasAnalytics}>
                      {ad.hasPlacement === false ? (
                        <>
                          <AlertCircle size={16} />
                          ממתין לבחירת מיקום
                        </>
                      ) : isPublished && hasAnalytics ? (
                        <>
                          <CheckCircle2 size={16} />
                          העיתון פורסם - נתונים זמינים
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} />
                          {isPublished ? 'ממתין לנתונים' : 'העיתון טרם פורסם'}
                        </>
                      )}
                    </PublishedBadge>
                    
                    <AdCardMeta>
                      <Calendar size={14} />
                      <span>
                        תאריך פרסום: {ad.startDate 
                          ? new Date(ad.startDate).toLocaleDateString('he-IL')
                          : ad.order?.orderDate
                          ? new Date(ad.order.orderDate).toLocaleDateString('he-IL')
                          : 'לא זמין'}
                      </span>
                    </AdCardMeta>
                    
                    {hasAnalytics && (
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <AdCardMeta>
                          <Eye size={14} />
                          <span>
                            {adAnalytics.reduce((sum, a) => sum + (a.uniqueReaders || 0), 0)} צפיות
                          </span>
                        </AdCardMeta>
                        <AdCardMeta>
                          <MousePointerClick size={14} />
                          <span>
                            {adAnalytics.reduce((sum, a) => sum + (a.clicksTotal || 0), 0)} קליקים
                          </span>
                        </AdCardMeta>
                        <AdCardMeta>
                          <TrendingUp size={14} />
                          <span>
                            CTR: {adAnalytics.length > 0
                              ? `${(adAnalytics.reduce((sum, a) => sum + (parseFloat(a.ctr) || 0), 0) / adAnalytics.length).toFixed(2)}%`
                              : '0%'}
                          </span>
                        </AdCardMeta>
                      </div>
                    )}
                    
                    <AdCardActions>
                      <EditButton onClick={(e) => handleEditAd(e, ad)}>
                        <Edit size={16} />
                        עריכה
                      </EditButton>
                      <DeleteButton onClick={(e) => handleDeleteAd(e, ad)}>
                        <Trash2 size={16} />
                        הסרה
                      </DeleteButton>
                    </AdCardActions>
                  </AdCard>
                );
              })}
            </div>
          )}
        </TableCard>
      </Content>

      {/* Modal לפרטי מודעה */}
      {selectedAd && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  {selectedAd.slot?.name || `מודעה #${selectedAd.adplacementId || selectedAd.order?.orderId}`}
                </ModalTitle>
                <CloseButton onClick={closeModal}>
                  <X />
                </CloseButton>
              </ModalHeader>

              <AdDetailsGrid>
                <DetailItem>
                  <DetailLabel>תאריך פרסום</DetailLabel>
                  <DetailValue>
                    {selectedAd.startDate 
                      ? new Date(selectedAd.startDate).toLocaleDateString('he-IL')
                      : selectedAd.order?.orderDate
                      ? new Date(selectedAd.order.orderDate).toLocaleDateString('he-IL')
                      : 'לא זמין'}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>תאריך סיום</DetailLabel>
                  <DetailValue>
                    {selectedAd.endDate 
                      ? new Date(selectedAd.endDate).toLocaleDateString('he-IL')
                      : 'לא מוגדר'}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>מיקום</DetailLabel>
                  <DetailValue>{selectedAd.slot?.name || 'לא זמין'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>סטטוס</DetailLabel>
                  <DetailValue>{selectedAd.order?.status || 'לא זמין'}</DetailValue>
                </DetailItem>
              </AdDetailsGrid>

              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ color: hasederaTheme.colors.text.white, marginBottom: '1rem' }}>
                  אנליטיקות ({selectedAdAnalytics.length})
                </h3>
                {selectedAdAnalytics.length === 0 ? (
                  <EmptyState>
                    <EmptyStateText>אין נתוני אנליטיקה למודעה זו</EmptyStateText>
                  </EmptyState>
                ) : (
                  <AnalyticsList>
                    {selectedAdAnalytics
                      .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))
                      .map((item, index) => (
                        <AnalyticsItem key={item.analyticsId || index}>
                          <div>
                            <AnalyticsLabel>תאריך דוח</AnalyticsLabel>
                            <AnalyticsValue>
                              {item.reportDate 
                                ? new Date(item.reportDate).toLocaleDateString('he-IL')
                                : '-'}
                            </AnalyticsValue>
                          </div>
                          <div>
                            <AnalyticsLabel>קליקים</AnalyticsLabel>
                            <AnalyticsValue>{item.clicksTotal || 0}</AnalyticsValue>
                          </div>
                          <div>
                            <AnalyticsLabel>קוראים ייחודיים</AnalyticsLabel>
                            <AnalyticsValue>{item.uniqueReaders || 0}</AnalyticsValue>
                          </div>
                          <div>
                            <AnalyticsLabel>CTR</AnalyticsLabel>
                            <AnalyticsValue>
                              {item.ctr ? `${parseFloat(item.ctr).toFixed(2)}%` : '0%'}
                            </AnalyticsValue>
                          </div>
                        </AnalyticsItem>
                      ))}
                  </AnalyticsList>
                )}
              </div>
            </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
