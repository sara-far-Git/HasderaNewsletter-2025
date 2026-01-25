import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Megaphone, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { getSectionAds, getIssueAds, getPublishedAds } from '../Services/adsService';

const AdsContainer = styled.section`
  margin-top: 3rem;
  padding: 2rem;
  background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
`;

const AdsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const AdsTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
`;

const AdsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AdCard = styled.a`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    border-color: rgba(16, 185, 129, 0.5);
    box-shadow: 0 15px 30px rgba(0,0,0,0.3);
  }
`;

const AdImageWrapper = styled.div`
  width: 100%;
  height: 200px;
  background: rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AdPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgba(255,255,255,0.3);
`;

const AdContent = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AdTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
`;

const AdMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
`;

const AdLink = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #10b981;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255,255,255,0.5);
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255,255,255,0.5);
`;

export default function AdsSection({ sectionId, issueId, showAll = false }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, [sectionId, issueId, showAll]);

  const loadAds = async () => {
    try {
      setLoading(true);
      let data = [];
      
      if (showAll) {
        // הצגת כל המודעות הפורסמות
        data = await getPublishedAds(1, 20);
      } else if (sectionId) {
        // מודעות למדור ספציפי
        data = await getSectionAds(sectionId);
      } else if (issueId) {
        // מודעות לגיליון ספציפי
        data = await getIssueAds(issueId);
      }
      
      setAds(data || []);
    } catch (err) {
      console.error('❌ שגיאה בטעינת מודעות:', err);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const isValidImageUrl = (url) => {
    if (!url) return false;
    if (url.startsWith('pending-upload-')) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const handleAdClick = (ad) => {
    // אם יש קישור, נפתח אותו בחלון חדש
    if (ad.linkUrl || ad.url || ad.creative?.linkUrl) {
      const link = ad.linkUrl || ad.url || ad.creative?.linkUrl;
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <AdsContainer>
        <AdsHeader>
          <Megaphone size={24} color="#10b981" />
          <AdsTitle>מודעות</AdsTitle>
        </AdsHeader>
        <LoadingState>טוען מודעות...</LoadingState>
      </AdsContainer>
    );
  }

  if (ads.length === 0) {
    return (
      <AdsContainer>
        <AdsHeader>
          <Megaphone size={24} color="#10b981" />
          <AdsTitle>מודעות</AdsTitle>
        </AdsHeader>
        <EmptyState>
          <p>אין מודעות זמינות כרגע</p>
        </EmptyState>
      </AdsContainer>
    );
  }

  return (
    <AdsContainer>
      <AdsHeader>
        <Megaphone size={24} color="#10b981" />
        <AdsTitle>מודעות</AdsTitle>
      </AdsHeader>
      <AdsGrid>
        {ads.map((ad, index) => {
          const creative = ad.creative || ad.order?.creatives?.[0];
          const imageUrl = creative?.fileUrl || ad.imageUrl || ad.url;
          const isValidUrl = isValidImageUrl(imageUrl);
          const adKey = ad.adplacementId || ad.orderId || ad.creativeId || ad.id || index;
          const title = ad.slot?.name || ad.title || creative?.title || 'מודעה';
          const issueInfo = ad.issueTitle ? `מתוך: ${ad.issueTitle}` : '';

          return (
            <AdCard
              key={adKey}
              href={ad.linkUrl || ad.url || creative?.linkUrl || '#'}
              onClick={(e) => {
                e.preventDefault();
                handleAdClick(ad);
              }}
            >
              <AdImageWrapper>
                {isValidUrl ? (
                  <img
                    src={imageUrl}
                    alt={title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <AdPlaceholder style={{ display: isValidUrl ? 'none' : 'flex' }}>
                  <ImageIcon size={48} />
                  <span>תמונה לא זמינה</span>
                </AdPlaceholder>
              </AdImageWrapper>
              <AdContent>
                <AdTitle>{title}</AdTitle>
                {issueInfo && <AdMeta>{issueInfo}</AdMeta>}
                {(ad.linkUrl || ad.url || creative?.linkUrl) && (
                  <AdLink>
                    <ExternalLink size={14} />
                    לחצי לפרטים
                  </AdLink>
                )}
              </AdContent>
            </AdCard>
          );
        })}
      </AdsGrid>
    </AdsContainer>
  );
}
