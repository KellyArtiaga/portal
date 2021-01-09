import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseService } from './base.service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class FuncionalidadeService extends BaseService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('funcionalidades', _http, _userContextService);
  }

  getFuncionalidades(): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    return this._http.get<any>(`${this.getServerAPI()}`, options);
  }

  getFuncionalidadesFilhas(idPai?: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    options.params = options.params.set('funcionalidadePaiID', idPai);

    return this._http.get<any>(`${this.getServerAPI()}`, options);
  }

  getOperacoesFuncionalidade(idFunc): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    return this._http.get<any>(`${this.getServerAPI()}/${idFunc}/operacoes`, options);
  }

}
