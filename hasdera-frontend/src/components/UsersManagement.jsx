/**
 * UsersManagement.jsx
 * ניהול משתמשים והרשאות - תפקידים וגישה מוגבלת
 */

import { useState } from 'react';
import styled from 'styled-components';
import { Shield, UserPlus, Users, Lock, Eye, Edit } from 'lucide-react';
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

const RolesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${hasederaTheme.spacing.xl};
  margin-bottom: ${hasederaTheme.spacing['2xl']};
`;

const RoleCard = styled(Card)`
  text-align: center;
`;

const RoleIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${hasederaTheme.colors.primary.main} 0%, ${hasederaTheme.colors.primary.dark} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${hasederaTheme.colors.text.white};
  margin: 0 auto ${hasederaTheme.spacing.lg};
`;

const RoleTitle = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.xl};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0 0 ${hasederaTheme.spacing.md} 0;
`;

const RoleDescription = styled.p`
  color: ${hasederaTheme.colors.text.secondary};
  margin: 0 0 ${hasederaTheme.spacing.lg} 0;
  line-height: 1.6;
`;

const PermissionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${hasederaTheme.spacing.lg} 0;
  text-align: right;
`;

const PermissionItem = styled.li`
  padding: ${hasederaTheme.spacing.sm};
  color: ${hasederaTheme.colors.text.secondary};
  font-size: ${hasederaTheme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  gap: ${hasederaTheme.spacing.sm};

  &::before {
    content: '✓';
    color: ${hasederaTheme.colors.success.main};
    font-weight: bold;
  }
`;

const UsersTable = styled.table`
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
    <Container>
      <Header>
        <Title>משתמשים והרשאות</Title>
        <PrimaryButton>
          <UserPlus size={18} style={{ marginLeft: '8px' }} />
          הוספת משתמש
        </PrimaryButton>
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

      <h2 style={{ marginBottom: hasederaTheme.spacing.xl, fontSize: hasederaTheme.typography.fontSize['2xl'] }}>
        רשימת משתמשים
      </h2>

      <UsersTable>
        <TableHeader>
          <tr>
            <TableHeaderCell>שם</TableHeaderCell>
            <TableHeaderCell>אימייל</TableHeaderCell>
            <TableHeaderCell>תפקיד</TableHeaderCell>
            <TableHeaderCell>סטטוס</TableHeaderCell>
            <TableHeaderCell>פעולות</TableHeaderCell>
          </tr>
        </TableHeader>
        <tbody>
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
                <SecondaryButton style={{ padding: '4px 12px', fontSize: '14px', marginLeft: '8px' }}>
                  <Eye size={14} style={{ marginLeft: '4px' }} />
                  צפייה
                </SecondaryButton>
                <SecondaryButton style={{ padding: '4px 12px', fontSize: '14px' }}>
                  <Edit size={14} style={{ marginLeft: '4px' }} />
                  עריכה
                </SecondaryButton>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </UsersTable>
    </Container>
  );
}

