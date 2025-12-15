/**
 * LinkModal.jsx
 * מודל לעריכה והוספת קישורים
 */

import React from "react";
import { Link, Mail, ExternalLink, Phone, MapPin, Calendar, Clock, Star, Heart, ShoppingCart, User, Home, Trash2 } from "lucide-react";
import {
  LinkModal as ModalOverlay,
  LinkModalContent,
  ModalTitle,
  FormGroup,
  Label,
  Input,
  Select,
  ButtonGroup,
  ActionButton,
  IconGrid,
  IconOption
} from "../styles/FlipbookStyles";

// מיפוי שמות איקונים לקומפוננטות
const ICON_MAP = {
  Link,
  Mail,
  ExternalLink,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Star,
  Heart,
  ShoppingCart,
  User,
  Home
};

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export default function LinkModal({
  isOpen,
  isAddingLink,
  linkForm,
  totalPages,
  editingLink,
  onClose,
  onSave,
  onDelete,
  onFormChange
}) {
  if (!isOpen) return null;

  const handleTypeChange = (e) => {
    onFormChange({ type: e.target.value, url: '', email: '' });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <LinkModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{isAddingLink ? 'הוסף קישור' : 'ערוך קישור'}</ModalTitle>

        <FormGroup>
          <Label>סוג קישור</Label>
          <Select value={linkForm.type} onChange={handleTypeChange}>
            <option value="url">קישור לאתר (URL)</option>
            <option value="mailto">קישור למייל (Email)</option>
          </Select>
        </FormGroup>

        {linkForm.type === 'mailto' ? (
          <FormGroup>
            <Label>כתובת מייל</Label>
            <Input
              type="email"
              value={linkForm.email || ''}
              onChange={(e) => onFormChange({ email: e.target.value })}
              placeholder="example@email.com"
            />
          </FormGroup>
        ) : (
          <FormGroup>
            <Label>כתובת URL</Label>
            <Input
              type="url"
              value={linkForm.url || ''}
              onChange={(e) => onFormChange({ url: e.target.value })}
              placeholder="https://example.com"
            />
          </FormGroup>
        )}

        <FormGroup>
          <Label>עמוד</Label>
          <Input
            type="number"
            value={linkForm.page || 1}
            onChange={(e) => onFormChange({ page: parseInt(e.target.value) || 1 })}
            min={1}
            max={totalPages || 100}
          />
        </FormGroup>

        <FormGroup>
          <Label>מיקום X</Label>
          <Input
            type="number"
            value={linkForm.x || 0}
            onChange={(e) => onFormChange({ x: parseInt(e.target.value) || 0 })}
          />
        </FormGroup>

        <FormGroup>
          <Label>מיקום Y</Label>
          <Input
            type="number"
            value={linkForm.y || 0}
            onChange={(e) => onFormChange({ y: parseInt(e.target.value) || 0 })}
          />
        </FormGroup>

        <FormGroup>
          <Label>רוחב</Label>
          <Input
            type="number"
            value={linkForm.width || 100}
            onChange={(e) => onFormChange({ width: parseInt(e.target.value) || 100 })}
          />
        </FormGroup>

        <FormGroup>
          <Label>גובה</Label>
          <Input
            type="number"
            value={linkForm.height || 50}
            onChange={(e) => onFormChange({ height: parseInt(e.target.value) || 50 })}
          />
        </FormGroup>

        <FormGroup>
          <Label>בחר איקון</Label>
          <IconGrid>
            {AVAILABLE_ICONS.map(iconName => {
              const IconComponent = ICON_MAP[iconName];
              return (
                <IconOption
                  key={iconName}
                  $selected={linkForm.icon === iconName}
                  onClick={() => onFormChange({ icon: iconName })}
                  type="button"
                >
                  <IconComponent size={24} />
                </IconOption>
              );
            })}
          </IconGrid>
        </FormGroup>

        <ButtonGroup>
          <ActionButton onClick={onClose}>
            ביטול
          </ActionButton>
          <ActionButton onClick={onSave} $variant="primary">
            שמור
          </ActionButton>
          {editingLink && (
            <ActionButton onClick={() => onDelete(editingLink.id)} $variant="danger">
              <Trash2 size={16} />
              מחק
            </ActionButton>
          )}
        </ButtonGroup>
      </LinkModalContent>
    </ModalOverlay>
  );
}

// ייצוא מיפוי האיקונים לשימוש בקומפוננטות אחרות
export { ICON_MAP, AVAILABLE_ICONS };