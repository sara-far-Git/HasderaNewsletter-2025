/**
 * AdSlotsManagement.jsx
 * ניהול מקומות פרסום - טבלת עמודים, סוגי מקום, זמינות ומחירים
 */

import { useState } from 'react';
import styled from 'styled-components';
import { Layout, CheckCircle, XCircle, DollarSign, FileText } from 'lucide-react';
import hasederaTheme from '../styles/HasederaTheme';
import { Card, CardHeader, CardTitle, PrimaryButton, Badge } from '../styles';

const Container = styled.div`
  padding: ${hasederaTheme.spacing.xl};
  direction: rtl;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${hasederaTheme.spacing['2xl']};
`;

const Title = styled.h1`
  font-size: ${hasederaTheme.typography.fontSize['3xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0;
`;

const FiltersBar = styled.div`
  display: flex;
  gap: ${hasederaTheme.spacing.md};
  margin-bottom: ${hasederaTheme.spacing.xl};
  padding: ${hasederaTheme.spacing.lg};
  background: ${hasederaTheme.colors.background.light};
  border-radius: ${hasederaTheme.borderRadius.lg};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${hasederaTheme.colors.background.light};
  border-radius: ${hasederaTheme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${hasederaTheme.shadows.md};
`;

const TableHeader = styled.thead`
  background: ${hasederaTheme.colors.primary.main};
  color: ${hasederaTheme.colors.text.white};
`;

const TableHeaderCell = styled.th`
  padding: ${hasederaTheme.spacing.lg};
  text-align: right;
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  font-size: ${hasederaTheme.typography.fontSize.base};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid ${hasederaTheme.colors.border.light};
  transition: background ${hasederaTheme.transitions.base};

  &:hover {
    background: ${hasederaTheme.colors.background.main};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: ${hasederaTheme.spacing.lg};
  color: ${hasederaTheme.colors.text.primary};
  font-size: ${hasederaTheme.typography.fontSize.base};
`;

const StatusCell = styled(TableCell)`
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};
`;

const SlotTypeBadge = styled(Badge)`
  background: ${props => {
    if (props.$type === 'full') return hasederaTheme.colors.primary.main;
    if (props.$type === 'half') return hasederaTheme.colors.info.main;
    if (props.$type === 'quarter') return hasederaTheme.colors.warning.main;
    return hasederaTheme.colors.text.disabled;
  }};
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

  return (
    <Container>
      <Header>
        <Title>ניהול מקומות פרסום</Title>
      </Header>

      <FiltersBar>
        <PrimaryButton>כל הגליונות</PrimaryButton>
        <PrimaryButton variant="secondary">פנויים בלבד</PrimaryButton>
        <PrimaryButton variant="secondary">תפוסים בלבד</PrimaryButton>
      </FiltersBar>

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    <CheckCircle size={20} color={hasederaTheme.colors.success.main} />
                    פנוי
                  </>
                ) : (
                  <>
                    <XCircle size={20} color={hasederaTheme.colors.error.main} />
                    תפוס
                  </>
                )}
              </StatusCell>
              <TableCell>
                {slot.advertiser || '-'}
              </TableCell>
              <TableCell>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                <PrimaryButton style={{ padding: '4px 12px', fontSize: '14px' }}>
                  עריכה
                </PrimaryButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

