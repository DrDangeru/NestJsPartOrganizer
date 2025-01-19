import { IsString, IsOptional, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { Part, PartStatus } from '../types/inventory.types';       

export class LoanPartDto {
    @IsString()
    @IsNotEmpty() partName: string
    @IsNotEmpty() partId: string

    @IsNotEmpty()
    @IsString()
    loanedTo: string

    @IsNotEmpty()
    @IsNumber()
    quantity: number

    @IsNotEmpty()
    @IsString()
    loanedFrom: Date

    @IsNotEmpty()
    @IsString()
    loanedUntil: Date
}