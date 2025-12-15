/**
 * LinkModal.jsx
 * קומפוננטה למודל הוספה/עריכה של קישורים
 */

import React from "react";
import { Link, Mail, ExternalLink, Phone, MapPin, Calendar, Clock, Star, Heart, ShoppingCart, User, Home, Trash2 } from "lucide-react";
import {
  LinkModal as StyledLinkModal,
  LinkModalContent,
  ModalTitle,
  FormGroup,
  Label,
  Input,
  ButtonGroup,
  ActionButton,
  IconGrid,
  IconOption
} from "./AdminFlipbookViewer.styles";

const availableIcons = [
  { name: 'Link', component: Link },
  { name: 'Mail', component: Mail },
  { name: 'ExternalLink', component: ExternalLink },
  { name: 'Phone', component: Phone },
  { name: 'MapPin', component: MapPin },
  { name: 'Calendar', component: Calendar },
  { name: 'Clock', component: Clock },
  { name: 'Star', component: Star },
  { name: 'Heart', component: Heart },
  { name: 'ShoppingCart', component: ShoppingCart },
  { name: 'User', component: User },
  { name: 'Home', component: Home },
];

export default function LinkModal({
  show,
  isAddingLink,
  linkForm,
  setLinkForm,
  totalPages,
  onClose,
  onSave,
  onDelete,
  editingLink
}) {
  console.log('🎬 LinkModal render, show=', show);
  if (!show) {
    console.log('🎬 LinkModal returning null because show=false');
    return null;
  }

  return (
    <StyledLinkModal onClick={onClose}>
      <LinkModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{isAddingLink ? 'הוסף קישור' : 'ערוך קישור'}</ModalTitle>
        
        <FormGroup>
          <Label>סוג קישור</Label>
          <select
            value={linkForm.type}
            onChange={(e) => setLinkForm({ ...linkForm, type: e.target.value, url: '', email: '' })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              direction: 'rtl'
            }}
          >
            <option value="url">קישור לאתר (URL)</option>
            <option value="mailto">קישור למייל (Email)</option>
          </select>
        </FormGroup>

        {linkForm.type === 'mailto' ? (
          <FormGroup>
            <Label>כתובת מייל</Label>
            <Input
              type="email"
              value={linkForm.email}
              onChange={(e) => setLinkForm({ ...linkForm, email: e.target.value })}
              placeholder="example@email.com"
            />
          </FormGroup>
        ) : (
          <FormGroup>
            <Label>כתובת URL</Label>
            <Input
              type="url"
              value={linkForm.url}
              onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
              placeholder="https://example.com"
            />
          </FormGroup>
        )}
        
        <FormGroup>
          <Label>עמוד</Label>
          <Input
            type="number"
            value={linkForm.page}
            onChange={(e) => setLinkForm({ ...linkForm, page: parseInt(e.target.value) })}
            min={1}
            max={totalPages || 100}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>מיקום X</Label>
          <Input
            type="number"
            value={linkForm.x}
            onChange={(e) => setLinkForm({ ...linkForm, x: parseInt(e.target.value) })}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>מיקום Y</Label>
          <Input
            type="number"
            value={linkForm.y}
            onChange={(e) => setLinkForm({ ...linkForm, y: parseInt(e.target.value) })}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>רוחב</Label>
          <Input
            type="number"
            value={linkForm.width}
            onChange={(e) => setLinkForm({ ...linkForm, width: parseInt(e.target.value) })}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>גובה</Label>
          <Input
            type="number"
            value={linkForm.height}
            onChange={(e) => setLinkForm({ ...linkForm, height: parseInt(e.target.value) })}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>בחר איקון</Label>
          <IconGrid>
            {availableIcons.map(icon => {
              const IconComponent = icon.component;
              return (
                <IconOption
                  key={icon.name}
                  $selected={linkForm.icon === icon.name}
                  onClick={() => setLinkForm({ ...linkForm, icon: icon.name })}
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
            <ActionButton onClick={onDelete} $variant="danger">
              <Trash2 size={16} />
              מחק
            </ActionButton>
          )}
        </ButtonGroup>
      </LinkModalContent>
    </StyledLinkModal>
  );
}

