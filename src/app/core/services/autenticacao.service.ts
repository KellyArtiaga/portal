import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { LoginSSO } from 'src/app/shared/interfaces/login-sso.model';

import { UserContextService } from './user-context.service';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService extends BaseService {
  origem: string;

  constructor(public _http: HttpClient, private _userContextService: UserContextService) {
    super('v1/login', _http, _userContextService);
  }

  setOrigem(origem) {
    this.origem = origem;
  }

  login(body: LoginSSO): Observable<any> {
    const url = this.getServerAPIAutenticacao();
    return this._http.post(url, body, this.getHttpHeaderOptions());
  }
}
