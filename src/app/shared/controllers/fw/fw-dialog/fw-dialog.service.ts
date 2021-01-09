import { Injectable, TemplateRef } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material';
import { Subject, Observable } from 'rxjs';
import { FwConfirmationDialogComponent } from './fw-confirmation-dialog.component';
import { DialogWrapper } from './fw-dialog-wrapper';
import * as _ from 'lodash';

@Injectable()
export class FwDialogService {


    constructor(public dialog: MatDialog) {}

    confirm(message : string, opts : any = {}): Observable<any> {
        const dialogRef = this.dialog.open(FwConfirmationDialogComponent, {
            width: opts.width || '50%',
            data: {
                message : message,
                confirmLabel: opts.confirmLabel,
                cancelLabel: opts.cancelLabel
            }
        });
        return this.pipeActions(dialogRef);
    }

    confirmForm(wrapper : TemplateRef<any>,  opts : any = {}): Observable<any> {
        const dialogRef = this.dialog.open(wrapper,{
            width: opts.width || '50%',
            data: {
                message : opts.message,
                confirmLabel: opts.confirmLabel,
                cancelLabel: opts.cancelLabel
            }
        });
        return this.pipeActions(dialogRef);
    }

    private pipeActions(dialogRef : MatDialogRef<any>) {
        const subject = new Subject();
        dialogRef.afterClosed().subscribe(result => {
            if(!_.isNil(result) && result !== 'canceled') {
                subject.next(result);
            }
        });

        return subject;
    }

}