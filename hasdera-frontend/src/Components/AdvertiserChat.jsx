import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { MessageCircle, Send, X, Loader } from "lucide-react";
import { sendAdvertiserMessage } from "../Services/advertiserChatService";

// 🎨 Styled Components
const ChatContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  width: 380px;
  max-height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  direction: rtl;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    width: calc(100% - 2rem);
    left: 1rem;
    bottom: 1rem;
    max-height: calc(100vh - 2rem);
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
  color: white;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #fafafa;
  max-height: 400px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isUser ? 'flex-start' : 'flex-end'};
  gap: 0.25rem;
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: 0.875rem 1.125rem;
  border-radius: 16px;
  background: ${props => props.$isUser 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
    : 'white'};
  color: ${props => props.$isUser ? 'white' : '#1f2937'};
  box-shadow: ${props => props.$isUser ? '0 2px 8px rgba(16, 185, 129, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.08)'};
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 0.95rem;
`;

const ChatInputContainer = styled.div`
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
`;

const ChatInput = styled.textarea`
  flex: 1;
  padding: 0.875rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: none;
  min-height: 48px;
  max-height: 120px;
  direction: rtl;
  text-align: right;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SendButton = styled.button`
  padding: 0.875rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-width: 48px;
  height: 48px;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingBubble = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.125rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  align-self: flex-end;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.3rem;

  span {
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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

const ToggleButton = styled.button`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
  z-index: 999;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
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
  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
    {msg.actions.map((action, i) => (
      <button
        key={i}
        onClick={() => window.location.href = action.url}
        style={{
          padding: "0.5rem 0.75rem",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          background: "#10b981",
          color: "white",
          fontSize: "0.85rem",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
        }}
      >
        {action.label}
      </button>
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