import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { MessageCircle, Send, X, Loader } from "lucide-react";
import { sendAdvertiserMessage } from "../Services/advertiserChatService";
import { PrimaryButton, IconButton, TextArea } from "../styles";
import hasederaTheme from "../styles/HasederaTheme";

// 🎨 Styled Components עם Theme
const ChatContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 380px;
  max-height: 600px;
  background: ${hasederaTheme.colors.background.card};
  border-radius: ${hasederaTheme.borderRadius.xl};
  box-shadow: ${hasederaTheme.shadows.lg};
  overflow: hidden;
  direction: rtl;
  transition: ${hasederaTheme.transitions.base};
  border: 1px solid ${hasederaTheme.colors.border.light};

  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    width: calc(100% - 2rem);
    left: 1rem;
    bottom: 1rem;
    max-height: calc(100vh - 2rem);
  }
`;

const ChatHeader = styled.div`
  background: ${hasederaTheme.colors.gradient.primary};
  color: ${hasederaTheme.colors.text.white};
  padding: ${hasederaTheme.spacing.lg} ${hasederaTheme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h3`
  margin: 0;
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
`;

const CloseButton = styled(IconButton)`
  width: 32px;
  height: 32px;
  color: ${hasederaTheme.colors.text.white};
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${hasederaTheme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${hasederaTheme.spacing.md};
  background: ${hasederaTheme.colors.background.hover};
  max-height: 400px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${hasederaTheme.colors.border.medium};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${hasederaTheme.colors.border.dark};
  }
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isUser ? 'flex-start' : 'flex-end'};
  gap: ${hasederaTheme.spacing.xs};
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing.lg};
  border-radius: ${hasederaTheme.borderRadius.xl};
  background: ${props => props.$isUser 
    ? hasederaTheme.colors.gradient.primary
    : hasederaTheme.colors.background.card};
  color: ${props => props.$isUser 
    ? hasederaTheme.colors.text.white 
    : hasederaTheme.colors.text.primary};
  box-shadow: ${props => props.$isUser 
    ? hasederaTheme.shadows.green 
    : hasederaTheme.shadows.base};
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: ${hasederaTheme.typography.fontSize.base};
`;

const ChatInputContainer = styled.div`
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing.xl};
  background: ${hasederaTheme.colors.background.card};
  border-top: 1px solid ${hasederaTheme.colors.border.light};
  display: flex;
  gap: ${hasederaTheme.spacing.md};
  align-items: flex-end;
`;

const ChatInput = styled(TextArea)`
  flex: 1;
  resize: none;
  min-height: 48px;
  max-height: 120px;
  text-align: right;
`;

const SendButton = styled(PrimaryButton)`
  min-width: 48px;
  height: 48px;
  padding: ${hasederaTheme.spacing.md};
`;

const LoadingBubble = styled.div`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing.lg};
  background: ${hasederaTheme.colors.background.card};
  border-radius: ${hasederaTheme.borderRadius.xl};
  box-shadow: ${hasederaTheme.shadows.base};
  align-self: flex-end;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.3rem;

  span {
    width: 8px;
    height: 8px;
    background: ${hasederaTheme.colors.gradient.primary};
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

const ToggleButton = styled(PrimaryButton)`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  padding: 0;
  z-index: 999;

  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    bottom: 1rem;
    left: 1rem;
    width: 56px;
    height: 56px;
  }
`;

// 🎯 Main Component
export default function AdvertiserChat({ userProfile = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "שלום! אני כאן כדי לעזור לך לבחור מיקום לפרסום בגיליון. איך אוכל לעזור?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // גלילה אוטומטית למטה כשמגיעה הודעה חדשה
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // התמקדות בשדה הקלט כשפותחים את הצ'אט
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { text: userMessage, isUser: true, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      // שליחת ההודעה עם הפרופיל (אם קיים)
      const reply = await sendAdvertiserMessage(userMessage, userProfile);
      const botMessage = {
        text: reply.reply || reply,
        actions: reply.actions || null,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעה:", error);
      const errorMessage = error.response?.data?.error || error.message || "לא ניתן לשלוח הודעה";
      const errorDetails = error.response?.data?.details ? `\n\nפרטים: ${error.response.data.details.substring(0, 200)}...` : "";
      const pythonPath = error.response?.data?.pythonScriptPath ? `\n\nנתיב Python: ${error.response.data.pythonScriptPath}` : "";
      setMessages(prev => [...prev, {
        text: `שגיאה: ${errorMessage}${errorDetails}${pythonPath}`,
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
      <ToggleButton onClick={() => setIsOpen(true)} title="פתח Assistant למפרסמים">
        <MessageCircle size={24} />
      </ToggleButton>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>
          <MessageCircle size={20} />
          Assistant למפרסמים
        </ChatTitle>
        <CloseButton onClick={() => setIsOpen(false)}>
          <X size={18} />
        </CloseButton>
      </ChatHeader>

      <ChatMessages>
        {messages.map((msg, idx) => (
          <Message key={idx} $isUser={msg.isUser}>
            <MessageBubble $isUser={msg.isUser}>
              {msg.text}
            </MessageBubble>
            {!msg.isUser && msg.actions && (
              <div style={{ display: "flex", gap: hasederaTheme.spacing.sm, marginTop: hasederaTheme.spacing.sm }}>
                {msg.actions.map((action, i) => (
                  <PrimaryButton
                    key={i}
                    onClick={() => window.location.href = action.url}
                    style={{
                      fontSize: hasederaTheme.typography.fontSize.sm,
                      padding: `${hasederaTheme.spacing.sm} ${hasederaTheme.spacing.md}`
                    }}
                  >
                    {action.label}
                  </PrimaryButton>
                ))}
              </div>
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
          placeholder="שאל אותי על מיקום פרסום, גודל מודעה, רעיונות..."
          rows={1}
        />
        <SendButton onClick={handleSend} disabled={!input.trim() || isLoading}>
          {isLoading ? <Loader size={20} className="spin" /> : <Send size={20} />}
        </SendButton>
      </ChatInputContainer>
    </ChatContainer>
  );
}