import { AbstractControl } from '@angular/forms';
import { MatMenu } from '@angular/material';

export interface ModalDateMV {
  campoPeriodo: AbstractControl;
  campoDataInicio: AbstractControl;
  campoDataFim: AbstractControl;
  matMenu: MatMenu;
  maxDate?: number;
  minDate?: number;
}
