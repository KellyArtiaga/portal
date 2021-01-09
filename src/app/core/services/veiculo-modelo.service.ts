import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class VeiculoModeloService extends AppService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('veiculosmodelos', _http, _userContextService);
  }


  getAll(filtro?: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();

    options.params = new HttpParams();

    if (filtro) {
      if (filtro.clienteId) {
        options.params = options.params.set('clienteId', filtro.clienteId);
      }
      if (filtro.numPage) {
        options.params = options.params.set('linhasPagina', filtro.numPage);
      }
      if (filtro.numRows) {
        options.params = options.params.set('numeroPagina', filtro.numRows);
      }
    }

    return this._http.get<any>(`${url}`, options);
  }

  getById(id: number): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();

    return this._http.get<any>(`${url}/${id}`, options);
  }
}
