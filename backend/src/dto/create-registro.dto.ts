import { IsString, IsEmail, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateRegistroDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Nome deve ter pelo menos 5 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  nome: string;

  @IsEmail({}, { message: 'E-mail deve ser válido' })
  @IsNotEmpty()
  @MaxLength(255, { message: 'E-mail deve ter no máximo 255 caracteres' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Mensagem deve ter pelo menos 3 caracteres' })
  mensagem: string;
}
