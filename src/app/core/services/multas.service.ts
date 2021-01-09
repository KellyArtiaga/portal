import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';
import { MultasMV } from 'src/app/shared/interfaces/multas.model';

@Injectable({
  providedIn: 'root'
})
export class MultasService extends AppService {
  private multa: MultasMV;

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('multas', _http, _userContextService);
  }

  set(multa: MultasMV): void {
    this.multa = multa;
  }

  get(): MultasMV {
    return this.multa;
  }

  getAll(dados: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('clientesId', dados.clienteId)
      .set('paginar', dados.paginar);

    if (dados.placa) {
      options.params = options.params.set('placa', dados.placa);
    }
    if (dados.numeroAit) {
      options.params = options.params.set('numeroAit', dados.numeroAit);
    }
    if (dados.dataInicio) {
      options.params = options.params.set('dataInicio', new Date(dados.dataInicio).getTime());
    }
    if (dados.dataFim) {
      options.params = options.params.set('dataFim', new Date(dados.dataFim).getTime());
    }
    if (dados.renavam) {
      options.params = options.params.set('renavam', dados.renavam);
    }
    if (dados.tipo) {
      options.params = options.params.set('tipo', dados.tipo);
    }
    if (dados.status) {
      options.params = options.params.set('idStatus', dados.status);
    }
    if (dados.numPage) {
      options.params = options.params.set('numeroPagina', dados.numPage);
    }
    if (dados.numRows) {
      options.params = options.params.set('linhasPagina', dados.numRows);
    }

    return this._http.get<any>(`${url}/relatorio`, options);
  }

  getResponseGraficos(dados: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (Array.isArray(dados.clientesId) && dados.clientesId.length > 0) {
      options.params = options.params.set('clientesId', dados.clientesId);
    }
    if (Array.isArray(dados.regionaisId) && dados.regionaisId.length > 0) {
      options.params = options.params.set('regionaisId', dados.regionaisId);
    }
    if (Array.isArray(dados.centrosCustosId) && dados.centrosCustosId.length > 0) {
      options.params = options.params.set('centrosCustosId', dados.centrosCustosId);
    }
    if (dados) {
      if (dados.dataInicio) {
        options.params = options.params.set('dataInicio', new Date(dados.dataInicio).toISOString().slice(0, 10));
      }
      if (dados.dataFim) {
        options.params = options.params.set('dataFim', new Date(dados.dataFim).toISOString().slice(0, 10));
      }
      if (dados.prazoIdentificacao) {
        options.params = options.params.set('tipoData', 'I');
        options.params = options.params.set('dataInicio', new Date(dados.prazoIdentificacao).toISOString().slice(0, 10));
      }
      if (dados.estadosId) {
        options.params = options.params.set('estadosId', dados.estadosId);
      }
      if (dados.gruposId) {
        options.params = options.params.set('gruposId', dados.gruposId);
      }
      if (dados.municipiosId) {
        options.params = options.params.set('municipiosId', dados.municipiosId);
      }
      if (dados.infracoesId) {
        options.params = options.params.set('infracoesId', dados.infracoesId);
      }
      if (dados.infracoesClassificoesId) {
        options.params = options.params.set('infracoesClassificoesId', dados.infracoesClassificoesId);
      }
      if (dados.multaId) {
        options.params = options.params.set('multaId', dados.multaId);
      }
      if (dados.tipoData) {
        options.params = options.params.set('tipoData', dados.tipoData);
      }
      if (dados.placa) {
        options.params = options.params.set('placa', dados.placa);
      }
      if (dados.autoInfracao) {
        options.params = options.params.set('autoInfracao', dados.autoInfracao);
      }
      if (dados.faturado) {
        options.params = options.params.set('faturado', dados.faturado);
      }
      if (dados.condutorIdentificado) {
        options.params = options.params.set('condutorIdentificado', dados.condutorIdentificado);
      }
      if (typeof dados.base === 'boolean') {
        options.params = options.params.set('base', dados.base);
      }
      if (dados.paginar) {
        options.params = options.params.set('paginar', dados.paginar);
        if (dados.numPage) {
          options.params = options.params.set('numeroPagina', dados.numPage);
        }
        if (dados.numRows) {
          options.params = options.params.set('linhasPagina', dados.numRows);
        }
      }
    }

    return this._http.get<any>(`${url}`, options);
  }

  getTotalizadores(body: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const bodyTotalizadores = JSON.stringify(body);

    return this._http.post<any>(`${url}/indicadores`, bodyTotalizadores, options);
  }

  getMultasByType(body: any, type: string): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const bodyFrotaAtiva = JSON.stringify(body);

    return this._http.post<any>(`${url}/${type}`, bodyFrotaAtiva, options);
  }

  getCondutorMulta(data: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();
    options.params = new HttpParams();

    if (data) {
      Object.keys(data).forEach(key => {
        if (data[key]) {
          options.params = options.params.set(key, data[key]);
        }
      });
    }

    return this._http.get<any>(`${url}/condutores`, options);
  }

  postCondutorMulta(body: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();

    return this._http.post<any>(`${url}/condutores`, body, options);
  }

  patchCondutorMulta(id: any, body: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();

    return this._http.patch<any>(`${url}/condutores/${id}`, body, options);
  }
}
