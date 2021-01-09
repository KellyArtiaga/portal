import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserContextService } from './user-context.service';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class ResumoAvariasService extends BaseService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('resumocartaavaria', _http, _userContextService);
  }

  getHistorico(atendimentoId: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    options.params = options.params.set('atendimentoId', atendimentoId );
    const url = this.getServerAPI();
    return this._http.get<any>(`${url}`, options);
  }
}
