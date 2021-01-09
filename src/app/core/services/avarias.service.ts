import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class AvariasService extends AppService {
  origem: string;

  constructor(public _http: HttpClient, private _userContextService: UserContextService) {
    super('avarias', _http, _userContextService);
  }

  getResponseGraficos(dados: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (Array.isArray(dados.clientesId) && dados.clientesId.length > 0) {
      options.params = options.params.set('clientesId', dados.clientesId);
    }
    if (Array.isArray(dados.regionaisId) && dados.regionaisId.length > 0) {
      options.params = options.params.set('regionaisId', dados.regionaisId);
    }
    if (Array.isArray(dados.centrosCustoId) && dados.centrosCustoId.length > 0) {
      options.params = options.params.set('centrosCustoId', dados.centrosCustoId);
    }
    if (dados) {
      if (dados.dataInicio) {
        options.params = options.params.set('dataInicio', new Date(dados.dataInicio).toISOString().slice(0, 10));
      }
      if (dados.dataFim) {
        options.params = options.params.set('dataFim', new Date(dados.dataFim).toISOString().slice(0, 10));
      }
      if (dados.placa) {
        options.params = options.params.set('placa', dados.placa);
      }
      if (dados.statusFatura) {
        options.params = options.params.set('statusFatura', dados.statusFatura);
      }
      if (dados.finalidadeId) {
        options.params = options.params.set('finalidadeId', dados.finalidadeId);
      }
      if (dados.categoriaId) {
        options.params = options.params.set('categoriaId', dados.categoriaId);
      }
      if (dados.materialId) {
        options.params = options.params.set('materialId', dados.materialId);
      }
      if (typeof dados.base === 'boolean') {
        options.params = options.params.set('base', dados.base);
      }
    }

    return this._http.get<any>(`${url}/indicadores`, options);
  }
}
