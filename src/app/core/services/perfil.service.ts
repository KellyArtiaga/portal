import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';
import * as _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class PerfilService extends AppService {

  chavePerfilUsuario: any;
  perfisHierarquicos = {
    'M' : 100,
    'A' : 10,
    'G' : 5,
    'C' : 1
  };

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('perfis', _http, _userContextService);
  }

  getAll(grupoEconomicoId?: number, chavePerfilUsuario?: string, numPage?: number, numRows?: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    const numeroPagina = 'numeroPagina';
    const linhasPagina = 'linhasPagina';
    if (chavePerfilUsuario) {
      options.params = options.params.set('chavePerfilUsuario', chavePerfilUsuario);
    }
    if (!_.isNil(grupoEconomicoId)) {
      options.params = options.params.set('grupoEconomicoId', grupoEconomicoId);
    }
    if (numPage) {
      options.params = options.params.set(numeroPagina, JSON.stringify(numPage));
    }
    if (numRows) {
      options.params = options.params.set(linhasPagina, JSON.stringify(numRows));
    }
    const url = this.getServerAPI();
    return this._http.get<any>(`${url}`, options);
  }

  filtrar(perfil) {  
    const nivelPerfil = this.perfisHierarquicos[perfil.tipoPerfil];
    const meuNivel = this.perfisHierarquicos[this._userContextService.getIsMaster() ? 'M' : this._userContextService.getDados().tipoPerfil];
    if (_.isNil(nivelPerfil) || _.isNil(meuNivel)) {
      return false;
    }
    return nivelPerfil < meuNivel;
  };

  get(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/${id}`, options);
  }

  desmobilizar(id: number, data: Object): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(data);
    const url = this.getServerAPI();

    return this._http.patch<any>(`${url}/${id}`, body, options);
  }

  postPerfil(bodyPost: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);
    const url = this.getServerAPI();

    return this._http.post<any>(`${url}`, body, options);
  }

  patchPerfil(id: number, bodyPatch: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPatch);
    const url = this.getServerAPI();

    return this._http.patch<any>(`${url}/${id}`, body, options);
  }

  deletePerfil(id: number, bodyDelete: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.body = JSON.stringify(bodyDelete);

    return this._http.delete<any>(`${url}/${id}`, options);
  }
}
