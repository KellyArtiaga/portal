import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseService } from './base.service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class CartaAvariaService extends BaseService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('itemcartaavaria', _http, _userContextService);
  }

  getCartaAvarias(atendimentoId: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    options.params = options.params.set('atendimentoId', atendimentoId);

    const url = this.getServerAPI();
    return this._http.get<any>(`${url}`, options);
  }

  patchAvarias(id: number, bodyPatch: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPatch);

    return this._http.patch<any>(`${url}/${id}`, body, options);
  }

  postAvarias(bodyPost: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);

    return this._http.post<any>(`${url}/atualizacoes`, body, options);
  }
}
