/**
 * HasderaChat.jsx
 * 
 * קומפוננטת React שמציגה ממשק צ'אט עם AI לאנליטיקות.
 * 
 * הקומפוננטה מאפשרת למשתמש:
 * - לשאול שאלות על נתוני אנליטיקות
 * - לראות את היסטוריית השיחה
 * - לקבל תשובות מה-AI
 */

import { useState, useRef, useEffect } from "react";
import {  sendMessage } from "../Services/chatServices";

import styled from "styled-components";

const ChatContainer = styled.div`
    width: 100%;
    max-width: 650px;
    margin: 30px auto;
    padding: 20px;
    direction: rtl;
    font-family: "Heebo", sans-serif;
`;

const ChatTitle = styled.h2`
    text-align: center;
    color: #298e8e;
    font-size: 24px;
    margin-bottom: 15px;
`;

const ChatBox = styled.div`
    background: #f8f8f8;
    border-radius: 15px;
    padding: 15px;
    height: 500px;
    overflow-y: auto;
    border: 1px solid #e3e3e3;
`;

const Bubble = styled.div`
    max-width: 75%;
    padding: 12px 16px;
    border-radius: 18px;
    margin: 10px 0;
    line-height: 1.5;
    white-space: pre-wrap;
    ${({ role }) =>
        role === "user"
            ? `
        background: #298e8e;
        color: white;
        margin-left: auto;
        border-bottom-left-radius: 5px;
    `
            : `
        background: white;
        border: 1px solid #dcdcdc;
        margin-right: auto;
        border-bottom-right-radius: 5px;
    `}
`;

const InputArea = styled.div`
    margin-top: 15px;
    display: flex;
    gap: 10px;
`;

const ChatInput = styled.input`
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #ccc;
    font-size: 16px;
    direction: rtl;
`;

const SendButton = styled.button`
    padding: 12px 18px;
    background: #298e8e;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 16px;
    transition: 0.2s;

    &:hover {
        background: #1f6f6f;
    }
    
    &:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
`;

// אנימציית טעינה
const LoadingBubble = styled.div`
    max-width: 75%;
    padding: 12px 16px;
    border-radius: 18px;
    margin: 10px 0;
    margin-right: auto;
    border-bottom-right-radius: 5px;
    background: white;
    border: 1px solid #dcdcdc;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const LoadingDots = styled.div`
    display: flex;
    gap: 4px;
    
    span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #298e8e;
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

export default function HasderaChat() {
    // ============================================================
    // הגדרת משתני state (מצב) של הקומפוננטה
    // ============================================================
    
    const [message, setMessage] = useState("");        // הטקסט שהמשתמש כותב בשדה הקלט
    const [chat, setChat] = useState([]);               // רשימת כל ההודעות בצ'אט (לצורך תצוגה)
    const bottomRef = useRef(null);                     // הפניה לאלמנט בתחתית הצ'אט (לגלילה אוטומטית)
    const [session, setSession] = useState([]);        // היסטוריית השיחה שנשלחת לשרת (לשמירת הקשר)
    const [isLoading, setIsLoading] = useState(false);  // האם כרגע שולחים הודעה ומחכים לתשובה

    // ============================================================
    // useEffect - גלילה אוטומטית למטה כשמוסיפים הודעה חדשה או כשמצב הטעינה משתנה
    // ============================================================
    
    // כל פעם שמשתנה chat (מוסיפים הודעה) או מצב הטעינה, גוללים למטה
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat, isLoading]);

    // ============================================================
    // פונקציה שמטפלת בשליחת הודעה
    // ============================================================
    
    const handleSend = async () => {
        // בודקים שיש טקסט לשליחה (לא רק רווחים) ולא כרגע בטעינה
        if (!message.trim() || isLoading) return;
    
        // שומרים את ההודעה של המשתמש
        const userMessage = message.trim();
        
        // מפעילים מצב טעינה
        setIsLoading(true);
        
        // שלב 1: מוסיפים את הודעת המשתמש לצ'אט המקומי (לצורך תצוגה מיידית)
        const userMsg = { role: "user", text: userMessage };
        setChat(prev => [...prev, userMsg]);
    
        // שלב 2: בונים את ה-Session (היסטוריית השיחה) לשליחה לשרת
        // כולל את כל ההודעות הקודמות + ההודעה החדשה
        const updatedSession = [
            ...session,
            { Role: "user", Content: userMessage }
        ];
    
        // מעדכנים את ה-session ומנקים את שדה הקלט
        setSession(updatedSession);
        setMessage("");
    
        try {
            // שלב 3: שולחים את ההודעה לשרת (שעובר לפייתון ואז ל-AI)
            const aiResponse = await sendMessage(userMessage, updatedSession);
    
            // שלב 4: מוסיפים את התשובה מה-AI
            setChat(prev => [...prev, { role: "agent", text: aiResponse }]);
    
            // שלב 5: מוסיפים את תשובת ה-AI ל-Session (כדי לשמור את ההקשר)
            setSession(prev => [
                ...prev,
                { Role: "assistant", Content: aiResponse }
            ]);
        } catch (error) {
            // אם קרתה שגיאה, מוסיפים הודעת שגיאה
            setChat(prev => [...prev, { 
                role: "agent", 
                text: `שגיאה: ${error.message || "לא ניתן לקבל תשובה מהשרת"}` 
            }]);
        } finally {
            // מסיימים את מצב הטעינה
            setIsLoading(false);
        }
    };
    

    // ============================================================
    // JSX - הקוד שמציג את הממשק למשתמש
    // ============================================================
    
    return (
        <ChatContainer>
            {/* כותרת הצ'אט */}
            <ChatTitle>צ'אט אנליטיקות השדרה</ChatTitle>
            
            {/* תיבת הצ'אט - מציגה את כל ההודעות */}
            <ChatBox>
                {/* עוברים על כל ההודעות ומציגים אותן */}
                {chat.map((msg, i) => (
                    <Bubble key={i} role={msg.role}>
                        {msg.text}
                    </Bubble>
                ))}
                {/* אנימציית טעינה */}
                {isLoading && (
                    <LoadingBubble>
                        <LoadingDots>
                            <span></span>
                            <span></span>
                            <span></span>
                        </LoadingDots>
                        <span>טוען תשובה...</span>
                    </LoadingBubble>
                )}
                {/* אלמנט ריק בתחתית - משמש לגלילה אוטומטית */}
                <div ref={bottomRef}></div>
            </ChatBox>

            {/* אזור הקלט - שדה טקסט וכפתור שליחה */}
            <InputArea>
                <ChatInput
                    placeholder="שאלי על גיליון, מודעה או ביצועים…"
                    value={message}  // הערך של השדה (מה שהמשתמש כותב)
                    onChange={(e) => setMessage(e.target.value)}  // כשמשנים את הטקסט, מעדכנים את state
                    onKeyDown={(e) => {
                        // אם לוחצים Enter (בלי Shift), שולחים את ההודעה
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();  // מונעים מעבר שורה
                            handleSend();        // שולחים את ההודעה
                        }
                    }}
                />
                {/* כפתור שליחה - מושבת בזמן טעינה */}
                <SendButton onClick={handleSend} disabled={isLoading}>
                    {isLoading ? "שולח..." : "שלחי"}
                </SendButton>
            </InputArea>
        </ChatContainer>
    );
}