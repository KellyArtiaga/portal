import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { MessageService } from '../../../communication/message.service';
import { FwConfirmationDialogComponent } from './fw-confirmation-dialog.component';
import { FormUtils } from '../../../util/form-utils';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'fw-form-dialog',
    template: `
    <div mat-dialog-content>
        <div>{{message}}</div>
        <ng-content>
        </ng-content>
    </div>
    <div mat-dialog-actions>
        <button mat-button (click)="cancel()">{{closeLabel}}</button>
        <button mat-button (click)="confirm()" cdkFocusInitial>{{confirmLabel}}</button>
    </div>
    `
})
export class FwFormDialogComponent extends FwConfirmationDialogComponent {

    @Input()
    control: AbstractControl = new FormControl();

    constructor(
        private messageService: MessageService,
        public dialogRef: MatDialogRef<FwFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        super(dialogRef, data);
    }

    confirm() {
        if (this.control.invalid) {
            this.messageService.error('UN-E002');
            FormUtils.markChildrenAsDirty(this.control);
            return;
        }
        this.dialogRef.close(this.control.value);
    }

}
