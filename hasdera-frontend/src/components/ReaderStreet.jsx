import React, { useState } from "react";
import './ReaderStreet.css';

// אייקונים/איורים לדוגמה (אפשר להחליף ל-SVG/תמונות שלך)
const stations = [
  { key: 'fruit', label: 'דוכן פירות', icon: '🍉', action: 'טעימות/מתכונים' },
  { key: 'library', label: 'ספריה קטנה', icon: '📚', action: 'סיפור בהמשכים' },
  { key: 'board', label: 'לוח מודעות', icon: '📌', action: 'לוח מכירות' },
  { key: 'lottery', label: 'קיוסק הגרלות', icon: '🎲', action: 'הגרלה' },
  { key: 'cafe', label: 'בית קפה', icon: '☕', action: 'טור אישי' },
  { key: 'escape', label: 'חדר בריחה', icon: '🗝️', action: 'אתגר השדרה' },
];

const easterEggs = [
  { key: 'bench', icon: '🪑', message: 'ציטוט השראה יומי!' },
  { key: 'cat', icon: '🐈', message: 'קיבלת קופון סודי!' },
  { key: 'window', icon: '🪟', message: 'חידת היום: מה עף בלי כנפיים?' },
  { key: 'tree', icon: '🌳', message: 'הפתעה! נכנסת להגרלה.' },
];

export default function ReaderStreet() {
  const [eggMsg, setEggMsg] = useState("");
  const [showEgg, setShowEgg] = useState(false);

  const handleEgg = (msg) => {
    setEggMsg(msg);
    setShowEgg(true);
    setTimeout(() => setShowEgg(false), 2500);
  };

  return (
    <div className="reader-street-bg">
      {/* יונים */}
      <div className="pigeon pigeon-1" />
      <div className="pigeon pigeon-2" />
      {/* עיתון מתגלגל */}
      <div className="newspaper" />
      {/* שלט מתנדנד */}
      <div className="swing-sign">השדרה</div>
      {/* חלון נדלק בלילה */}
      <div className="window" onClick={() => handleEgg(easterEggs[2].message)} />
      {/* עצים */}
      <div className="tree" onClick={() => handleEgg(easterEggs[3].message)} />
      {/* ספסל */}
      <div className="bench" onClick={() => handleEgg(easterEggs[0].message)} />
      {/* חתול */}
      <div className="cat" onClick={() => handleEgg(easterEggs[1].message)} />

      {/* מסלול השדרה */}
      <div className="street-path">
        {stations.map((s, i) => (
          <div key={s.key} className="station" tabIndex={0} title={s.label}>
            <div className="station-icon">{s.icon}</div>
            <div className="station-label">{s.label}</div>
            <div className="station-action">{s.action}</div>
            <div className="station-door" />
          </div>
        ))}
      </div>

      {/* הודעת הפתעה */}
      {showEgg && <div className="easter-egg-popup">{eggMsg}</div>}
    </div>
  );
}
