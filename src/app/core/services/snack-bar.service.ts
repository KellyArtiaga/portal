import { Injectable, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  constructor(private _snackBar: MatSnackBar) { }

  open(msg: string, duration?: number, action?: string) {
    return this._snackBar.open(msg, action, { duration: duration || 7000, panelClass: ['info-color'] });
  }

  error(msg: string, duration?: number, action?: string) {
    return this._snackBar.open(msg, action, { duration: duration || 2000, panelClass: ['error-color'] });
  }

  success(msg: string, duration?: number, action?: string) {
    return this._snackBar.open(msg, action, { duration: duration || 2000, panelClass: ['success-color'] });
  }

  alert(msg: string, duration?: number, action?: string) {
    return this._snackBar.open(msg, action, { duration: duration || 2000, panelClass: ['alert-color'] });
  }
}

