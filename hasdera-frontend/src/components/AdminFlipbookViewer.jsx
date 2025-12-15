/**
 * AdminFlipbookViewer.jsx
 * צופה מגזין מתקדם עם Real3D FlipBook - גרסה משופרת
 */

import React, { 
  useEffect, 
  useRef, 
  useState, 
  useCallback, 
  useMemo 
} from "react";
import { createPortal } from 'react-dom';
import { useNavigate } from "react-router-dom";
import { 
  Link, 
  Save, 
  Send, 
  Plus, 
  Trash2 
} from "lucide-react";
import { 
  getIssueById, 
  updateIssueMetadata, 
  publishIssue,
  createIssue 
} from "../Services/issuesService";
import { clearAdplacementsForIssue } from "../Services/slotsService";
import {
  FlipbookStyles,
  ViewerContainer,
  BackgroundImage,
  Header,
  HeaderTitle,
  HeaderActions,
  ActionButton,
  IconButton,
  CloseButton,
  FlipbookWrapper,
  FlipbookContainer,
  NavigationArrow,
  LoadingOverlay,
  Spinner,
  LoadingText,
  ErrorBox,
  ErrorTitle,
  ErrorMessage,
  RetryButton,
  LinkOverlay,
  LinkBadge,
  LinkIconWrapper,
  CursorIcon,
  ZoomInIcon,
  ZoomOutIcon,
  MaximizeIcon,
  HomeIcon,
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "./AdminFlipbookViewer.styles";
import LinkModal from "./LinkModal";
import { useLinkManagement } from "./hooks/useLinkManagement";
import { usePageTracking } from "./hooks/usePageTracking";
import { useFlipbookInitialization } from "./hooks/useFlipbookInitialization";

// ============================================
// Constants
// ============================================
const CLEANUP_ERRORS_TO_IGNORE = [
  'RenderingCancelledException',
  'AbortError',
  'MissingPDFException',
  'Transport destroyed',
  'signal is aborted',
  'Cannot read properties of null',
  'renderBookPage',
  'Rendering cancelled',
  'Missing PDF'
];

// ============================================
// Helper Functions
// ============================================
const getPdfUrl = (issue) => {
  if (!issue) return null;
  const url = issue.PdfUrl || issue.FileUrl || issue.pdf_url || issue.pdfUrl || issue.fileUrl;
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return null;
  return trimmed;
};

const parseLinks = (summary) => {
  if (!summary) return [];
  try {
    const metadata = JSON.parse(summary);
    if (!metadata.links || !Array.isArray(metadata.links)) return [];
    return metadata.links.map((link, index) => ({
      id: String(link.id || link.Id || Date.now() + index),
      page: Number(link.page || link.Page || 1),
      x: Number(link.x || link.X || 0),
      y: Number(link.y || link.Y || 0),
      width: Number(link.width || link.Width || 100),
      height: Number(link.height || link.Height || 50),
      url: String(link.url || link.Url || ''),
      icon: link.icon || link.Icon || 'Link',
      email: link.email || link.Email || ''
    }));
  } catch (e) {
    console.error('Error parsing links:', e);
    return [];
  }
};

const formatLinksForSave = (links) => {
  return (links || []).map(link => ({
    Id: String(link.id || link.Id || ''),
    Page: Number(link.page || link.Page || 1),
    X: Number(link.x || link.X || 0),
    Y: Number(link.y || link.Y || 0),
    Width: Number(link.width || link.Width || 100),
    Height: Number(link.height || link.Height || 50),
    Url: String(link.url || link.Url || ''),
    Icon: link.icon || link.Icon || 'Link',
    Email: link.email || link.Email || ''
  }));
};

const isCleanupError = (error) => {
  const message = error?.message || String(error || '');
  const name = error?.name || '';
  return CLEANUP_ERRORS_TO_IGNORE.some(pattern => 
    message.includes(pattern) || name.includes(pattern)
  );
};

// ============================================
// Custom Hooks
// ============================================
const useGlobalErrorHandler = () => {
  useEffect(() => {
    const handler = (event) => {
      if (isCleanupError(event.reason)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };
    window.addEventListener('unhandledrejection', handler, true);
    return () => window.removeEventListener('unhandledrejection', handler, true);
  }, []);
};

const useKeyboardNavigation = (isFullscreen, onClose, goToPrevPage, goToNextPage) => {
  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case 'Escape':
          isFullscreen ? document.exitFullscreen?.() : onClose?.();
          break;
        case 'ArrowRight':
          goToPrevPage?.();
          break;
        case 'ArrowLeft':
          goToNextPage?.();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen, onClose, goToPrevPage, goToNextPage]);
};

