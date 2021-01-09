import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseService } from './base.service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilGrupoEconomicoService extends BaseService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('perfis', _http, _userContextService);
  }

  getGruposEconomicosIds(idPerfil:number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    return this._http.get<any>(`${this.getServerAPI()}/${idPerfil}/gruposeconomicos`, options);
  }

  postGruposEconomicosIds(idPerfil:number, idsGruposEconomicos:number[]): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    return this._http.post<any>(`${this.getServerAPI()}/${idPerfil}/gruposeconomicos`,{idsGruposEconomicos}, options);
  }

}
