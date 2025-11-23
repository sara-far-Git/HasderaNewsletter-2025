// Hasedera Theme - ערכת עיצוב מרכזית למגזין השדרה

const hasederaTheme = {
  colors: {
    primary: {
      main: '#10b981',      // ירוק ראשי
      dark: '#059669',       // ירוק כהה
      light: '#34d399',      // ירוק בהיר
    },
    secondary: {
      main: '#667eea',       // סגול
      dark: '#764ba2',       // סגול כהה
      light: '#a78bfa',      // סגול בהיר
    },
    gradient: {
      primary: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    background: {
      main: '#ffffff',
      card: '#ffffff',
      hover: '#f3f4f6',
      dark: '#1f2937',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      white: '#ffffff',
      disabled: '#9ca3af',
    },
    border: {
      light: '#e5e7eb',
      medium: '#d1d5db',
      dark: '#9ca3af',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  typography: {
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',  // עגול מלא
  },
  shadows: {
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    green: '0 4px 14px 0 rgba(16, 185, 129, 0.3)',
    greenHover: '0 6px 20px 0 rgba(16, 185, 129, 0.4)',
  },
  transitions: {
    base: 'all 0.2s ease-in-out',
    fast: 'all 0.15s ease-in-out',
    slow: 'all 0.3s ease-in-out',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// 🎨 Global Styles
export const GlobalStyles = `
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
    font-family: 'Assistant', 'Heebo', system-ui, Avenir, Helvetica, Arial, sans-serif;
    overflow-x: hidden;
    direction: rtl;
    background: #1a1a1a;
    color: #111827;
  }

  #root {
    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }

  a {
    font-weight: 500;
    color: ${hasederaTheme.colors.primary.main};
    text-decoration: inherit;
  }

  a:hover {
    color: ${hasederaTheme.colors.primary.dark};
  }

  button {
    font-family: inherit;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: 600;
  }

  p {
    margin: 0;
  }

  ul, ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`;

export default hasederaTheme;

