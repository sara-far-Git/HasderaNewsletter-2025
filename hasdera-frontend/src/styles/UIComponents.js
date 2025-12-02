import styled from "styled-components";
import hasederaTheme from "./HasederaTheme";

// 🎨 === BUTTONS === 🎨

export const PrimaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${hasederaTheme.colors.gradient.primary};
  color: ${hasederaTheme.colors.text.white};
  border: none;
  border-radius: ${hasederaTheme.borderRadius.md};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  box-shadow: ${hasederaTheme.shadows.green};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${hasederaTheme.shadows.greenHover};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${hasederaTheme.colors.background.card};
  color: ${hasederaTheme.colors.primary.main};
  border: 2px solid ${hasederaTheme.colors.primary.main};
  border-radius: ${hasederaTheme.borderRadius.md};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background: ${hasederaTheme.colors.primary.main};
    color: ${hasederaTheme.colors.text.white};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const IconButton = styled.button`
  padding: 0.5rem;
  background: ${props => props.$variant === 'primary' 
    ? hasederaTheme.colors.primary.main 
    : 'transparent'};
  color: ${props => props.$variant === 'primary' 
    ? hasederaTheme.colors.text.white 
    : hasederaTheme.colors.text.secondary};
  border: none;
  border-radius: ${hasederaTheme.borderRadius.md};
  cursor: pointer;
  transition: ${hasederaTheme.transitions.base};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: ${props => props.$variant === 'primary' 
      ? hasederaTheme.colors.primary.dark 
      : hasederaTheme.colors.background.hover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 🎨 === CARDS === 🎨

export const Card = styled.div`
  background: ${hasederaTheme.colors.background.card};
  border-radius: ${hasederaTheme.borderRadius.lg};
  box-shadow: ${hasederaTheme.shadows.base};
  padding: ${hasederaTheme.spacing.lg};
  transition: ${hasederaTheme.transitions.base};
  
  ${props => props.$hoverable && `
    &:hover {
      box-shadow: ${hasederaTheme.shadows.md};
      transform: translateY(-2px);
    }
  `}
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${hasederaTheme.spacing.lg};
  padding-bottom: ${hasederaTheme.spacing.md};
  border-bottom: 1px solid ${hasederaTheme.colors.border.light};
