/**
 * AdminSlotSelector.jsx
 * קומפוננטה למנהל לבחירת מיקום וגודל למודעה עם אפשרות להזנת פרטי מפרסם ידנית
 */

import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import { Check, X, User, Building2, Mail, Phone, Search } from "lucide-react";
import { Card, CardTitle, PrimaryButton, SecondaryButton, Flex } from "../styles";
import hasederaTheme from "../styles/HasederaTheme";
import AdPlacementSelector from "./AdPlacementSelector";
import { getAdvertisers, createAdvertiser } from "../Services/advertisersService";

// Styled Components
const SelectorContainer = styled(Card)`
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: ${hasederaTheme.spacing.xl};
  direction: rtl;
  background: transparent;
  border: none;
  box-shadow: none;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: ${hasederaTheme.spacing.lg};
  text-align: center;
  padding-bottom: ${hasederaTheme.spacing.lg};
  border-bottom: 1px solid rgba(20, 184, 166, 0.2);
`;

const Title = styled(CardTitle)`
  font-size: ${hasederaTheme.typography.fontSize.xl};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  color: #ffffff;
  margin-bottom: ${hasederaTheme.spacing.sm};
  
  background: linear-gradient(135deg, #ffffff 0%, #14b8a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: ${hasederaTheme.typography.fontSize.sm};
  color: rgba(255, 255, 255, 0.7);
`;

const Section = styled.div`
  margin-bottom: ${hasederaTheme.spacing.xl};
`;

const SectionTitle = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.lg};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: #ffffff;
  margin-bottom: ${hasederaTheme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
  
  svg {
    width: 20px;
    height: 20px;
    color: #14b8a6;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: ${hasederaTheme.spacing.sm};
  margin-bottom: ${hasederaTheme.spacing.md};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button`
  padding: ${hasederaTheme.spacing.sm} ${hasederaTheme.spacing.md};
  background: ${props => props.$active ? 'rgba(20, 184, 166, 0.2)' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#14b8a6' : 'transparent'};
  color: ${props => props.$active ? '#14b8a6' : 'rgba(255, 255, 255, 0.7)'};
  font-size: ${hasederaTheme.typography.fontSize.sm};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #14b8a6;
    background: rgba(20, 184, 166, 0.1);
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${hasederaTheme.spacing.md};
`;

const Label = styled.label`
  display: block;
  font-size: ${hasederaTheme.typography.fontSize.sm};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: ${hasederaTheme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.xs};
  
  svg {
    width: 16px;
    height: 16px;
    color: #14b8a6;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${hasederaTheme.spacing.sm} ${hasederaTheme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${hasederaTheme.borderRadius.md};
  color: #ffffff;
  font-size: ${hasederaTheme.typography.fontSize.sm};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #14b8a6;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${hasederaTheme.spacing.sm} ${hasederaTheme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${hasederaTheme.borderRadius.md};
  color: #ffffff;
  font-size: ${hasederaTheme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #14b8a6;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }
  
  option {
    background: #1e293b;
    color: white;
  }
`;

const SearchInput = styled(Input)`
  margin-bottom: ${hasederaTheme.spacing.sm};
`;

const AdvertisersList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${hasederaTheme.borderRadius.md};
  background: rgba(255, 255, 255, 0.02);
`;

const AdvertiserItem = styled.div`
  padding: ${hasederaTheme.spacing.sm} ${hasederaTheme.spacing.md};
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:hover {
    background: rgba(20, 184, 166, 0.1);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.$selected && `
    background: rgba(20, 184, 166, 0.2);
    border-left: 3px solid #14b8a6;
  `}
`;

const AdvertiserName = styled.div`
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: #ffffff;
  margin-bottom: 0.25rem;
`;

const AdvertiserDetails = styled.div`
  font-size: ${hasederaTheme.typography.fontSize.xs};
  color: rgba(255, 255, 255, 0.6);
`;

const ActionButtons = styled(Flex)`
  justify-content: center;
  margin-top: ${hasederaTheme.spacing.lg};
  gap: ${hasederaTheme.spacing.md};
  flex-direction: column;
  padding-top: ${hasederaTheme.spacing.lg};
  border-top: 1px solid rgba(20, 184, 166, 0.2);
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${hasederaTheme.spacing.sm};
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing.xl};
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${hasederaTheme.borderRadius.md};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  width: 100%;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    display: block;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }
`;

const ConfirmButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${hasederaTheme.spacing.sm};
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing.xl};
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: #ffffff;
  border: none;
  border-radius: ${hasederaTheme.borderRadius.md};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  width: 100%;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    display: block;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: ${hasederaTheme.spacing.sm};
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${hasederaTheme.borderRadius.md};
  color: #ef4444;
  font-size: ${hasederaTheme.typography.fontSize.sm};
  margin-bottom: ${hasederaTheme.spacing.md};
`;

