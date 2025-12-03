/**
 * AdSlotsManagement.jsx
 * ניהול מקומות פרסום - טבלת עמודים, סוגי מקום, זמינות ומחירים
 * מעוצב כמו אזור המפרסמים
 */

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Layout, CheckCircle, XCircle, DollarSign, FileText } from 'lucide-react';
import AdminLayout from './AdminLayout';

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

// 🎨 Filters Bar
const FiltersBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const FilterButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active 
    ? 'rgba(16, 185, 129, 0.2)' 
    : 'rgba(255, 255, 255, 0.05)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.$active 
    ? 'rgba(16, 185, 129, 0.3)' 
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 50px;
  color: ${props => props.$active ? '#10b981' : 'rgba(255, 255, 255, 0.8)'};
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
    background: rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
  }
`;

// 🎨 Table
const TableWrapper = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: rgba(16, 185, 129, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TableHeaderCell = styled.th`
  padding: 1.5rem;
  text-align: right;
  font-weight: 600;
  font-size: 0.95rem;
  color: white;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  text-align: right;
`;

const StatusCell = styled(TableCell)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const SlotTypeBadge = styled.span`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: ${props => {
    if (props.$type === 'full') return 'rgba(16, 185, 129, 0.2)';
    if (props.$type === 'half') return 'rgba(59, 130, 246, 0.2)';
    if (props.$type === 'quarter') return 'rgba(245, 158, 11, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.$type === 'full') return 'rgba(16, 185, 129, 0.3)';
    if (props.$type === 'half') return 'rgba(59, 130, 246, 0.3)';
    if (props.$type === 'quarter') return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => {
    if (props.$type === 'full') return '#10b981';
    if (props.$type === 'half') return '#3b82f6';
    if (props.$type === 'quarter') return '#f59e0b';
    return 'rgba(255, 255, 255, 0.7)';
  }};
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: ${props => {
    if (props.variant === 'success') return 'rgba(16, 185, 129, 0.2)';
    if (props.variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'success') return 'rgba(16, 185, 129, 0.3)';
    if (props.variant === 'warning') return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => {
    if (props.variant === 'success') return '#10b981';
    if (props.variant === 'warning') return '#f59e0b';
    return 'rgba(255, 255, 255, 0.7)';
  }};
`;

const ActionButton = styled.button`
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
`;

export default function AdSlotsManagement() {
  const [slots] = useState([
    {
      id: 1,
      issueId: 123,
      pageNumber: 1,
      slotType: 'full',
      slotTypeLabel: 'עמוד מלא',
      available: true,
      advertiser: null,
      price: 5000,
      contractStatus: null,
    },
    {
      id: 2,
      issueId: 123,
      pageNumber: 2,
      slotType: 'half',
      slotTypeLabel: 'חצי עמוד - אופקי',
      available: false,
      advertiser: 'חברת ABC',
      price: 2500,
      contractStatus: 'paid',
    },
    {
      id: 3,
      issueId: 123,
      pageNumber: 3,
      slotType: 'quarter',
      slotTypeLabel: 'רבע עמוד',
      available: true,
      advertiser: null,
      price: 1250,
      contractStatus: null,
    },
  ]);

  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <AdminLayout title="ניהול מקומות פרסום">
      <Container>
        <FiltersBar>
          <FilterButton 
            $active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          >
            כל הגליונות
          </FilterButton>
          <FilterButton 
            $active={activeFilter === 'available'}
            onClick={() => setActiveFilter('available')}
          >
            פנויים בלבד
          </FilterButton>
          <FilterButton 
            $active={activeFilter === 'taken'}
            onClick={() => setActiveFilter('taken')}
          >
            תפוסים בלבד
          </FilterButton>
        </FiltersBar>

        <TableWrapper>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>מספר עמוד</TableHeaderCell>
                <TableHeaderCell>סוג מקום</TableHeaderCell>
                <TableHeaderCell>זמינות</TableHeaderCell>
                <TableHeaderCell>מפרסם</TableHeaderCell>
                <TableHeaderCell>מחיר</TableHeaderCell>
                <TableHeaderCell>סטטוס תשלום</TableHeaderCell>
                <TableHeaderCell>פעולות</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {slots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <FileText size={16} />
                      עמוד {slot.pageNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <SlotTypeBadge $type={slot.slotType}>
                      {slot.slotTypeLabel}
                    </SlotTypeBadge>
                  </TableCell>
                  <StatusCell>
                    {slot.available ? (
                      <>
                        <CheckCircle size={20} color="#10b981" />
                        פנוי
                      </>
                    ) : (
                      <>
                        <XCircle size={20} color="#ef4444" />
                        תפוס
                      </>
                    )}
                  </StatusCell>
                  <TableCell>
                    {slot.advertiser || '-'}
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <DollarSign size={16} />
                      {slot.price.toLocaleString()} ₪
                    </div>
                  </TableCell>
                  <TableCell>
                    {slot.contractStatus === 'paid' ? (
                      <Badge variant="success">שולם</Badge>
                    ) : slot.contractStatus === 'pending' ? (
                      <Badge variant="warning">ממתין</Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <ActionButton>
                      עריכה
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      </Container>
    </AdminLayout>
  );
}
