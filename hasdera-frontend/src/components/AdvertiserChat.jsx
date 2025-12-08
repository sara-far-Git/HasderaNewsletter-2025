/**
 * AdvertiserChat.jsx
 * צ'אט למפרסמים עם עיצוב תואם לדשבורד
 * Glassmorphism + אנימציות יפות
 */

import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { sendAdvertiserMessage } from "../Services/advertiserChatService";

// 🎬 אנימציות
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

// 🎨 צבעים וסגנונות
const colors = {
  primary: '#10b981',
  primaryDark: '#059669',
  primaryLight: 'rgba(16, 185, 129, 0.15)',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassLight: 'rgba(255, 255, 255, 0.05)',
  dark: '#1a1a1a',
  darkLight: '#2a2a2a',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
};

// 🎨 Container הראשי
const ChatContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 400px;
  max-height: 550px;
  background: ${colors.glass};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px ${colors.shadow},
    inset 0 1px 0 ${colors.glassBorder};
  border: 1px solid ${colors.glassBorder};
  overflow: hidden;
  direction: rtl;
  animation: ${fadeInUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  @media (max-width: 768px) {
    width: calc(100% - 2rem);
    left: 1rem;
    bottom: 1rem;
    max-height: calc(100vh - 6rem);
  }
`;

// 🎨 Header
const ChatHeader = styled.div`
  background: ${colors.gradient};
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Assistant', sans-serif;
  position: relative;
  z-index: 1;

  svg {
    width: 20px;
    height: 20px;
    animation: ${float} 3s ease-in-out infinite;
    flex-shrink: 0;
  }
`;

const OnlineIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.9;
  margin-right: 0.5rem;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #4ade80;
    border-radius: 50%;
    box-shadow: 0 0 8px #4ade80;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;

  svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
    flex-shrink: 0;
    display: block;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// 🎨 Messages Area
const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: ${colors.glassLight};
  min-height: 300px;
  max-height: 350px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isUser ? 'flex-start' : 'flex-end'};
  gap: 0.5rem;
  animation: ${slideIn} 0.3s ease-out;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 0.875rem 1.125rem;
  border-radius: ${props => props.$isUser 
    ? '18px 18px 4px 18px' 
    : '18px 18px 18px 4px'};
  background: ${props => props.$isUser 
    ? colors.gradient
    : colors.glass};
  color: ${props => props.$isUser 
    ? 'white' 
    : colors.text};
  box-shadow: ${props => props.$isUser 
    ? '0 4px 15px rgba(16, 185, 129, 0.3)' 
    : `0 4px 15px ${colors.shadow}`};
  border: ${props => props.$isUser 
    ? 'none' 
    : `1px solid ${colors.glassBorder}`};
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 0.95rem;
  font-family: 'Assistant', sans-serif;
  backdrop-filter: ${props => props.$isUser ? 'none' : 'blur(10px)'};
`;

const MessageTime = styled.span`
  font-size: 0.7rem;
  color: ${colors.textMuted};
  padding: 0 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${colors.primaryLight};
  border: 1px solid ${colors.glassBorder};
  border-radius: 12px;
  color: ${colors.primary};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Assistant', sans-serif;

  &:hover {
    background: ${colors.primary};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
`;

// 🎨 Loading
const LoadingBubble = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: ${colors.glass};
  border: 1px solid ${colors.glassBorder};
  border-radius: 18px 18px 18px 4px;
  align-self: flex-end;
  backdrop-filter: blur(10px);
  animation: ${fadeIn} 0.3s ease;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.35rem;

  span {
    width: 8px;
    height: 8px;
    background: ${colors.primary};
    border-radius: 50%;
    animation: ${bounce} 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
`;

// 🎨 Input Area
const ChatInputContainer = styled.div`
  padding: 1rem 1.25rem;
  background: ${colors.glass};
  border-top: 1px solid ${colors.glassBorder};
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
`;

const ChatInput = styled.textarea`
  flex: 1;
  resize: none;
  min-height: 48px;
  max-height: 120px;
  padding: 0.875rem 1rem;
  background: ${colors.glassLight};
  border: 1px solid ${colors.glassBorder};
  border-radius: 16px;
  color: ${colors.text};
  font-size: 0.95rem;
  font-family: 'Assistant', sans-serif;
  text-align: right;
  direction: rtl;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: ${colors.textMuted};
  }
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }
`;

const SendButton = styled.button`
  min-width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.gradient};
  border: none;
  border-radius: 14px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);

  svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
    flex-shrink: 0;
    display: block;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.loading svg {
    animation: ${spin} 1s linear infinite;
  }
