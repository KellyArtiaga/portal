import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseService } from './base.service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class HistoricoCobrancaService extends BaseService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('historicocobranca', _http, _userContextService);
  }

  getHistorico(filtro: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('numeroPagina', JSON.stringify(filtro.numeroPagina))
      .set('linhasPagina', JSON.stringify(filtro.linhasPagina))
      .set('clientesId', filtro.clienteId);

    if (filtro && filtro.centrosCustoId) {
      options.params = options.params.set('centrosCustoId', filtro.centrosCustoId);
    }
    if (filtro && filtro.regionaisId) {
      options.params = options.params.set('regionaisId', filtro.regionaisId);
    }
    if (filtro && filtro.status) {
      options.params = options.params.set('status', filtro.status);
    }
    if (filtro && filtro.placa) {
      options.params = options.params.set('placa', filtro.placa);
    }
    if (filtro && filtro.dataInicio) {
      options.params = options.params.set('dataInicio', filtro.dataInicio);
    }
    if (filtro && filtro.dataFim) {
      options.params = options.params.set('dataFim', filtro.dataFim);
    }
    if (filtro && filtro.veiculoId) {
      options.params = options.params.set('veiculoId', filtro.veiculoId);
    }
    if (filtro && filtro.atendimentoId) {
      options.params = options.params.set('atendimentoId', filtro.atendimentoId);
    }

    return this._http.get<any>(`${url}`, options);
  }
}
