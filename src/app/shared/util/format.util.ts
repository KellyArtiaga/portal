import { RealPipe, CnpjPipe, CpfCnpjPipe } from 'ng2-brpipes';


import { DecimalPipe, formatDate } from '@angular/common';
const pipeReal = new RealPipe().transform;
const pipeCnpj = new CnpjPipe().transform;
const pipeCpfCnpj = new CpfCnpjPipe().transform;
const decimalPipe = new DecimalPipe('pt-br').transform;
export class FormatUtil {
    public static Empty: string = "";


    public static formatCpfCnpj(value: string, defaultRepl : string = null): string {
        const valueFormatted = pipeCpfCnpj(value);
        if (valueFormatted == null) {
            return defaultRepl;
        }
        return valueFormatted;
    }

    public static formatCnpj(value: string, defaultRepl : string = null): string {
        const valueFormatted = pipeCnpj(value);
        if (valueFormatted == null) {
            return defaultRepl;
        }
        return valueFormatted;
    }

    public static formatDecimal(value: any): string {    
        return decimalPipe(value,'1.2-2','pt-br');
    }

    public static formatCurrency(value: any): string {
        return pipeReal(value);
    }
     
    public static  formatSimpleDate(value) {
        return formatDate(value, 'dd/MM/yyyy','pt-BR');
    }
  
}