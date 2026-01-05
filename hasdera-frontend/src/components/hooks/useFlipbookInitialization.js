/**
 * useFlipbookInitialization.js
 * Hook לאתחול Real3D FlipBook
 */

import { useRef, useEffect, useCallback } from "react";

export function useFlipbookInitialization(
  issue,
  flipbookContainerRef,
  flipbookInstanceRef,
  setIsLoading,
  setError,
  setIsFlipbookReady,
  setTotalPages,
  currentPageRef,
  setCurrentPage,
  pageChangeHandlersRef,
  setForceUpdate,
  isInitializingRef,
  lastPdfUrlRef,
  handlePageChange,
  getCurrentPageFromFlipbook
) {
  // פונקציה נפרדת לאתחול ה-FlipBook
  const initializeFlipBook = useCallback((pdfUrl) => {
    setIsFlipbookReady(false);
    
    if (!flipbookContainerRef.current) {
      return;
    }
    
    // הגנה מפני טעינה חוזרת
    if (flipbookInstanceRef.current && flipbookInstanceRef.current.options?.pdfUrl === pdfUrl) {
      try {
        const currentPage = flipbookInstanceRef.current.getCurrentPageNumber?.() || 0;
        const totalPages = flipbookInstanceRef.current.options?.numPages || 0;
        if (currentPage > 0 || totalPages > 0) {
          console.log('⚠️ FlipBook already initialized with same URL, skipping...');
          return;
        }
      } catch (e) {
        // נמשיך עם טעינה מחדש
      }
    }
    
    // פונקציה לניקוי יסודי של ה-FlipBook instance הקודם
    const cleanupPreviousInstance = () => {
      return new Promise((resolve) => {
        if (!flipbookInstanceRef.current) {
          resolve();
          return;
        }
        
        try {
          console.log('🧹 Cleaning up previous FlipBook instance...');
          const instance = flipbookInstanceRef.current;
          
          // ביטול ה-PDF service לפני ההרס הכללי
          try {
            if (instance.pdfService) {
              if (typeof instance.pdfService.cancel === 'function') {
                instance.pdfService.cancel();
              }
              if (typeof instance.pdfService.destroy === 'function') {
                instance.pdfService.destroy();
              }
            }
            // נסה גם דרך ה-PDF service הפנימי
            if (instance.pdf && typeof instance.pdf.cancel === 'function') {
              instance.pdf.cancel();
            }
            if (instance.pdf && typeof instance.pdf.destroy === 'function') {
              instance.pdf.destroy();
            }
          } catch (e) {
            console.warn('⚠️ Error cancelling PDF service:', e);
          }
          
          // נסה להרוס את ה-WebGL context לפני ההרס הכללי
          if (instance.webgl) {
            try {
              const webgl = instance.webgl;
              if (webgl instanceof HTMLElement) {
                const canvas = webgl.querySelector('canvas');
                if (canvas) {
                  const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
                  if (gl) {
                    const loseContext = gl.getExtension('WEBGL_lose_context');
                    if (loseContext) {
                      loseContext.loseContext();
                      console.log('✅ WebGL context lost');
                    }
                  }
                }
              } else if (webgl && webgl.canvas) {
                const gl = webgl.canvas.getContext('webgl') || webgl.canvas.getContext('webgl2');
                if (gl) {
                  const loseContext = gl.getExtension('WEBGL_lose_context');
                  if (loseContext) {
                    loseContext.loseContext();
                    console.log('✅ WebGL context lost');
                  }
                }
              }
            } catch (e) {
              console.warn('⚠️ Error cleaning up WebGL context:', e);
            }
          }
          
          // הרס את ה-FlipBook instance
          try {
            if (typeof instance.destroy === 'function') {
              instance.destroy();
            } else if (typeof instance.dispose === 'function') {
              instance.dispose();
            }
          } catch (e) {
            console.warn('⚠️ Error during destroy/dispose:', e);
          }
          
          flipbookInstanceRef.current = null;
          
          // ניקוי יסודי של ה-container
          if (flipbookContainerRef.current) {
            try {
              // הסר את כל ה-children לפני ניקוי ה-innerHTML
              while (flipbookContainerRef.current.firstChild) {
                flipbookContainerRef.current.removeChild(flipbookContainerRef.current.firstChild);
              }
              flipbookContainerRef.current.innerHTML = '';
            } catch (e) {
              console.error('❌ Error cleaning up container:', e);
            }
          }
          
          // המתן קצת יותר זמן כדי לוודא שה-PDF service וההרס הסתיימו
          setTimeout(() => {
            console.log('✅ Cleanup complete');
            resolve();
          }, 300); // הגדלנו ל-300ms כדי לתת יותר זמן ל-PDF service להתבטל
        } catch (e) {
          console.error('❌ Error destroying flipbook instance:', e);
          flipbookInstanceRef.current = null;
          resolve();
        }
      });
    };
    
    // נקה את ה-instance הקודם לפני יצירת חדש
    cleanupPreviousInstance().then(() => {
      // בדוק שוב שה-container עדיין קיים (יכול להיות שנהרס ב-cleanup)
      if (!flipbookContainerRef.current) {
        console.warn('⚠️ Container was destroyed during cleanup, aborting initialization');
        isInitializingRef.current = false;
        return;
      }
      
      // המשך עם יצירת ה-instance החדש
      let flipbook;
      let container;

    try {
      container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      flipbookContainerRef.current.appendChild(container);

      const options = {
        pdfUrl: pdfUrl,
        rightToLeft: true,
        startPage: 0,
        backgroundColor: '#1a1a1a',
        backgroundTransparent: false,
        pdfAutoLinks: true,
        pdfTextLayer: true,
        htmlLayer: true,
        pdfAnnotationLayer: true,
        sound: true,
        flipSound: true,
        loadAllPages: false,
        loadPagesF: 3,
        loadPagesB: 2,
        viewMode: 'webgl',
        pageFlipDuration: 1,
        lights: true,
        lightIntensity: 0.6,
        shadows: true,
        shadowOpacity: 0.35,
        pageRoughness: 0.9,
        pageHardness: 1.2,
        coverHardness: 2.5,
        pageSegmentsW: 20,
        pageMiddleShadowSize: 5,
        zoomMin: 0.85,
        responsiveView: true,
        bookMargin: 20,
        rotateCameraOnMouseDrag: false,
        pageDragDisabled: false,
        pageClickAreaWdith: '15%',
        cornerCurl: true,
        pdfDisableAutoFetch: false,
        pdfDisableStream: false,
        pdfDisableRange: false,
        sideNavigationButtons: false,
        btnFirst: { enabled: false },
        btnLast: { enabled: false },
        btnPrev: { enabled: false },
        btnNext: { enabled: false },
        btnZoomIn: { enabled: false },
        btnZoomOut: { enabled: false },
        btnZoomDropdown: { enabled: false },
        btnFullscreen: { enabled: false },
        btnToc: { enabled: false },
        btnShare: { enabled: false },
        btnDownload: { enabled: false },
        btnPrint: { enabled: false },
        btnSearch: { enabled: false },
        btnThumb: { enabled: false },
        btnAutoplay: { enabled: false },
        btnSound: { enabled: false },
        hideMenu: true,
        menu2Transparent: true,
        menu2OverBook: false,
        menuFloating: false,
        currentPage: { enabled: false },
        skin: 'dark',
        cover: true,
        backCover: true,
      };

      if (window.FlipBook) {
        flipbook = new window.FlipBook(container, options);
      } else if (window.FLIPBOOK?.Main) {
        flipbook = new window.FLIPBOOK.Main(options, container);
      } else {
        setError("הספרייה לא נטענה");
        setIsLoading(false);
        return;
      }

      if (flipbook) {
        flipbookInstanceRef.current = flipbook;
        
        // שמירת reference ל-instance הנוכחי כדי לבדוק שהוא לא נהרס
        const currentInstance = flipbook;

        // Event listeners עם בדיקות null
        if (flipbook.on) {
          flipbook.on('pagechange', (event) => {
            // בדוק שה-instance עדיין קיים ולא נהרס
            if (!flipbookInstanceRef.current || flipbookInstanceRef.current !== currentInstance) {
              return;
            }
            try {
              let page = event?.page || event?.detail?.page || event?.data?.page;
              if (!page) {
                page = getCurrentPageFromFlipbook(flipbook);
              }
              handlePageChange('pagechange', page);
            } catch (e) {
              console.warn('⚠️ Error in pagechange handler:', e);
            }
          });
          
          flipbook.on('flip', (event) => {
            // בדוק שה-instance עדיין קיים ולא נהרס
            if (!flipbookInstanceRef.current || flipbookInstanceRef.current !== currentInstance) {
              return;
            }
            try {
              let page = event?.page || event?.detail?.page || event?.data?.page;
              if (!page) {
                page = getCurrentPageFromFlipbook(flipbook);
              }
              handlePageChange('flip', page);
            } catch (e) {
              console.warn('⚠️ Error in flip handler:', e);
            }
          });
          
          flipbook.on('turned', (event) => {
            // בדוק שה-instance עדיין קיים ולא נהרס
            if (!flipbookInstanceRef.current || flipbookInstanceRef.current !== currentInstance) {
              return;
            }
            try {
              let page = event?.page || event?.detail?.page || event?.data?.page;
              if (!page) {
                page = getCurrentPageFromFlipbook(flipbook);
              }
              handlePageChange('turned', page);
            } catch (e) {
              console.warn('⚠️ Error in turned handler:', e);
            }
          });
        }

        // jQuery event listeners עם בדיקות null
        if (typeof jQuery !== 'undefined' && jQuery && container) {
          const jqueryFlipbookHandler = (event) => {
            // בדוק שה-instance עדיין קיים ולא נהרס
            if (!flipbookInstanceRef.current || flipbookInstanceRef.current !== currentInstance) {
              return;
            }
            try {
              let page = event?.page || event?.originalEvent?.page;
              if (!page) {
                page = getCurrentPageFromFlipbook(flipbook);
              }
              handlePageChange('pagechange (jQuery flipbook)', page);
            } catch (e) {
              console.warn('⚠️ Error in jQuery flipbook handler:', e);
            }
          };
          jQuery(container).on('pagechange', jqueryFlipbookHandler);
          pageChangeHandlersRef.current.push({ type: 'jquery-flipbook', handler: jqueryFlipbookHandler, element: container });
        }

        // Window event listener עם בדיקות null
        const handleWindowPageChange = (event) => {
          // בדוק שה-instance עדיין קיים ולא נהרס
          if (!flipbookInstanceRef.current || flipbookInstanceRef.current !== currentInstance) {
            return;
          }
          try {
            let page = event?.detail?.page;
            if (!page && flipbookInstanceRef.current) {
              page = getCurrentPageFromFlipbook(flipbookInstanceRef.current);
            }
            handlePageChange('r3d-pagechange (window)', page);
          } catch (e) {
            console.warn('⚠️ Error in window pagechange handler:', e);
          }
        };
        window.addEventListener('r3d-pagechange', handleWindowPageChange);
        pageChangeHandlersRef.current.push({ type: 'window', handler: handleWindowPageChange });

        // jQuery window event listener עם בדיקות null
        if (typeof jQuery !== 'undefined' && jQuery(window)) {
          const jqueryWindowHandler = (event) => {
            // בדוק שה-instance עדיין קיים ולא נהרס
            if (!flipbookInstanceRef.current || flipbookInstanceRef.current !== currentInstance) {
              return;
            }
            try {
              let page = event?.page || event?.originalEvent?.page;
              if (!page && flipbookInstanceRef.current) {
                page = getCurrentPageFromFlipbook(flipbookInstanceRef.current);
              }
              handlePageChange('r3d-pagechange (jQuery window)', page);
            } catch (e) {
              console.warn('⚠️ Error in jQuery window handler:', e);
            }
          };
          jQuery(window).on('r3d-pagechange', jqueryWindowHandler);
          pageChangeHandlersRef.current.push({ type: 'jquery-window', handler: jqueryWindowHandler });
        }

        // Timeout for PDF loading
        const timeoutId = setTimeout(() => {
          const pages = flipbook.options?.numPages || flipbook.options?.pages?.length || 0;
          if (pages > 0) {
            setIsLoading(false);
            setTotalPages(pages);
          }
        }, 15000);

        flipbook.on('ready', () => {
          // בדוק שה-instance עדיין קיים ולא נהרס
          if (!flipbookInstanceRef.current || flipbookInstanceRef.current !== currentInstance) {
            return;
          }
          try {
            clearTimeout(timeoutId);
            setIsLoading(false);
            isInitializingRef.current = false;
            const pages = flipbook.options?.numPages || flipbook.options?.pages?.length || 0;
            setTotalPages(pages);
            
            const initialPage = flipbook.getCurrentPageNumber?.();
            if (initialPage) {
              currentPageRef.current = initialPage;
              setCurrentPage(initialPage);
            }
            
            setTimeout(() => {
              // בדוק שוב שה-instance עדיין קיים
              if (flipbookInstanceRef.current === currentInstance) {
                setIsFlipbookReady(true);
              }
            }, 500);
          } catch (e) {
            console.warn('⚠️ Error in ready handler:', e);
          }
        });

        flipbook.on('pdfinit', () => {
          // בדוק שה-instance עדיין קיים ולא נהרס
          if (!flipbookInstanceRef.current || flipbookInstanceRef.current !== currentInstance) {
            return;
          }
          try {
            clearTimeout(timeoutId);
            setIsLoading(false);
            isInitializingRef.current = false;
            const pages = flipbook.options?.numPages || 0;
            setTotalPages(pages);
            
            setTimeout(() => {
              // בדוק שוב שה-instance עדיין קיים
              if (!flipbookInstanceRef.current || flipbookInstanceRef.current !== currentInstance) {
                return;
              }
              try {
                const page = getCurrentPageFromFlipbook(flipbook);
                if (page) {
                  currentPageRef.current = page;
                  setCurrentPage(page);
                }
                setIsFlipbookReady(true);
              } catch (e) {
                console.warn('⚠️ Error getting page in pdfinit:', e);
              }
            }, 500);
          } catch (e) {
            console.warn('⚠️ Error in pdfinit handler:', e);
          }
        });

        // MutationObserver עם בדיקות null
        let mutationObserver = null;
        if (flipbook.bookLayer instanceof HTMLElement) {
          mutationObserver = new MutationObserver((mutations) => {
            // בדוק שה-instance עדיין קיים ולא נהרס
            if (!flipbookInstanceRef.current || flipbookInstanceRef.current !== currentInstance) {
              return;
            }
            try {
              let pageChanged = false;
              let newPage = null;
              
              for (const mutation of mutations) {
                if (mutation.type === 'attributes') {
                  const target = mutation.target;
                  if (target === flipbook.bookLayer || flipbook.bookLayer.contains(target)) {
                    const dataPage = flipbook.bookLayer.getAttribute('data-current-page');
                    if (dataPage) {
                      const pageNum = Number(dataPage);
                      if (!isNaN(pageNum)) {
                        newPage = pageNum;
                        pageChanged = true;
                        break;
                      }
                    }
                  }
                }
              }
              
              if (pageChanged && newPage !== null) {
                handlePageChange('MutationObserver', newPage);
              }
            } catch (e) {
              console.error('❌ Error in MutationObserver:', e);
            }
          });
          
          mutationObserver.observe(flipbook.bookLayer, {
            attributes: true,
            attributeFilter: ['class', 'data-current-page', 'data-page', 'data-page-number'],
            childList: true,
            subtree: true
          });
          
          pageChangeHandlersRef.current.push({
            type: 'mutationObserver',
            cleanup: () => {
              if (mutationObserver) {
                mutationObserver.disconnect();
              }
            }
          });
        }

        flipbook.on('error', (err) => {
          // בדוק שה-instance עדיין קיים ולא נהרס
          if (!flipbookInstanceRef.current || flipbookInstanceRef.current !== currentInstance) {
            return;
          }
          
          // התעלם משגיאות של cleanup (Transport destroyed, RenderingCancelledException)
          const errorStr = err?.message || err?.toString() || JSON.stringify(err) || '';
          if (errorStr.includes('Transport destroyed') || 
              errorStr.includes('RenderingCancelledException') ||
              errorStr.includes('AbortError') ||
              errorStr.includes('signal is aborted') ||
              errorStr.includes('Cannot read properties of null') ||
              errorStr.includes('MissingPDFException') ||
              errorStr.includes('Missing PDF')) {
            // אלה שגיאות נורמליות בזמן cleanup או כאשר אין PDF, לא נציג אותן למשתמש
            console.log('ℹ️ Ignoring cleanup-related or missing PDF error:', errorStr);
            return;
          }
          
          isInitializingRef.current = false;
          
          let errorMessage = "שגיאה בטעינת המגזין";
          
          if (errorStr.includes('Invalid PDF') || 
              errorStr.includes('PDF structure') || 
              errorStr.includes('InvalidPDFException') ||
              errorStr.includes('invalid pdf') ||
              errorStr.includes('InvalidPDF')) {
            errorMessage = "שגיאה בפורמט הקובץ PDF. הקובץ עשוי להיות פגום או לא תקין. אנא נסה להעלות את הקובץ מחדש.";
          } else if (errorStr.includes('NetworkError') || 
                     errorStr.includes('Failed to fetch') ||
                     errorStr.includes('CORS') ||
                     errorStr.includes('network')) {
            errorMessage = "שגיאה בטעינת הקובץ מהשרת. אנא ודא שהשרת זמין ונסה שוב.";
          } else if (errorStr.includes('timeout') || errorStr.includes('Timeout')) {
            errorMessage = "זמן הטעינה פג. הקובץ גדול מדי או שיש בעיה בחיבור. אנא נסה שוב.";
          } else if (err && err.message) {
            errorMessage = `שגיאה בטעינת המגזין: ${err.message}`;
          }
          
          setError(errorMessage);
          setIsLoading(false);
          clearTimeout(timeoutId);
        });
      }
    } catch (err) {
      console.error('❌ Error initializing FlipBook:', err);
      let errorMessage = "שגיאה באתחול המגזין";
      
      const errorStr = err?.message || err?.toString() || '';
      if (errorStr.includes('Invalid PDF') || 
          errorStr.includes('PDF structure') || 
          errorStr.includes('InvalidPDFException')) {
        errorMessage = "שגיאה בפורמט הקובץ PDF. הקובץ עשוי להיות פגום או לא תקין. אנא נסה להעלות את הקובץ מחדש.";
      } else if (err.message) {
        errorMessage = `שגיאה: ${err.message}`;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      isInitializingRef.current = false;
    }
    });
  }, [flipbookContainerRef, flipbookInstanceRef, setIsLoading, setError, setIsFlipbookReady, setTotalPages, currentPageRef, setCurrentPage, pageChangeHandlersRef, handlePageChange, getCurrentPageFromFlipbook, isInitializingRef]);

  // Keep a stable ref to the initializer to avoid stale-closure issues
  const initializeFlipBookRef = useRef(initializeFlipBook);
  useEffect(() => {
    initializeFlipBookRef.current = initializeFlipBook;
  }, [initializeFlipBook]);

  // אתחול FlipBook
  useEffect(() => {
    console.log('🔍 useFlipbookInitialization - issue:', issue);
    
    if (!issue) {
      console.log('⚠️ useFlipbookInitialization - no issue, returning');
      return;
    }
    
    if (!issue.IssueId && !issue.issueId && !issue.issue_id) {
      console.log('⚠️ useFlipbookInitialization - no issue ID, returning');
      return;
    }
    
    let pdfUrl = issue.PdfUrl || issue.FileUrl || issue.pdf_url || issue.Pdf_url || issue.pdfUrl || issue.fileUrl || issue.FileUrl || issue.File_url;
    console.log('🔍 useFlipbookInitialization - pdfUrl:', pdfUrl, 'type:', typeof pdfUrl, 'issue:', issue);
    
    // בדיקה מחמירה יותר: PDF URL חייב להיות string לא ריק
    // נבדוק גם אם זה null, undefined, string ריק, או string "null"/"undefined"
    const isValidPdfUrl = pdfUrl && 
                          typeof pdfUrl === 'string' && 
                          pdfUrl.trim() !== '' && 
                          pdfUrl !== 'null' && 
                          pdfUrl !== 'undefined' &&
                          !pdfUrl.startsWith('null') &&
                          !pdfUrl.startsWith('undefined');
    
    if (!isValidPdfUrl) {
      // אם אין PDF, נסמן שהטעינה הסתיימה (לא בטעינה) ונציג הודעה מתאימה
      console.log('✅ useFlipbookInitialization - No valid PDF URL detected, setting loading to false. pdfUrl was:', pdfUrl);
      setIsLoading(false);
      setIsFlipbookReady(false);
      setTotalPages(0);
      // לא נציג שגיאה - זה נורמלי עבור גיליונות טיוטה ללא PDF
      return;
    }
    
    console.log('✅ useFlipbookInitialization - Valid PDF URL found:', pdfUrl, 'proceeding with initialization');
    
    if (!flipbookContainerRef.current) {
      return;
    }
    
    if (!window.FlipBook && !window.FLIPBOOK) {
      return;
    }
    
    if (isInitializingRef.current) {
      return;
    }
    
    if (lastPdfUrlRef.current === pdfUrl && flipbookInstanceRef.current) {
      try {
        const currentPage = flipbookInstanceRef.current.getCurrentPageNumber?.() || 0;
        if (currentPage > 0) {
          return;
        }
      } catch (e) {
        // נמשיך עם טעינה מחדש
      }
    }
    
    if (lastPdfUrlRef.current === pdfUrl && isInitializingRef.current) {
      return;
    }
    
    isInitializingRef.current = true;
    lastPdfUrlRef.current = pdfUrl;
    
    // טיפול בקבצי טיוטה - המרה ל-URL מלא
    let checkPdfPromise;
    
    try {
      let apiBaseUrl = import.meta.env.VITE_API_URL;
      
      if (!apiBaseUrl) {
        const currentOrigin = window.location.origin;
        apiBaseUrl = currentOrigin.replace(':5173', ':5055').replace('5173', '5055');
        if (apiBaseUrl === currentOrigin) {
          apiBaseUrl = currentOrigin.replace(/:\d+/, ':5055');
        }
      }
      
      if (pdfUrl.startsWith('pending-upload-')) {
        const tempFileName = pdfUrl.replace('pending-upload-', '');
        pdfUrl = `${apiBaseUrl}/api/issues/draft-file/${tempFileName}`;
      } else if (pdfUrl.startsWith('/api/issues/draft-file/')) {
        pdfUrl = `${apiBaseUrl}${pdfUrl}`;
      } else if (pdfUrl.startsWith('/uploads/')) {
        pdfUrl = `${apiBaseUrl}${pdfUrl}`;
      } else if (pdfUrl.includes('/api/issues/draft-file/') && !pdfUrl.startsWith('http')) {
        pdfUrl = `${apiBaseUrl}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`;
      } else if (pdfUrl.includes('localhost:5000')) {
        pdfUrl = pdfUrl.replace('localhost:5000', 'localhost:5055').replace(':5000', ':5055');
      }
      
      setIsLoading(true);
      
      const token = localStorage.getItem('hasdera_token');
      const headers = {
        'Range': 'bytes=0-1023'
      };
      if (token && (pdfUrl.includes('/api/issues/draft-file/') || pdfUrl.includes('/uploads/'))) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      checkPdfPromise = fetch(pdfUrl, { 
        method: 'GET', 
        mode: 'cors',
        cache: 'no-cache',
        headers: headers
      })
        .then(checkResponse => {
          if (!checkResponse.ok && checkResponse.status !== 206) {
            throw new Error(`HTTP ${checkResponse.status}: ${checkResponse.statusText}`);
          }
          
          return checkResponse.arrayBuffer().then(firstBytes => {
            const bytes = new Uint8Array(firstBytes);
            
            if (bytes.length >= 4) {
              const pdfHeader = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
              
              if (pdfHeader === '%PDF') {
                return true;
              } else {
                for (let i = 0; i < Math.min(10, bytes.length - 4); i++) {
                  const header = String.fromCharCode(bytes[i], bytes[i+1], bytes[i+2], bytes[i+3]);
                  if (header === '%PDF') {
                    return true;
                  }
                }
                throw new Error('Invalid PDF structure - PDF header not found. הקובץ PDF פגום או לא תקין. אנא נסה להעלות את הקובץ מחדש.');
              }
            } else {
              throw new Error('File too small to be a valid PDF. הקובץ קטן מדי להיות PDF תקין.');
            }
          });
        })
        .catch(err => {
          if (pdfUrl.includes('s3.amazonaws.com') || pdfUrl.includes('amazonaws.com')) {
            return true;
          }
          
          if (err.message && (err.message.includes('Range') || err.message.includes('206'))) {
            const retryHeaders = {};
            if (token && (pdfUrl.includes('/api/issues/draft-file/') || pdfUrl.includes('/uploads/'))) {
              retryHeaders['Authorization'] = `Bearer ${token}`;
            }
            return fetch(pdfUrl, { 
              method: 'GET', 
              mode: 'cors',
              cache: 'no-cache',
              headers: retryHeaders
            })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              return response.arrayBuffer().then(buffer => {
                const bytes = new Uint8Array(buffer);
                if (bytes.length >= 4) {
                  const pdfHeader = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
                  if (pdfHeader === '%PDF') {
                    return true;
                  }
                }
                throw new Error('Invalid PDF structure - PDF header not found');
              });
            })
            .catch(retryErr => {
              throw retryErr;
            });
          }
          
          if (err.message && err.message.includes('Invalid PDF structure')) {
            throw new Error('הקובץ PDF פגום או לא תקין. אנא נסה להעלות את הקובץ מחדש.');
          }
          throw err;
        });
      
      // תיקון encoding כפול ב-URL
      if (pdfUrl.includes('%25')) {
        const urlParts = pdfUrl.split('?');
        let pathPart = urlParts[0];
        const queryPart = urlParts[1] || '';
        
        let attempts = 0;
        while (pathPart.includes('%25') && attempts < 10) {
          const beforeDecode = pathPart;
          try {
            pathPart = decodeURIComponent(pathPart);
            if (beforeDecode === pathPart) break;
          } catch (e) {
            pathPart = pathPart.replace(/%25/g, '%');
            try {
              pathPart = decodeURIComponent(pathPart);
            } catch (e2) {
              break;
            }
          }
          attempts++;
        }
        
        if (pathPart.includes('%25')) {
          pathPart = pathPart.replace(/%25/g, '%');
          try {
            pathPart = decodeURIComponent(pathPart);
          } catch (e) {
            // נמשיך עם ה-path כמו שהוא
          }
        }
        
        pdfUrl = queryPart ? `${pathPart}?${queryPart}` : pathPart;
      }
    } catch (e) {
      if (!checkPdfPromise) {
        checkPdfPromise = Promise.resolve(true);
      }
    }
    
    if (!checkPdfPromise) {
      checkPdfPromise = Promise.resolve(true);
    }
    
    if (flipbookInstanceRef.current) {
      try {
        flipbookInstanceRef.current.destroy?.() || flipbookInstanceRef.current.dispose?.();
      } catch (e) {}
      flipbookInstanceRef.current = null;
    }

    // הוספת token ל-URL עבור קבצי טיוטה
    let finalPdfUrl = pdfUrl;
    const token = localStorage.getItem('hasdera_token');
    
    try {
      if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
        const apiBaseUrl = import.meta.env.VITE_API_URL || window.location.origin.replace(':5173', ':5000');
        if (pdfUrl.startsWith('/')) {
          finalPdfUrl = `${apiBaseUrl}${pdfUrl}`;
        } else {
          finalPdfUrl = `${apiBaseUrl}/${pdfUrl}`;
        }
      } else {
        finalPdfUrl = pdfUrl;
      }
      
      if (token && (finalPdfUrl.includes('/api/issues/draft-file/') || finalPdfUrl.includes('/uploads/'))) {
        const urlObj = new URL(finalPdfUrl);
        urlObj.searchParams.set('token', token);
        finalPdfUrl = urlObj.toString();
      }
    } catch (urlError) {
      setError('שגיאה בעיבוד כתובת הקובץ PDF. אנא בדוק שהשרת רץ ונסה שוב.');
      setIsLoading(false);
      return;
    }
    
    if (!checkPdfPromise) {
      initializeFlipBookRef.current?.(finalPdfUrl);
      isInitializingRef.current = false;
      return;
    }
    
    checkPdfPromise
      .then(() => {
        initializeFlipBookRef.current?.(finalPdfUrl);
        isInitializingRef.current = false;
      })
      .catch(err => {
        const errorMessage = err.message || err.toString();
        
        if (pdfUrl.includes('/api/issues/draft-file/') || pdfUrl.includes('/uploads/')) {
          initializeFlipBookRef.current?.(finalPdfUrl);
          isInitializingRef.current = false;
          return;
        }
        
        let userMessage = "שגיאה בטעינת הקובץ PDF.";
        
        if (errorMessage.includes('Invalid PDF structure') || 
            errorMessage.includes('PDF header not found') ||
            errorMessage.includes('פגום')) {
          userMessage = "הקובץ PDF פגום או לא תקין. אנא נסה להעלות את הקובץ מחדש.";
        } else if (errorMessage.includes('HTTP')) {
          userMessage = `שגיאה בטעינת הקובץ מהשרת (${errorMessage}). אנא ודא שהשרת זמין ונסה שוב.`;
        } else {
          userMessage = `שגיאה בטעינת הקובץ PDF: ${errorMessage}. אנא נסה להעלות את הקובץ מחדש.`;
        }
        
        setError(userMessage);
        setIsLoading(false);
        isInitializingRef.current = false;
      });
  }, [
    issue?.IssueId ?? issue?.issueId ?? issue?.issue_id ?? null,
    issue?.PdfUrl ?? issue?.pdfUrl ?? issue?.pdf_url ?? null,
    issue?.FileUrl ?? issue?.fileUrl ?? issue?.file_url ?? null
    // לא נכלול את initializeFlipBook, flipbookContainerRef, flipbookInstanceRef, isInitializingRef, lastPdfUrlRef
    // כי הם refs או functions שלא צריכים לגרום ל-re-run
    // setIsLoading ו-setError הם stable setters מ-useState, אז גם לא צריך אותם
  ]);
}

