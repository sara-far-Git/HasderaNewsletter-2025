/**
 * usePageTracking.js
 * Hook למעקב אחרי שינויי עמודים ב-FlipBook
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react";

export function usePageTracking(flipbookInstanceRef, flipbookContainerRef, isLoading, setIsLoading, setError, links = []) {
  const currentPageRef = useRef(1);
  const pageChangeHandlersRef = useRef([]);
  const pageChangeCountRef = useRef(0);
  const lastKnownPageRef = useRef(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [isFlipbookReady, setIsFlipbookReady] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Helper function לקבלת העמוד הנוכחי מכל המקורות האפשריים
  const getCurrentPageFromFlipbook = (flipbook) => {
    if (!flipbook) return undefined;
    
    // דרך 1: דרך main.currentPageValue
    if (flipbook.main && flipbook.main.currentPageValue !== undefined && flipbook.main.currentPageValue !== null) {
      try {
        const raw = flipbook.main.currentPageValue.toString().trim();
        if (raw) {
          const pages = raw.split('-').map(s => Number(s)).filter(Number.isFinite);
          if (pages.length > 0) {
            return pages[0];
          }
        }
      } catch (e) {
        // שקט
      }
    }
    
    // דרך 2: דרך DOM
    if (flipbook.bookLayer instanceof HTMLElement) {
      try {
        const dataPage = flipbook.bookLayer.getAttribute('data-current-page');
        if (dataPage) {
          return Number(dataPage);
        }
        
        const classes = flipbook.bookLayer.className.split(' ');
        for (const cls of classes) {
          if (cls.startsWith('page-')) {
            const pageNum = Number(cls.replace('page-', ''));
            if (!isNaN(pageNum)) {
              return pageNum;
            }
          }
        }
        
        const activePage = flipbook.bookLayer.querySelector('.flipbook-page-active, .page-active, [data-page-active="true"]');
        if (activePage) {
          const pageAttr = activePage.getAttribute('data-page') || activePage.getAttribute('data-page-number');
          if (pageAttr) {
            return Number(pageAttr);
          }
        }
      } catch (e) {
        // שקט
      }
    }
    
    // דרך 3: דרך bookLayer (object)
    if (flipbook.bookLayer && !(flipbook.bookLayer instanceof HTMLElement)) {
      if (typeof flipbook.bookLayer.getCurrentPageNumber === 'function') {
        try {
          const page = flipbook.bookLayer.getCurrentPageNumber();
          if (page) return page;
        } catch (e) {}
      }
      if (flipbook.bookLayer.currentPageValue !== undefined && flipbook.bookLayer.currentPageValue !== null) {
        return flipbook.bookLayer.currentPageValue;
      }
    }
    
    // דרך 4: דרך getCurrentPageNumber
    if (typeof flipbook.getCurrentPageNumber === 'function') {
      try {
        return flipbook.getCurrentPageNumber();
      } catch (e) {}
    }
    
    return undefined;
  };

  // Handler משותף לעדכון העמוד הנוכחי
  const handlePageChange = (eventName, page) => {
    try {
      if (page !== undefined && page !== null && page > 0) {
        if (page !== lastKnownPageRef.current) {
          pageChangeCountRef.current += 1;
          lastKnownPageRef.current = page;
          currentPageRef.current = page;
          setCurrentPage(page);
          setForceUpdate(prev => prev + 1);
          console.log(`📄 Page changed via ${eventName}: ${lastKnownPageRef.current} → ${page} (Counter: ${pageChangeCountRef.current})`);
        }
      }
    } catch (e) {
      console.error(`❌ Error in ${eventName} handler:`, e);
    }
  };

  // Polling mechanism למעקב אחרי שינויי עמודים
  useEffect(() => {
    if (!flipbookInstanceRef.current || isLoading) {
      return;
    }
    
    let checkCount = 0;
    const checkCurrentPage = () => {
      try {
        checkCount++;
        const flipbook = flipbookInstanceRef.current;
        if (!flipbook) return;
        
        let page = undefined;
        
        // דרך 1: getCurrentPageNumber()
        if (typeof flipbook.getCurrentPageNumber === 'function') {
          try {
            page = flipbook.getCurrentPageNumber();
          } catch (e) {}
        }
        
        // דרך 2: currentPageValue ישירות
        if (page === undefined && flipbook.currentPageValue !== undefined && flipbook.currentPageValue !== null) {
          page = flipbook.currentPageValue;
        }
        
        // דרך 3: דרך main object
        if (page === undefined && flipbook.main) {
          try {
            if (flipbook.main.currentPageValue !== undefined && flipbook.main.currentPageValue !== null) {
              const raw = flipbook.main.currentPageValue.toString().trim();
              if (raw) {
                const pages = raw.split('-').map(s => Number(s)).filter(Number.isFinite);
                if (pages.length > 0) {
                  page = pages[0];
                }
              }
            }
          } catch (e) {}
        }
        
        // דרך 4: דרך DOM
        if (page === undefined && flipbook.bookLayer instanceof HTMLElement) {
          try {
            const dataPage = flipbook.bookLayer.getAttribute('data-current-page');
            if (dataPage) {
              page = Number(dataPage);
            }
            
            if (page === undefined) {
              const classes = flipbook.bookLayer.className.split(' ');
              for (const cls of classes) {
                if (cls.startsWith('page-') || cls.startsWith('flipbook-page-')) {
                  const pageNum = Number(cls.replace(/^(page-|flipbook-page-)/, ''));
                  if (!isNaN(pageNum) && pageNum > 0) {
                    page = pageNum;
                    break;
                  }
                }
              }
            }
            
            if (page === undefined) {
              const activePage = flipbook.bookLayer.querySelector('.flipbook-page-active, .page-active, [data-page-active="true"], .flipbook-page-current, .current-page');
              if (activePage) {
                const pageAttr = activePage.getAttribute('data-page') || activePage.getAttribute('data-page-number') || activePage.getAttribute('data-current-page');
                if (pageAttr) {
                  page = Number(pageAttr);
                } else {
                  const activeClasses = activePage.className.split(' ');
                  for (const cls of activeClasses) {
                    if (cls.startsWith('page-') || cls.startsWith('flipbook-page-')) {
                      const pageNum = Number(cls.replace(/^(page-|flipbook-page-)/, ''));
                      if (!isNaN(pageNum) && pageNum > 0) {
                        page = pageNum;
                        break;
                      }
                    }
                  }
                }
              }
            }
            
            if (page === undefined) {
              const allPageElements = flipbook.bookLayer.querySelectorAll('[class*="page-"], [class*="flipbook-page-"], [data-page], [data-page-number]');
              for (const elem of allPageElements) {
                const style = window.getComputedStyle(elem);
                const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0;
                const hasActiveClass = elem.classList.contains('active') || elem.classList.contains('current') || elem.classList.contains('flipbook-page-active');
                
                if (isVisible || hasActiveClass) {
                  const pageAttr = elem.getAttribute('data-page') || elem.getAttribute('data-page-number');
                  if (pageAttr) {
                    const pageNum = Number(pageAttr);
                    if (!isNaN(pageNum) && pageNum > 0) {
                      page = pageNum;
                      break;
                    }
                  }
                  
                  const classes = elem.className.split(' ');
                  for (const cls of classes) {
                    const match = cls.match(/(?:^|[-_])(?:page|flipbook-page)[-_]?(\d+)/i);
                    if (match) {
                      const pageNum = Number(match[1]);
                      if (!isNaN(pageNum) && pageNum > 0) {
                        page = pageNum;
                        break;
                      }
                    }
                  }
                  
                  if (page !== undefined) break;
                }
              }
            }
          } catch (e) {
            console.error('Error in DOM page detection:', e);
          }
        }
        
        const currentPageValue = currentPageRef.current;
        
        if (page !== undefined && page !== null && page > 0) {
          if (page !== lastKnownPageRef.current) {
            pageChangeCountRef.current += 1;
            lastKnownPageRef.current = page;
            console.log(`📄 Page changed via polling: ${currentPageValue} → ${page} (Counter: ${pageChangeCountRef.current})`);
            currentPageRef.current = page;
            setCurrentPage(page);
            setForceUpdate(prev => prev + 1);
          }
        }
      } catch (e) {
        console.error('❌ Error in polling check:', e);
      }
    };
    
    const intervalId = setInterval(checkCurrentPage, 100);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isLoading, flipbookInstanceRef]);

  // Filtered links for current page
  const filteredLinksForCurrentPage = useMemo(() => {
    const flipbook = flipbookInstanceRef.current;
    const isBookLayerReady = flipbook?.bookLayer instanceof HTMLElement;
    const isBookReady = flipbook?.book instanceof HTMLElement;
    
    if (isLoading || !isFlipbookReady || !totalPages || totalPages === 0 || !flipbook || (!isBookLayerReady && !isBookReady)) {
      return [];
    }
    
    if (!links || links.length === 0) {
      return [];
    }
    
    let actualPage = lastKnownPageRef.current || currentPageRef.current || currentPage || 1;
    
    if (flipbookInstanceRef.current?.main?.currentPageValue) {
      try {
        const raw = flipbookInstanceRef.current.main.currentPageValue.toString().trim();
        if (raw) {
          const pages = raw.split('-').map(s => Number(s)).filter(Number.isFinite);
          if (pages.length > 0) {
            actualPage = pages[0];
          }
        }
      } catch (e) {
        // שקט
      }
    }
    
    if (flipbookInstanceRef.current?.bookLayer instanceof HTMLElement) {
      try {
        const dataPage = flipbookInstanceRef.current.bookLayer.getAttribute('data-current-page');
        if (dataPage) {
          actualPage = Number(dataPage);
        }
      } catch (e) {
        // שקט
      }
    }
    
    if (flipbookInstanceRef.current) {
      try {
        const flipbookPage = flipbookInstanceRef.current.getCurrentPageNumber?.();
        if (flipbookPage !== undefined && flipbookPage !== null && flipbookPage > 0) {
          actualPage = flipbookPage;
        }
      } catch (e) {
        // שקט
      }
    }
    
    if (actualPage !== lastKnownPageRef.current) {
      pageChangeCountRef.current += 1;
      lastKnownPageRef.current = actualPage;
    }
    if (actualPage !== currentPageRef.current) {
      currentPageRef.current = actualPage;
      if (actualPage !== currentPage) {
        setCurrentPage(actualPage);
      }
    }
    
    console.log('🎯 useMemo filteredLinksForCurrentPage:', { actualPage, linksLength: links.length, links: links.map(l => ({ id: l.id, page: l.page })) });
    
    const filtered = links.filter(link => {
      const linkPage = Number(link.page);
      const currentPageNum = Number(actualPage);
      console.log('🎯 Filter check:', { linkId: link.id, linkPage, currentPageNum, matches: linkPage === currentPageNum });
      return linkPage === currentPageNum;
    });
    
    console.log('🎯 filteredLinksForCurrentPage:', { actualPage, totalLinks: links.length, filteredCount: filtered.length, filtered });
    
    return filtered;
  }, [links, currentPage, forceUpdate, isLoading, isFlipbookReady, totalPages, flipbookInstanceRef, currentPageRef, lastKnownPageRef, pageChangeCountRef, setCurrentPage]);

  // Navigation helpers
  const goToPrevPage = useCallback(() => {
    flipbookInstanceRef.current?.prevPage?.();
  }, [flipbookInstanceRef]);

  const goToNextPage = useCallback(() => {
    flipbookInstanceRef.current?.nextPage?.();
  }, [flipbookInstanceRef]);

  const canGoPrev = currentPage > 1;
  const canGoNext = totalPages ? currentPage < totalPages : false;

  return {
    currentPage,
    totalPages,
    isFlipbookReady,
    setCurrentPage,
    setTotalPages,
    setIsFlipbookReady,
    goToPrevPage,
    goToNextPage,
    canGoPrev,
    canGoNext,
    filteredLinksForCurrentPage,
    forceUpdate,
    setForceUpdate,
    currentPageRef,
    pageChangeHandlersRef,
    pageChangeCountRef,
    lastKnownPageRef,
    handlePageChange,
    getCurrentPageFromFlipbook
  };
}

