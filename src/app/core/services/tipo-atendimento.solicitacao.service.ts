import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { UserContextService } from './user-context.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoAtendimentoSolicitacaoService extends BaseService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('atendimentossolicitacao', _http, _userContextService);
  }

  getByIdTipoAtendimento(idTipoAtendimento: number): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    options.params = options.params.set('atendimentoTipoId', idTipoAtendimento);

    return this.getHttp().get<any>(`${url}/tipos`, options);
  }

  getAll(): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this.getHttp().get<any>(`${url}/tipos`, options);
  }

  postArquivos(body: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this.getHttp().post<any>(`${url}/arquivos`, body, options);
  }

  deleteArquivo(idAtendimento: number, body: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.body = JSON.stringify(body);
    const url = this.getServerAPI();

    return this.getHttp().delete<any>(`${url}/arquivos/${idAtendimento}`, options);
  }
}
