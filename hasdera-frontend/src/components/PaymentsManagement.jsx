/**
 * PaymentsManagement.jsx
 * מערכת תשלומים וגבייה - חשבוניות, תשלומים, תזכורות ודוחות
 */

import { useState } from 'react';
import styled from 'styled-components';
import { CreditCard, FileText, Bell, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import hasederaTheme from '../styles/HasederaTheme';
import { Card, CardHeader, CardTitle, PrimaryButton, SecondaryButton, Badge } from '../styles';

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${hasederaTheme.spacing.xl};
  margin-bottom: ${hasederaTheme.spacing['2xl']};
`;

const StatCard = styled(Card)`
  text-align: center;
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.main} 0%, ${hasederaTheme.colors.primary.dark} 100%);
  color: ${hasederaTheme.colors.text.white};
  border: none;
`;

const StatValue = styled.div`
  font-size: ${hasederaTheme.typography.fontSize['3xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  margin-bottom: ${hasederaTheme.spacing.sm};
`;

const StatLabel = styled.div`
  font-size: ${hasederaTheme.typography.fontSize.base};
  opacity: 0.9;
`;

const TabsBar = styled.div`
  display: flex;
  gap: ${hasederaTheme.spacing.md};
  margin-bottom: ${hasederaTheme.spacing.xl};
  border-bottom: 2px solid ${hasederaTheme.colors.border.light};
`;

const Tab = styled.button`
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing.xl};
  background: transparent;
  border: none;
  border-bottom: 3px solid ${props => props.$active ? hasederaTheme.colors.primary.main : 'transparent'};
  color: ${props => props.$active ? hasederaTheme.colors.primary.main : hasederaTheme.colors.text.secondary};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${props => props.$active ? hasederaTheme.typography.fontWeight.semibold : hasederaTheme.typography.fontWeight.normal};
  cursor: pointer;
  transition: all ${hasederaTheme.transitions.base};
`;

const PaymentsTable = styled.table`
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
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${hasederaTheme.colors.border.light};

  &:hover {
    background: ${hasederaTheme.colors.background.main};
  }
`;

const TableCell = styled.td`
  padding: ${hasederaTheme.spacing.lg};
  color: ${hasederaTheme.colors.text.primary};
`;

export default function PaymentsManagement() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [payments] = useState([
    {
      id: 1,
      invoiceNumber: 'INV-2025-001',
      advertiser: 'חברת ABC',
      amount: 5000,
      date: '2025-01-15',
      dueDate: '2025-02-15',
      status: 'paid',
      paymentDate: '2025-01-20',
    },
    {
      id: 2,
      invoiceNumber: 'INV-2025-002',
      advertiser: 'XYZ שיווק',
      amount: 3000,
      date: '2025-01-20',
      dueDate: '2025-02-20',
      status: 'pending',
      paymentDate: null,
    },
    {
      id: 3,
      invoiceNumber: 'INV-2025-003',
      advertiser: 'חברת DEF',
      amount: 7500,
      date: '2025-01-10',
      dueDate: '2025-02-10',
      status: 'overdue',
      paymentDate: null,
    },
  ]);

  const stats = [
    { label: 'סה"כ הכנסות החודש', value: '₪125,000', icon: TrendingUp },
    { label: 'תשלומים ממתינים', value: '3', icon: Clock },
    { label: 'תשלומים מאוחרים', value: '1', icon: XCircle },
    { label: 'חשבוניות החודש', value: '12', icon: FileText },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={20} color={hasederaTheme.colors.status.success} />;
      case 'pending':
        return <Clock size={20} color={hasederaTheme.colors.status.warning} />;
      case 'overdue':
        return <XCircle size={20} color={hasederaTheme.colors.status.error} />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">שולם</Badge>;
      case 'pending':
        return <Badge variant="warning">ממתין</Badge>;
      case 'overdue':
        return <Badge variant="error">מאוחר</Badge>;
      default:
        return null;
    }
  };

  return (
    <Container>
      <Header>
        <Title>מערכת תשלומים וגבייה</Title>
        <PrimaryButton>
          <FileText size={18} style={{ marginLeft: '8px' }} />
          צירוף חשבונית
        </PrimaryButton>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <StatCard key={index}>
              <Icon size={32} style={{ marginBottom: '12px', opacity: 0.8 }} />
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          );
        })}
      </StatsGrid>

      <TabsBar>
        <Tab $active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')}>
          חשבוניות
        </Tab>
        <Tab $active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
          תשלומים
        </Tab>
        <Tab $active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')}>
          תזכורות
        </Tab>
        <Tab $active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>
          דוחות
        </Tab>
      </TabsBar>

      <PaymentsTable>
        <TableHeader>
          <tr>
            <TableHeaderCell>מספר חשבונית</TableHeaderCell>
            <TableHeaderCell>מפרסם</TableHeaderCell>
            <TableHeaderCell>סכום</TableHeaderCell>
            <TableHeaderCell>תאריך</TableHeaderCell>
            <TableHeaderCell>תאריך יעד</TableHeaderCell>
            <TableHeaderCell>סטטוס</TableHeaderCell>
            <TableHeaderCell>פעולות</TableHeaderCell>
          </tr>
        </TableHeader>
        <tbody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.invoiceNumber}</TableCell>
              <TableCell>{payment.advertiser}</TableCell>
              <TableCell>₪{payment.amount.toLocaleString()}</TableCell>
              <TableCell>{payment.date}</TableCell>
              <TableCell>{payment.dueDate}</TableCell>
              <TableCell>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStatusIcon(payment.status)}
                  {getStatusBadge(payment.status)}
                </div>
              </TableCell>
              <TableCell>
                <SecondaryButton style={{ padding: '4px 12px', fontSize: '14px' }}>
                  עריכה
                </SecondaryButton>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </PaymentsTable>
    </Container>
  );
}