`;

export const CardTitle = styled.h2`
  font-size: ${hasederaTheme.typography.fontSize.xl};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  color: ${hasederaTheme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// 🎨 === INPUTS === 🎨

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${hasederaTheme.colors.border.light};
  border-radius: ${hasederaTheme.borderRadius.md};
  font-size: ${hasederaTheme.typography.fontSize.base};
  transition: ${hasederaTheme.transitions.base};
  direction: rtl;
  
  &:focus {
    outline: none;
    border-color: ${hasederaTheme.colors.primary.main};
    box-shadow: 0 0 0 3px ${hasederaTheme.colors.primary.main}1a;
  }
  
  &::placeholder {
    color: ${hasederaTheme.colors.text.disabled};
  }
  
  &:disabled {
    background: ${hasederaTheme.colors.background.hover};
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${hasederaTheme.colors.border.light};
  border-radius: ${hasederaTheme.borderRadius.md};
  font-size: ${hasederaTheme.typography.fontSize.base};
  font-family: inherit;
  transition: ${hasederaTheme.transitions.base};
  resize: vertical;
  min-height: 100px;
  direction: rtl;
  
  &:focus {
    outline: none;
    border-color: ${hasederaTheme.colors.primary.main};
    box-shadow: 0 0 0 3px ${hasederaTheme.colors.primary.main}1a;
  }
  
  &::placeholder {
    color: ${hasederaTheme.colors.text.disabled};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${hasederaTheme.colors.border.light};
  border-radius: ${hasederaTheme.borderRadius.md};
  font-size: ${hasederaTheme.typography.fontSize.base};
  transition: ${hasederaTheme.transitions.base};
  cursor: pointer;
  direction: rtl;
  
  &:focus {
    outline: none;
    border-color: ${hasederaTheme.colors.primary.main};
    box-shadow: 0 0 0 3px ${hasederaTheme.colors.primary.main}1a;
  }
`;

// 🎨 === LAYOUT === 🎨

export const Container = styled.div`
  max-width: ${props => props.$maxWidth || '1400px'};
  margin: 0 auto;
  padding: ${props => props.$padding || hasederaTheme.spacing.xl};
  
  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    padding: ${hasederaTheme.spacing.md};
  }
`;

export const PageHeader = styled.header`
  background: ${hasederaTheme.colors.gradient.primary};
  color: ${hasederaTheme.colors.text.white};
  padding: ${hasederaTheme.spacing.xl} ${hasederaTheme.spacing['2xl']};
  box-shadow: ${hasederaTheme.shadows.md};
  margin-bottom: ${hasederaTheme.spacing.xl};
`;

export const PageTitle = styled.h1`
  font-size: ${hasederaTheme.typography.fontSize['3xl']};
  font-weight: ${hasederaTheme.typography.fontWeight.bold};
  margin: 0;
  
  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    font-size: ${hasederaTheme.typography.fontSize['2xl']};
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$cols || 'repeat(auto-fit, minmax(250px, 1fr))'};
  gap: ${props => props.$gap || hasederaTheme.spacing.lg};
  
  @media (max-width: ${hasederaTheme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

export const Flex = styled.div`
  display: flex;
  flex-direction: ${props => props.$direction || 'row'};
  justify-content: ${props => props.$justify || 'flex-start'};
  align-items: ${props => props.$align || 'stretch'};
  gap: ${props => props.$gap || hasederaTheme.spacing.md};
  flex-wrap: ${props => props.$wrap ? 'wrap' : 'nowrap'};
`;

// 🎨 === BADGES & LABELS === 🎨

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: ${hasederaTheme.borderRadius.full};
  font-size: ${hasederaTheme.typography.fontSize.sm};
  font-weight: ${hasederaTheme.typography.fontWeight.semibold};
  
  ${props => {
    switch(props.$variant) {
      case 'success':
        return `
          background: #d1fae5;
          color: ${hasederaTheme.colors.status.success};
        `;
      case 'warning':
        return `
          background: #fef3c7;
          color: ${hasederaTheme.colors.status.warning};
        `;
      case 'error':
        return `
          background: #fee2e2;
          color: ${hasederaTheme.colors.status.error};
        `;
      case 'info':
        return `
          background: #dbeafe;
          color: ${hasederaTheme.colors.status.info};
        `;
      default:
        return `
          background: ${hasederaTheme.colors.background.hover};
          color: ${hasederaTheme.colors.text.secondary};
        `;
    }
  }}
`;

// 🎨 === DIVIDER === 🎨

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${hasederaTheme.colors.border.light};
  margin: ${hasederaTheme.spacing.lg} 0;
`;

// 🎨 === LOADING === 🎨

export const Spinner = styled.div`
  width: ${props => props.$size || '40px'};
  height: ${props => props.$size || '40px'};
  border: 4px solid ${hasederaTheme.colors.border.light};
  border-top-color: ${hasederaTheme.colors.primary.main};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: ${props => props.$minHeight || '200px'};
  flex-direction: column;
  gap: ${hasederaTheme.spacing.md};
`;

// 🎨 === ALERT === 🎨

export const Alert = styled.div`
  padding: ${hasederaTheme.spacing.md} ${hasederaTheme.spacing.lg};
  border-radius: ${hasederaTheme.borderRadius.md};
  margin-bottom: ${hasederaTheme.spacing.md};
  
  ${props => {
    switch(props.$variant) {
      case 'success':
        return `
          background: #d1fae5;
          color: ${hasederaTheme.colors.status.success};
          border-right: 4px solid ${hasederaTheme.colors.status.success};
        `;
      case 'warning':
        return `
          background: #fef3c7;
          color: ${hasederaTheme.colors.status.warning};
          border-right: 4px solid ${hasederaTheme.colors.status.warning};
        `;
      case 'error':
        return `
          background: #fee2e2;
          color: ${hasederaTheme.colors.status.error};
          border-right: 4px solid ${hasederaTheme.colors.status.error};
        `;
      case 'info':
        return `
          background: #dbeafe;
          color: ${hasederaTheme.colors.status.info};
          border-right: 4px solid ${hasederaTheme.colors.status.info};
        `;
      default:
        return `
          background: ${hasederaTheme.colors.background.hover};
          color: ${hasederaTheme.colors.text.primary};
        `;
    }
  }}
`;

