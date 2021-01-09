import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VeiculoEquipamentosMV } from 'src/app/shared/interfaces/veiculo-equipamentos.model';
import { AppService } from './service';
import { UserContextService } from './user-context.service';


@Injectable({
  providedIn: 'root'
})
export class VeiculoEquipamentoSolicitacaoSubstituicaoService extends AppService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('veiculosequipamentossolicitacoessubstituicoes', _http, _userContextService);
  }


  getAll(filtro?: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtro) {
      if (filtro.veiculoSolicitacaoId) {
        options.params = options.params.set('veiculoSolicitacaoId', filtro.veiculoSolicitacaoId);
      }
      if (filtro.equipamentoId) {
        options.params = options.params.set('equipamentoId', filtro.equipamentoId);
      }
      if (filtro.numPage) {
        options.params = options.params.set('linhasPagina', filtro.numPage);
      }
      if (filtro.numRows) {
        options.params = options.params.set('numeroPagina', filtro.numRows);
      }
    }

    return this._http.get<any>(`${url}`, options);
  }

  getById(id: number): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();

    return this._http.get<any>(`${url}/${id}`, options);
  }

  post(bodyPost: VeiculoEquipamentosMV): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);

    return this._http.post<any>(`${url}`, body, options);
  }
}
