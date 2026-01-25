/**
 * ShareButtons.jsx
 * כפתורי שיתוף חברתי
 */

import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Share2, Facebook, Twitter, Link2, Check, MessageCircle } from "lucide-react";

/* ======================== Animations ======================== */
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const checkmark = keyframes`
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

/* ======================== Styled Components ======================== */
const ShareWrapper = styled.div`
  position: relative;
`;

const ShareTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f8fafc;
    border-color: rgba(255, 255, 255, 0.15);
  }
`;

const ShareMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 0.5rem;
  min-width: 180px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  animation: ${fadeIn} 0.2s ease-out;
  z-index: 50;
`;

const ShareOption = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #94a3b8;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  text-align: right;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #f8fafc;
  }

  svg {
    flex-shrink: 0;
  }
`;

const WhatsAppIcon = styled(MessageCircle)`
  color: #25D366;
`;

const FacebookIcon = styled(Facebook)`
  color: #1877F2;
`;

const TwitterIcon = styled(Twitter)`
  color: #1DA1F2;
`;

const CopyIcon = styled(Link2)`
  color: #10b981;
`;

const CheckIcon = styled(Check)`
  color: #10b981;
  animation: ${checkmark} 0.3s ease-out;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0.25rem 0;
`;

/* ======================== Component ======================== */
export default function ShareButtons({ title = "מגזין השדרה", url }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = encodeURIComponent(`${title} - מגזין השדרה`);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleShare = (platform) => {
    let shareLink = "";

    switch (platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=${shareText}%20${encodedUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`;
        break;
      default:
        break;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
    }

    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <ShareWrapper>
      <ShareTrigger onClick={() => setIsOpen(!isOpen)}>
        <Share2 size={16} />
        שיתוף
      </ShareTrigger>

      {isOpen && (
        <ShareMenu>
          <ShareOption onClick={() => handleShare("whatsapp")}>
            <WhatsAppIcon size={18} />
            וואטסאפ
          </ShareOption>
          <ShareOption onClick={() => handleShare("facebook")}>
            <FacebookIcon size={18} />
            פייסבוק
          </ShareOption>
          <ShareOption onClick={() => handleShare("twitter")}>
            <TwitterIcon size={18} />
            טוויטר
          </ShareOption>
          <Divider />
          <ShareOption onClick={handleCopyLink}>
            {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
            {copied ? "הקישור הועתק!" : "העתק קישור"}
          </ShareOption>
        </ShareMenu>
      )}
    </ShareWrapper>
  );
}

/* ============ Inline Share Buttons (Alternative) ============ */
const InlineWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const InlineButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: ${props => props.$bg || 'rgba(255, 255, 255, 0.05)'};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.$shadow || 'rgba(0,0,0,0.3)'};
  }
`;

export function ShareButtonsInline({ title = "מגזין השדרה", url }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = encodeURIComponent(`${title} - מגזין השדרה`);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleShare = (platform) => {
    let shareLink = "";

    switch (platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=${shareText}%20${encodedUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`;
        break;
      default:
        break;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <InlineWrapper>
      <InlineButton 
        $bg="#25D366" 
        $shadow="rgba(37, 211, 102, 0.4)"
        onClick={() => handleShare("whatsapp")}
        title="שתף בוואטסאפ"
      >
        <MessageCircle size={18} />
      </InlineButton>
      <InlineButton 
        $bg="#1877F2" 
        $shadow="rgba(24, 119, 242, 0.4)"
        onClick={() => handleShare("facebook")}
        title="שתף בפייסבוק"
      >
        <Facebook size={18} />
      </InlineButton>
      <InlineButton 
        $bg="#1DA1F2" 
        $shadow="rgba(29, 161, 242, 0.4)"
        onClick={() => handleShare("twitter")}
        title="שתף בטוויטר"
      >
        <Twitter size={18} />
      </InlineButton>
      <InlineButton 
        $bg="rgba(255,255,255,0.1)" 
        $shadow="rgba(0,0,0,0.3)"
        onClick={handleCopyLink}
        title={copied ? "הועתק!" : "העתק קישור"}
      >
        {copied ? <Check size={18} /> : <Link2 size={18} />}
      </InlineButton>
    </InlineWrapper>
  );
}

