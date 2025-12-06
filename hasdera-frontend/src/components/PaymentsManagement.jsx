/**
 * PaymentsManagement.jsx
 * מערכת תשלומים וגבייה - חשבוניות, תשלומים, תזכורות ודוחות
 * מעוצב כמו אזור המפרסמים
 */

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { CreditCard, FileText, Bell, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
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

// 🎨 Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1rem;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
  
  svg {
    width: 24px;
    height: 24px;
    display: block;
  }
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

// 🎨 Tabs Bar
const TabsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.6s;
  animation-fill-mode: both;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active 
    ? 'rgba(16, 185, 129, 0.2)' 
    : 'transparent'};
  backdrop-filter: blur(10px);
  border: none;
  border-bottom: 3px solid ${props => props.$active 
    ? '#10b981' 
    : 'transparent'};
  color: ${props => props.$active ? '#10b981' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 0.95rem;
  font-weight: ${props => props.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &:hover {
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
  animation-delay: 0.8s;
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

const Badge = styled.span`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: ${props => {
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.2)';
    if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
    if (props.$variant === 'error') return 'rgba(239, 68, 68, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.3)';
    if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.3)';
    if (props.$variant === 'error') return 'rgba(239, 68, 68, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => {
    if (props.$variant === 'success') return '#10b981';
    if (props.$variant === 'warning') return '#f59e0b';
    if (props.$variant === 'error') return '#ef4444';
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
        return <CheckCircle size={20} color="#10b981" />;
      case 'pending':
        return <Clock size={20} color="#f59e0b" />;
      case 'overdue':
        return <XCircle size={20} color="#ef4444" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge $variant="success">שולם</Badge>;
      case 'pending':
        return <Badge $variant="warning">ממתין</Badge>;
      case 'overdue':
        return <Badge $variant="error">מאוחר</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="מערכת תשלומים וגבייה">
      <Container>
        <Header>
          <AddButton>
            <FileText size={18} />
            צירוף חשבונית
          </AddButton>
        </Header>

        <StatsGrid>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <StatCard key={index}>
                <StatIcon>
                  <Icon size={24} />
                </StatIcon>
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

        <TableWrapper>
          <Table>
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
                  <StatusCell>
                    {getStatusIcon(payment.status)}
                    {getStatusBadge(payment.status)}
                  </StatusCell>
                  <TableCell>
                    <ActionButton>
                      עריכה
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      </Container>
    </AdminLayout>
  );
}
