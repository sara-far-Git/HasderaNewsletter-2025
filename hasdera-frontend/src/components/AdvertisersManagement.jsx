/**
 * AdvertisersManagement.jsx
 * ניהול מפרסמים - רשימה, פרטי קשר, היסטוריה וחוזים
 * מעוצב כמו אזור המפרסמים
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Users, Mail, Phone, FileText, Package, Send } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { createAdvertiser, getAdvertisers, getAdvertiserPayments } from '../Services/advertisersService';

// 🎬 אנימציות
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// 🎨 Container
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.8s ease-out;
`;

// 🎨 Header
const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(16, 185, 129, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 50px;
  color: #10b981;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: #10b981;
    transform: translateY(-2px);
  }
  
  svg {
    width: 18px;
    height: 18px;
    display: block;
  }
`;

// 🎨 Advertisers Grid
const AdvertisersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const AdvertiserCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateY(-4px);
  }
`;

const AdvertiserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
`;

const AdvertiserInfo = styled.div`
  flex: 1;
`;

const AdvertiserName = styled.h3`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: 1px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: ${props => {
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.2)';
    if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.3)';
    if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => {
    if (props.$variant === 'success') return '#10b981';
    if (props.$variant === 'warning') return '#f59e0b';
    return 'rgba(255, 255, 255, 0.7)';
  }};
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const ContactRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  
  svg {
    width: 16px;
    height: 16px;
    display: block;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
`;

const StatBox = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
  }
  
  svg {
    width: 16px;
    height: 16px;
    display: block;
  }
`;

const Sidebar = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 460px;
  max-width: 92vw;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 200;
  padding: 1.25rem;
  overflow-y: auto;
  direction: rtl;
  animation: ${fadeInUp} 0.25s ease-out;
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
  font-family: inherit;

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
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

function normalizeAdvertiser(a) {
  return {
    advertiserId: a?.advertiserId ?? a?.AdvertiserId,
    name: a?.name ?? a?.Name ?? '',
    company: a?.company ?? a?.Company ?? null,
    email: a?.email ?? a?.Email ?? null,
    phone: a?.phone ?? a?.Phone ?? null,
    joinDate: a?.joinDate ?? a?.JoinDate ?? null,
  };
}

function normalizePayment(p) {
  return {
    paymentId: p?.paymentId ?? p?.PaymentId,
    amount: p?.amount ?? p?.Amount ?? null,
    method: p?.method ?? p?.Method ?? null,
    status: p?.status ?? p?.Status ?? null,
    date: p?.date ?? p?.Date ?? null,
  };
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

export default function AdvertisersManagement() {
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState('create'); // create | payments
  const [selectedAdvertiser, setSelectedAdvertiser] = useState(null);

  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(null);

  const loadAdvertisers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAdvertisers();
      setAdvertisers(Array.isArray(list) ? list.map(normalizeAdvertiser) : []);
    } catch (e) {
      console.error(e);
      setError('לא ניתן לטעון מפרסמים');
      setAdvertisers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdvertisers();
  }, [loadAdvertisers]);

  const openCreate = useCallback(() => {
    setSidebarMode('create');
    setSelectedAdvertiser(null);
    setNewName('');
    setNewCompany('');
    setNewEmail('');
    setNewPhone('');
    setSidebarOpen(true);
  }, []);

  const openPayments = useCallback(async (adv) => {
    setSidebarMode('payments');
    setSelectedAdvertiser(adv);
    setSidebarOpen(true);
    setPayments([]);
    setPaymentsError(null);
    setPaymentsLoading(true);
    try {
      const list = await getAdvertiserPayments(adv.advertiserId);
      setPayments(Array.isArray(list) ? list.map(normalizePayment) : []);
    } catch (e) {
      console.error(e);
      setPaymentsError('לא ניתן לטעון תשלומים');
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  const submitCreate = useCallback(async () => {
    if (!newName.trim()) {
      setError('שם מפרסם חובה');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createAdvertiser({
        advertiserId: 0,
        name: newName.trim(),
        company: newCompany || null,
        email: newEmail || null,
        phone: newPhone || null,
      });
      await loadAdvertisers();
      setSidebarOpen(false);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e?.response?.data?.error || 'שגיאה ביצירת מפרסם');
    } finally {
      setSubmitting(false);
    }
  }, [loadAdvertisers, newCompany, newEmail, newName, newPhone]);

  const sortedAdvertisers = useMemo(() => {
    return [...advertisers].sort((a, b) =>
      String(a.company ?? a.name).localeCompare(String(b.company ?? b.name), 'he')
    );
  }, [advertisers]);

  return (
    <AdminLayout title="ניהול מפרסמים">
      <Container>
        <Header>
          <AddButton onClick={openCreate}>
            <Users size={18} />
            הוספת מפרסם חדש
          </AddButton>
        </Header>

        {error && (
          <div
            style={{
              color: '#ef4444',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12,
              padding: '0.75rem 1rem',
              direction: 'rtl',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <AdvertisersGrid>
          {loading ? (
            <div style={{ color: 'rgba(255,255,255,0.7)' }}>טוען...</div>
          ) : (
            sortedAdvertisers.map((advertiser) => (
              <AdvertiserCard key={advertiser.advertiserId}>
                <AdvertiserHeader>
                  <Avatar>{(advertiser.company ?? advertiser.name ?? '').charAt(0) || 'מ'}</Avatar>
                  <AdvertiserInfo>
                    <AdvertiserName>{advertiser.company ?? advertiser.name}</AdvertiserName>
                    <Badge $variant={'success'}>מפרסם</Badge>
                  </AdvertiserInfo>
                </AdvertiserHeader>

                <ContactInfo>
                  <ContactRow>
                    <Mail size={16} />
                    {advertiser.email ? (
                      <a style={{ color: 'inherit', textDecoration: 'none' }} href={`mailto:${advertiser.email}`}>
                        {advertiser.email}
                      </a>
                    ) : (
                      <span style={{ opacity: 0.6 }}>—</span>
                    )}
                  </ContactRow>
                  <ContactRow>
                    <Phone size={16} />
                    {advertiser.phone ? (
                      <a style={{ color: 'inherit', textDecoration: 'none' }} href={`tel:${advertiser.phone}`}>
                        {advertiser.phone}
                      </a>
                    ) : (
                      <span style={{ opacity: 0.6 }}>—</span>
                    )}
                  </ContactRow>
                </ContactInfo>

                <CardActions>
                  <ActionButton onClick={() => openPayments(advertiser)}>
                    <FileText size={16} />
                    תשלומים
                  </ActionButton>
                  <ActionButton onClick={() => openPayments(advertiser)}>
                    <Package size={16} />
                    חבילה/חוזה
                  </ActionButton>
                  <ActionButton onClick={() => openPayments(advertiser)}>
                    <Send size={16} />
                    פעילות
                  </ActionButton>
                </CardActions>
              </AdvertiserCard>
            ))
          )}
        </AdvertisersGrid>

        {sidebarOpen && (
          <Sidebar>
            <SidebarTitle>
              {sidebarMode === 'create'
                ? 'הוספת מפרסם חדש'
                : `תשלומים · ${selectedAdvertiser?.company ?? selectedAdvertiser?.name ?? ''}`}
            </SidebarTitle>

            {sidebarMode === 'create' && (
              <>
                <SidebarSection>
                  <Label>שם (חובה)</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="שם מפרסם" />
                </SidebarSection>

                <SidebarSection>
                  <Label>חברה</Label>
                  <Input value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="שם חברה" />
                </SidebarSection>

                <SidebarSection>
                  <Label>אימייל</Label>
                  <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="אימייל" />
                </SidebarSection>

                <SidebarSection>
                  <Label>טלפון</Label>
                  <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="טלפון" />
                </SidebarSection>

                <ButtonRow>
                  <SecondaryButton type="button" onClick={() => setSidebarOpen(false)}>
                    ביטול
                  </SecondaryButton>
                  <PrimaryButton type="button" onClick={submitCreate} disabled={submitting}>
                    {submitting ? 'יוצר...' : 'יצירה'}
                  </PrimaryButton>
                </ButtonRow>
              </>
            )}

            {sidebarMode === 'payments' && (
              <>
                <SidebarSection>
                  {paymentsError && (
                    <div
                      style={{
                        color: '#ef4444',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 12,
                        padding: '0.75rem 1rem',
                        direction: 'rtl',
                      }}
                    >
                      {paymentsError}
                    </div>
                  )}

                  {paymentsLoading ? (
                    <div style={{ color: 'rgba(255,255,255,0.7)' }}>טוען תשלומים...</div>
                  ) : !payments.length ? (
                    <div style={{ color: 'rgba(255,255,255,0.65)' }}>אין תשלומים להצגה</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {payments.map((p) => (
                        <div
                          key={p.paymentId}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: 12,
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: '0.75rem',
                              color: 'white',
                              fontWeight: 800,
                            }}
                          >
                            <div>{p.amount != null ? `₪${Number(p.amount).toLocaleString('he-IL')}` : '—'}</div>
                            <div style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>{paymentStatusLabel(p.status)}</div>
                          </div>
                          <div style={{ marginTop: '0.25rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
                            {p.method ? `אמצעי: ${p.method}` : 'אמצעי: —'}
                          </div>
                          <div style={{ marginTop: '0.15rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                            {p.date ? `תאריך: ${new Date(p.date).toLocaleDateString('he-IL')}` : 'תאריך: —'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SidebarSection>

                <ButtonRow>
                  <SecondaryButton type="button" onClick={() => setSidebarOpen(false)}>
                    סגירה
                  </SecondaryButton>
                  <PrimaryButton type="button" onClick={openCreate}>
                    מפרסם חדש
                  </PrimaryButton>
                </ButtonRow>
              </>
            )}
          </Sidebar>
        )}
      </Container>
    </AdminLayout>
  );
}
