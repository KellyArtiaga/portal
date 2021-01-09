import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class VeiculoEntregaDevolucaoService extends AppService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('veiculosentregasdevolucoes', _http, _userContextService);
  }


  getAll(filtro?: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();

    options.params = new HttpParams()
      .set('paginar', filtro.paginar ? filtro.paginar : false);

    if (filtro) {
      if (filtro.clienteId) {
        options.params = options.params.set('clienteId', filtro.clienteId);
      }
      if (filtro.situacao) {
        options.params = options.params.set('situacao', filtro.situacao);
      }
      if (filtro.modeloId) {
        options.params = options.params.set('modeloId', filtro.modeloId);
      }
      if (filtro.entidadeId) {
        options.params = options.params.set('entidadeId', filtro.entidadeId);
      }
      if (filtro.placa) {
        options.params = options.params.set('placa', filtro.placa);
      }
      if (Boolean(filtro.paginar)) {
        if (filtro.numPage) {
          options.params = options.params.set('numeroPagina', filtro.numPage);
        }
        if (filtro.numRows) {
          options.params = options.params.set('linhasPagina', filtro.numRows);
        }
      }
    }

    return this._http.get<any>(`${url}`, options);
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
}
