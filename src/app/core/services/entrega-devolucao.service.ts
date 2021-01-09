import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class EntregaDevolucaoService extends AppService {
  private _cliente: number;

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('entregas-devolucoes', _http, _userContextService);
  }

  get clienteSelecionado() {
    return this._cliente;
  }

  set clienteSelecionado(cliente) {
    this._cliente = cliente;
  }

  getAll(filtro?: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('paginar', JSON.stringify(Boolean(filtro.paginar)));

    if (filtro) {
      if (filtro.clientesId) {
        options.params = options.params.set('clientesId', filtro.clientesId);
      }
      if (filtro.regionaisId) {
        options.params = options.params.set('regionaisId', filtro.regionaisId);
      }
      if (filtro.centrosCustoId) {
        options.params = options.params.set('centrosCustoId', filtro.centrosCustoId);
      }
      if (filtro.dataInicio) {
        options.params = options.params.set('dataInicio', filtro.dataInicio);
      }
      if (filtro.dataFim) {
        options.params = options.params.set('dataFim', filtro.dataFim);
      }
      if (filtro.tipo) {
        options.params = options.params.set('tipo', filtro.tipo);
      }
      if (filtro.veiculoId) {
        options.params = options.params.set('veiculoId', filtro.veiculoId);
      }
      if (filtro.solicitanteId) {
        options.params = options.params.set('solicitanteId', filtro.solicitanteId);
      }
      if (filtro.situacaoAgendamento) {
        options.params = options.params.set('situacaoAgendamento', filtro.situacaoAgendamento);
      }
      if (typeof filtro.paginar === 'boolean' && Boolean(filtro.paginar)) {
        if (filtro.numRows) {
          options.params = options.params.set('linhasPagina', filtro.numRows);
        }
        if (filtro.numPage) {
          options.params = options.params.set('numeroPagina', filtro.numPage);
        }
      }
    }

    return this._http.get<any>(`${url}/acompanhar`, options);
  }

  get(id: number, situacao: string): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (situacao) {
      options.params = options.params.set('situacao', situacao);
    }

    return this._http.get<any>(`${url}/${id}`, options);
  }
}
