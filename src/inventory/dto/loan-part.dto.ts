import { IsString, IsNumber, IsEnum, IsNotEmpty } from 'class-validator';
import { Part, PartStatus } from '../types/inventory.types';       

export class LoanPartDto {
    @IsString()
    @IsNotEmpty() partName: string
    @IsNotEmpty() partId: string

    @IsEnum(PartStatus) @IsNotEmpty() 
    status: PartStatus

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