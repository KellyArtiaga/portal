import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

import { AppService } from './service';
import { UserContextService } from './user-context.service';
import { Moment } from 'moment';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AgrupadorService extends AppService {

  lastFetch : Moment;
  cached : any[] = null;
  usuadioId : any = null;

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('agrupadores', _http, _userContextService);
  }

  getAll(): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionTokenUsuarioId();
    const usuarioId = this._userContextService.getUsuarioId();
    if (this.lastFetch != null && usuarioId == this.usuadioId) {
      const mins = Math.abs(moment().diff(this.lastFetch, 'minutes'));
      if (mins <= 2) {
        return of(this.cached);
      }
    }
    return this._http.get<any>(`${url}`, options).pipe(
      map((result)=> result['data']),
      tap((result)=> {
        this.lastFetch = moment();
        this.cached = result;
        this.usuadioId = usuarioId;
      })
    );
  }

}
