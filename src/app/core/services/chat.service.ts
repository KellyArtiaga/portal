import { BaseService } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserContextService } from './user-context.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService extends BaseService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('atendimentosclientesmensagenschat', _http, _userContextService);
  }

  getMessageHeaders(atendimentosId: Array<any>): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    options.params = new HttpParams();
    options.params = options.params.set('atendimentosId', atendimentosId);

    return this._http.get<any>(`${url}/headers`, options);
  }

}
