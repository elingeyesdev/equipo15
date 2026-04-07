import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message.replace(/\n/g, '');

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message =
          'Conflicto: Ya existe un registro con ese valor único en el sistema.';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message =
          'No encontrado: El registro que intentas modificar u obtener no existe.';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message =
          'Relación Inválida: Una clave foránea no coincide con los registros existentes.';
        break;
    }

    if (status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      response.status(status).json({
        statusCode: status,
        message: message,
      });
    } else {
      super.catch(exception, host);
    }
  }
}
