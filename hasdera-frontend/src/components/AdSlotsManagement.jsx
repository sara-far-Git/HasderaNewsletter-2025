/**
 * AdSlotsManagement.jsx
 * ניהול מקומות פרסום - תצוגת flipbook של מקומות פרסום בגיליון
 * - תפוס: מציג מי תפס + פרטי מפרסם
 * - פנוי: לחיצה פותחת הזמנה טלפונית (פרטי מפרסם, העלאת מודעה, תשלום)
 */

import { useEffect, useMemo, useState, useCallback, useRef, forwardRef } from 'react';
import styled, { keyframes } from 'styled-components';
import HTMLFlipBook from 'react-pageflip';
import { FileText, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getIssues, getIssueSlots, bookIssueSlot, updateIssueSlotBooking, updateIssueSlotPlacement } from '../Services/issuesService';
import { getAdvertisers } from '../Services/advertisersService';
import { adminUploadCreative } from '../Services/creativesService';
import AdPlacementSelector from './AdPlacementSelector';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
`;

const TopRow = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 520px;
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  appearance: none;
  padding-right: 3rem;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(16, 185, 129, 0.3);
  }

  &:focus {
    outline: none;
    border-color: rgba(16, 185, 129, 0.5);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  option {
    background: #1e293b;
    color: white;
  }
`;

const SelectIcon = styled(ChevronDown)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: rgba(255, 255, 255, 0.5);
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  padding: 0.9rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  display: flex;
  gap: 0.6rem;
  align-items: center;
`;

const StatValue = styled.div`
  font-weight: 700;
  color: ${p => (p.$variant === 'available' ? '#10b981' : p.$variant === 'occupied' ? '#ef4444' : 'white')};
`;

const MainRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const BookShell = styled.div`
  min-height: 620px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.div`
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
`;

const Sidebar = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 420px;
  max-width: 92vw;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 200;
  padding: 1.25rem;
  animation: ${slideIn} 0.25s ease-out;
  overflow-y: auto;
  direction: rtl;
`;

const SidebarTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  color: white;
  font-size: 1.1rem;
`;

const SidebarSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const Label = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.35rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: white;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: rgba(16, 185, 129, 0.5);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const SidebarSelect = styled(Select)`
  max-width: 100%;
`;

const PrimaryButton = styled.button`
  flex: 1;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.18);
  color: #10b981;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.26);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const BookPage = styled.div`
  width: 360px;
  height: 510px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  direction: rtl;
  color: #0f172a;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
`;

const SlotTitle = styled.div`
  font-weight: 800;
  color: #0f172a;
  font-size: 1.05rem;
`;

const SlotMeta = styled.div`
  color: rgba(15, 23, 42, 0.7);
  font-size: 0.9rem;
  margin-top: 0.35rem;
`;

const SlotBox = styled.button`
  margin-top: 1rem;
  flex: 1;
  border-radius: 12px;
  border: 1px dashed rgba(15, 23, 42, 0.25);
  background: rgba(248, 250, 252, 1);
  color: rgba(15, 23, 42, 0.9);
  cursor: pointer;
  padding: 1rem;
  text-align: right;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(241, 245, 249, 1);
    border-color: rgba(16, 185, 129, 0.5);
  }
`;

const StatusLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  color: ${p => (p.$occupied ? '#ef4444' : '#10b981')};
  font-weight: 700;
`;

function normalizeIssueId(issue) {
  return issue?.issueId ?? issue?.issue_id ?? issue?.Issue_id;
}

function normalizeIssueTitle(issue) {
  return issue?.title ?? issue?.Title ?? '';
}

function normalizeIssueDate(issue) {
  return issue?.issueDate ?? issue?.issue_date ?? issue?.Issue_date ?? null;
}

function normalizeSlotsPayload(payload) {
  const rawSlots = payload?.slots ?? payload?.Slots ?? [];
  return rawSlots.map(s => ({
    slotId: s.slotId ?? s.SlotId,
    code: s.code ?? s.Code,
    name: s.name ?? s.Name,
    basePrice: s.basePrice ?? s.BasePrice,
    isOccupied: s.isOccupied ?? s.IsOccupied,
    occupiedQuarters: s.occupiedQuarters ?? s.OccupiedQuarters ?? [],
    occupiedBy: s.occupiedBy ?? s.OccupiedBy ?? null,
  }));
}

