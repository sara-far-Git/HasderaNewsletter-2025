/**
 * UsersManagement.jsx
 * ניהול משתמשים והרשאות - תפקידים וגישה מוגבלת
 * מעוצב כמו אזור המפרסמים
 */

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Shield, UserPlus, Users, Lock, Eye, Edit } from 'lucide-react';
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
  justify-content: space-between;
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

// 🎨 Roles Grid
const RolesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const RoleCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    transform: translateY(-4px);
  }
`;

const RoleIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
  
  svg {
    width: 40px;
    height: 40px;
    display: block;
  }
`;

const RoleTitle = styled.h3`
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  margin: 0 0 0.75rem 0;
  letter-spacing: 1px;
`;

const RoleDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
  font-size: 0.95rem;
`;

const PermissionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: right;
`;

const PermissionItem = styled.li`
  padding: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;

  &::before {
    content: '✓';
    color: #10b981;
    font-weight: bold;
    font-size: 1rem;
  }
`;

// 🎨 Users Table Section
const SectionTitle = styled.h2`
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  font-weight: 400;
  color: white;
  margin-bottom: 2rem;
  letter-spacing: 1px;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.6s;
  animation-fill-mode: both;
`;

const UsersTable = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-delay: 0.8s;
  animation-fill-mode: both;
`;

const TableHeader = styled.div`
  background: rgba(16, 185, 129, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr 1fr 2fr;
  gap: 1rem;
  padding: 1.5rem;
`;

const TableHeaderCell = styled.div`
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  text-align: right;
`;

const TableBody = styled.div``;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr 1fr 2fr;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: ${props => {
    if (props.variant === 'success') return 'rgba(16, 185, 129, 0.2)';
    if (props.variant === 'error') return 'rgba(239, 68, 68, 0.2)';
    if (props.variant === 'info') return 'rgba(59, 130, 246, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'success') return 'rgba(16, 185, 129, 0.3)';
    if (props.variant === 'error') return 'rgba(239, 68, 68, 0.3)';
    if (props.variant === 'info') return 'rgba(59, 130, 246, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${props => {
    if (props.variant === 'success') return '#10b981';
    if (props.variant === 'error') return '#ef4444';
    if (props.variant === 'info') return '#3b82f6';
    return 'rgba(255, 255, 255, 0.7)';
  }};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
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
  margin-right: 0.5rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
  }
  
  svg {
    width: 14px;
    height: 14px;
    display: block;
  }
`;

export default function UsersManagement() {
  const [users] = useState([
    {
      id: 1,
      name: 'שרה כהן',
      email: 'sara@hasdera.co.il',
      role: 'admin',
      roleLabel: 'מנהל ראשי',
      status: 'active',
    },
    {
      id: 2,
      name: 'דוד לוי',
      email: 'david@hasdera.co.il',
      role: 'editor',
      roleLabel: 'עורך',
      status: 'active',
    },
    {
      id: 3,
      name: 'מיכל רוזן',
      email: 'michal@hasdera.co.il',
      role: 'ad_manager',
      roleLabel: 'מנהלת פרסום',
      status: 'active',
    },
  ]);

  const roles = [
    {
      id: 'admin',
      title: 'מנהל ראשי',
      description: 'גישה מלאה לכל המערכת',
      icon: Shield,
      permissions: ['כל ההרשאות', 'ניהול משתמשים', 'גישה לדוחות', 'הגדרות מערכת'],
    },
    {
      id: 'editor',
      title: 'עורך/כותב',
      description: 'ניהול תוכן וכתבות',
      icon: Edit,
      permissions: ['ניהול כתבות', 'ניהול מדורים', 'העלאת תמונות', 'הגהה'],
    },
    {
      id: 'ad_manager',
      title: 'מנהל/ת פרסום',
      description: 'ניהול מפרסמים ופרסומות',
      icon: Users,
      permissions: ['ניהול מפרסמים', 'ניהול מקומות פרסום', 'חוזים', 'תשלומים'],
    },
    {
      id: 'collector',
      title: 'איש גבייה',
      description: 'ניהול תשלומים וגבייה',
      icon: Lock,
      permissions: ['ניהול תשלומים', 'חשבוניות', 'תזכורות', 'דוחות הכנסות'],
    },
  ];

  return (
    <AdminLayout title="משתמשים והרשאות">
      <Container>
        <Header>
          <AddButton>
            <UserPlus size={18} />
            הוספת משתמש
          </AddButton>
        </Header>

        <RolesGrid>
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <RoleCard key={role.id}>
                <RoleIcon>
                  <Icon size={40} />
                </RoleIcon>
                <RoleTitle>{role.title}</RoleTitle>
                <RoleDescription>{role.description}</RoleDescription>
                <PermissionsList>
                  {role.permissions.map((permission, idx) => (
                    <PermissionItem key={idx}>{permission}</PermissionItem>
                  ))}
                </PermissionsList>
              </RoleCard>
            );
          })}
        </RolesGrid>

        <SectionTitle>רשימת משתמשים</SectionTitle>

        <UsersTable>
          <TableHeader>
            <TableHeaderCell>שם</TableHeaderCell>
            <TableHeaderCell>אימייל</TableHeaderCell>
            <TableHeaderCell>תפקיד</TableHeaderCell>
            <TableHeaderCell>סטטוס</TableHeaderCell>
            <TableHeaderCell>פעולות</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="info">{user.roleLabel}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                    {user.status === 'active' ? 'פעיל' : 'לא פעיל'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ActionButton>
                    <Eye size={14} />
                    צפייה
                  </ActionButton>
                  <ActionButton>
                    <Edit size={14} />
                    עריכה
                  </ActionButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </UsersTable>
      </Container>
    </AdminLayout>
  );
}
