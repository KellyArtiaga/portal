import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class VeiculoService extends AppService {
  private veiculoAgendar: any;

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('veiculos', _http, _userContextService);
  }

  getAll(filtro: any, placa?: string, associarCondutor?: boolean): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (this._userContextService.getGrupoEconomicoId()) {
      options.params = options.params.set('grupoEconomicoId', this._userContextService.getGrupoEconomicoId());
    }
    if (this._userContextService.getUsuarioId()) {
      options.params = options.params.set('usuarioId', this._userContextService.getUsuarioId());
    }
    if (filtro) {
      if (filtro.cnpj) {
        options.params = options.params.set('cnpjCpf', filtro.cnpj);
      }
      if (Array.isArray(filtro.clientesId) && filtro.clientesId.length > 0) {
        options.params = options.params.set('clientesId', filtro.clientesId);
      }
      if (Array.isArray(filtro.regionaisId)) {
        options.params = options.params.set('regionaisId', filtro.regionaisId);
      }
      if (Array.isArray(filtro.centrosCustoId)) {
        options.params = options.params.set('centrosCustoId', filtro.centrosCustoId);
      }
      if (filtro.placa) {
        options.params = options.params.set('placa', filtro.placa);
      }
    }
    if (placa) {
      options.params = options.params.set('placa', placa);
    }
    if (associarCondutor) {
      options.params = options.params.set('associadoCondutor', associarCondutor);
    }

    const url = this.getServerAPI();
    return this._http.get<any>(`${url}`, options);
  }

  get(id: number, carregaAssociacoes: boolean = false): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();
    if (carregaAssociacoes) {
      options.params = new HttpParams()
        .set('carregarAgrupadores', '1');
    }

    return this._http.get<any>(`${url}/${id}`, options);
  }

  patchKM(id: number, bodyPatch: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPatch);
    const url = this.getServerAPI();

    return this._http.patch<any>(`${url}/atualizarkm/${id}`, body, options);
  }

  getEquipamentos(params?: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (params && params.equipamentoId) {
      options.params = options.params.set('equipamentoId', params.equipamentoId);
    }

    if (params && params.veiculoId) {
      options.params = options.params.set('veiculoId', params.veiculoId);
    }

    return this._http.get<any>(`${this.getServerAPI()}/equipamentos`, options);
  }

  getPlanoManutencao(params: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('km', params.km)
      .set('veiculoId', params.veiculoId);
    return this._http.get<any>(`${this.getServerAPI()}/planomanutencao`, options);
  }

  getFrotas(params: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    options.params = options.params.set('paginar', params.paginar ? params.paginar : false);

    if (params) {
      if (Array.isArray(params.clientesId) && params.clientesId.length > 0) {
        options.params = options.params.set('clientesId', params.clientesId);
      }
      if (Array.isArray(params.regionaisId) && params.regionaisId.length > 0) {
        options.params = options.params.set('regionaisId', params.regionaisId);
      }
      if (Array.isArray(params.centrosCustoId) && params.centrosCustoId.length > 0) {
        options.params = options.params.set('centrosCustoId', params.centrosCustoId);
      }
      if (params.placa) {
        options.params = options.params.set('placa', params.placa);
      }
      if (params.paginar) {
        if (params.numPage) {
          options.params = options.params.set('numeroPagina', params.numPage);
        }
        if (params.numRows) {
          options.params = options.params.set('linhasPagina', params.numRows);
        }
      }
    }

    return this._http.get<any>(`${this.getServerAPI()}/frotas`, options);
  }

  getManutencoesRealizadas(params: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('paginar', params.paginar ? params.paginar : false);

    if (params) {
      if (Array.isArray(params.clientesId) && params.clientesId.length > 0) {
        options.params = options.params.set('clientesId', params.clientesId);
      }
      if (Array.isArray(params.regionaisId) && params.regionaisId.length > 0) {
        options.params = options.params.set('regionaisId', params.regionaisId);
      }
      if (Array.isArray(params.centrosCustoId) && params.centrosCustoId.length > 0) {
        options.params = options.params.set('centrosCustoId', params.centrosCustoId);
      }
      if (params.placa) {
        options.params = options.params.set('placa', params.placa);
      }
      if (params.dataInicio) {
        options.params = options.params.set('dataInicio', params.dataInicio);
      }
      if (params.dataFim) {
        options.params = options.params.set('dataFim', params.dataFim);
      }
      if (params.status) {
        options.params = options.params.set('status', params.status);
      }
      if (params.responsavel) {
        options.params = options.params.set('responsavel', params.responsavel);
      }
      if (params.numPage) {
        options.params = options.params.set('numeroPagina', params.numPage);
      }
      if (params.numRows) {
        options.params = options.params.set('linhasPagina', params.numRows);
      }
    }

    return this._http.get<any>(`${this.getServerAPI()}/manutencaorealizada`, options);
  }

  getZeroKM(params: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    options.params = options.params.set('condutorId', this._userContextService.getCondutorId());
    options.params = options.params.set('paginar', params.paginar ? params.paginar : false);

    if (params.clientesId) {
      options.params = options.params.set('clientesId', params.clientesId);
    }
    if (params.regionaisId) {
      options.params = options.params.set('regionaisId', params.regionaisId);
    }
    if (params.centrosCustoId) {
      options.params = options.params.set('centrosCustoId', params.centrosCustoId);
    }
    if (params.dataInicio) {
      options.params = options.params.set('dataInicio', new Date(params.dataInicio).toISOString().slice(0, 10));
    }
    if (params.dataFim) {
      options.params = options.params.set('dataFim', new Date(params.dataFim).toISOString().slice(0, 10));
    }
    if (params.placa) {
      options.params = options.params.set('placa', params.placa);
    }
    if (params.status) {
      options.params = options.params.set('status', params.status);
    }
    if (params.motivo) {
      options.params = options.params.set('motivo', params.motivo);
    }
    if (params.pedidoCompraId) {
      options.params = options.params.set('pedidoCompraId', params.pedidoCompraId);
    }
    if (params.contratoMasterId) {
      options.params = options.params.set('contratoMasterId', params.contratoMasterId);
    }
    if (params.paginar && params.numPage) {
      options.params = options.params.set('numeroPagina', params.numPage);
    }
    if (params.paginar && params.numRows) {
      options.params = options.params.set('linhasPagina', params.numRows);
    }

    return this._http.get<any>(`${this.getServerAPI()}/zerokm`, options);
  }

  getAcessorios(params?: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (params && params.tipo) {
      options.params = options.params.set('tipo', params.tipo);
    }

    if (params && params.acessorioId) {
      options.params = options.params.set('acessorioId', params.acessorioId);
    }

    return this._http.get<any>(`${this.getServerAPI()}/acessorios`, options);
  }

}
