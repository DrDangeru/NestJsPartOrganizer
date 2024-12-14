import { IsString, IsOptional, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { Part, PartStatus, PartCategory } from '../types/inventory.types';

export class CreatePartDto implements Omit<Part, 'dateAdded'> {
    @IsString()
    @IsNotEmpty()
    type!: Part['type']
    partName: string;

    @IsString()
    @IsOptional()
    partId?: string;

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

    @IsString()
    @IsOptional()
    category?: PartCategory;
}