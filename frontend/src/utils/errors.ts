export const translateError = (msg: string): string => {
  if (!msg || typeof msg !== 'string') return 'Ocurrió un error inesperado';
  
  const m = msg.toLowerCase();
  
  if (m.includes('startdate must be a valid iso 8601') || m.includes('startdate must be a date')) {
    return 'La fecha de inicio debe ser una fecha válida.';
  }
  if (m.includes('enddate must be a valid iso 8601') || m.includes('enddate must be a date')) {
    return 'La fecha de cierre debe ser una fecha válida.';
  }
  if (m.includes('submissionsopenat must be a valid') || m.includes('submissionsopenat must be')) {
    return 'La fecha de inicio de recepción de ideas debe ser válida.';
  }
  if (m.includes('submissionscloseat must be a valid') || m.includes('submissionscloseat must be')) {
    return 'La fecha de cierre de recepción de ideas debe ser válida.';
  }
  
  if (m.includes('title should not be empty') || m.includes('title must be')) {
    return 'El título es obligatorio.';
  }
  if (m.includes('problemdescription should not be empty') || m.includes('problemdescription must be')) {
    return 'La descripción del problema es obligatoria.';
  }
  if (m.includes('rules should not be empty') || m.includes('rules must be')) {
    return 'Las reglas de participación son obligatorias.';
  }
  if (m.includes('targetaudience should not be empty') || m.includes('targetaudience must be')) {
    return 'La audiencia objetivo es obligatoria.';
  }
  if (m.includes('evaluationcriteria should not be empty') || m.includes('evaluationcriteria must be')) {
    return 'Los criterios de evaluación son obligatorios.';
  }
  if (m.includes('faculty') && (m.includes('empty') || m.includes('must be'))) {
    return 'La facultad seleccionada es requerida.';
  }
  if (m.includes('companycontext should not be empty') || m.includes('companycontext must be')) {
    return 'El contexto de la organización es obligatorio.';
  }
  
  if (m.includes('description should not be empty') || m.includes('description must be')) {
    return 'La descripción es obligatoria.';
  }
  
  if (m.includes('must be a valid iso 8601 date string')) {
    const field = msg.split(' ')[0];
    return `El campo ${field} debe ser una fecha válida (ISO 8601).`;
  }
  if (m.includes('should not be empty')) {
    const field = msg.split(' ')[0];
    return `El campo ${field} no debe estar vacío.`;
  }
  if (m.includes('must be a string')) {
    const field = msg.split(' ')[0];
    return `El campo ${field} debe ser un texto.`;
  }
  if (m.includes('must be an integer') || m.includes('must be a number')) {
    const field = msg.split(' ')[0];
    return `El campo ${field} debe ser un número válido.`;
  }
  
  if (m.includes('internal server error')) {
    return 'Error interno del servidor. Por favor, intente más tarde.';
  }
  if (m.includes('unauthorized') || m.includes('forbidden')) {
    return 'No tiene autorización para realizar esta acción.';
  }
  if (m.includes('bad request')) {
    return 'Petición inválida. Verifique los datos ingresados.';
  }
  
  return msg;
};

export const extractErrorMessage = (error: unknown, fallback = 'Ocurrió un error inesperado'): string => {
  if (!error || typeof error !== 'object') return fallback;
  
  const err = error as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };
  
  const message = err.response?.data?.message;
  
  if (Array.isArray(message)) {
    return message.map(translateError).join('\n');
  }
  if (typeof message === 'string') {
    return translateError(message);
  }
  
  const rawMsg = err.message || '';
  if (rawMsg) {
    return translateError(rawMsg);
  }
  
  return fallback;
};
