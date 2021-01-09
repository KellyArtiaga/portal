import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class IndicadoresGeraisService extends AppService {
  private _filter: any;

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('gerais', _http, _userContextService);
  }

  set lastRequestFilter(filtro) {
    this._filter = filtro;
  }

  get lastRequestFilter() {
    return this._filter;
  }

  getIndicadoresGerais(filtros: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtros) {
      if (filtros.periodo) {
        options.params = options.params.set('periodo', new Date(filtros.periodo).toISOString().slice(0, 10));
        options.params = options.params.set('dataInicio', new Date(filtros.periodo).toISOString().slice(0, 10));
        options.params = options.params.set('dataFim', new Date(filtros.periodo).toISOString().slice(0, 10));
      }
      if (Array.isArray(filtros.clientesId) && filtros.clientesId.length > 0) {
        options.params = options.params.set('clientesId', filtros.clientesId);
      }
      if (Array.isArray(filtros.regionaisId) && filtros.regionaisId.length > 0) {
        options.params = options.params.set('regionaisId', filtros.regionaisId);
      }
      if (Array.isArray(filtros.centrosCustoId) && filtros.centrosCustoId.length > 0) {
        options.params = options.params.set('centrosCustoId', filtros.centrosCustoId);
      }
      if (typeof filtros.statusVeiculo === 'boolean') {
        options.params = options.params.set('statusVeiculo', filtros.statusVeiculo);
      }
      if (filtros.placa) {
        options.params = options.params.set('placa', filtros.placa);
      }
    }

    return this._http.get<any>(`${url}/indicadores`, options);
  }

}
