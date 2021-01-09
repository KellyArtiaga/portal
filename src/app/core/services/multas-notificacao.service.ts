import { HttpClient } from '@angular/common/http';
import { UserContextService } from './user-context.service';
import { BaseService } from './base.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MultasNotificacaoService extends BaseService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('notificacoes', _http, _userContextService);
  }
}
