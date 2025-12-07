/**
 * styles/index.js
 * ייצוא כל הקומפוננטים המעוצבים והתימה
 */

import styled from 'styled-components';
import hasederaTheme from './HasederaTheme';

// ============================================
// Buttons
// ============================================

export const PrimaryButton = styled.button`
  background: ${hasederaTheme.colors.primary.main};
  color: ${hasederaTheme.colors.text.white};
  border: none;
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing.xl};
  border-radius: ${hasederaTheme.borderRadius.md};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${hasederaTheme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${hasederaTheme.transitions.base};
  font-family: ${hasederaTheme.typography.fontFamily.primary};
  direction: rtl;

  &:hover {
    background: ${hasederaTheme.colors.primary.dark};
    transform: translateY(-2px);
    box-shadow: ${hasederaTheme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: ${hasederaTheme.colors.text.disabled};
    cursor: not-allowed;
    transform: none;
  }
`;

export const SecondaryButton = styled.button`
  background: transparent;
  color: ${hasederaTheme.colors.primary.main};
  border: 2px solid ${hasederaTheme.colors.primary.main};
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing.xl};
  border-radius: ${hasederaTheme.borderRadius.md};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${hasederaTheme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${hasederaTheme.transitions.base};
  font-family: ${hasederaTheme.typography.fontFamily.primary};
  direction: rtl;

  &:hover {
    background: ${hasederaTheme.colors.primary.main};
    color: ${hasederaTheme.colors.text.white};
    transform: translateY(-2px);
    box-shadow: ${hasederaTheme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const IconButton = styled.button`
  background: transparent;
  border: none;
  padding: ${hasederaTheme.spacing.sm};
  border-radius: ${hasederaTheme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${hasederaTheme.transitions.base};
  color: ${hasederaTheme.colors.text.primary};

  &:hover {
    background: ${hasederaTheme.colors.background.main};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

// ============================================
// Cards
// ============================================

export const Card = styled.div`
  background: ${hasederaTheme.colors.background.card};
  border-radius: ${hasederaTheme.borderRadius.lg};
  padding: ${hasederaTheme.spacing.xl};
  box-shadow: ${hasederaTheme.shadows.md};
  transition: all ${hasederaTheme.transitions.base};
  border: 1px solid ${hasederaTheme.colors.border.light};
  direction: rtl;

  &:hover {
    box-shadow: ${hasederaTheme.shadows.lg};
    transform: translateY(-2px);
  }
`;

export const CardHeader = styled.div`
  margin-bottom: ${hasederaTheme.spacing.lg};
  padding-bottom: ${hasederaTheme.spacing.md};
  border-bottom: 1px solid ${hasederaTheme.colors.border.light};
`;

export const CardTitle = styled.h3`
  font-size: ${hasederaTheme.typography.fontSize.xl};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0;
`;

export const CardContent = styled.div`
  color: ${hasederaTheme.colors.text.secondary};
`;

// ============================================
// Inputs
// ============================================

export const Input = styled.input`
  width: 100%;
  padding: ${hasederaTheme.spacing.md};
  border: 2px solid ${hasederaTheme.colors.border.medium};
  border-radius: ${hasederaTheme.borderRadius.md};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-family: ${hasederaTheme.typography.fontFamily.primary};
  transition: all ${hasederaTheme.transitions.base};
  direction: rtl;
  background: ${hasederaTheme.colors.background.light};

  &:focus {
    outline: none;
    border-color: ${hasederaTheme.colors.primary.main};
    box-shadow: 0 0 0 3px ${hasederaTheme.colors.primary.main}33;
  }

  &::placeholder {
    color: ${hasederaTheme.colors.text.disabled};
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: ${hasederaTheme.spacing.md};
  border: 2px solid ${hasederaTheme.colors.border.medium};
  border-radius: ${hasederaTheme.borderRadius.md};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-family: ${hasederaTheme.typography.fontFamily.primary};
  transition: all ${hasederaTheme.transitions.base};
  direction: rtl;
  background: ${hasederaTheme.colors.background.light};
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${hasederaTheme.colors.primary.main};
    box-shadow: 0 0 0 3px ${hasederaTheme.colors.primary.main}33;
  }

  &::placeholder {
    color: ${hasederaTheme.colors.text.disabled};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: ${hasederaTheme.spacing.md};
  border: 2px solid ${hasederaTheme.colors.border.medium};
  border-radius: ${hasederaTheme.borderRadius.md};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-family: ${hasederaTheme.typography.fontFamily.primary};
  transition: all ${hasederaTheme.transitions.base};
  direction: rtl;
  background: ${hasederaTheme.colors.background.light};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${hasederaTheme.colors.primary.main};
    box-shadow: 0 0 0 3px ${hasederaTheme.colors.primary.main}33;
  }
`;

// ============================================
// Layout Components
// ============================================

export const Container = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${hasederaTheme.spacing.xl};
  direction: rtl;
`;

export const PageHeader = styled.header`
  background: ${hasederaTheme.colors.background.light};
  padding: ${hasederaTheme.spacing.xl};
  border-bottom: 2px solid ${hasederaTheme.colors.border.light};
  margin-bottom: ${hasederaTheme.spacing.xl};
  direction: rtl;
`;

export const PageTitle = styled.h1`
  font-size: ${hasederaTheme.typography.fontSize['3xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0;
`;

export const PageSubtitle = styled.p`
  font-size: ${hasederaTheme.typography.fontSize.lg};
  color: ${hasederaTheme.colors.text.secondary};
  margin: ${hasederaTheme.spacing.sm} 0 0 0;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${hasederaTheme.spacing.xl};
  direction: rtl;
`;

export const Flex = styled.div`
  display: flex;
  gap: ${props => props.gap || hasederaTheme.spacing.md};
  align-items: ${props => props.alignItems || 'center'};
  justify-content: ${props => props.justifyContent || 'flex-start'};
  direction: rtl;
  flex-wrap: ${props => props.wrap || 'nowrap'};
`;

// ============================================
// Badge
// ============================================

export const Badge = styled.span`
  display: inline-block;
  padding: ${hasederaTheme.spacing.xs} ${hasederaTheme.spacing.sm};
  border-radius: ${hasederaTheme.borderRadius.full};
  font-size: ${hasederaTheme.typography.fontSize.sm};
  font-weight: ${hasederaTheme.typography.fontWeight.medium};
  background: ${props => {
    if (props.variant === 'success') return hasederaTheme.colors.success.main;
    if (props.variant === 'error') return hasederaTheme.colors.error.main;
    if (props.variant === 'warning') return hasederaTheme.colors.warning.main;
    if (props.variant === 'info') return hasederaTheme.colors.info.main;
    return hasederaTheme.colors.primary.main;
  }};
  color: ${hasederaTheme.colors.text.white};
`;

// ============================================
// Spinner
// ============================================

export const Spinner = styled.div`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border: 4px solid ${hasederaTheme.colors.border.light};
  border-top-color: ${hasederaTheme.colors.primary.main};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Export theme
export { hasederaTheme };
export default hasederaTheme;