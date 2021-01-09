import { BaseService } from './base.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class PlanoManutencaoService extends BaseService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('planomanutencao', _http, _userContextService);
  }
}
