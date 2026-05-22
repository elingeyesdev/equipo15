import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class UpdateAllowedDomainDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: 'Dominio inválido' })
  domain: string;
}
