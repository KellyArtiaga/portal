import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class CartaAutorizacaoCobrancaService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('cartasautorizacoescobrancas', _http, _userContextService);
  }

  getHistorico(filtro: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtro && Array.isArray(filtro.clienteId) && filtro.clienteId.length > 0) {
      options.params = options.params.set('clientesId', filtro.clienteId);
    }
    if (filtro && Array.isArray(filtro.regionaisId) && filtro.regionaisId.length > 0) {
      options.params = options.params.set('regionaisId', filtro.regionaisId);
    }
    if (filtro && Array.isArray(filtro.centrosCustoId) && filtro.centrosCustoId.length > 0) {
      options.params = options.params.set('centrosCustoId', filtro.centrosCustoId);
    }
    if (filtro && filtro.status) {
      options.params = options.params.set('status', filtro.status);
    }
    if (filtro && filtro.dataInicio) {
      options.params = options.params.set('dataInicio', new Date(filtro.dataInicio).toISOString().slice(0, 10));
    }
    if (filtro && filtro.dataFim) {
      options.params = options.params.set('dataFim', new Date(filtro.dataFim).toISOString().slice(0, 10));
    }
    if (filtro && filtro.veiculoId) {
      options.params = options.params.set('veiculoId', filtro.veiculoId);
    }
    if (filtro && filtro.osId) {
      options.params = options.params.set('osId', filtro.osId);
    }
    if (filtro && typeof filtro.paginar === 'boolean' && Boolean(filtro.paginar)) {
      options.params = options.params.set('paginar', filtro.paginar);
      options.params = options.params.set('numeroPagina', filtro.numeroPagina);
      options.params = options.params.set('linhasPagina', filtro.linhasPagina);
    }

    const url = this.getServerAPI();
    return this._http.get<any>(`${url}`, options);
  }

  getCartaAvarias(veiculoId: number): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    return this._http.get<any>(`${url}/itens/${veiculoId}`, options);
  }

  getById(veiculoId: number): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    return this._http.get<any>(`${url}/${veiculoId}`, options);
  }

  putAprovacao(veiculoId: number, body: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    return this._http.put<any>(`${url}/${veiculoId}`, body, options);
  }
}