const SuccessMessage = styled.div`
  padding: ${hasederaTheme.spacing.sm};
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: ${hasederaTheme.borderRadius.md};
  color: #10b981;
  font-size: ${hasederaTheme.typography.fontSize.sm};
  margin-bottom: ${hasederaTheme.spacing.md};
`;

export default function AdminSlotSelector({ 
  slot, 
  pageNumber, 
  issueId, 
  onSelect, 
  onCancel 
}) {
  const [tab, setTab] = useState('existing'); // 'existing' or 'new'
  const [advertisers, setAdvertisers] = useState([]);
  const [filteredAdvertisers, setFilteredAdvertisers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdvertiser, setSelectedAdvertiser] = useState(null);
  const [placementData, setPlacementData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // טופס מפרסם חדש
  const [newAdvertiser, setNewAdvertiser] = useState({
    name: '',
    company: '',
    email: '',
    phone: ''
  });

  // טעינת מפרסמים
  useEffect(() => {
    const loadAdvertisers = async () => {
      try {
        const data = await getAdvertisers();
        setAdvertisers(data || []);
        setFilteredAdvertisers(data || []);
      } catch (err) {
        console.error('Error loading advertisers:', err);
        setError('שגיאה בטעינת מפרסמים');
      }
    };
    
    loadAdvertisers();
  }, []);

  // חיפוש מפרסמים
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAdvertisers(advertisers);
      return;
    }

    const filtered = advertisers.filter(adv => {
      const query = searchQuery.toLowerCase();
      return (
        (adv.name && adv.name.toLowerCase().includes(query)) ||
        (adv.company && adv.company.toLowerCase().includes(query)) ||
        (adv.email && adv.email.toLowerCase().includes(query))
      );
    });
    
    setFilteredAdvertisers(filtered);
  }, [searchQuery, advertisers]);

  const handlePlacementSelect = useCallback((data) => {
    setPlacementData(data);
  }, []);

  const handleCreateAdvertiser = useCallback(async () => {
    if (!newAdvertiser.name || !newAdvertiser.email) {
      setError('נא למלא שם ואימייל');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const created = await createAdvertiser(newAdvertiser);
      setSelectedAdvertiser(created);
      setTab('existing');
      setSuccess('מפרסם נוצר בהצלחה');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('שגיאה ביצירת מפרסם');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [newAdvertiser]);

  const handleConfirm = useCallback(async () => {
    if (!placementData) {
      setError('נא לבחור מיקום וגודל למודעה');
      return;
    }

    if (tab === 'existing' && !selectedAdvertiser) {
      setError('נא לבחור מפרסם');
      return;
    }

    if (tab === 'new' && (!newAdvertiser.name || !newAdvertiser.email)) {
      setError('נא למלא שם ואימייל למפרסם חדש');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let advertiserId = selectedAdvertiser?.advertiserId || selectedAdvertiser?.AdvertiserId;
      
      // אם זה מפרסם חדש, ניצור אותו
      if (tab === 'new' && !advertiserId) {
        const created = await createAdvertiser(newAdvertiser);
        advertiserId = created.advertiserId || created.AdvertiserId;
      }

      // קריאה לפונקציה onSelect עם כל הנתונים
      await onSelect({
        slotId: slot?.slotId || slot?.SlotId,
        slotCode: slot?.code || slot?.Code,
        slotName: slot?.name || slot?.Name,
        pageNumber,
        issueId,
        advertiserId,
        placement: placementData,
        advertiser: tab === 'existing' ? selectedAdvertiser : newAdvertiser
      });

      setSuccess('הזמנה נוצרה בהצלחה');
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (err) {
      setError('שגיאה ביצירת הזמנה');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [placementData, selectedAdvertiser, newAdvertiser, tab, slot, pageNumber, issueId, onSelect, onCancel]);

  return (
    <SelectorContainer>
      <Header>
        <Title>הזמנת מודעה ידנית</Title>
        <Subtitle>
          {slot?.name || slot?.Name || 'מקום פרסום'} - עמוד {pageNumber}
        </Subtitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <Section>
        <SectionTitle>
          <User size={20} />
          בחירת מפרסם
        </SectionTitle>

        <TabsContainer>
          <Tab $active={tab === 'existing'} onClick={() => setTab('existing')}>
            מפרסם קיים
          </Tab>
          <Tab $active={tab === 'new'} onClick={() => setTab('new')}>
            מפרסם חדש
          </Tab>
        </TabsContainer>

        {tab === 'existing' ? (
          <>
            <SearchInput
              type="text"
              placeholder="חפש מפרסם..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={16} />}
            />
            <AdvertisersList>
              {filteredAdvertisers.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                  {searchQuery ? 'לא נמצאו מפרסמים' : 'אין מפרסמים זמינים'}
                </div>
              ) : (
                filteredAdvertisers.map((adv) => (
                  <AdvertiserItem
                    key={adv.advertiserId || adv.AdvertiserId}
                    $selected={selectedAdvertiser?.advertiserId === adv.advertiserId || 
                              selectedAdvertiser?.AdvertiserId === adv.AdvertiserId}
                    onClick={() => setSelectedAdvertiser(adv)}
                  >
                    <AdvertiserName>
                      {adv.name || adv.Name || 'ללא שם'}
                    </AdvertiserName>
                    <AdvertiserDetails>
                      {adv.company || adv.Company || ''} {adv.email || adv.Email || ''}
                    </AdvertiserDetails>
                  </AdvertiserItem>
                ))
              )}
            </AdvertisersList>
          </>
        ) : (
          <>
            <FormGroup>
              <Label>
                <User size={16} />
                שם מפרסם *
              </Label>
              <Input
                type="text"
                placeholder="הזן שם מפרסם"
                value={newAdvertiser.name}
                onChange={(e) => setNewAdvertiser({ ...newAdvertiser, name: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Building2 size={16} />
                חברה
              </Label>
              <Input
                type="text"
                placeholder="הזן שם חברה"
                value={newAdvertiser.company}
                onChange={(e) => setNewAdvertiser({ ...newAdvertiser, company: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Mail size={16} />
                אימייל *
              </Label>
              <Input
                type="email"
                placeholder="הזן אימייל"
                value={newAdvertiser.email}
                onChange={(e) => setNewAdvertiser({ ...newAdvertiser, email: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Phone size={16} />
                טלפון
              </Label>
              <Input
                type="tel"
                placeholder="הזן מספר טלפון"
                value={newAdvertiser.phone}
                onChange={(e) => setNewAdvertiser({ ...newAdvertiser, phone: e.target.value })}
              />
            </FormGroup>
          </>
        )}
      </Section>

      <Section>
        <SectionTitle>
          <Building2 size={20} />
          בחירת מיקום וגודל
        </SectionTitle>
        <AdPlacementSelector
          onSelect={handlePlacementSelect}
          onCancel={() => {}}
        />
      </Section>

      <ActionButtons>
        <CancelButton onClick={onCancel} disabled={isLoading}>
          <X size={18} />
          ביטול
        </CancelButton>
        <ConfirmButton onClick={handleConfirm} disabled={isLoading || !placementData}>
          <Check size={18} />
          {isLoading ? 'שומר...' : 'שמור הזמנה'}
        </ConfirmButton>
      </ActionButtons>
    </SelectorContainer>
  );
}

