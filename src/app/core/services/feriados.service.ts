import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { UserContextService } from 'src/app/core/services/user-context.service';

import { AppService } from './service';

@Injectable({
  providedIn: 'root'
})
export class FeriadoService extends AppService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('', _http, _userContextService);
  }

  getFeriados(filtro: any): Observable<any> {
    const url = `${this.getServerAPICommon()}/feriados`;
    const options = this.getHttpHeaderOptionToken();
    const filtroAno = filtro && filtro.ano ? filtro.ano : String(new Date().getFullYear());
    options.params = new HttpParams().set('ano', filtroAno);
    return this._http.get<any>(`${url}`, options);
  }

  getFeriados_old(filtro: any): Observable<any> {
    const url = this.getServerAPIFeriados();
    const options: any = {
      header: new HttpHeaders()
        .set('Content-Type', 'text/xml')
        .append('Access-Control-Allow-Methods', 'GET')
        .append('Access-Control-Allow-Origin', '*')
        .append('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Request-Method'),
      responseType: 'text',
      params: new HttpParams()
        .set('ano', filtro && filtro.ano ? filtro.ano : String(new Date().getFullYear()))
        .set('token', this.getTokenAPIFeriados())
        .set('cidade', filtro.municipio)
        .set('estado', filtro.uf)
    };

    return this._http.get<any>(`${url}`, options);
  }
}
