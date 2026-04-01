import React from 'react';
import styled from 'styled-components';
import type { FieldConfig } from './FieldFactory';

interface DynamicFormProps {
  fields: FieldConfig[];
  values: Record<string, any>;
  errors: Record<string, string | null>;
  isSubmitting?: boolean;
  onChange: (name: string, value: any) => void;
  onSubmit: (action: 'publish' | 'draft') => void;
}

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #cccccc;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #0066cc;
  }
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const RichTextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #cccccc;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 160px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #0066cc;
  }
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 0.875rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover:not(:disabled) {
    background-color: #0052a3;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DraftButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: #0066cc;
  border: 1px solid #0066cc;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover:not(:disabled) {
    background-color: #e6f0fa;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DragDropZone = styled.div<{ $active: boolean }>`
  border: 2px dashed ${p => p.$active ? '#0066cc' : '#cccccc'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  background: ${p => p.$active ? 'rgba(0,102,204,0.05)' : 'white'};
  transition: all 0.2s;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  margin-top: 1rem;
  object-fit: contain;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: #333333;
`;

const RadioInput = styled.input`
  accent-color: #0066cc;
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const HelperText = styled.p`
  font-size: 0.8rem;
  color: #0066cc;
  background: rgba(0, 102, 204, 0.06);
  border-left: 3px solid #0066cc;
  padding: 0.5rem 0.75rem;
  margin: 0;
  border-radius: 0 4px 4px 0;
  line-height: 1.4;
`;

export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  values,
  errors,
  isSubmitting = false,
  onChange,
  onSubmit
}) => {
  const [dragActive, setDragActive] = React.useState(false);

  const handleSubmit = (action: 'publish' | 'draft') => (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    onSubmit(action);
  };

  const processFile = (file: File, name: string) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        onChange(name, ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <FormContainer>
      {fields.map(field => {
        if (field.type === 'image') {
          return (
            <FormGroup key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              <DragDropZone
                $active={dragActive && !field.disabled}
                onDragOver={(e) => {
                  if (field.disabled) return;
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => {
                  if (field.disabled) return;
                  setDragActive(false);
                }}
                onDrop={(e) => {
                  if (field.disabled) return;
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files[0];
                  if (file) processFile(file, field.name);
                }}
                onClick={() => {
                  if (field.disabled) return;
                  const input = document.createElement('input');
                  input.id = field.name;
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e: any) => {
                    const file = e.target?.files?.[0];
                    if (file) processFile(file, field.name);
                  };
                  input.click();
                }}
              >
                {values[field.name] ? (
                  <PreviewImage src={values[field.name]} alt="Preview" />
                ) : (
                  <p>{field.disabled ? 'Logotipo configurado (no editable)' : 'Arrastra tu logo aquí o haz clic para subir'}</p>
                )}
              </DragDropZone>
              {errors[field.name] && <ErrorMessage>{errors[field.name]}</ErrorMessage>}
            </FormGroup>
          );
        }

        if (field.type === 'radio' && field.options) {
          const currentValue = values[field.name];
          const helperMessage = field.helperTexts?.[String(currentValue)];
          return (
            <FormGroup key={field.name}>
              <Label>{field.label}</Label>
              <RadioGroup>
                {field.options.map(opt => (
                  <RadioOption key={String(opt.value)}>
                    <RadioInput
                      type="radio"
                      name={field.name}
                      value={String(opt.value)}
                      checked={currentValue === opt.value}
                      disabled={field.disabled}
                      onChange={(e) => {
                        const val = e.target.value;
                        const parsedVal = val === 'true' ? true : val === 'false' ? false : val;
                        onChange(field.name, parsedVal);
                      }}
                    />
                    {opt.label}
                  </RadioOption>
                ))}
              </RadioGroup>
              {helperMessage && <HelperText>{helperMessage}</HelperText>}
              {errors[field.name] && <ErrorMessage>{errors[field.name]}</ErrorMessage>}
            </FormGroup>
          );
        }

        return (
          <FormGroup key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === 'text' && (
              <Input
                id={field.name}
                type="text"
                disabled={field.disabled}
                value={values[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            )}
            {field.type === 'date' && (
              <Input
                id={field.name}
                type="date"
                disabled={field.disabled}
                min={new Date().toISOString().split('T')[0]}
                value={values[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            )}
            {field.type === 'rich-text' && (
              <RichTextArea
                id={field.name}
                disabled={field.disabled}
                value={values[field.name] || ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder="Describe las reglas y detalles del reto..."
              />
            )}
            {errors[field.name] && <ErrorMessage>{errors[field.name]}</ErrorMessage>}
          </FormGroup>
        );
      })}
      <ButtonGroup>
        <DraftButton disabled={isSubmitting} onClick={handleSubmit('draft')}>
          {isSubmitting ? 'Guardando...' : 'Guardar Borrador'}
        </DraftButton>
        <SubmitButton disabled={isSubmitting} onClick={handleSubmit('publish')}>
          {isSubmitting ? 'Publicando...' : 'Publicar Reto'}
        </SubmitButton>
      </ButtonGroup>
    </FormContainer>
  );
};

