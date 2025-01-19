import { IsString, IsOptional, IsEnum, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Part, PartStatus, PartCategory } from '../types/inventory.types';

export class CreatePartDto implements Omit<Part, 'dateAdded'> {
    @IsString()
    @IsNotEmpty()
    type!: Part['type']
    partName: string;

    @IsString()
    @IsOptional()
    partDescription?: string;
   

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
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number = 1;

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