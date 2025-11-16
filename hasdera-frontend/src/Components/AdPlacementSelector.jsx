import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { Check, X } from "lucide-react";

// 🎨 Styled Components
const SelectorContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  direction: rtl;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
`;

const SizeSelector = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const SizeButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid ${props => props.$active ? '#667eea' : '#e5e7eb'};
  border-radius: 0.75rem;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.$active ? 'white' : '#374151'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$active ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'};

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }
`;

const PageContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  aspect-ratio: 1 / 1.414; /* יחס A4 */
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
`;

const PageGrid = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: ${props => {
    if (props.$size === 'full') return '1fr';
    if (props.$size === 'half') return props.$orientation === 'horizontal' ? 'repeat(2, 1fr)' : '1fr';
    if (props.$size === 'quarter') return 'repeat(2, 1fr)';
    return '1fr';
  }};
  grid-template-rows: ${props => {
    if (props.$size === 'full') return '1fr';
    if (props.$size === 'half') return props.$orientation === 'horizontal' ? '1fr' : 'repeat(2, 1fr)';
    if (props.$size === 'quarter') return 'repeat(2, 1fr)';
    return '1fr';
  }};
  gap: ${props => props.$size ? '2px' : '0'};
  background-color: ${props => props.$size ? '#e5e7eb' : 'transparent'};
`;

const FullPage = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  ${props => props.$selected && `
    background: rgba(102, 126, 234, 0.2) !important;
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3) !important;
  `}
`;

const HalfPage = styled.div`
  position: relative;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;

  &:hover {
    background: ${props => props.$isHovered ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.05)'};
    border-color: ${props => props.$isHovered ? '#667eea' : 'transparent'};
    transform: ${props => props.$isHovered ? 'scale(1.02)' : 'scale(1)'};
    z-index: ${props => props.$isHovered ? '10' : '1'};
    box-shadow: ${props => props.$isHovered ? '0 4px 20px rgba(102, 126, 234, 0.3)' : 'none'};
  }

  ${props => props.$selected && `
    background: rgba(102, 126, 234, 0.2) !important;
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2) !important;
  `}
`;

const Quarter = styled.div`
  position: relative;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;

  /* Hover effect */
  &:hover {
    background: ${props => {
      if (props.$size === 'full') return 'rgba(102, 126, 234, 0.1)';
      if (props.$size === 'half') {
        if (props.$isHovered) return 'rgba(102, 126, 234, 0.15)';
        return 'rgba(102, 126, 234, 0.05)';
      }
      if (props.$size === 'quarter') {
        if (props.$isHovered) return 'rgba(102, 126, 234, 0.2)';
        return 'rgba(102, 126, 234, 0.05)';
      }
      return 'white';
    }};
    border-color: ${props => props.$isHovered ? '#667eea' : 'transparent'};
    transform: ${props => props.$isHovered ? 'scale(1.02)' : 'scale(1)'};
    z-index: ${props => props.$isHovered ? '10' : '1'};
    box-shadow: ${props => props.$isHovered ? '0 4px 20px rgba(102, 126, 234, 0.3)' : 'none'};
  }

  /* Selected state */
  ${props => props.$selected && `
    background: rgba(102, 126, 234, 0.2) !important;
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2) !important;
  `}

  /* Full page highlight */
  ${props => props.$size === 'full' && props.$isHovered && `
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(102, 126, 234, 0.1);
      border: 3px solid #667eea;
      border-radius: 0.25rem;
      z-index: 5;
    }
  `}

  /* Half page highlight */
  ${props => props.$size === 'half' && props.$isHovered && `
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(102, 126, 234, 0.15);
      border: 3px solid #667eea;
      border-radius: 0.25rem;
      z-index: 5;
    }
  `}

  /* Quarter page highlight */
  ${props => props.$size === 'quarter' && props.$isHovered && `
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(102, 126, 234, 0.2);
      border: 3px solid #667eea;
      border-radius: 0.25rem;
      z-index: 5;
    }
  `}
`;

const QuarterLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
  pointer-events: none;
  z-index: 2;
  transition: all 0.3s ease;

  ${props => props.$isHovered && `
    color: #667eea;
    font-weight: 700;
    font-size: 1rem;
  `}

  ${props => props.$selected && `
    color: #667eea;
    font-weight: 700;
  `}
`;

