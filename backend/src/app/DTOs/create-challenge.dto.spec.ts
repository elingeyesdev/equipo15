import { validate } from 'class-validator';
import { CreateChallengeDto } from './create-challenge.dto';


function buildValidDto(overrides: Partial<CreateChallengeDto> = {}): CreateChallengeDto {
  const dto = new CreateChallengeDto();
  dto.title = 'Rediseñar el sistema de becas universitarias';
  dto.problemDescription =
    'La plataforma actual de becas presenta múltiples problemas de usabilidad que dificultan el acceso de los estudiantes. ' +
    'Necesitamos una solución innovadora que simplifique el proceso de solicitud, mejore la transparencia en la asignación ' +
    'y permita un seguimiento eficiente del estado de cada postulación por parte de los interesados.';
  dto.companyContext = 'Somos una universidad grande con miles de estudiantes activos en diferentes facultades.';
  dto.participationRules = 'Equipos de máximo 5 personas. Solo estudiantes regulares pueden participar.';
  dto.startDate = getFutureDate(1);
  dto.endDate = getFutureDate(14);
  dto.isPrivate = false;
  dto.status = 'Activo' as any;

  Object.assign(dto, overrides);
  return dto;
}


function getFutureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}


function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}




describe('CreateChallengeDto — Lógica de Fechas', () => {
  it('debe fallar si endDate es anterior a startDate (orden cronológico)', async () => {
    const dto = buildValidDto({
      startDate: getFutureDate(10),
      endDate: getFutureDate(5), 
    });
    const errors = await validate(dto);
    const sixMonthsError = errors.find(e => e.property === 'endDate');
    expect(sixMonthsError).toBeDefined();
  });

  it('debe fallar si endDate excede 6 meses (180 días) desde startDate', async () => {
    const dto = buildValidDto({
      startDate: getFutureDate(1),
      endDate: getFutureDate(200), 
    });
    const errors = await validate(dto);
    const sixMonthsError = errors.find(e => e.property === 'endDate');
    expect(sixMonthsError).toBeDefined();
  });

  it('debe pasar si endDate está exactamente a 180 días de startDate', async () => {
    const dto = buildValidDto({
      startDate: getFutureDate(1),
      endDate: getFutureDate(181), 
    });
    const errors = await validate(dto);
    const sixMonthsError = errors.find(e => e.property === 'endDate');
    expect(sixMonthsError).toBeUndefined();
  });

  it('debe pasar si endDate está a 14 días (caso normal)', async () => {
    const dto = buildValidDto({
      startDate: getFutureDate(1),
      endDate: getFutureDate(15),
    });
    const errors = await validate(dto);
    const dateError = errors.find(e => e.property === 'endDate');
    expect(dateError).toBeUndefined();
  });

  it('debe permitir omitir endDate (borradores sin fecha de cierre)', async () => {
    const dto = buildValidDto({ endDate: undefined });
    const errors = await validate(dto);
    const dateError = errors.find(e => e.property === 'endDate');
    expect(dateError).toBeUndefined();
  });
});