function normalizeOrderStatus(occupiedBy) {
  return occupiedBy?.orderStatus ?? occupiedBy?.OrderStatus ?? null;
}

function paymentStatusLabel(status) {
  const s = String(status ?? '').toLowerCase();
  if (!s) return '—';
  if (s === 'paid') return 'שולם';
  if (s === 'pending') return 'ממתין';
  if (s === 'failed') return 'נכשל';
  if (s === 'refunded') return 'הוחזר';
  if (s === 'canceled') return 'בוטל';
  return s;
}

const SlotPage = forwardRef(function SlotPage({ slot, onClick }, ref) {
  const occupiedCount = Array.isArray(slot.occupiedQuarters) ? slot.occupiedQuarters.length : 0;
  const fullyOccupied = !!slot.isOccupied || occupiedCount >= 4;
  const partiallyOccupied = !fullyOccupied && occupiedCount > 0;
  const buyer = slot.occupiedBy;

  return (
    <BookPage ref={ref} data-density="soft">
      <div>
        <SlotTitle>{slot.name}</SlotTitle>
        <SlotMeta>{slot.code}{slot.basePrice != null ? ` · מחיר בסיס: ${slot.basePrice}` : ''}</SlotMeta>
        <StatusLine $occupied={fullyOccupied}>
          {fullyOccupied ? <XCircle size={18} /> : <CheckCircle size={18} />}
          {fullyOccupied ? 'תפוס' : (partiallyOccupied ? 'תפוס חלקית' : 'פנוי')}
        </StatusLine>
      </div>

      <SlotBox onClick={() => onClick(slot)}>
        {fullyOccupied ? (
          <div>
            <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>נקנה ע"י</div>
            <div>{buyer?.advertiserName ?? buyer?.AdvertiserName ?? '—'}</div>
            {(buyer?.phone || buyer?.Phone) && <div style={{ opacity: 0.85, marginTop: '0.25rem' }}>{buyer?.phone ?? buyer?.Phone}</div>}
            {(buyer?.email || buyer?.Email) && <div style={{ opacity: 0.85, marginTop: '0.25rem' }}>{buyer?.email ?? buyer?.Email}</div>}
            <div style={{ opacity: 0.75, marginTop: '0.75rem' }}>לחץ לפרטים</div>
          </div>
        ) : (
          <div>
            <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>לחץ לרכישה טלפונית</div>
            <div style={{ opacity: 0.75 }}>
              {partiallyOccupied ? 'יש חלקים תפוסים — בחר את הפנוי' : 'פתיחת תהליך: פרטי מפרסם · העלאה · תשלום'}
            </div>
          </div>
        )}
      </SlotBox>

      <div style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '0.75rem' }}>דפדף בין המקומות</div>
    </BookPage>
  );
});

