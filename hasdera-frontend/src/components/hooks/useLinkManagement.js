/**
 * useLinkManagement.js
 * Hook לניהול קישורים ב-AdminFlipbookViewer - גרסה מתוקנת
 * 
 * תיקונים:
 * - הסרת סנכרון כפול
 * - שמירת page נכונה
 * - פישוט הלוגיקה
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { 
  Link, 
  Mail, 
  ExternalLink, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  Heart, 
  ShoppingCart, 
  User, 
  Home 
} from "lucide-react";

// ============================================
// Constants
// ============================================
const AVAILABLE_ICONS = [
  { name: 'Link', component: Link },
  { name: 'Mail', component: Mail },
  { name: 'ExternalLink', component: ExternalLink },
  { name: 'Phone', component: Phone },
  { name: 'MapPin', component: MapPin },
  { name: 'Calendar', component: Calendar },
  { name: 'Clock', component: Clock },
  { name: 'Star', component: Star },
  { name: 'Heart', component: Heart },
  { name: 'ShoppingCart', component: ShoppingCart },
  { name: 'User', component: User },
  { name: 'Home', component: Home },
];

const DEFAULT_LINK_FORM = {
  type: 'url',
  url: '',
  email: '',
  icon: 'Link',
  page: 1,
  x: 0,
  y: 0,
  width: 100,
  height: 50
};

// ============================================
// Helper Functions
// ============================================
const normalizeLink = (link, index = 0) => ({
  id: String(link.id || link.Id || Date.now() + index),
  page: Number(link.page || link.Page || 1),
  x: Number(link.x || link.X || 0),
  y: Number(link.y || link.Y || 0),
  width: Number(link.width || link.Width || 100),
  height: Number(link.height || link.Height || 50),
  url: String(link.url || link.Url || ''),
  icon: String(link.icon || link.Icon || 'Link'),
  email: String(link.email || link.Email || '')
});

const normalizeLinks = (linksArray) => {
  if (!Array.isArray(linksArray)) return [];
  return linksArray.map((link, index) => normalizeLink(link, index));
};

// ============================================
// Main Hook
// ============================================
export function useLinkManagement(
  currentPage, 
  totalPages, 
  flipbookWrapperRef, 
  externalLinks,      // הקישורים מה-parent
  setExternalLinks    // פונקציה לעדכון הקישורים ב-parent
) {
  // State
  const [editingLink, setEditingLink] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkForm, setLinkForm] = useState(DEFAULT_LINK_FORM);
  const [isDraggingLink, setIsDraggingLink] = useState(false);
  const [draggingLinkId, setDraggingLinkId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPlacingLink, setIsPlacingLink] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Ref לזיהוי שינויים אמיתיים
  const lastExternalLinksRef = useRef(null);

  // ============================================
  // Links Management - עובדים ישירות עם externalLinks
  // ============================================
  
  // קבלת הקישורים הנוכחיים (מנורמלים)
  const links = normalizeLinks(externalLinks);

  // עדכון קישורים - שולח ישירות ל-parent
  const updateLinks = useCallback((newLinks) => {
    if (typeof setExternalLinks === 'function') {
      const normalized = normalizeLinks(newLinks);
      setExternalLinks(normalized);
    }
  }, [setExternalLinks]);

  // ============================================
  // Handlers
  // ============================================

  // התחלת הוספת קישור
  const handleAddLink = useCallback(() => {
    console.log('🔗 handleAddLink - starting placement mode');
    setIsPlacingLink(true);
  }, []);

  // מיקום קישור על העמוד
  const handlePlaceLinkOnPage = useCallback((e, pageFromParent) => {
    if (!isPlacingLink || !flipbookWrapperRef.current) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = flipbookWrapperRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - 50);
    const y = Math.max(0, e.clientY - rect.top - 25);
    
    // השתמש בעמוד שהועבר או בעמוד הנוכחי
    const targetPage = pageFromParent || currentPage || 1;
    
    console.log('🔗 handlePlaceLinkOnPage - placing at:', { x, y, targetPage });
    
    setIsPlacingLink(false);
    setIsAddingLink(true);
    setLinkForm({
      ...DEFAULT_LINK_FORM,
      page: targetPage,
      x,
      y
    });
    setShowLinkModal(true);
  }, [isPlacingLink, currentPage, flipbookWrapperRef]);

  // תזוזת עכבר בזמן מיקום
  const handleMouseMoveOnPage = useCallback((e) => {
    if (isPlacingLink) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  }, [isPlacingLink]);

  // עריכת קישור קיים
  const handleEditLink = useCallback((link) => {
    console.log('🔗 handleEditLink - editing:', link);
    setEditingLink(link);
    
    // בדיקה אם זה mailto
    if (link.url && link.url.startsWith('mailto:')) {
      const email = link.url.replace('mailto:', '').split('?')[0];
      setLinkForm({
        ...link,
        type: 'mailto',
        email: email,
        url: ''
      });
    } else {
      setLinkForm({
        ...link,
        type: 'url',
        email: ''
      });
    }
    
    setShowLinkModal(true);
  }, []);

  // מחיקת קישור
  const handleDeleteLink = useCallback((linkId) => {
    console.log('🔗 handleDeleteLink - deleting:', linkId);
    const newLinks = links.filter(l => l.id !== linkId);
    updateLinks(newLinks);
  }, [links, updateLinks]);

  // שמירת קישור (חדש או עריכה)
  const handleSaveLink = useCallback(() => {
    // בניית URL סופי
    let finalUrl = '';
    if (linkForm.type === 'mailto') {
      if (!linkForm.email) {
        alert('אנא הזן כתובת מייל');
        return;
      }
      finalUrl = `mailto:${linkForm.email}`;
    } else {
      if (!linkForm.url) {
        alert('אנא הזן כתובת URL');
        return;
      }
      finalUrl = linkForm.url;
    }
    
    // יצירת אובייקט הקישור
    const linkToSave = {
      id: editingLink ? editingLink.id : String(Date.now()),
      page: Number(linkForm.page) || currentPage || 1,
      x: Number(linkForm.x) || 0,
      y: Number(linkForm.y) || 0,
      width: Number(linkForm.width) || 100,
      height: Number(linkForm.height) || 50,
      url: finalUrl,
      icon: linkForm.icon || 'Link',
      email: linkForm.type === 'mailto' ? linkForm.email : ''
    };
    
    console.log('🔗 handleSaveLink - saving:', linkToSave);
    
    let newLinks;
    if (editingLink) {
      // עדכון קישור קיים
      newLinks = links.map(l => l.id === editingLink.id ? linkToSave : l);
    } else {
      // הוספת קישור חדש
      newLinks = [...links, linkToSave];
    }
    
    updateLinks(newLinks);
    
    // סגירת המודל ואיפוס
    setShowLinkModal(false);
    setIsAddingLink(false);
    setIsPlacingLink(false);
    setEditingLink(null);
    setLinkForm(DEFAULT_LINK_FORM);
  }, [linkForm, editingLink, links, currentPage, updateLinks]);

  // לחיצה על קישור (פתיחה)
  const handleLinkClick = useCallback((link) => {
    if (!link.url) return;
    
    if (link.url.startsWith('mailto:')) {
      window.location.href = link.url;
      return;
    }
    
    try {
      let urlToOpen = link.url;
      if (!urlToOpen.startsWith('http://') && !urlToOpen.startsWith('https://')) {
        urlToOpen = `https://${urlToOpen}`;
      }
      window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening link:', error);
      alert('שגיאה בפתיחת הקישור');
    }
  }, []);

  // התחלת גרירת קישור
  const handleLinkMouseDown = useCallback((e, linkId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const link = links.find(l => l.id === linkId);
    if (!link || !flipbookWrapperRef.current) return;
    
    const rect = flipbookWrapperRef.current.getBoundingClientRect();
    
    setIsDraggingLink(true);
    setDraggingLinkId(linkId);
    setDragOffset({
      x: e.clientX - rect.left - link.x,
      y: e.clientY - rect.top - link.y
    });
  }, [links, flipbookWrapperRef]);

  // סגירת המודל
  const handleCloseModal = useCallback(() => {
    setShowLinkModal(false);
    setIsAddingLink(false);
    setIsPlacingLink(false);
    setEditingLink(null);
    setLinkForm(DEFAULT_LINK_FORM);
  }, []);

  // מחיקה מתוך המודל
  const handleDeleteFromModal = useCallback(() => {
    if (editingLink) {
      handleDeleteLink(editingLink.id);
      handleCloseModal();
    }
  }, [editingLink, handleDeleteLink, handleCloseModal]);

  // ============================================
  // Drag & Drop
  // ============================================
  
  const handleMouseMove = useCallback((e) => {
    if (!isDraggingLink || !draggingLinkId || !flipbookWrapperRef.current) return;
    
    const rect = flipbookWrapperRef.current.getBoundingClientRect();
    const newX = Math.max(0, e.clientX - rect.left - dragOffset.x);
    const newY = Math.max(0, e.clientY - rect.top - dragOffset.y);
    
    const newLinks = links.map(link => 
      link.id === draggingLinkId 
        ? { ...link, x: newX, y: newY }
        : link
    );
    
    updateLinks(newLinks);
  }, [isDraggingLink, draggingLinkId, dragOffset, flipbookWrapperRef, links, updateLinks]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingLink(false);
    setDraggingLinkId(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Effect לגרירה
  useEffect(() => {
    if (isDraggingLink) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingLink, handleMouseMove, handleMouseUp]);

  // ============================================
  // Return
  // ============================================
  return {
    // State
    links,
    editingLink,
    setEditingLink,
    showLinkModal,
    setShowLinkModal,
    isAddingLink,
    setIsAddingLink,
    linkForm,
    setLinkForm,
    isDraggingLink,
    setIsDraggingLink,
    draggingLinkId,
    setDraggingLinkId,
    dragOffset,
    setDragOffset,
    isPlacingLink,
    setIsPlacingLink,
    mousePosition,
    setMousePosition,
    
    // Handlers
    handleAddLink,
    handlePlaceLinkOnPage,
    handleMouseMoveOnPage,
    handleEditLink,
    handleDeleteLink,
    handleSaveLink,
    handleLinkClick,
    handleLinkMouseDown,
    handleCloseModal,
    handleDeleteFromModal,
    handleMouseMove,
    handleMouseUp,
    
    // Constants
    availableIcons: AVAILABLE_ICONS
  };
}