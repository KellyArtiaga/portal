import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserContextService } from './user-context.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MultasAcompanhamentosService extends BaseService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('acompanhamentos', _http, _userContextService);
  }

  getAcompanhamentosByMultaId(multaId: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('idMulta', multaId.toString());

    return this._http.get(`${this.getServerAPIMultas()}`, options)
  }
}
