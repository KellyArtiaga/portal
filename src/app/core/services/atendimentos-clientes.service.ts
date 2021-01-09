import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PostAtendimentosMV } from 'src/app/shared/interfaces/post-atendimentos.model';
import { PostDocumentosChavesMV } from 'src/app/shared/interfaces/post-documentos.model';
import { AppService } from './service';
import { UserContextService } from './user-context.service';


@Injectable({
  providedIn: 'root'
})
export class AtendimentoClienteService extends AppService {
  private _filter: any;
  private atendimentos: any;

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('atendimentosclientes', _http, _userContextService);
  }

  set lastRequestFilter(filtro) {
    this._filter = filtro;
  }

  get lastRequestFilter() {
    return this._filter;
  }

  postDocumentos(bodyPost: PostDocumentosChavesMV): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);
    const url = this.getServerAPI();

    return this._http.post<any>(`${url}/documentoschaves`, body, options);
  }

  getAll(): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}`, options);
  }

  get(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/${id}`, options);
  }

  getValidarVeiculo(clienteId: string, placa: string): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    options.params = options.params.set('clienteId', clienteId);
    options.params = options.params.set('placa', placa);
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/validarveiculo`, options);
  }

  getFornecedor(atendimentoId: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (atendimentoId) {
      options.params = options.params.set('atendimentoId', atendimentoId);
    }

    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/fornecedor`, options);
  }

  getSinistro(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (id) {
      options.params = options.params.set('atendimentoId', id);
    }

    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/sinistro`, options);
  }

  getSinistroSemAgendamentoParada(veiculoId: number, questionariosId?: number[]): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('veiculoId', String(veiculoId));

    if (typeof questionariosId !== 'undefined' && questionariosId.length > 0 && Array.isArray(questionariosId)) {
      options.params = options.params.set('questionariosId', questionariosId);
    }

    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/sinistrosemagendamentoparada`, options);
  }

  getOrdemServico(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (id) {
      options.params = options.params.set('atendimentoId', id);
    }

    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/os`, options);
  }

  getRelatorio(filtros?: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('paginar', filtros.paginar ? filtros.paginar : false);

    if (filtros) {
      if (filtros.clientesId) {
        options.params = options.params.set('clientesId', filtros.clientesId);
      }
      if (filtros.regionaisId) {
        options.params = options.params.set('regionaisId', filtros.regionaisId);
      }
      if (filtros.centrosCustoId) {
        options.params = options.params.set('centrosCustoId', filtros.centrosCustoId);
      }
      if (filtros.placa) {
        options.params = options.params.set('placa', filtros.placa);
      }
      if (filtros.atendimentoId) {
        options.params = options.params.set('atendimentoId', filtros.atendimentoId);
      }
      if (filtros.dataInicio) {
        options.params = options.params.set('dataInicio', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        options.params = options.params.set('dataFim', filtros.dataFim);
      }
      if (filtros.situacao) {
        options.params = options.params.set('situacao', filtros.situacao);
      }
      if (filtros.paginar) {
        options.params = options.params.set('numeroPagina', filtros.numPage);
        options.params = options.params.set('linhasPagina', filtros.numRows);
      }
    }

    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/relatorio`, options);
  }

  getQuestionario(identificador: string, filtro?: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('identificador', identificador);

    if (filtro && filtro.atendimentoId) {
      options.params = options.params.set('atendimentoId', filtro.atendimentoId);
    }
    if (filtro && filtro.veiculoId) {
      options.params = options.params.set('veiculoId', filtro.veiculoId);
    }

    if (this._userContextService.getSegmentoProduto()) {
      options.params = options.params.set('segmentoProdutoId', this._userContextService.getSegmentoProduto());
    }

    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/questionario`, options);
  }

  getQuestionarioAcessorio(atendimentoId?: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (atendimentoId) {
      options.params = options.params.set('atendimentoId', atendimentoId);
    }

    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/questionarioacessorio`, options);
  }

  getIndicadoresAtendimentos(filtro: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtro) {
      if (filtro.dataInicio) {
        options.params = options.params.set('dataInicio', new Date(filtro.dataInicio).toISOString().slice(0, 10));
      }
      if (filtro.dataFim) {
        options.params = options.params.set('dataFim', new Date(filtro.dataFim).toISOString().slice(0, 10));
      }
      if (filtro.clientesId) {
        options.params = options.params.set('clientesId', filtro.clientesId);
      }
      if (filtro.regionaisId) {
        options.params = options.params.set('regionaisId', filtro.regionaisId);
      }
      if (filtro.centrosCustosId) {
        options.params = options.params.set('centrosCustoId', filtro.centrosCustosId);
      }
      if (filtro.placa) {
        options.params = options.params.set('placa', filtro.placa);
      }
      if (typeof filtro.base === 'boolean') {
        options.params = options.params.set('base', filtro.base);
      }
    }

    return this._http.get<any>(`${url}/indicadores`, options);
  }

  putAtendimento(atendimentoId: number, bodyPost: PostAtendimentosMV): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (atendimentoId) {
      options.params = options.params.set('id', atendimentoId);
    }

    const body = JSON.stringify(bodyPost);
    const url = this.getServerAPI();

    return this._http.put<any>(`${url}/manutencao`, body, options);
  }

  postAtendimento(bodyPost: PostAtendimentosMV): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);
    const url = this.getServerAPI();

    return this._http.post<any>(`${url}/manutencao`, body, options);
  }

  patchCancelarAtendimento(id: number, bodyPatch: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();

    const body = JSON.stringify(bodyPatch);

    return this._http.patch<any>(`${url}/${id}`, body, options);
  }

  getVeiculoReservaAtendimento(id: number): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('atendimentoId', String(id));

    return this._http.get<any>(`${url}/poolreserva`, options);
  }

  getStored(): any {
    return this.atendimentos;
  }

  setStored(atendimento: any): void {
    this.atendimentos = atendimento;
  }
}