const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);
  
  const toggleFullscreen = useCallback(() => {
    document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.();
  }, []);
  
  return { isFullscreen, toggleFullscreen };
};

// ============================================
// Sub-Components
// ============================================
const LoadingState = () => (
  <LoadingOverlay>
    <Spinner />
    <LoadingText>טוען את המגזין...</LoadingText>
  </LoadingOverlay>
);

const ErrorState = ({ error, onRetry }) => (
  <LoadingOverlay>
    <ErrorBox>
      <ErrorTitle>שגיאה בטעינה</ErrorTitle>
      <ErrorMessage>{error}</ErrorMessage>
      <RetryButton onClick={onRetry}>נסה שוב</RetryButton>
    </ErrorBox>
  </LoadingOverlay>
);

const NoPdfState = ({ onNavigate }) => (
  <LoadingOverlay>
    <ErrorBox>
      <ErrorTitle>אין קובץ PDF זמין</ErrorTitle>
      <ErrorMessage>
        הגיליון הזה הוא טיוטה ועדיין לא הועלה אליו קובץ PDF.
        <br />
        אנא העלה קובץ PDF דרך ניהול הגיליונות.
      </ErrorMessage>
      <RetryButton onClick={onNavigate}>חזרה לניהול גיליונות</RetryButton>
    </ErrorBox>
  </LoadingOverlay>
);

const PlacingLinkIndicator = ({ mousePosition }) => (
  <>
    <CursorIcon style={{ left: mousePosition.x, top: mousePosition.y }}>
      <Link size={32} />
    </CursorIcon>
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '50%',
      transform: 'translateX(50%)',
      background: 'rgba(20, 184, 166, 0.9)',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 600,
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      לחץ על הדף כדי למקם קישור
    </div>
  </>
);

const NavigationArrows = ({ canGoPrev, canGoNext, goToPrevPage, goToNextPage }) => (
  <>
    <NavigationArrow 
      $side="right" 
      $disabled={!canGoPrev}
      onClick={canGoPrev ? goToPrevPage : undefined}
      title={canGoPrev ? "עמוד קודם" : "אין עמוד קודם"}
      disabled={!canGoPrev}
    >
      <ChevronRightIcon />
    </NavigationArrow>
    <NavigationArrow 
      $side="left" 
      $disabled={!canGoNext}
      onClick={canGoNext ? goToNextPage : undefined}
      title={canGoNext ? "עמוד הבא" : "אין עמוד הבא"}
      disabled={!canGoNext}
    >
      <ChevronLeftIcon />
    </NavigationArrow>
  </>
);

// Link Overlay Component
const LinkOverlayItem = React.memo(({ 
  link, isEditing, isDragging, isPublished, IconComponent,
  onMouseDown, onClick, onDoubleClick, onEdit, onDelete, displayX, displayY
}) => (
  <LinkOverlay
    x={displayX}
    y={displayY}
    width={link.width}
    height={link.height}
    $isEditing={isEditing}
    $showAnimation={true}
    onMouseDown={onMouseDown}
    onClick={onClick}
    onDoubleClick={onDoubleClick}
    style={{ 
      cursor: isDragging ? 'grabbing' : 'pointer',
      pointerEvents: 'auto',
      position: 'absolute',
      left: `${displayX}px`,
      top: `${displayY}px`
    }}
  >
    <LinkBadge $isBlinking={isPublished} $showAnimation={true}>
      <LinkIconWrapper>
        <IconComponent size={18} />
      </LinkIconWrapper>
    </LinkBadge>
    <div 
      style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 6, zIndex: 50 }} 
      onClick={e => e.stopPropagation()}
    >
      <IconButton title="ערוך" onClick={onEdit} style={{ padding: 6 }}>
        <Save size={14} />
      </IconButton>
      <IconButton title="מחק" onClick={onDelete} style={{ padding: 6 }}>
        <Trash2 size={14} />
      </IconButton>
    </div>
  </LinkOverlay>
));
LinkOverlayItem.displayName = 'LinkOverlayItem';

