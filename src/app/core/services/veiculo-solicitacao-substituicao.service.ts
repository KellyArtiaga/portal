import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VeiculoSolicitacaoSubstituicaoMV } from 'src/app/shared/interfaces/veiculo-solicitacao-substituicao.model';
import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class VeiculoSolicitacaoSubstituicaoService extends AppService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('veiculossolicitacaosubstituicao', _http, _userContextService);
  }


  getAll(id: number): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (id) {
      options.params = options.params.set('id', id);
    }

    return this._http.get<any>(`${url}`, options);
  }

  post(bodyPost: VeiculoSolicitacaoSubstituicaoMV): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);

    return this._http.post<any>(`${url}`, body, options);
  }

  put(id: number, bodyPut: VeiculoSolicitacaoSubstituicaoMV): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPut);

    return this._http.put<any>(`${url}/${id}`, body, options);
  }

  patch(id: number, bodyPatch: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPatch);

    return this._http.patch<any>(`${url}/${id}`, body, options);
  }
}