`;

// 🎨 Toggle Button
const ToggleButton = styled.button`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.gradient};
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  z-index: 999;
  box-shadow: 
    0 8px 25px rgba(16, 185, 129, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  animation: ${fadeIn} 0.5s ease;

  svg {
    width: 28px;
    height: 28px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
    flex-shrink: 0;
    display: block;
  }

  &:hover {
    transform: scale(1.1) translateY(-3px);
    box-shadow: 
      0 12px 35px rgba(16, 185, 129, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    bottom: 1rem;
    left: 1rem;
    width: 56px;
    height: 56px;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${colors.dark};
  animation: ${pulse} 2s ease-in-out infinite;
`;

// 🎨 SVG Icons - עם fill ו-stroke נכונים
const Icons = {
  messageCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  loader: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10"/>
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ display: 'block' }}>
      <path d="M12 2L13.09 8.26L18 6L15.74 10.91L22 12L15.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L8.26 13.09L2 12L8.26 10.91L6 6L10.91 8.26L12 2Z"/>
    </svg>
  ),
};

// 🎯 Main Component
export default function AdvertiserChat({ userProfile = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "היי! 👋 אני כאן לעזור לך לתכנן את הפרסום המושלם במגזין השדרה.\n\nאני יכולה לעזור לך עם:\n• בחירת גודל מודעה ומחיר\n• המלצה על מיקום מתאים לעסק שלך\n• מידע על דדליינים ולוחות זמנים\n• חיבור לגרפיקאית לעיצוב המודעה\n\nספרי לי, מה העסק שלך?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // גלילה אוטומטית
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // התמקדות בשדה הקלט
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
      setHasNewMessage(false);
    }
  }, [isOpen]);

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newUserMsg = { 
      text: userMessage, 
      isUser: true, 
      timestamp: new Date() 
    };
    
    setInput("");
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // בניית היסטוריה שכוללת את כל ההודעות הקודמות + ההודעה הנוכחית!
      const history = [
        ...messages.map(m => ({
          text: m.text,
          isUser: m.isUser
        })),
        { text: userMessage, isUser: true }  // ההודעה הנוכחית
      ];
      
      const reply = await sendAdvertiserMessage(userMessage, userProfile, history);
      const botMessage = {
        text: reply.reply || reply,
        actions: reply.actions || null,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
      if (!isOpen) setHasNewMessage(true);

    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעה:", error);
      setMessages(prev => [...prev, {
        text: `משהו השתבש 😕 נסי שוב או פני לצוות שלנו.`,
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <ToggleButton onClick={() => setIsOpen(true)} title="פתח צ'אט">
        {Icons.messageCircle}
        {hasNewMessage && <NotificationBadge>1</NotificationBadge>}
      </ToggleButton>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>
          {Icons.sparkles}
          עוזר למפרסמים
          <OnlineIndicator>מחובר</OnlineIndicator>
        </ChatTitle>
        <CloseButton onClick={() => setIsOpen(false)} title="סגור">
          {Icons.x}
        </CloseButton>
      </ChatHeader>

      <ChatMessages>
        {messages.map((msg, idx) => (
          <Message key={idx} $isUser={msg.isUser}>
            <MessageBubble $isUser={msg.isUser}>
              {msg.text}
            </MessageBubble>
            <MessageTime>{formatTime(msg.timestamp)}</MessageTime>
            
            {!msg.isUser && msg.actions && (
              <ActionButtons>
                {msg.actions.map((action, i) => (
                  <ActionButton
                    key={i}
                    onClick={() => window.location.href = action.url}
                  >
                    {action.label}
                  </ActionButton>
                ))}
              </ActionButtons>
            )}
          </Message>
        ))}
        
        {isLoading && (
          <LoadingBubble>
            <LoadingDots>
              <span></span>
              <span></span>
              <span></span>
            </LoadingDots>
          </LoadingBubble>
        )}
        <div ref={messagesEndRef} />
      </ChatMessages>

      <ChatInputContainer>
        <ChatInput
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="הקלד הודעה..."
          rows={1}
        />
        <SendButton 
          onClick={handleSend} 
          disabled={!input.trim() || isLoading}
          className={isLoading ? 'loading' : ''}
          title="שלח"
        >
          {isLoading ? Icons.loader : Icons.send}
        </SendButton>
      </ChatInputContainer>
    </ChatContainer>
  );
}