describe('CreateChallengeDto — Privacidad y Tokens', () => {
  it('debe aceptar isPrivate: true con un UUID válido como id', async () => {
    const dto = buildValidDto({
      isPrivate: true,
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    const errors = await validate(dto);
    const idError = errors.find(e => e.property === 'id');
    expect(idError).toBeUndefined();
  });

  it('debe fallar si id no es un UUID válido', async () => {
    const dto = buildValidDto({
      isPrivate: true,
      id: 'no-es-un-uuid',
    });
    const errors = await validate(dto);
    const idError = errors.find(e => e.property === 'id');
    expect(idError).toBeDefined();
  });

  it('debe aceptar un reto público sin id (accessToken)', async () => {
    const dto = buildValidDto({
      isPrivate: false,
      id: undefined,
    });
    const errors = await validate(dto);
    const idError = errors.find(e => e.property === 'id');
    expect(idError).toBeUndefined();
  });
});




describe('CreateChallengeDto — Contenido y Calidad', () => {
  it('debe fallar si el título está vacío', async () => {
    const dto = buildValidDto({ title: '' });
    const errors = await validate(dto);
    const titleError = errors.find(e => e.property === 'title');
    expect(titleError).toBeDefined();
  });

  it('debe fallar si el título es puro texto repetitivo (spam)', async () => {
    const dto = buildValidDto({ title: 'asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf' });
    const errors = await validate(dto);
    const titleError = errors.find(e => e.property === 'title');
    expect(titleError).toBeDefined();
  });

  it('debe fallar si la descripción contiene texto spam repetitivo', async () => {
    
    const spam = 'empresa dolor '.repeat(30);
    const dto = buildValidDto({ problemDescription: spam });
    const errors = await validate(dto);
    const descError = errors.find(e => e.property === 'problemDescription');
    expect(descError).toBeDefined();
  });

  it('debe pasar con una descripción larga y diversa', async () => {
    const dto = buildValidDto(); 
    const errors = await validate(dto);
    const descError = errors.find(e => e.property === 'problemDescription');
    expect(descError).toBeUndefined();
  });

  it('debe fallar si el título contiene una URL insegura (http://)', async () => {
    const dto = buildValidDto({ title: 'Visita http://sitio-malicioso.com para más información' });
    const errors = await validate(dto);
    const titleError = errors.find(e => e.property === 'title');
    expect(titleError).toBeDefined();
  });

  it('debe pasar si el título contiene una URL segura (https://)', async () => {
    const dto = buildValidDto({ title: 'Consulta en https://empresa-segura.com nuestra convocatoria oficial' });
    const errors = await validate(dto);
    const urlError = errors.find(
      e => e.property === 'title' && e.constraints && 'noInsecureUrls' in e.constraints
    );
    expect(urlError).toBeUndefined();
  });

  it('debe fallar si la descripción contiene una URL insegura', async () => {
    const dto = buildValidDto({
      problemDescription:
        'Los estudiantes deben visitar http://formulario-viejo.com para completar su registro. ' +
        'Este proceso resulta ineficiente porque la plataforma no soporta autenticación segura moderna. ' +
        'Necesitamos migrar todo el ecosistema a una solución centralizada que permita gestionar becas.',
    });
    const errors = await validate(dto);
    const descError = errors.find(
      e => e.property === 'problemDescription' && e.constraints && 'noInsecureUrls' in e.constraints
    );
    expect(descError).toBeDefined();
  });
});




describe('CreateChallengeDto — Validación de Campos Opcionales y Tipos', () => {
  it('debe fallar si facultyId no es un número', async () => {
    const dto = buildValidDto({ facultyId: 'texto' as any });
    const errors = await validate(dto);
    const facultyError = errors.find(e => e.property === 'facultyId');
    expect(facultyError).toBeDefined();
  });

  it('debe aceptar facultyId como número válido', async () => {
    const dto = buildValidDto({ facultyId: 3 });
    const errors = await validate(dto);
    const facultyError = errors.find(e => e.property === 'facultyId');
    expect(facultyError).toBeUndefined();
  });

  it('debe fallar si status no es un valor del enum válido', async () => {
    const dto = buildValidDto({ status: 'Inventado' as any });
    const errors = await validate(dto);
    const statusError = errors.find(e => e.property === 'status');
    expect(statusError).toBeDefined();
  });

  it('debe pasar con status Borrador', async () => {
    const dto = buildValidDto({ status: 'Borrador' as any });
    const errors = await validate(dto);
    const statusError = errors.find(e => e.property === 'status');
    expect(statusError).toBeUndefined();
  });

  it('debe fallar si startDate no es un formato de fecha válido', async () => {
    const dto = buildValidDto({ startDate: 'no-es-fecha' });
    const errors = await validate(dto);
    const dateError = errors.find(e => e.property === 'startDate');
    expect(dateError).toBeDefined();
  });

  it('un DTO completamente válido no debe tener errores', async () => {
    const dto = buildValidDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});




describe('CreateChallengeDto — Números y Símbolos', () => {
  it('debe fallar si el título contiene números', async () => {
    const dto = buildValidDto({ title: 'Reto número ciento veintitrés para estudiantes' });
    
    dto.title = 'Reto número 123 para estudiantes';
    const errors = await validate(dto);
    const titleError = errors.find(
      e => e.property === 'title' && e.constraints && 'noNumbers' in e.constraints
    );
    expect(titleError).toBeDefined();
  });

  it('debe fallar si la descripción contiene números', async () => {
    const dto = buildValidDto({
      problemDescription:
        'La plataforma tiene cinco módulos con errores críticos que afectan a más de doscientos usuarios activos. ' +
        'Necesitamos rediseñar el flujo completo de registro para mejorar la experiencia del estudiante ' +
        'y reducir los tiempos de espera en cada paso del formulario de postulación universitaria.',
    });
    
    dto.problemDescription = dto.problemDescription!.replace('cinco', '5').replace('doscientos', '200');
    const errors = await validate(dto);
    const descError = errors.find(
      e => e.property === 'problemDescription' && e.constraints && 'noNumbers' in e.constraints
    );
    expect(descError).toBeDefined();
  });

  it('debe fallar si el contexto de empresa contiene números', async () => {
    const dto = buildValidDto({ companyContext: 'Tenemos 500 empleados en toda la región.' });
    const errors = await validate(dto);
    const ctxError = errors.find(
      e => e.property === 'companyContext' && e.constraints && 'noNumbers' in e.constraints
    );
    expect(ctxError).toBeDefined();
  });

  it('debe pasar si el título no tiene números ni símbolos raros', async () => {
    const dto = buildValidDto({ title: 'Rediseñar la experiencia del estudiante universitario' });
    const errors = await validate(dto);
    const titleError = errors.find(
      e => e.property === 'title' && e.constraints && 'noNumbers' in e.constraints
    );
    expect(titleError).toBeUndefined();
  });

  it('debe fallar si el título es spam de símbolos especiales', async () => {
    const dto = buildValidDto({ title: '!@#$%^&*()!@#$%^&*()!@#$%' });
    const errors = await validate(dto);
    const titleError = errors.find(
      e => e.property === 'title' && e.constraints && 'noExcessiveSymbols' in e.constraints
    );
    expect(titleError).toBeDefined();
  });

  it('debe permitir números en participationRules (sin NoNumbers)', async () => {
    const dto = buildValidDto({
      participationRules: 'Equipos de máximo 5 personas, estudiantes de semestre 3 en adelante.',
    });
    const errors = await validate(dto);
    const rulesError = errors.find(
      e => e.property === 'participationRules' && e.constraints && 'noNumbers' in e.constraints
    );
    expect(rulesError).toBeUndefined();
  });

  it('debe fallar si participationRules es solo spam de números', async () => {
    const dto = buildValidDto({ participationRules: '1234567890123456789012345678901234567890' });
    const errors = await validate(dto);
    const rulesError = errors.find(e => e.property === 'participationRules');
    expect(rulesError).toBeDefined();
  });
});