// ============================================
// Main Component
// ============================================
export default function AdminFlipbookViewer({ 
  issueId, 
  onClose, 
  issue: propIssue, 
  slots: propSlots, 
  showSlotsManagement = false 
}) {
  const navigate = useNavigate();
  
  // Refs
  const flipbookContainerRef = useRef(null);
  const flipbookInstanceRef = useRef(null);
  const flipbookWrapperRef = useRef(null);
  const isInitializingRef = useRef(false);
  const lastPdfUrlRef = useRef(null);
  const currentPageRef = useRef(1);
  const pageChangeHandlersRef = useRef([]);
  
  // Core State
  const [issue, setIssue] = useState(propIssue || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [links, setLinks] = useState([]);
  
  // Custom Hooks
  useGlobalErrorHandler();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  
  // Page Tracking Hook
  const {
    currentPage, totalPages, isFlipbookReady,
    setCurrentPage, setTotalPages, setIsFlipbookReady,
    goToPrevPage, goToNextPage, canGoPrev, canGoNext,
    forceUpdate, setForceUpdate, handlePageChange, getCurrentPageFromFlipbook
  } = usePageTracking(flipbookInstanceRef, flipbookContainerRef, isLoading, setIsLoading, setError, links);

  // Link Management Hook
  const {
    links: managedLinks, // הקישורים המנוהלים ע"י ה-hook
    editingLink, showLinkModal, isAddingLink, linkForm, setLinkForm,
    mousePosition, isDraggingLink, draggingLinkId, isPlacingLink,
    handleAddLink, handlePlaceLinkOnPage, handleMouseMoveOnPage,
    handleEditLink, handleDeleteLink, handleSaveLink, handleLinkClick,
    handleLinkMouseDown, handleCloseModal, handleDeleteFromModal, availableIcons
  } = useLinkManagement(currentPage, totalPages, flipbookWrapperRef, links, setLinks);
  
  // השתמש בקישורים מה-hook (הם מנורמלים)
  const activeLinks = managedLinks || links;

  // Close handler
  const handleClose = useCallback(() => {
    onClose ? onClose() : navigate('/admin/issues');
  }, [onClose, navigate]);

  useKeyboardNavigation(isFullscreen, handleClose, goToPrevPage, goToNextPage);

  // Derived State
  const pdfUrl = useMemo(() => getPdfUrl(issue), [issue]);
  
  const pdfReady = useMemo(() => {
    try {
      return !isLoading && isFlipbookReady && !error && totalPages > 0 && 
             flipbookInstanceRef.current?.bookLayer instanceof HTMLElement;
    } catch { return false; }
  }, [isLoading, isFlipbookReady, error, totalPages]);

  const linksForCurrentPage = useMemo(() => {
    if (!currentPage || !activeLinks.length) return [];
    const filtered = activeLinks.filter(l => Number(l.page) === Number(currentPage));
    console.log('🔗 linksForCurrentPage:', { currentPage, total: activeLinks.length, filtered: filtered.length });
    return filtered;
  }, [activeLinks, currentPage]);

  // Initialize FlipBook
  useFlipbookInitialization(
    issue, flipbookContainerRef, flipbookInstanceRef,
    setIsLoading, setError, setIsFlipbookReady, setTotalPages,
    currentPageRef, setCurrentPage, pageChangeHandlersRef, setForceUpdate,
    isInitializingRef, lastPdfUrlRef, handlePageChange, getCurrentPageFromFlipbook
  );

  // Load Issue Data
  useEffect(() => {
    if (!issueId) return;
    const loadIssue = async () => {
      try {
        const data = await getIssueById(issueId);
        setIssue(data);
        setIsPublished(data.isPublished || false);
        setLinks(parseLinks(data.Summary || data.summary));
        if (!getPdfUrl(data)) setIsLoading(false);
      } catch (err) {
        console.error('Error loading issue:', err);
        setError('שגיאה בטעינת הגיליון: ' + err.message);
        setIsLoading(false);
      }
    };
    loadIssue();
  }, [issueId]);

  // Placement Click Handler
  useEffect(() => {
    if (!flipbookContainerRef.current || !isPlacingLink) return;
    const container = flipbookContainerRef.current;
    const captureHandler = (e) => handlePlaceLinkOnPage(e, currentPage);
    const events = ['pointerup', 'mouseup', 'touchend'];
    events.forEach(event => container.addEventListener(event, captureHandler, { capture: true }));
    return () => events.forEach(event => container.removeEventListener(event, captureHandler, { capture: true }));
  }, [isPlacingLink, handlePlaceLinkOnPage, currentPage]);

  // Cleanup
  useEffect(() => {
    return () => {
      pageChangeHandlersRef.current.forEach(({ cleanup, type, handler }) => {
        try {
          cleanup ? cleanup() : type === 'window' && window.removeEventListener('r3d-pagechange', handler);
        } catch {}
      });
      pageChangeHandlersRef.current = [];
      
      if (flipbookInstanceRef.current) {
        try {
          const webgl = flipbookInstanceRef.current.webgl;
          if (webgl) {
            const canvas = webgl instanceof HTMLElement ? webgl.querySelector('canvas') : webgl?.canvas;
            if (canvas) {
              const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
              gl?.getExtension('WEBGL_lose_context')?.loseContext();
            }
          }
          flipbookInstanceRef.current.destroy?.() || flipbookInstanceRef.current.dispose?.();
        } catch {}
        flipbookInstanceRef.current = null;
      }
      if (flipbookContainerRef.current) flipbookContainerRef.current.innerHTML = '';
    };
  }, []);

  // Save Draft
  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateIssueMetadata(issueId, {
        Title: issue?.Title || issue?.title || '',
        Links: formatLinksForSave(activeLinks),
        Animations: [],
      });
      setIssue(await getIssueById(issueId));
      navigate('/admin/issues');
    } catch (err) {
      console.error('Error saving draft:', err);
      alert('שגיאה בשמירת הטיוטה');
    } finally {
      setIsSaving(false);
    }
  }, [issueId, issue, activeLinks, navigate]);

  // Publish
  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    try {
      await updateIssueMetadata(issueId, {
        Title: issue?.Title || issue?.title || '',
        Links: formatLinksForSave(activeLinks),
        Animations: [],
      });
      await publishIssue(issueId);
      try { await clearAdplacementsForIssue(issueId); } catch {}
      try { await createIssue({ Title: "גיליון חדש", Links: [], Animations: [] }); } catch {}
      setIsPublished(true);
      alert('הגיליון פורסם בהצלחה!');
    } catch (err) {
      console.error('Error publishing:', err);
      alert('שגיאה בפרסום הגיליון');
    } finally {
      setIsPublishing(false);
    }
  }, [issueId, issue, activeLinks]);

  // Get page target for portal - נשתמש ב-wrapper ישירות
  const getPageTarget = useCallback((pageNum) => {
    // במקום לחפש עמוד ספציפי, נחזיר את ה-wrapper
    // הקישורים יוצגו עם position absolute על ה-wrapper
    return flipbookWrapperRef.current;
  }, []);

  // Calculate display coordinates - פשוט יותר, ישירות על ה-wrapper
  const calculateDisplayCoords = useCallback((link, pageTarget) => {
    // הקואורדינטות כבר יחסיות ל-wrapper
    return { 
      x: Number(link.x) || 0, 
      y: Number(link.y) || 0 
    };
  }, []);

  // Render link overlays - ללא Portal, ישירות על ה-wrapper
  const renderLinkOverlays = useMemo(() => {
    if (!pdfReady || !linksForCurrentPage.length) {
      console.log('🔗 renderLinkOverlays: skipping', { pdfReady, linksCount: linksForCurrentPage.length });
      return null;
    }
    
    console.log('🔗 renderLinkOverlays: rendering', linksForCurrentPage.length, 'links');
    
    return linksForCurrentPage.map(link => {
      const IconComponent = availableIcons.find(i => i.name === (link.icon || 'Link'))?.component || Link;
      const displayX = Number(link.x) || 0;
      const displayY = Number(link.y) || 0;
      
      console.log('🔗 Rendering link:', { id: link.id, page: link.page, x: displayX, y: displayY });
      
      // רינדור ישיר ללא Portal
      return (
        <LinkOverlayItem
          key={link.id}
          link={link}
          isEditing={editingLink?.id === link.id}
          isDragging={isDraggingLink && draggingLinkId === link.id}
          isPublished={isPublished}
          IconComponent={IconComponent}
          displayX={displayX}
          displayY={displayY}
          onMouseDown={(e) => { e.stopPropagation(); handleLinkMouseDown(e, link.id); }}
          onClick={(e) => { e.stopPropagation(); !isDraggingLink && (link.url?.trim() ? handleLinkClick(link) : handleEditLink(link)); }}
          onDoubleClick={(e) => { e.stopPropagation(); !isDraggingLink && handleEditLink(link); }}
          onEdit={() => handleEditLink(link)}
          onDelete={() => handleDeleteLink(link.id)}
        />
      );
    });
  }, [pdfReady, linksForCurrentPage, availableIcons, editingLink, isDraggingLink, draggingLinkId, isPublished, handleLinkMouseDown, handleLinkClick, handleEditLink, handleDeleteLink]);

  // Render preview overlay - ללא Portal
  const renderPreviewOverlay = useMemo(() => {
    if (!pdfReady || !showLinkModal || !linkForm?.page) return null;
    
    const displayX = Number(linkForm.x) || 0;
    const displayY = Number(linkForm.y) || 0;
    const IconComponent = availableIcons.find(i => i.name === (linkForm.icon || 'Link'))?.component || Link;
    const isCurrentPage = Number(linkForm.page) === Number(currentPage);
    
    return (
      <LinkOverlay
        key={`preview-${linkForm.id || 'new'}`}
        x={displayX}
        y={displayY}
        width={linkForm.width || 100}
        height={linkForm.height || 50}
        $isEditing={true}
        $showAnimation={true}
        style={{ pointerEvents: 'none', opacity: isCurrentPage ? 1 : 0.6 }}
      >
        <LinkBadge $isBlinking={false} $showAnimation={true}>
          <LinkIconWrapper><IconComponent size={18} /></LinkIconWrapper>
        </LinkBadge>
      </LinkOverlay>
    );
  }, [pdfReady, showLinkModal, linkForm, currentPage, availableIcons]);

  // Early return
  if (!issue) {
    return <LoadingOverlay><Spinner /><LoadingText>טוען גיליון...</LoadingText></LoadingOverlay>;
  }

  const showNoPdf = !isLoading && !error && !isFlipbookReady && !totalPages && !pdfUrl;

  return (
    <ViewerContainer>
      <FlipbookStyles />
      <BackgroundImage />
      
      <Header>
        <HeaderTitle>{issue?.Title || issue?.title || 'גיליון'}</HeaderTitle>
        <HeaderActions>
          <ActionButton onClick={handleAddLink} $variant="primary">
            <Plus size={18} />הוסף קישור
          </ActionButton>
          <ActionButton onClick={handleSaveDraft} disabled={isSaving} $variant="primary">
            <Save size={18} />{isSaving ? 'שומר...' : 'שמור טיוטה'}
          </ActionButton>
          <ActionButton onClick={handlePublish} disabled={isPublishing} $variant="success">
            <Send size={18} />{isPublishing ? 'מפרסם...' : 'פרסם'}
          </ActionButton>
          <IconButton onClick={() => flipbookInstanceRef.current?.zoomOut?.()} title="הקטן"><ZoomOutIcon /></IconButton>
          <IconButton onClick={() => flipbookInstanceRef.current?.zoomIn?.()} title="הגדל"><ZoomInIcon /></IconButton>
          <IconButton onClick={toggleFullscreen} title="מסך מלא"><MaximizeIcon /></IconButton>
          <IconButton onClick={() => navigate('/admin/issues')} title="חזרה לניהול גליונות"><HomeIcon /></IconButton>
          <CloseButton onClick={handleClose} title="סגור (ESC)"><CloseIcon /></CloseButton>
        </HeaderActions>
      </Header>

      {!isLoading && !error && (
        <NavigationArrows canGoPrev={canGoPrev} canGoNext={canGoNext} goToPrevPage={goToPrevPage} goToNextPage={goToNextPage} />
      )}

      {isLoading && !error && <LoadingState />}
      {error && <ErrorState error={error} onRetry={() => window.location.reload()} />}
      {showNoPdf && <NoPdfState onNavigate={() => navigate('/admin/issues')} />}
      {isPlacingLink && <PlacingLinkIndicator mousePosition={mousePosition} />}

      {!error && (
        <FlipbookWrapper 
          ref={flipbookWrapperRef}
          onClick={isPlacingLink ? handlePlaceLinkOnPage : undefined}
          onMouseMove={handleMouseMoveOnPage}
          style={{ cursor: isPlacingLink ? 'crosshair' : 'default', position: 'relative' }}
        >
          <FlipbookContainer ref={flipbookContainerRef} />
          
          {/* Links Container - position relative לקישורים */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            pointerEvents: 'none',
            zIndex: 100
          }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
              {renderPreviewOverlay}
              {renderLinkOverlays}
            </div>
          </div>
        </FlipbookWrapper>
      )}

      {showLinkModal && (
        <LinkModal
          show={showLinkModal}
          linkForm={linkForm}
          setLinkForm={setLinkForm}
          onSave={handleSaveLink}
          onClose={handleCloseModal}
          isAddingLink={isAddingLink}
          editingLink={editingLink}
          onDelete={handleDeleteFromModal}
          availableIcons={availableIcons}
          totalPages={totalPages}
        />
      )}
    </ViewerContainer>
  );
}