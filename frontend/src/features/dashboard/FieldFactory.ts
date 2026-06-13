import {
  Validator, RequiredValidation, MinDateValidation,
  WordCountValidation, TitleWordCountValidation,
} from './ValidationStrategies';

export type FieldType = 'text' | 'rich-text' | 'date' | 'image' | 'radio';

export interface FieldOption {
  label: string;
  value: string | boolean;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  disabled?: boolean;
  defaultValue?: string | boolean;
  options?: FieldOption[];
  helperTexts?: Record<string, string>;
  validator: Validator;
}

export class FieldFactory {
  static createTitleField(hasPostulations = false): FieldConfig {
    return {
      name: 'title',
      label: 'Título',
      type: 'text',
      disabled: hasPostulations,
      validator: new Validator([
        new RequiredValidation(),
        new TitleWordCountValidation(),   // 2–15 palabras
      ])
    };
  }

  static createProblemDescriptionField(): FieldConfig {
    return {
      name: 'problemDescription',
      label: 'Descripción del Problema',
      type: 'rich-text',
      validator: new Validator([
        new WordCountValidation(10, 250, 'La descripción del problema'),
      ])
    };
  }

  static createCompanyContextField(): FieldConfig {
    return {
      name: 'companyContext',
      label: 'Contexto de la Empresa',
      type: 'rich-text',
      validator: new Validator([
        new WordCountValidation(10, 250, 'El contexto de la empresa'),
      ])
    };
  }

  static createParticipationRulesField(): FieldConfig {
    return {
      name: 'participationRules',
      label: 'Reglas de Participación',
      type: 'rich-text',
      validator: new Validator([
        new WordCountValidation(10, 250, 'Las reglas de participación'),
      ])
    };
  }

  static createPrivacyField(): FieldConfig {
    return {
      name: 'isPrivate',
      label: 'Tipo de Reto',
      type: 'radio',
      defaultValue: false,
      options: [
        { label: 'Reto Abierto (General)', value: false },
        { label: 'Reto Privado (Empresas)', value: true }
      ],
      helperTexts: {
        true: 'Este reto no aparecerá en el muro público; se generará un enlace único para invitar empresas.'
      },
      validator: new Validator([
        new RequiredValidation()
      ])
    };
  }

  static createStartDateField(): FieldConfig {
    return {
      name: 'startDate',
      label: 'Fecha de Inicio',
      type: 'date',
      validator: new Validator([
        new RequiredValidation(),
        new MinDateValidation(new Date())
      ])
    };
  }

  static createEndDateField(): FieldConfig {
    return {
      name: 'endDate',
      label: 'Fecha de Cierre',
      type: 'date',
      validator: new Validator([
        new RequiredValidation(),
        new MinDateValidation(new Date())
      ])
    };
  }
}
