import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from 'src/assets/config/app.config';
import { BaseService } from './base.service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class StatusIndicacaoService extends BaseService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('indicacoesNotificacao', _http, _userContextService);
  }

  getStatus(): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    return this._http.get(`${this.getServerAPIMultas()}/status`, options);
  }
}
