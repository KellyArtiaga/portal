import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnderecoMV } from 'src/app/shared/interfaces/endereco.model';
import { HabilitacaoMV } from 'src/app/shared/interfaces/habilitacao.model';
import { PostCondutorMV } from 'src/app/shared/interfaces/post-condutor.model';

import { AppService } from './service';
import { UserContextService } from './user-context.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class CondutorService extends AppService {
  private storedId: number;

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('condutores', _http, _userContextService);
  }

  post(bodyPost: PostCondutorMV): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);
    const url = this.getServerAPI();

    return this._http.post<any>(`${url}`, body, options);
  }

  put(idCondutor: number, bodyPut: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPut);
    const url = this.getServerAPI();

    return this._http.put<any>(`${url}/${idCondutor}`, body, options);
  }

  getAll(filtro?: any, clientesId?: any, descricaoGenerica?: string, condutorVeiculo?: boolean): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (clientesId && Array.isArray(clientesId)) {
      options.params = options.params.set('clientesId', clientesId);
    }
    if (filtro) {
      if (filtro.email) {
        options.params = options.params.set('email', filtro.email);
      }
      if (filtro.cpf) {
        options.params = options.params.set('cpf', filtro.cpf);
      }
      if (filtro.numPage) {
        options.params = options.params.set('numPage', filtro.numPage);
      }
      if (filtro.numRows) {
        options.params = options.params.set('numRows', filtro.numRows);
      }
    }
    if (descricaoGenerica) {
      options.params = options.params.set('descricaoGenerica', descricaoGenerica);
    }
    if (condutorVeiculo) {
      options.params = options.params.set('condutorVeiculo', condutorVeiculo);
    }

    const url = this.getServerAPI();

    return this._http.get<any>(`${url}`, options);
  }

  getById(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/${id}`, options);
  }

  get(params: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    options.params = new HttpParams();

    if (params.descricaoGenerica) {
      options.params = options.params.set('descricaoGenerica', params.descricaoGenerica);
    }
    if (params.email) {
      options.params = options.params.set('email', params.email);
    }
    if (params.cpf) {
      options.params = options.params.set('cpf', params.cpf);
    }
    if (params.condutorVeiculo) {
      options.params = options.params.set('condutorVeiculo', params.condutorVeiculo);
    }
    if (params.numPage) {
      options.params = options.params.set('numPage', params.numPage);
    }
    if (params.numRows) {
      options.params = options.params.set('numRows', params.numRows);
    }
    if (!params.cpf && !params.email) {
      if (Array.isArray(params.clientesId) && params.clientesId.length > 0) {
        options.params = options.params.set('clientesId', params.clientesId);
      } else {
        options.params = options.params.set('clientesId', [this._userContextService.getClienteId()]);
      }
    }
    if (Array.isArray(params.regionaisId) && params.regionaisId.length > 0) {
      options.params = options.params.set('regionaisId', params.regionaisId);
    }
    if (Array.isArray(params.centrosCustoId) && params.centrosCustoId.length > 0) {
      options.params = options.params.set('centrosCustoId', params.centrosCustoId);
    }


    const ge = this._userContextService.getGrupoEconomico();
    if (!_.isNil(ge)) {
      options.params = options.params.set('grupoEconomicoId', ge.id);
    }

    return this._http.get<any>(`${url}`, options);
  }

  putEndereco(idCondutor: number, bodyEndereco: EnderecoMV): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyEndereco);
    const url = this.getServerAPI();

    return this._http.put<any>(`${url}/${idCondutor}/endereco`, body, options);
  }

  putHabilitacao(idCondutor: number, bodyHabilitacao: HabilitacaoMV): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyHabilitacao);
    const url = this.getServerAPI();

    return this._http.put<any>(`${url}/${idCondutor}/habilitacao`, body, options);
  }

  getAllFormaContato(): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/formascontato`, options);
  }

  getFormaContato(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/${id}/formascontato`, options);
  }

  setStoredId(id: number): void {
    this.storedId = id;
  }

  getStoredId(): number {
    return this.storedId;
  }
}
