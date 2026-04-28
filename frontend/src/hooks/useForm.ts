import { useState, useCallback } from 'react';
import type { FieldConfig } from '../components/form/FieldFactory';

type FormValue = string | number | boolean | null;

export const useForm = (configs: FieldConfig[], initialValues: Record<string, FormValue> = {}) => {
  const buildDefaults = () => {
    const defaults: Record<string, FormValue> = {};
    configs.forEach(c => {
      if (c.defaultValue !== undefined) {
        defaults[c.name] = c.defaultValue;
      }
    });
    return { ...defaults, ...initialValues };
  };
  const [values, setValues] = useState<Record<string, FormValue>>(buildDefaults);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: string, value: FormValue, configsCurrent: FieldConfig[]) => {
    const config = configsCurrent.find(c => c.name === name);
    if (config) {
      const error = config.validator.validate(value);
      setErrors(prev => ({ ...prev, [name]: error }));
      return !error;
    }
    return true;
  }, []);

  const handleChange = useCallback((name: string, value: FormValue) => {
    let nextEndDate = '';
    if (name === 'startDate' && typeof value === 'string') {
      const start = new Date(value);
      if (!isNaN(start.getTime())) {
        start.setDate(start.getDate() + 7);
        const year = start.getFullYear();
        const month = String(start.getMonth() + 1).padStart(2, '0');
        const day = String(start.getDate()).padStart(2, '0');
        nextEndDate = `${year}-${month}-${day}`;
      }
    }

    setValues(prev => {
      const newValues = { ...prev, [name]: value };
      if (nextEndDate) {
        newValues['endDate'] = nextEndDate;
      }
      return newValues;
    });

    validateField(name, value, configs);
    if (nextEndDate) {
      validateField('endDate', nextEndDate, configs);
    }
  }, [configs, validateField]);

  const validateAll = useCallback((isDraft = false) => {
    let isValid = true;
    const newErrors: Record<string, string | null> = {};

    configs.forEach(config => {
      const value = values[config.name] || '';
      const error = config.validator.validate(value);
      if (error && !isDraft) {
        isValid = false;
        newErrors[config.name] = error;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [configs, values]);

  return {
    values,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    validateAll
  };
};