export default function AdSlotsManagement() {
  const bookRef = useRef(null);

  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [slotsPayload, setSlotsPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('details');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [advertisers, setAdvertisers] = useState([]);
  const [selectedAdvertiserId, setSelectedAdvertiserId] = useState('');
  const [advName, setAdvName] = useState('');
  const [advCompany, setAdvCompany] = useState('');
  const [advEmail, setAdvEmail] = useState('');
  const [advPhone, setAdvPhone] = useState('');

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('טלפון');
  const [paymentStatus, setPaymentStatus] = useState('paid');

  const [creativeFile, setCreativeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editTargetSlotId, setEditTargetSlotId] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [placementEditSize, setPlacementEditSize] = useState('quarter');
  const [placementEditQuarters, setPlacementEditQuarters] = useState([]);

  const [bookStep, setBookStep] = useState('size'); // size -> details
  const [placementSelection, setPlacementSelection] = useState(null); // { size, quarters, description }

  useEffect(() => {
    const loadIssues = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await getIssues(1, 100, false);
        const sorted = (list || []).sort((a, b) => {
          const dateA = new Date(normalizeIssueDate(a) || 0);
          const dateB = new Date(normalizeIssueDate(b) || 0);
          return dateB - dateA;
        });
        setIssues(sorted);
        if (sorted.length && !selectedIssueId) {
          setSelectedIssueId(normalizeIssueId(sorted[0]));
        }
      } catch (e) {
        console.error(e);
        setError('לא ניתן לטעון גליונות');
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, []);

  useEffect(() => {
    const loadAdvertisers = async () => {
      try {
        const list = await getAdvertisers();
        setAdvertisers(Array.isArray(list) ? list : []);
      } catch {
        setAdvertisers([]);
      }
    };
    loadAdvertisers();
  }, []);

  useEffect(() => {
    if (!selectedIssueId) return;
    const loadSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const issue = issues.find(i => normalizeIssueId(i) === selectedIssueId);
        setSelectedIssue(issue);
        const payload = await getIssueSlots(selectedIssueId);
        setSlotsPayload(payload);
      } catch (e) {
        console.error(e);
        setError('לא ניתן לטעון מקומות פרסום');
      } finally {
        setLoading(false);
      }
    };
    loadSlots();
  }, [selectedIssueId, issues]);

  const slots = useMemo(() => normalizeSlotsPayload(slotsPayload), [slotsPayload]);

  const stats = useMemo(() => {
    const total = slots.length;
    const occupied = slots.filter(s => s.isOccupied).length;
    const available = total - occupied;
    return { total, occupied, available };
  }, [slots]);

  const resetBookingForm = useCallback(() => {
    setSelectedAdvertiserId('');
    setAdvName('');
    setAdvCompany('');
    setAdvEmail('');
    setAdvPhone('');
    setPaymentAmount('');
    setPaymentMethod('טלפון');
    setPaymentStatus('paid');
    setCreativeFile(null);
    setBookStep('size');
    setPlacementSelection(null);
  }, []);

  const openDetails = useCallback((slot) => {
    setSelectedSlot(slot);
    setSidebarMode('details');
    setEditMode(false);
    setEditTargetSlotId('');
    setEditPaymentStatus(normalizeOrderStatus(slot.occupiedBy) ?? '');
    const occupied = Array.isArray(slot.occupiedQuarters) ? slot.occupiedQuarters : [];
    setPlacementEditQuarters(occupied.length ? occupied : [1, 2, 3, 4]);
    setPlacementEditSize(occupied.length === 4 ? 'full' : (occupied.length === 2 ? 'half' : 'quarter'));
    setSidebarOpen(true);
  }, []);

  const openBooking = useCallback((slot) => {
    setSelectedSlot(slot);
    setSidebarMode('book');
    setEditMode(false);
    resetBookingForm();
    setSidebarOpen(true);
  }, [resetBookingForm]);

  const availableSlotsForMove = useMemo(() => {
    if (!selectedSlot) return [];
    return slots
      .filter(s => !s.isOccupied || s.slotId === selectedSlot.slotId)
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? '')));
  }, [slots, selectedSlot]);

  const isFullyOccupied = useCallback((slot) => {
    const occupiedCount = Array.isArray(slot?.occupiedQuarters) ? slot.occupiedQuarters.length : 0;
    return !!slot?.isOccupied || occupiedCount >= 4;
  }, []);

  const onSlotClick = useCallback((slot) => {
    if (isFullyOccupied(slot)) openDetails(slot);
    else openBooking(slot);
  }, [isFullyOccupied, openBooking, openDetails]);

  const onAdvertiserPick = useCallback((value) => {
    setSelectedAdvertiserId(value);
    if (!value) return;
    const adv = advertisers.find(a => String(a.advertiserId ?? a.AdvertiserId) === String(value));
    if (!adv) return;
    setAdvName(adv.name ?? adv.Name ?? '');
    setAdvCompany(adv.company ?? adv.Company ?? '');
    setAdvEmail(adv.email ?? adv.Email ?? '');
    setAdvPhone(adv.phone ?? adv.Phone ?? '');
  }, [advertisers]);

  const submitBooking = useCallback(async () => {
    if (!selectedIssueId || !selectedSlot?.slotId) return;
    if (!placementSelection?.size || !Array.isArray(placementSelection?.quarters) || placementSelection.quarters.length === 0) {
      setError('חובה לבחור גודל ומיקום מודעה');
      return;
    }
    if (!creativeFile) {
      setError('חובה להעלות מודעה');
      return;
    }
    if (!selectedAdvertiserId && !advName.trim()) {
      setError('חובה להזין שם מפרסם');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        advertiserId: selectedAdvertiserId ? Number(selectedAdvertiserId) : null,
        name: advName.trim() || null,
        company: advCompany || null,
        email: advEmail || null,
        phone: advPhone || null,
        size: placementSelection.size,
        quarters: placementSelection.quarters,
        placementDescription: placementSelection.description ?? null,
        amount: paymentAmount ? Number(paymentAmount) : null,
        method: paymentMethod || null,
        paymentStatus: paymentStatus || null,
      };

      const booking = await bookIssueSlot(selectedIssueId, selectedSlot.slotId, payload);

      const advertiserId = booking.advertiserId ?? booking.AdvertiserId ?? payload.advertiserId;
      const orderId = booking.orderId ?? booking.OrderId;

      await adminUploadCreative(creativeFile, advertiserId, orderId);

      const refreshed = await getIssueSlots(selectedIssueId);
      setSlotsPayload(refreshed);
      setSidebarOpen(false);
    } catch (e) {
      console.error(e);
      const apiMessage = typeof e?.response?.data === 'string'
        ? e.response.data
        : (e?.response?.data?.message || e?.response?.data?.error);
      setError(apiMessage || 'שגיאה בביצוע הזמנה');
    } finally {
      setSubmitting(false);
    }
  }, [advCompany, advEmail, advName, advPhone, creativeFile, paymentAmount, paymentMethod, paymentStatus, placementSelection, selectedAdvertiserId, selectedIssueId, selectedSlot]);

  const saveBookingEdits = useCallback(async () => {
    if (!selectedIssueId || !selectedSlot?.slotId) return;

    const payload = {
      targetSlotId: editTargetSlotId ? Number(editTargetSlotId) : null,
      paymentStatus: editPaymentStatus || null,
    };

    setSubmitting(true);
    setError(null);
    try {
      const result = await updateIssueSlotBooking(selectedIssueId, selectedSlot.slotId, payload);
      const refreshed = await getIssueSlots(selectedIssueId);
      setSlotsPayload(refreshed);

      const normalized = normalizeSlotsPayload(refreshed);
      const newSlotId = result?.toSlotId ?? result?.ToSlotId ?? payload.targetSlotId ?? selectedSlot.slotId;
      const nextSelected = normalized.find(s => s.slotId === newSlotId) ?? normalized.find(s => s.slotId === selectedSlot.slotId);
      if (nextSelected) {
        setSelectedSlot(nextSelected);
        setEditPaymentStatus(normalizeOrderStatus(nextSelected.occupiedBy) ?? editPaymentStatus);
      }

      setEditMode(false);
      setEditTargetSlotId('');
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e?.response?.data?.error || 'שגיאה בעריכת הזמנה');
    } finally {
      setSubmitting(false);
    }
  }, [editPaymentStatus, editTargetSlotId, selectedIssueId, selectedSlot, submitting]);

  const togglePlacementQuarter = useCallback((quarter) => {
    setPlacementEditQuarters((prev) => {
      const set = new Set(prev);
      if (set.has(quarter)) {
        set.delete(quarter);
      } else {
        set.add(quarter);
      }
      return Array.from(set).sort((a, b) => a - b);
    });
  }, []);

  const savePlacementEdits = useCallback(async () => {
    if (!selectedIssueId || !selectedSlot?.slotId) return;
    const orderId = selectedSlot.occupiedBy?.orderId ?? selectedSlot.occupiedBy?.OrderId;
    if (!orderId) {
      setError('לא נמצא מזהה הזמנה לשמירה');
      return;
    }
    if (!placementEditQuarters.length) {
      setError('חובה לבחור לפחות רבע אחד');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        orderId: Number(orderId),
        size: placementEditSize,
        quarters: placementEditQuarters,
        description: placementEditSize === 'full'
          ? 'עמוד מלא'
          : placementEditSize === 'half'
            ? 'חצי עמוד'
            : 'רבע עמוד',
      };
      await updateIssueSlotPlacement(selectedIssueId, selectedSlot.slotId, payload);
      const refreshed = await getIssueSlots(selectedIssueId);
      setSlotsPayload(refreshed);
    } catch (e) {
      console.error(e);
      const apiMessage = typeof e?.response?.data === 'string'
        ? e.response.data
        : (e?.response?.data?.message || e?.response?.data?.error);
      setError(apiMessage || 'שגיאה בעדכון חלוקת מיקום');
    } finally {
      setSubmitting(false);
    }
  }, [placementEditQuarters, placementEditSize, selectedIssueId, selectedSlot, submitting]);

  const handleIssueChange = (e) => {
    const issueId = Number(e.target.value);
    setSelectedIssueId(issueId);
    setSlotsPayload(null);
    setSidebarOpen(false);
  };

  return (
    <AdminLayout title="ניהול מקומות פרסום">
      <Container>
        <TopRow>
          <SelectWrapper>
            <Select value={selectedIssueId ?? ''} onChange={handleIssueChange} disabled={loading || !issues.length}>
              {issues.map(issue => {
                const id = normalizeIssueId(issue);
                const title = normalizeIssueTitle(issue);
                const date = normalizeIssueDate(issue);
                const label = `${title || 'גיליון'}${date ? ` · ${new Date(date).toLocaleDateString('he-IL')}` : ''}`;
                return (
                  <option key={id} value={id}>{label}</option>
                );
              })}
            </Select>
            <SelectIcon size={20} />
          </SelectWrapper>

          <Stats>
            <StatCard>
              <FileText size={18} />
              <div>סה"כ: <StatValue>{stats.total}</StatValue></div>
            </StatCard>
            <StatCard>
              <XCircle size={18} color="#ef4444" />
              <div>תפוסים: <StatValue $variant="occupied">{stats.occupied}</StatValue></div>
            </StatCard>
            <StatCard>
              <CheckCircle size={18} color="#10b981" />
              <div>פנויים: <StatValue $variant="available">{stats.available}</StatValue></div>
            </StatCard>
          </Stats>
        </TopRow>

        <MainRow>
          {error && (
            <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '0.75rem 1rem', direction: 'rtl' }}>
              {error}
            </div>
          )}

          <BookShell>
            {loading ? (
              <EmptyState>טוען...</EmptyState>
            ) : !slots.length ? (
              <EmptyState>
                <FileText size={56} style={{ opacity: 0.35 }} />
                <div style={{ marginTop: '0.75rem' }}>אין מקומות להצגה</div>
              </EmptyState>
            ) : (
              <HTMLFlipBook
                width={360}
                height={510}
                size="fixed"
                minWidth={280}
                maxWidth={420}
                minHeight={420}
                maxHeight={600}
                maxShadowOpacity={0.35}
                showCover={false}
                mobileScrollSupport={true}
                ref={bookRef}
              >
                {slots.map(slot => (
                  <SlotPage key={slot.slotId} slot={slot} onClick={onSlotClick} />
                ))}
              </HTMLFlipBook>
            )}
          </BookShell>
        </MainRow>

        {sidebarOpen && selectedSlot && (
          <Sidebar>
            <SidebarTitle>
              {sidebarMode === 'details' ? 'פרטי מקום תפוס' : 'הזמנה טלפונית'}
            </SidebarTitle>

            <div style={{ color: 'rgba(255,255,255,0.8)' }}>
              <div style={{ fontWeight: 800 }}>{selectedSlot.name}</div>
              <div style={{ opacity: 0.75, marginTop: '0.25rem' }}>{selectedSlot.code}</div>
              {selectedIssue && (
                <div style={{ opacity: 0.65, marginTop: '0.5rem' }}>
                  גיליון: {normalizeIssueTitle(selectedIssue)}
                </div>
              )}
            </div>

            {sidebarMode === 'details' && (
              <>
              <SidebarSection>
                <Label>נקנה ע"י</Label>
                <div style={{ color: 'white', fontWeight: 800 }}>
                  {selectedSlot.occupiedBy?.advertiserName ?? selectedSlot.occupiedBy?.AdvertiserName ?? '—'}
                </div>
                {(selectedSlot.occupiedBy?.phone || selectedSlot.occupiedBy?.Phone) && (
                  <div style={{ marginTop: '0.35rem', color: 'rgba(255,255,255,0.85)' }}>{selectedSlot.occupiedBy?.phone ?? selectedSlot.occupiedBy?.Phone}</div>
                )}
                {(selectedSlot.occupiedBy?.email || selectedSlot.occupiedBy?.Email) && (
                  <div style={{ marginTop: '0.35rem', color: 'rgba(255,255,255,0.85)' }}>{selectedSlot.occupiedBy?.email ?? selectedSlot.occupiedBy?.Email}</div>
                )}

                <div style={{ marginTop: '0.75rem' }}>
                  <Label>סטטוס תשלום</Label>
                  {!editMode ? (
                    <div style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 700 }}>
                      {paymentStatusLabel(normalizeOrderStatus(selectedSlot.occupiedBy))}
                    </div>
                  ) : (
                    <SelectWrapper style={{ maxWidth: '100%' }}>
                      <SidebarSelect value={editPaymentStatus} onChange={(e) => setEditPaymentStatus(e.target.value)}>
                        <option value="">—</option>
                        <option value="paid">שולם</option>
                        <option value="pending">ממתין</option>
                        <option value="failed">נכשל</option>
                        <option value="refunded">הוחזר</option>
                        <option value="canceled">בוטל</option>
                      </SidebarSelect>
                      <SelectIcon size={20} />
                    </SelectWrapper>
                  )}
                </div>

                {editMode && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <Label>להעביר למקום אחר (אופציונלי)</Label>
                    <SelectWrapper style={{ maxWidth: '100%' }}>
                      <SidebarSelect value={editTargetSlotId} onChange={(e) => setEditTargetSlotId(e.target.value)}>
                        <option value="">לא להעביר</option>
                        {availableSlotsForMove
                          .filter(s => s.slotId !== selectedSlot.slotId)
                          .map(s => (
                            <option key={s.slotId} value={s.slotId}>
                              {s.name} ({s.code})
                            </option>
                          ))}
                      </SidebarSelect>
                      <SelectIcon size={20} />
                    </SelectWrapper>
                  </div>
                )}
              </SidebarSection>

              <SidebarSection>
                <Label>חלוקת מיקום (לתיקון הזמנות ישנות)</Label>
                <SelectWrapper style={{ maxWidth: '100%' }}>
                  <SidebarSelect value={placementEditSize} onChange={(e) => setPlacementEditSize(e.target.value)}>
                    <option value="quarter">רבע עמוד</option>
                    <option value="half">חצי עמוד</option>
                    <option value="full">עמוד מלא</option>
                  </SidebarSelect>
                  <SelectIcon size={20} />
                </SelectWrapper>

                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => togglePlacementQuarter(q)}
                      style={{
                        padding: '0.4rem 0.6rem',
                        borderRadius: 8,
                        border: placementEditQuarters.includes(q)
                          ? '1px solid rgba(16,185,129,0.6)'
                          : '1px solid rgba(255,255,255,0.15)',
                        background: placementEditQuarters.includes(q)
                          ? 'rgba(16,185,129,0.15)'
                          : 'rgba(255,255,255,0.05)',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      רבע {q}
                    </button>
                  ))}
                </div>

                <ButtonRow>
                  <PrimaryButton type="button" onClick={savePlacementEdits} disabled={submitting}>
                    {submitting ? 'שומר...' : 'שמירת חלוקה'}
                  </PrimaryButton>
                </ButtonRow>
              </SidebarSection>
              </>
            )}

            {sidebarMode === 'book' && (
              <>
                <SidebarSection>
                  {bookStep === 'size' ? (
                    <>
                      <Label>העלאת מודעה (לתצוגה מקדימה)</Label>
                      <Input type="file" onChange={(e) => setCreativeFile(e.target.files?.[0] ?? null)} />
                      {creativeFile && <div style={{ marginTop: '0.5rem', opacity: 0.75 }}>{creativeFile.name}</div>}
                      <div style={{ marginTop: '0.5rem', opacity: 0.65, fontSize: '0.85rem' }}>
                        תצוגה מקדימה זמינה לתמונות ול-PDF
                      </div>

                      <AdPlacementSelector
                        onCancel={() => setSidebarOpen(false)}
                        onSelect={(selection) => {
                          setPlacementSelection(selection);
                          setBookStep('details');
                        }}
                        previewFile={creativeFile}
                        occupiedQuarters={selectedSlot?.occupiedQuarters}
                      />
                    </>
                  ) : (
                    <>
                      <Label>בחירת מפרסם קיים (אופציונלי)</Label>
                      <SelectWrapper style={{ maxWidth: '100%' }}>
                        <Select value={selectedAdvertiserId} onChange={(e) => onAdvertiserPick(e.target.value)}>
                          <option value="">מפרסם חדש</option>
                          {advertisers.map(a => {
                            const id = a.advertiserId ?? a.AdvertiserId;
                            const label = a.company ?? a.Company ?? a.name ?? a.Name ?? a.email ?? a.Email ?? `מפרסם ${id}`;
                            return (
                              <option key={id} value={id}>{label}</option>
                            );
                          })}
                        </Select>
                        <SelectIcon size={20} />
                      </SelectWrapper>

                      <div style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>
                        מיקום שנבחר: {placementSelection?.description ?? '—'}
                      </div>

                      {creativeFile && <div style={{ marginTop: '0.5rem', opacity: 0.7 }}>מודעה: {creativeFile.name}</div>}

                      <div style={{ marginTop: '0.75rem' }}>
                        <Label>שם</Label>
                        <Input value={advName} onChange={(e) => setAdvName(e.target.value)} placeholder="שם מפרסם" />
                      </div>
                      <div style={{ marginTop: '0.75rem' }}>
                        <Label>חברה</Label>
                        <Input value={advCompany} onChange={(e) => setAdvCompany(e.target.value)} placeholder="שם חברה" />
                      </div>
                      <div style={{ marginTop: '0.75rem' }}>
                        <Label>טלפון</Label>
                        <Input value={advPhone} onChange={(e) => setAdvPhone(e.target.value)} placeholder="טלפון" />
                      </div>
                      <div style={{ marginTop: '0.75rem' }}>
                        <Label>אימייל</Label>
                        <Input value={advEmail} onChange={(e) => setAdvEmail(e.target.value)} placeholder="אימייל" />
                      </div>
                    </>
                  )}
                </SidebarSection>

                {bookStep === 'details' && (
                  <>
                    <SidebarSection>
                      <Label>תשלום</Label>
                      <div style={{ marginTop: '0.5rem' }}>
                        <Label>סכום</Label>
                        <Input value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="למשל 500" />
                      </div>
                      <div style={{ marginTop: '0.75rem' }}>
                        <Label>אמצעי</Label>
                        <Input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="טלפון / אשראי / העברה" />
                      </div>
                      <div style={{ marginTop: '0.75rem' }}>
                        <Label>סטטוס</Label>
                        <SelectWrapper style={{ maxWidth: '100%' }}>
                          <SidebarSelect value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                            <option value="paid">שולם</option>
                            <option value="pending">ממתין</option>
                            <option value="failed">נכשל</option>
                            <option value="refunded">הוחזר</option>
                            <option value="canceled">בוטל</option>
                          </SidebarSelect>
                          <SelectIcon size={20} />
                        </SelectWrapper>
                      </div>
                    </SidebarSection>

                    <ButtonRow>
                      <SecondaryButton type="button" onClick={() => setBookStep('size')}>חזרה</SecondaryButton>
                      <PrimaryButton type="button" onClick={submitBooking} disabled={submitting}>
                        {submitting ? 'מבצע...' : 'אישור ורכישה'}
                      </PrimaryButton>
                    </ButtonRow>
                  </>
                )}
              </>
            )}

            {sidebarMode === 'details' && (
              <ButtonRow>
                {!editMode ? (
                  <>
                    <SecondaryButton onClick={() => setSidebarOpen(false)}>סגירה</SecondaryButton>
                    <PrimaryButton type="button" onClick={() => setEditMode(true)} disabled={submitting}>
                      עריכה
                    </PrimaryButton>
                  </>
                ) : (
                  <>
                    <SecondaryButton onClick={() => {
                      setEditMode(false);
                      setEditTargetSlotId('');
                      setEditPaymentStatus(normalizeOrderStatus(selectedSlot.occupiedBy) ?? '');
                    }}>
                      ביטול
                    </SecondaryButton>
                    <PrimaryButton type="button" onClick={saveBookingEdits} disabled={submitting}>
                      {submitting ? 'שומר...' : 'שמירה'}
                    </PrimaryButton>
                  </>
                )}
              </ButtonRow>
            )}
          </Sidebar>
        )}
      </Container>
    </AdminLayout>
  );
}
