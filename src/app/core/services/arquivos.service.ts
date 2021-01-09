import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class ArquivoService extends AppService {

  constructor(public _http: HttpClient, private _userContextService: UserContextService) {
    super('', _http, _userContextService);
  }

  getAll(idEntidade: string, chaveEntidade: number, tipo?: string, api?: string): Observable<any> {
    const url = this.getArquivoServerAPI();
    const options = this.getHttpHeaderOptionMultipart();
    options.params = new HttpParams()
      .set('entidadeId', idEntidade)
      .set('entidadeChave', String(chaveEntidade));

    if (tipo) {
      options.params = options.params.set('tipo', String(tipo));
    }

    return this._http.get<any>(`${url}/attachments`, options);
  }

  postArquivo(usuarioId: number, id: string, chave: number, tipo: string, descricao: string, arquivo: any, api?: string) {
    const url = this.getArquivoServerAPI();
    const options = this.getHttpHeaderOptionMultipart();
    options.params = new HttpParams()
      .set('usuarioId', String(usuarioId))
      .set('entidadeId', id)
      .set('entidadeChave', String(chave))
      .set('tipo', tipo)
      .set('descricao', descricao);

    return this._http.post(`${url}/attachments`, arquivo, options);
  }

  putArquivo(arquivoId: any, usuarioId: number, id: string, chave: number, tipo: string, descricao: string, arquivo: any) {
    const url = this.getArquivoServerAPI();
    const options = this.getHttpHeaderOptionMultipart();
    options.params = new HttpParams()
      .set('usuarioId', String(usuarioId))
      .set('entidadeId', id)
      .set('entidadeChave', String(chave))
      .set('tipo', tipo)
      .set('descricao', descricao);

    return this._http.put(`${url}/${arquivoId}`, arquivo, options);
  }

  getFromURL(url: string): Observable<any> {
    return this._http.get(url, { responseType: 'blob' });
  }

  deleteArquivo(arquivoId: string, api?: string) {
    const url = this.getArquivoServerAPI();

    return this._http.delete<any>(`${url}/attachments/${arquivoId}`);
  }

  recuperarArquivo(api?: string) {
    return this.getArquivoServerAPI();
  }

}
