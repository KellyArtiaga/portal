import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('usuarios', _http, _userContextService);
  }

  getByDescricao(filtro?: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtro) {
      if (filtro.condutorId) {
        options.params = options.params.set('condutorId', filtro.condutorId);
      }
      if (filtro.usuarioId) {
        options.params = options.params.set('usuarioId', filtro.usuarioId);
      }
      if (filtro.chavePerfilUsuario) {
        options.params = options.params.set('chavePerfilUsuario', filtro.chavePerfilUsuario);
      }
      if (filtro.email) {
        options.params = options.params.set('email', filtro.email);
      }
      if (filtro.descricaoGenerica) {
        options.params = options.params.set('descricaoGenerica', filtro.descricaoGenerica);
      }
      if (filtro.numPage) {
        options.params = options.params.set('numeroPagina', filtro.numPage);
      }
      if (filtro.numRows) {
        options.params = options.params.set('linhasPagina', filtro.numRows);
      }
    }
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}`, options);
  }

  get(id: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/${id}`, options);
  }

  post(bodyPost: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);
    const url = this.getServerAPI();

    return this._http.post<any>(`${url}`, body, options);
  }

  patch(id: number, bodyPatch: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPatch);
    const url = this.getServerAPI();

    return this._http.patch<any>(`${url}/${id}`, body, options);
  }

  patchPermissaoAcesso(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.patch<any>(`${url}/${id}/primeiro-acesso`, {}, options);
  }
}
