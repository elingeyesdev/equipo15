import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAllowedDomainDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;
}
