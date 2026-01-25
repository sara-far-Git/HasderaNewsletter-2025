/**
 * SkeletonLoader.jsx
 * קומפוננטות Skeleton Loading יפות
 */

import React from "react";
import styled, { keyframes } from "styled-components";

/* ======================== Animation ======================== */
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

/* ======================== Base Skeleton ======================== */
const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: ${props => props.$radius || '8px'};
`;

/* ======================== Basic Shapes ======================== */
export const SkeletonLine = styled(SkeletonBase)`
  height: ${props => props.$height || '16px'};
  width: ${props => props.$width || '100%'};
  margin-bottom: ${props => props.$mb || '0'};
`;

export const SkeletonCircle = styled(SkeletonBase)`
  width: ${props => props.$size || '40px'};
  height: ${props => props.$size || '40px'};
  border-radius: 50%;
`;

export const SkeletonRect = styled(SkeletonBase)`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '100px'};
`;

/* ======================== Issue Card Skeleton ======================== */
const CardWrapper = styled.div`
  background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 1.5rem;
`;

const CardCover = styled(SkeletonBase)`
  width: 100%;
  height: 140px;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const CardTitle = styled(SkeletonBase)`
  height: 20px;
  width: 70%;
  margin-bottom: 0.5rem;
`;

const CardDate = styled(SkeletonBase)`
  height: 14px;
  width: 50%;
`;

export function IssueCardSkeleton() {
  return (
    <CardWrapper>
      <CardCover $radius="12px" />
      <CardTitle />
      <CardDate />
    </CardWrapper>
  );
}

/* ======================== Issues Grid Skeleton ======================== */
const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
`;

export function IssuesGridSkeleton({ count = 6 }) {
  return (
    <GridWrapper>
      {Array.from({ length: count }).map((_, i) => (
        <IssueCardSkeleton key={i} />
      ))}
    </GridWrapper>
  );
}

/* ======================== Latest Issue Skeleton ======================== */
const LatestWrapper = styled.div`
  display: flex;
  gap: 2rem;
  background: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 2rem;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LatestCover = styled(SkeletonBase)`
  width: 200px;
  height: 280px;
  border-radius: 16px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 160px;
    height: 220px;
  }
`;

const LatestInfo = styled.div`
  flex: 1;
  min-width: 280px;
`;

const LatestLabel = styled(SkeletonBase)`
  height: 14px;
  width: 100px;
  margin-bottom: 0.75rem;
`;

const LatestTitle = styled(SkeletonBase)`
  height: 32px;
  width: 80%;
  margin-bottom: 0.75rem;
`;

const LatestDate = styled(SkeletonBase)`
  height: 18px;
  width: 150px;
  margin-bottom: 1.5rem;
`;

const LatestButton = styled(SkeletonBase)`
  height: 52px;
  width: 160px;
  border-radius: 14px;
`;

export function LatestIssueSkeleton() {
  return (
    <LatestWrapper>
      <LatestCover $radius="16px" />
      <LatestInfo>
        <LatestLabel />
        <LatestTitle />
        <LatestDate />
        <LatestButton $radius="14px" />
      </LatestInfo>
    </LatestWrapper>
  );
}

/* ======================== Profile Card Skeleton ======================== */
const ProfileWrapper = styled.div`
  background: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 2rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ProfileAvatar = styled(SkeletonBase)`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled(SkeletonBase)`
  height: 24px;
  width: 180px;
  margin-bottom: 0.5rem;
`;

const ProfileDetail = styled(SkeletonBase)`
  height: 16px;
  width: 150px;
  margin-bottom: 0.3rem;
`;

export function ProfileCardSkeleton() {
  return (
    <ProfileWrapper>
      <ProfileHeader>
        <ProfileAvatar />
        <ProfileInfo>
          <ProfileName />
          <ProfileDetail $width="200px" />
          <ProfileDetail $width="120px" />
        </ProfileInfo>
      </ProfileHeader>
    </ProfileWrapper>
  );
}

/* ======================== Announcement Skeleton ======================== */
const AnnouncementWrapper = styled.div`
  background: linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 0;
  overflow: hidden;
  display: flex;
  min-height: 120px;
`;

const AnnouncementIcon = styled(SkeletonBase)`
  width: 140px;
  height: 100%;
  min-height: 120px;
  border-radius: 0;
`;

const AnnouncementContent = styled.div`
  flex: 1;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const AnnouncementBadge = styled(SkeletonBase)`
  height: 24px;
  width: 80px;
  border-radius: 20px;
  margin-bottom: 0.75rem;
`;

const AnnouncementTitle = styled(SkeletonBase)`
  height: 28px;
  width: 60%;
  margin-bottom: 0.5rem;
`;

const AnnouncementDesc = styled(SkeletonBase)`
  height: 16px;
  width: 80%;
`;

export function AnnouncementSkeleton() {
  return (
    <AnnouncementWrapper>
      <AnnouncementIcon />
      <AnnouncementContent>
        <AnnouncementBadge />
        <AnnouncementTitle />
        <AnnouncementDesc />
      </AnnouncementContent>
    </AnnouncementWrapper>
  );
}

/* ======================== Text Lines Skeleton ======================== */
const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export function TextLinesSkeleton({ lines = 3 }) {
  const widths = ['100%', '90%', '75%', '85%', '60%'];
  
  return (
    <TextWrapper>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} $width={widths[i % widths.length]} $height="14px" />
      ))}
    </TextWrapper>
  );
}

/* ======================== Section Cards Skeleton ======================== */
const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

const SectionCard = styled.div`
  background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionIcon = styled(SkeletonBase)`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  margin-bottom: 0.75rem;
`;

const SectionName = styled(SkeletonBase)`
  height: 16px;
  width: 60px;
`;

export function SectionsGridSkeleton({ count = 6 }) {
  return (
    <SectionsGrid>
      {Array.from({ length: count }).map((_, i) => (
        <SectionCard key={i}>
          <SectionIcon />
          <SectionName />
        </SectionCard>
      ))}
    </SectionsGrid>
  );
}

