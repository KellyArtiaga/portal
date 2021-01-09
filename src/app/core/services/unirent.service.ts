import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from 'src/assets/config/app.config';
import { BaseService } from './base.service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class UnirentService extends BaseService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('unirent', _http, _userContextService);
  }

  post(body: any, token: string): Observable<any> {
    return this._http.post(`${AppConfig.API_UNIRENT}/unirent/movimentacoes`, body, this.getHttpHeaderOptionsUNIRENT(token));
  }

  movimentar(bodyPost: any): Observable<any> {

    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);
    const url = this.getServerAPI();

    return this._http.post<any>(`${url}/movimentacao`, body, options);
  }

  getStatus(): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    return this._http.get(`${this.getServerAPIMultas()}/indicacoesNotificacao/status`, options);
  }

}
