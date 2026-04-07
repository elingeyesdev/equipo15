export interface ValidationStrategy {
  validate(value: unknown): string | null;
}

export class RequiredValidation implements ValidationStrategy {
  validate(value: unknown): string | null {
    if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '')) {
      return 'Este campo es requerido';
    }
    return null;
  }
}

export class MaxLengthValidation implements ValidationStrategy {
  private maxLength: number;
  constructor(maxLength: number) {
    this.maxLength = maxLength;
  }

  validate(value: unknown): string | null {
    if (typeof value === 'string' && value.length > this.maxLength) {
      return `El límite es de ${this.maxLength} caracteres`;
    }
    return null;
  }
}

export class RichTextRequiredValidation implements ValidationStrategy {
  validate(value: unknown): string | null {
    if (typeof value !== 'string' || !value || value.trim() === '') {
      return 'Este campo es requerido';
    }
    return null;
  }
}

export class MinDateValidation implements ValidationStrategy {
  private minDate: Date;
  constructor(minDate: Date) {
    this.minDate = minDate;
  }
  validate(value: unknown): string | null {
    if (!value) return null;
    const inputDate = new Date(value as string | number | Date);
    const min = new Date(this.minDate.toDateString());
    const input = new Date(inputDate.toDateString());
    if (input < min) {
      return 'La fecha seleccionada no puede ser anterior al límite permitido';
    }
    return null;
  }
}

export class RequiredImageValidation implements ValidationStrategy {
  private maxSizeMb: number;
  constructor(maxSizeMb = 2) {
    this.maxSizeMb = maxSizeMb;
  }
  validate(value: unknown): string | null {
    if (!value || typeof value !== 'string' || !value.startsWith('data:image/')) {
      return 'Debe adjuntar una imagen válida';
    }
    const sizeInBytes = value.length * 0.75;
    if (sizeInBytes > this.maxSizeMb * 1024 * 1024) {
      return `La imagen no debe superar los ${this.maxSizeMb}MB`;
    }
    return null;
  }
}

export class Validator {
  private strategies: ValidationStrategy[];
  constructor(strategies: ValidationStrategy[]) {
    this.strategies = strategies;
  }

  validate(value: unknown): string | null {
    for (const strategy of this.strategies) {
      const error = strategy.validate(value);
      if (error) return error;
    }
    return null;
  }
}
