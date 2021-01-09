import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class MotivoService extends BaseService {
  descricaoMotivoSolicitacao: any;
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('atendimentosmotivosolicitacao', _http, _userContextService);
  }

  postMotivo(bodyPost: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);
    const url = this.getServerAPI();

    return this._http.post<any>(url, body, options);
  }

  putMotivo(bodyPut: any, id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('id', JSON.stringify(id));
    const body = JSON.stringify(bodyPut);
    const url = this.getServerAPI();

    return this._http.put<any>(url, body, options);
  }

  getAll(descricaoMotivoSolicitacao?: string, numPage?: number, numRows?: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const numeroPagina = 'numeroPagina';
    const linhasPagina = 'linhasPagina';
    if (descricaoMotivoSolicitacao) {
      options.params = new HttpParams()
        .set('descricaoMotivoSolicitacao', descricaoMotivoSolicitacao)
        .set(numeroPagina, JSON.stringify(numPage))
        .set(linhasPagina, JSON.stringify(numRows));
    } else {
      options.params = new HttpParams()
        .set(numeroPagina, JSON.stringify(numPage))
        .set(linhasPagina, JSON.stringify(numRows));
    }
    const url = this.getServerAPI();
    return this._http.get<any>(url, options);
  }

}
