import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class CentroCustoRegionalService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('centroscustoregionais', _http, _userContextService);
  }

  getAll(filtro: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('numeroPagina', JSON.stringify(filtro.numPage))
      .set('linhasPagina', JSON.stringify(filtro.numRows))
      .set('clienteId', filtro.clienteId);

    if (filtro) {
      if (filtro.tipo) {
        options.params = options.params.set('tipo', filtro.tipo);
      }
      if (filtro.status) {
        options.params = options.params.set('status', filtro.status);
      }
      if (filtro.dataInicio) {
        options.params = options.params.set('dataInicio', filtro.dataInicio);
      }
      if (filtro.dataFim) {
        options.params = options.params.set('dataFim', filtro.dataFim);
      }
      if (filtro.veiculoId) {
        options.params = options.params.set('veiculoId', filtro.veiculoId);
      }
      if (filtro.atendimentoId) {
        options.params = options.params.set('atendimentoId', filtro.atendimentoId);
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

  put(bodyPut: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPut);

    return this._http.put<any>(`${url}`, body, options);
  }
}
