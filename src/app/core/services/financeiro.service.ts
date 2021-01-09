import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class FinanceiroService extends AppService {
  origem: string;

  constructor(public _http: HttpClient, private _userContextService: UserContextService) {
    super('financeiro', _http, _userContextService);
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
      if (dados.statusFatura) {
        options.params = options.params.set('statusFatura', dados.statusFatura);
      }
      if (typeof dados.statusVeiculo === 'number') {
        options.params = options.params.set('statusVeiculo', Boolean(dados.statusVeiculo));
      }
      if (dados.placa) {
        options.params = options.params.set('placa', dados.placa);
      }
      if (dados.contratoId) {
        options.params = options.params.set('contratoId', dados.contratoId);
      }
      if (dados.tipoServico) {
        options.params = options.params.set('tipoServico', dados.tipoServico);
      }
      if (dados.detalheTipoServico) {
        options.params = options.params.set('detalheTipoServico', dados.detalheTipoServico);
      }
      if (dados.numeroPagina) {
        options.params = options.params.set('numeroPagina', dados.numeroPagina);
      }
      if (dados.linhasPagina) {
        options.params = options.params.set('linhasPagina', dados.linhasPagina);
      }
      if (dados.paginar) {
        options.params = options.params.set('paginar', dados.paginar);
      }
      if (typeof dados.base === 'boolean') {
        options.params = options.params.set('base', dados.base);
      }
    }

    return this._http.get<any>(`${url}/indicadores`, options);
  }
}
