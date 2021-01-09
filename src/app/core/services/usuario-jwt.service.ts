import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { EmailPost } from '../../shared/interfaces/email.model';
import { BaseService } from './base.service';
import { UserContextService } from './user-context.service';


@Injectable({
  providedIn: 'root'
})
export class UsuarioJwtService extends BaseService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('usuario', _http, _userContextService);
  }

  alterarSenha(idUsuario: number, dadosUsuario: any, projeto: string): Observable<any> {
    const options = this.getHttpHeaderOptionTokenJWT(projeto);
    const body = JSON.stringify(dadosUsuario);
    const url = this.getServerAPIAlterarSenha();

    return this._http.patch<any>(`${url}/alterar-senha/${idUsuario}`, body, options);
  }

  enviarEmail(email: EmailPost): Observable<any> {
    const options = this.getHttpHeaderOptionTokenJWT(null);
    const body = JSON.stringify(email);
    const url = this.getServerAPIAlterarSenha();
    return this._http.post<any>(`${url}/enviar-email`, body, options);
  }
}
