import { MatDialogRef } from "@angular/material";

export interface DialogWrapper<T> { 

    dialogRef : MatDialogRef<T>;
}