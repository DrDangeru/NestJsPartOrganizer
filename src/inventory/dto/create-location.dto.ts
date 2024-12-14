import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
    @IsString()
    @IsNotEmpty()
    locationName: string;

    @IsString()
    @IsOptional()
    locationId?: string;

    @IsString()
    @IsOptional()
    container?: string;

    @IsNumber()
    @IsOptional()
    row?: number;

    @IsString()
    @IsOptional()
    position?: string;
}