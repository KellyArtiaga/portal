import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as jwt_decode from 'jwt-decode';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class JWTEncodeService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('encode', _http, _userContextService);
  }

  encode(bodyPost: any): Observable<any> {
    const url = this.getServerAPIAutenticacao();
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);

    return this._http.post<any>(url, body, options);
  }

  decode(token: string): any {
    return jwt_decode(token);
  }
}
