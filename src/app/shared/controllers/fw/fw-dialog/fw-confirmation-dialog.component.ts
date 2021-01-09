import { Component, Inject, Input } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {DialogWrapper} from './fw-dialog-wrapper';

@Component({
    selector: 'fw-confirmation-dialog',
    template: `
    <div mat-dialog-content>
        {{data.message}}
    </div>
    
    <div mat-dialog-actions align="end">

        <button mat-button  
            mat-raised-button 
            color="primary" 
            (click)="confirm()" cdkFocusInitial>Sim
        </button>

        <button mat-button 
            mat-raised-button 
            color="seconday" 
            (click)="cancel()">Não
        </button>
        
    </div>
    `
  })
export class FwConfirmationDialogComponent implements DialogWrapper<any> {

    @Input()
    message : 'Tem certeza que deseja executar esta operação?'
    @Input()
    closeLabel : 'Não';
    @Input()
    confirmLabel : 'Sim';

    constructor(
        public dialogRef: MatDialogRef<FwConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.message = data.message || this.message;
        this.closeLabel = data.closeLabel || this.closeLabel;
        this.confirmLabel = data.confirmLabel || this.confirmLabel;
        
    }

    confirm(){
        this.dialogRef.close('confirmed');
    }

    cancel() {
        this.dialogRef.close('canceled');
    }
}
  