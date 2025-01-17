import { IsString, IsOptional, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { Part, PartStatus, PartCategory } from '../types/inventory.types';

export class CreatePartDto implements Omit<Part, 'dateAdded'> {
    @IsString()
    @IsNotEmpty()
    type!: Part['type']
    partName: string;

    @IsNumber()
    @IsOptional()
    partId?: number;

    @IsEnum(PartStatus)
    status: PartStatus = PartStatus.AVAILABLE;

    @IsString()
    @IsOptional()
    currentLoan?: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number | 1;

    @IsString()
    @IsOptional()
    manufacturer?: string;

    @IsString()
    @IsOptional()
    model?: string;

    @IsString()
    @IsOptional()
    locationName?: string;

    @IsNumber()
    @IsOptional()
    locationId?: number;

    @IsString()
    @IsOptional()
    container?: string;

    @IsNumber()
    @IsOptional()
    row?: number;

    @IsString()
    @IsOptional()
    position?: string;

    @IsString()
    @IsOptional()
    category?: PartCategory;
}