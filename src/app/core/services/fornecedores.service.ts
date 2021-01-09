import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService extends AppService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('fornecedores', _http, _userContextService);
  }

  getPorRaio(dados: any, kmAmpliacao?: number): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (kmAmpliacao) {
      options.params = options.params.set('kmAmpliacaoUsuario', kmAmpliacao);
    }
    if (dados) {
      if (dados.veiculoId) {
        options.params = options.params.set('veiculoId', dados.veiculoId);
      }
      if (dados.planoManutencaoId) {
        options.params = options.params.set('planoManutencaoId', dados.planoManutencaoId);
      }
      if (dados.listaServicos) {
        options.params = options.params.set('listaServicos', dados.listaServicos);
      }
      if (dados.municipioId) {
        options.params = options.params.set('municipioOrigemId', dados.municipioId);
      }
      if (dados.latitude) {
        options.params = options.params.set('latitudeOrigem', dados.latitude);
      }
      if (dados.longitude) {
        options.params = options.params.set('longitudeOrigem', dados.longitude);
      }
      if (dados.fornecedor24Horas) {
        options.params = options.params.set('fornecedor24Horas', dados.fornecedor24Horas);
      }
      if (dados.isencao) {
        options.params = options.params.set('isencao', dados.isencao);
      }
      if (dados.entregaDevolucao) {
        options.params = options.params.set('entregaDevolucao', dados.entregaDevolucao);
      }
      if (dados.segmentoNegocioId) {
        options.params = options.params.set('segmentoNegocioId', dados.segmentoNegocioId);
      }
      if (dados.tipoManutencao) {
        options.params = options.params.set('tipoManutencao', dados.tipoManutencao);
      }
    }

    return this._http.get<any>(`${url}/servicosfornecedoresraio`, options);
  }

  getDadosCalendario(fornecedorId?: number, dataInicio?: number, possuiSaldo?: boolean): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    if (fornecedorId) {
      options.params = options.params.set('fornecedorId', fornecedorId);
    }
    if (dataInicio) {
      options.params = options.params.set('dataInicio', dataInicio);
    }
    if (possuiSaldo) {
      options.params = options.params.set('possuiSaldo', possuiSaldo);
    }
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/calendariovaga`, options);
  }

}
