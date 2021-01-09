import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class ArquivosOsService extends AppService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('arquivosos', _http, _userContextService);
  }

  get(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();
    options.params = new HttpParams();

    if (id) {
      options.params = options.params.set('osId', id);
    }

    return this._http.get<any>(`${url}`, options);
  }
}
