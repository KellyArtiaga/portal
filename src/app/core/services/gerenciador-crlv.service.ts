import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class GerenciadorCrlvService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('gerenciadorcrlv', _http, _userContextService);
  }

  getCrlvs(filtros?: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('paginar', typeof filtros.paginar === 'boolean' ? filtros.paginar : true);

    if (filtros) {
      if (Array.isArray(filtros.clientesId) && filtros.clientesId.length > 0) {
        options.params = options.params.set('clientesId', filtros.clientesId);
      }
      if (Array.isArray(filtros.regionaisId) && filtros.regionaisId.length > 0) {
        options.params = options.params.set('regionaisId', filtros.regionaisId);
      }
      if (Array.isArray(filtros.centrosCustoId) && filtros.centrosCustoId.length > 0) {
        options.params = options.params.set('centrosCustoId', filtros.centrosCustoId);
      }
      if (filtros.placa) {
        options.params = options.params.set('placa', filtros.placa);
      }
      if (filtros.exercicio) {
        options.params = options.params.set('exercicio', filtros.exercicio);
      }
      if (filtros.situacaoEnvio) {
        options.params = options.params.set('situacao', filtros.situacaoEnvio);
      }

      if (typeof filtros.paginar === 'boolean' && filtros.paginar) {
        if (filtros.numPage) {
          options.params = options.params.set('numeroPagina', filtros.numPage);
        }
        if (filtros.numRows) {
          options.params = options.params.set('linhasPagina', filtros.numRows);
        }
      }
    }

    return this._http.get<any>(`${url}`, options);
  }

  patch(id: number, bodyPatch: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPatch);

    return this._http.patch<any>(`${url}/${id}`, body, options);
  }
}
