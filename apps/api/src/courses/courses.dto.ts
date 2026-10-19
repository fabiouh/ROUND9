import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsNumber, IsOptional, IsString, Length, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class HoleDto {
  @ApiProperty() @IsInt() @Min(3) @Max(6) par: number;
  @ApiProperty() @IsInt() @Min(1) @Max(18) strokeIndex: number;
}

export class TeeDto {
  @ApiProperty() @IsString() @Length(1, 40) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(20) genderCategory?: string;
  @ApiProperty() @IsNumber({ maxDecimalPlaces: 1 }) @Min(20) @Max(85) courseRating: number;
  @ApiProperty() @IsInt() @Min(55) @Max(155) slopeRating: number;
}

export class CreateCourseDto {
  @ApiProperty() @IsString() @Length(2, 120) name: string;
  @ApiProperty() @IsString() @Length(2, 2) country: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) location?: string;
  @ApiProperty({ type: [HoleDto], description: '9 or 18 holes in playing order' })
  @IsArray() @ValidateNested({ each: true }) @Type(() => HoleDto)
  holes: HoleDto[];
  @ApiProperty({ type: [TeeDto] })
  @IsArray() @ArrayMaxSize(8) @ValidateNested({ each: true }) @Type(() => TeeDto)
  tees: TeeDto[];
}
