import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class VeiculoAtendimentoService extends AppService {
  private veiculoAgendar: any;

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('veiculosatendimentos', _http, _userContextService);
  }

  getAll(filtro: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtro) {
      if (filtro.clienteId) {
        options.params = options.params.set('clienteId', filtro.clienteId);
      }
    }
    const url = this.getServerAPI();
    return this._http.get<any>(`${url}`, options);
  }
}
