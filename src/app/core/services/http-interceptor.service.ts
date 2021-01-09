import { PlatformLocation } from '@angular/common';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppConfig } from 'src/assets/config/app.config';

import { SnackBarService } from './snack-bar.service';
import { UserContextService } from './user-context.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {
  constructor(
    private _snackBarService: SnackBarService,
    private userContext: UserContextService,
    private platformLocation: PlatformLocation,
    private translateService: TranslateService
  ) { }

  timeout = 1500;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const started = Date.now();

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          return Date.now() - started;
        }
      }, error => {
        if (error instanceof HttpErrorResponse) {
          switch (error.status) {
            case 0:
              this._snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_COMUNICACAO'), this.timeout, 'X');
              break;
            case 500:
              this._snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), this.timeout, 'X');
              break;
            case 401:
              this.redirectLogin();
              break;
            case 403:
              this.redirectLogin();
              break;
          }
        }
      })
    );
  }

  private redirectLogin(): void {
    if (!this.userContext.getTokenRac()) {
      this._snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_SEM_PERMISSAO'), this.timeout, 'X');
      setTimeout(() => {
        const appURL = this.getLocalUrl() || AppConfig.APP_URL;
        const loginAppURL = AppConfig.LOGIN_APP_URL;
        localStorage.clear();

        window.location.href = `${loginAppURL}?source_system=${appURL}&system_code=${AppConfig.SYSTEM_CODE}`;
      }, this.timeout);
    }
  }

  getLocalUrl(): string {
    return encodeURI(`${(this.platformLocation as any).location.origin}/home`);
  }
}
