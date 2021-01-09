import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';


@Injectable({
  providedIn: 'root'
})
export class ContratoService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('contratos', _http, _userContextService);
  }

  getFrota(contratoId?: number): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    if (contratoId) {
      options.params = options.params.set('contratoId', contratoId);
    }

    return this._http.get<any>(`${url}/frotadetalhe`, options);
  }
}
