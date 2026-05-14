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

export class MinLengthValidation implements ValidationStrategy {
  private minLength: number;
  constructor(minLength: number) {
    this.minLength = minLength;
  }
  validate(value: unknown): string | null {
    if (value && typeof value === 'string' && value.trim().length < this.minLength) {
      return `Mínimo de caracteres requeridos: ${this.minLength}`;
    }
    return null;
  }
}

export class NoRepetitiveCharactersValidation implements ValidationStrategy {
  private limit: number;
  constructor(limit = 4) {
    this.limit = limit;
  }
  validate(value: unknown): string | null {
    if (typeof value === 'string') {
      const regex = new RegExp(`(.)\\1{${this.limit},}`, 'i');
      if (regex.test(value)) {
        return `No se permite repetir el mismo carácter más de ${this.limit} veces consecutivas.`;
      }
    }
    return null;
  }
}

export class DateRangeValidation implements ValidationStrategy {
  private minDaysDifference: number;
  constructor(minDaysDifference = 7) {
    this.minDaysDifference = minDaysDifference;
  }
  validate(value: unknown): string | null {
    if (!value || typeof value !== 'object' || !('start' in value) || !('end' in value)) return null;
    const { start, end } = value as { start: string, end: string };
    const dateStart = new Date(start);
    const dateEnd = new Date(end);
    const diffTime = Math.abs(dateEnd.getTime() - dateStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (dateEnd < dateStart) {
      return 'La fecha de cierre debe ser posterior a la fecha de inicio';
    }
    if (diffDays < this.minDaysDifference) {
       return `Debe haber al menos ${this.minDaysDifference} días de diferencia entre inicio y fin`;
    }
    return null;
  }
}

export class NoNumbersValidation implements ValidationStrategy {
  validate(value: unknown): string | null {
    if (typeof value !== 'string' || value.length === 0) return null;
    if (/\d/.test(value)) {
      return 'Este campo no permite números. Utiliza únicamente texto descriptivo.';
    }
    return null;
  }
}

export class NoExcessiveSymbolsValidation implements ValidationStrategy {
  private maxRatio: number;
  constructor(maxRatio = 0.3) {
    this.maxRatio = maxRatio;
  }
  validate(value: unknown): string | null {
    if (typeof value !== 'string' || value.length === 0) return null;
    const cleanChars = value.match(/[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s.,;:¿?¡!()\-"']/g) || [];
    const ratio = cleanChars.length / value.length;
    if (ratio < (1 - this.maxRatio)) {
      return 'El texto contiene demasiados símbolos o caracteres especiales.';
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
