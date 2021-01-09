import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PerfilFuncionalidadeMV } from 'src/app/shared/interfaces/post-perfil-funcionalidade.model';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilFuncionalidadeService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('perfisusuariosfuncionalidades', _http, _userContextService);
  }

  get(perfilUsuarioId?: number, operacaoFuncionalidadeId?: number, perfilUsuarioOperacaoFuncionalidadeId?: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    if (perfilUsuarioId) {
      options.params = options.params.set('perfilUsuarioId', perfilUsuarioId);
    }
    if (operacaoFuncionalidadeId) {
      options.params = options.params.set('operacaoFuncionalidadeId', operacaoFuncionalidadeId);
    }
    if (perfilUsuarioOperacaoFuncionalidadeId) {
      options.params = options.params.set('perfilUsuarioOperacaoFuncionalidadeId', perfilUsuarioOperacaoFuncionalidadeId);
    }
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}`, options);
  }

  post(bodyPost: PerfilFuncionalidadeMV): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);
    const url = this.getServerAPI();

    return this._http.post<any>(`${url}`, body, options);
  }

  delete(bodyDelete: PerfilFuncionalidadeMV): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.body = JSON.stringify(bodyDelete);

    return this._http.delete<any>(`${url}`, options);
  }
}
