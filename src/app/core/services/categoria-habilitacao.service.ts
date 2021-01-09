import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriaHabilitacaoService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('habilitacoescategorias', _http, _userContextService);
  }

  getAll(): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}`, options);
  }

  get(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/${id}`, options);
  }
}
