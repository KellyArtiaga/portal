import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class CombustivelService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('combustiveis', _http, _userContextService);
  }

  getAll(filtro?: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtro) {
      if (filtro.descricao) {
        options.params = options.params.set('descricao', filtro.descricao);
      }
      if (filtro.numRows) {
        options.params = options.params.set('linhasPagina', filtro.numRows);
      }
      if (filtro.numPage) {
        options.params = options.params.set('linhasPagina', filtro.numPage);
      }
    }

    return this._http.get<any>(`${url}`, options);
  }

  get(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/${id}`, options);
  }
}
