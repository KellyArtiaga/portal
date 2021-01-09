import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class CiaService extends BaseService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('cia', _http, _userContextService);
  }

}
