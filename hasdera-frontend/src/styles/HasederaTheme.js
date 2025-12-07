/**
 * HasederaTheme.js
 * ערכת עיצוב מרכזית למגזין השדרה - גרסה משודרגת
 * כולל תמיכה מלאה בעיצוב כהה, גרדיאנטים מרובים, ואנימציות
 */

const hasederaTheme = {
  // 🎨 צבעים
  colors: {
    // ירוק ראשי - הצבע המזהה של השדרה
    primary: {
      main: '#10b981',
      dark: '#059669',
      darker: '#047857',
      light: '#34d399',
      lighter: '#6ee7b7',
      pale: '#d1fae5',
    },
    
    // סגול - צבע משני
    secondary: {
      main: '#8b5cf6',
      dark: '#7c3aed',
      darker: '#6d28d9',
      light: '#a78bfa',
      lighter: '#c4b5fd',
    },
    
    // צבעי אקסנט לכרטיסים שונים
    accent: {
      purple: {
        main: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        shadow: 'rgba(139, 92, 246, 0.3)',
      },
      orange: {
        main: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        shadow: 'rgba(245, 158, 11, 0.3)',
      },
      pink: {
        main: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        shadow: 'rgba(236, 72, 153, 0.3)',
      },
      blue: {
        main: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        shadow: 'rgba(59, 130, 246, 0.3)',
      },
      teal: {
        main: '#14b8a6',
        gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        shadow: 'rgba(20, 184, 166, 0.3)',
      },
    },
    
    // גרדיאנטים
    gradient: {
      primary: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      primaryHover: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
      secondary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      gold: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
      dark: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
    },
    
    // רקעים
    background: {
      main: '#ffffff',
      card: '#ffffff',
      hover: '#f3f4f6',
      dark: '#1a1a1a',
      darker: '#111111',
      glass: 'rgba(255, 255, 255, 0.03)',
      glassLight: 'rgba(255, 255, 255, 0.08)',
      glassDark: 'rgba(0, 0, 0, 0.3)',
      overlay: 'rgba(26, 26, 26, 0.85)',
    },
    
    // טקסט
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      white: '#ffffff',
      whiteSecondary: 'rgba(255, 255, 255, 0.7)',
      whiteTertiary: 'rgba(255, 255, 255, 0.5)',
      disabled: '#9ca3af',
      gold: '#fbbf24',
    },
    
    // גבולות
    border: {
      light: '#e5e7eb',
      medium: '#d1d5db',
      dark: '#9ca3af',
      glass: 'rgba(255, 255, 255, 0.1)',
      glassHover: 'rgba(16, 185, 129, 0.4)',
      primary: 'rgba(16, 185, 129, 0.3)',
    },
    
    // סטטוסים
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },

  // 📝 טיפוגרפיה
  typography: {
    fontFamily: {
      primary: "'Assistant', 'Heebo', system-ui, sans-serif",
      heading: "'Cormorant Garamond', serif",
      mono: "'Fira Code', monospace",
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
      logo: '0.2em',
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // 📐 מרווחים
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },

  // 🔲 עיגול פינות
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // 🌫️ צלליות
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    // צלליות צבעוניות
    green: '0 4px 14px 0 rgba(16, 185, 129, 0.3)',
    greenHover: '0 6px 20px 0 rgba(16, 185, 129, 0.4)',
    greenGlow: '0 0 60px rgba(16, 185, 129, 0.15)',
    purple: '0 4px 14px 0 rgba(139, 92, 246, 0.3)',
    orange: '0 4px 14px 0 rgba(245, 158, 11, 0.3)',
    pink: '0 4px 14px 0 rgba(236, 72, 153, 0.3)',
    // צלליות לכרטיסים
    card: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)',
    cardHover: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 80px rgba(16, 185, 129, 0.15)',
  },

  // 🎬 מעברים ואנימציות
  transitions: {
    fast: 'all 0.15s ease-in-out',
    base: 'all 0.2s ease-in-out',
    slow: 'all 0.3s ease-in-out',
    slower: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // אנימציות מוכנות (לשימוש עם keyframes)
  animations: {
    fadeInUp: {
      from: { opacity: 0, transform: 'translateY(40px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
  },

  // 📱 נקודות שבירה
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // 🖼️ z-index
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    overlay: 400,
    modal: 500,
    popover: 600,
    tooltip: 700,
    toast: 800,
    max: 9999,
  },

  // 💎 אפקטים מיוחדים
  effects: {
    glassMorphism: `
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `,
    glassMorphismLight: `
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 0, 0, 0.05);
    `,
    textGradient: `
      background: linear-gradient(135deg, #10b981 0%, #059669 50%, #fbbf24 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    `,
    glowGreen: `
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.3),
                  0 0 40px rgba(16, 185, 129, 0.2),
                  0 0 60px rgba(16, 185, 129, 0.1);
    `,
  },
};

// 🎨 Global Styles
export const GlobalStyles = `
  /* Fonts are loaded via <link> tag in index.html */

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    scroll-padding-top: 80px;
  }

  body {
    font-family: ${hasederaTheme.typography.fontFamily.primary};
    overflow-x: hidden;
    direction: rtl;
    background: ${hasederaTheme.colors.background.dark};
    color: ${hasederaTheme.colors.text.primary};
    line-height: ${hasederaTheme.typography.lineHeight.normal};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }

  /* 🔗 קישורים */
  a {
    font-weight: ${hasederaTheme.typography.fontWeight.medium};
    color: ${hasederaTheme.colors.primary.main};
    text-decoration: none;
    transition: ${hasederaTheme.transitions.base};
  }

  a:hover {
    color: ${hasederaTheme.colors.primary.light};
  }

  /* 🔘 כפתורים */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
  }

  button:focus-visible {
    outline: 2px solid ${hasederaTheme.colors.primary.main};
    outline-offset: 2px;
  }

  /* 📝 כותרות */
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-family: ${hasederaTheme.typography.fontFamily.heading};
    font-weight: ${hasederaTheme.typography.fontWeight.normal};
    line-height: ${hasederaTheme.typography.lineHeight.tight};
  }

  p {
    margin: 0;
  }

  ul, ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* 🎨 תיקון איקונים - רק על קומפוננטות שלנו, לא על flipbook */
  /* לא נוסיף CSS גלובלי שיכול להפריע לאיקונים של הספר */

  /* 🖱️ Scrollbar מותאם */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(26, 26, 26, 0.5);
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${hasederaTheme.colors.gradient.primary};
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${hasederaTheme.colors.primary.dark};
  }

  /* 🎯 Selection */
  ::selection {
    background: ${hasederaTheme.colors.primary.main};
    color: white;
  }

  /* ♿ Focus visible */
  :focus-visible {
    outline: 2px solid ${hasederaTheme.colors.primary.main};
    outline-offset: 2px;
  }
`;

// 🛠️ Helper Functions
export const mediaQuery = {
  xs: `@media (max-width: ${hasederaTheme.breakpoints.xs})`,
  sm: `@media (max-width: ${hasederaTheme.breakpoints.sm})`,
  md: `@media (max-width: ${hasederaTheme.breakpoints.md})`,
  lg: `@media (max-width: ${hasederaTheme.breakpoints.lg})`,
  xl: `@media (max-width: ${hasederaTheme.breakpoints.xl})`,
  '2xl': `@media (max-width: ${hasederaTheme.breakpoints['2xl']})`,
};

// פונקציה ליצירת גרדיאנט מותאם
export const createGradient = (color1, color2, angle = 135) => 
  `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;

// פונקציה ליצירת צללית צבעונית
export const createColorShadow = (color, opacity = 0.3) =>
  `0 4px 14px 0 ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;

export default hasederaTheme;