const SelectionInfo = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 0.75rem;
  border: 2px solid #bae6fd;
  text-align: center;
`;

const SelectionText = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #0369a1;
  margin-bottom: 0.5rem;
`;

const SelectionDetails = styled.div`
  font-size: 0.95rem;
  color: #075985;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;

    &:hover {
      border-color: #667eea;
      color: #667eea;
    }
  `}
`;

// 🎯 Main Component
export default function AdPlacementSelector({ onSelect, onCancel }) {
  const [selectedSize, setSelectedSize] = useState(null); // 'full', 'half', 'quarter'
  const [hoveredQuarter, setHoveredQuarter] = useState(null); // מספר הרבע (1-4)
  const [selectedQuarters, setSelectedQuarters] = useState([]); // מערך של רבעים שנבחרו

  // פונקציה לקביעת אילו רבעים להדגיש בהתאם לגודל
  const getHighlightedQuarters = useCallback((quarterIndex, size) => {
    if (size === 'full') {
      return [1, 2, 3, 4]; // כל העמוד
    }
    if (size === 'half') {
      // חצי עמוד - שמאלי או ימני (אופקי)
      if (quarterIndex === 1) return [1, 3]; // חצי שמאלי
      if (quarterIndex === 2) return [2, 4]; // חצי ימני
    }
    if (size === 'quarter') {
      return [quarterIndex]; // רק הרבע הספציפי
    }
    return [];
  }, []);

  const handleQuarterHover = useCallback((quarterIndex) => {
    if (selectedSize) {
      setHoveredQuarter(quarterIndex);
    }
  }, [selectedSize]);

  const handleQuarterClick = useCallback((quarterIndex) => {
    if (!selectedSize) return;

    const quarters = getHighlightedQuarters(quarterIndex, selectedSize);
    setSelectedQuarters(quarters);
  }, [selectedSize, getHighlightedQuarters]);

  const handleFullPageClick = useCallback(() => {
    if (selectedSize === 'full') {
      setSelectedQuarters([1, 2, 3, 4]);
    }
  }, [selectedSize]);

  const handleSizeSelect = useCallback((size) => {
    setSelectedSize(size);
    setSelectedQuarters([]);
    setHoveredQuarter(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedQuarters.length > 0 && selectedSize) {
      onSelect({
        size: selectedSize,
        quarters: selectedQuarters,
        description: getSelectionDescription(selectedSize, selectedQuarters)
      });
    }
  }, [selectedQuarters, selectedSize, onSelect]);

  const getSelectionDescription = (size, quarters) => {
    if (size === 'full') return 'עמוד מלא';
    if (size === 'half') {
      if (quarters.includes(1) && quarters.includes(2)) return 'חצי עמוד עליון';
      if (quarters.includes(3) && quarters.includes(4)) return 'חצי עמוד תחתון';
      if (quarters.includes(1) && quarters.includes(3)) return 'חצי עמוד שמאלי';
      if (quarters.includes(2) && quarters.includes(4)) return 'חצי עמוד ימני';
    }
    if (size === 'quarter') {
      const labels = { 1: 'רבע עליון שמאלי', 2: 'רבע עליון ימני', 3: 'רבע תחתון שמאלי', 4: 'רבע תחתון ימני' };
      return labels[quarters[0]] || 'רבע עמוד';
    }
    return '';
  };

  const highlightedQuarters = hoveredQuarter && selectedSize 
    ? getHighlightedQuarters(hoveredQuarter, selectedSize)
    : [];

  return (
    <SelectorContainer>
      <Header>
        <Title>בחר מיקום למודעה</Title>
        <Subtitle>בחר גודל מודעה ולאחר מכן לחץ על האזור הרצוי בעמוד</Subtitle>
      </Header>

      <SizeSelector>
        <SizeButton
          $active={selectedSize === 'full'}
          onClick={() => handleSizeSelect('full')}
        >
          עמוד מלא
        </SizeButton>
        <SizeButton
          $active={selectedSize === 'half'}
          onClick={() => handleSizeSelect('half')}
        >
          חצי עמוד
        </SizeButton>
        <SizeButton
          $active={selectedSize === 'quarter'}
          onClick={() => handleSizeSelect('quarter')}
        >
          רבע עמוד
        </SizeButton>
      </SizeSelector>

      <PageContainer>
        {!selectedSize ? (
          // עמוד ללא חלוקה - לפני בחירת גודל
          <FullPage
            onClick={() => {
              // לא עושה כלום עד שיבחר גודל
            }}
            style={{ cursor: 'default' }}
          >
            <QuarterLabel style={{ color: '#9ca3af', fontSize: '1rem' }}>
              בחר גודל מודעה כדי לראות את החלוקה
            </QuarterLabel>
          </FullPage>
        ) : selectedSize === 'full' ? (
          // עמוד מלא - ללא חלוקה
          <FullPage
            $selected={selectedQuarters.length > 0}
            onClick={handleFullPageClick}
            onMouseEnter={() => handleQuarterHover(1)}
            onMouseLeave={() => setHoveredQuarter(null)}
          >
            <QuarterLabel $selected={selectedQuarters.length > 0}>
              עמוד מלא
            </QuarterLabel>
          </FullPage>
        ) : selectedSize === 'half' ? (
          // חצי עמוד - חלוקה ל-2
          <PageGrid $size="half" $orientation="horizontal">
            {[
              { index: 1, label: 'חצי שמאלי', quarters: [1, 3] },
              { index: 2, label: 'חצי ימני', quarters: [2, 4] }
            ].map(({ index, label, quarters }) => {
              const isHovered = highlightedQuarters.some(q => quarters.includes(q));
              const isSelected = selectedQuarters.some(q => quarters.includes(q));
              
              return (
                <HalfPage
                  key={index}
                  $isHovered={isHovered}
                  $selected={isSelected}
                  onMouseEnter={() => handleQuarterHover(index === 1 ? 1 : 2)}
                  onMouseLeave={() => setHoveredQuarter(null)}
                  onClick={() => handleQuarterClick(index === 1 ? 1 : 2)}
                >
                  <QuarterLabel $isHovered={isHovered} $selected={isSelected}>
                    {label}
                  </QuarterLabel>
                </HalfPage>
              );
            })}
          </PageGrid>
        ) : (
          // רבע עמוד - חלוקה ל-4
          <PageGrid $size="quarter">
            {[1, 2, 3, 4].map((quarterIndex) => {
              const isHovered = highlightedQuarters.includes(quarterIndex);
              const isSelected = selectedQuarters.includes(quarterIndex);
              
              return (
                <Quarter
                  key={quarterIndex}
                  $size={selectedSize}
                  $isHovered={isHovered}
                  $selected={isSelected}
                  onMouseEnter={() => handleQuarterHover(quarterIndex)}
                  onMouseLeave={() => setHoveredQuarter(null)}
                  onClick={() => handleQuarterClick(quarterIndex)}
                >
                  <QuarterLabel $isHovered={isHovered} $selected={isSelected}>
                    {quarterIndex === 1 && 'רבע עליון שמאלי'}
                    {quarterIndex === 2 && 'רבע עליון ימני'}
                    {quarterIndex === 3 && 'רבע תחתון שמאלי'}
                    {quarterIndex === 4 && 'רבע תחתון ימני'}
                  </QuarterLabel>
                </Quarter>
              );
            })}
          </PageGrid>
        )}
      </PageContainer>

      {selectedQuarters.length > 0 && (
        <SelectionInfo>
          <SelectionText>
            ✓ נבחר: {getSelectionDescription(selectedSize, selectedQuarters)}
          </SelectionText>
          <SelectionDetails>
            {selectedSize === 'full' && 'כל העמוד זמין לפרסום'}
            {selectedSize === 'half' && 'חצי מהעמוד זמין לפרסום'}
            {selectedSize === 'quarter' && 'רבע מהעמוד זמין לפרסום'}
          </SelectionDetails>
        </SelectionInfo>
      )}

      <ActionButtons>
        <ActionButton onClick={onCancel}>
          <X size={18} />
          ביטול
        </ActionButton>
        <ActionButton
          $primary
          onClick={handleConfirm}
          disabled={selectedQuarters.length === 0}
          style={{ opacity: selectedQuarters.length === 0 ? 0.5 : 1, cursor: selectedQuarters.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          <Check size={18} />
          אישור בחירה
        </ActionButton>
      </ActionButtons>
    </SelectorContainer>
  );
}

