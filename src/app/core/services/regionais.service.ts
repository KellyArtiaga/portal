import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class RegionalService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('regionais', _http, _userContextService);
  }

  getAll(filtro: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionTokenUsuarioId();
    options.params = new HttpParams()
      .set('paginar', filtro.paginar ? filtro.paginar : false);

    if (filtro) {
      if (filtro.descricao) {
        options.params = options.params.set('descricao', filtro.descricao);
      }
      if (filtro.grupoEconomicoId) {
        options.params = options.params.set('grupoEconomicoId', filtro.grupoEconomicoId);
      }
      if (filtro.paginar) {
        if (filtro.numRows) {
          options.params = options.params.set('linhasPagina', filtro.numRows);
        }
        if (filtro.numPage) {
          options.params = options.params.set('numeroPagina', filtro.numPage);
        }
      }
    }

    return this._http.get<any>(`${url}`, options);
  }

  getById(id: number): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();

    return this._http.get<any>(`${url}/${id}`, options);
  }

  post(bodyPost: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);

    return this._http.post<any>(`${url}`, body, options);
  }

  put(id: number, bodyPut: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPut);

    return this._http.put<any>(`${url}/${id}`, body, options);
  }

  delete(id: number, bodyDelete: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.body = JSON.stringify(bodyDelete);

    return this._http.delete<any>(`${url}/${id}`, options);
  }
}
