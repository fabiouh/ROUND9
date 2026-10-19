import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class TokenDto {
  @ApiProperty() @IsString() @Length(20, 100) token: string;
}

export class CreateInvitationDto {
  @ApiPropertyOptional({ description: 'Restrict the link to this email' }) @IsOptional() @IsEmail() invitedEmail?: string;
}
