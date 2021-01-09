import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class SolicitacaoSubstituicaoService extends AppService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('solicitacoessubstituicoes', _http, _userContextService);
  }

  set veiculoSolicitacaoSelecionado(item) {
    sessionStorage.setItem('veiculoSolicitacao', JSON.stringify(item));
  }

  get veiculoSolicitacaoSelecionado() {
    return JSON.parse(sessionStorage.getItem('veiculoSolicitacao'));
  }


  getById(id: number): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();

    return this._http.get<any>(`${url}/${id}`, options);
  }

  getAcompanhamentos(filtro: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('paginar', JSON.stringify(Boolean(filtro.paginar)));

    if (filtro) {
      if (filtro.solicitacaoId) {
        options.params = options.params.set('solicitacaoId', filtro.solicitacaoId);
      }
      if (filtro.clientesId) {
        options.params = options.params.set('clientesId', filtro.clientesId);
      }
      if (filtro.dataEmissaoInicio) {
        options.params = options.params.set('dataEmissaoInicio', filtro.dataEmissaoInicio);
      }
      if (filtro.dataEmissaoFim) {
        options.params = options.params.set('dataEmissaoFim', filtro.dataEmissaoFim);
      }
      if (filtro.modeloId) {
        options.params = options.params.set('modeloId', filtro.modeloId);
      }
      if (filtro.motivoSolicitacao) {
        options.params = options.params.set('motivoSolicitacao', filtro.motivoSolicitacao);
      }
      if (filtro.situacao) {
        options.params = options.params.set('situacao', filtro.situacao);
      }
      if (Boolean(filtro.paginar)) {
        if (filtro.numPage) {
          options.params = options.params.set('numeroPagina', filtro.numPage);
        }
        if (filtro.numRows) {
          options.params = options.params.set('linhasPagina', filtro.numRows);
        }
      }
    }

    return this._http.get<any>(`${url}/acompanhar`, options);
  }

}
