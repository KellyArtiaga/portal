import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class IndicadoresFrotaAtivaService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('frotaativa', _http, _userContextService);
  }

  getFrotaAtiva(filtros?: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtros) {
      if (filtros.periodo) {
        options.params = options.params.set('periodo', new Date(filtros.periodo).toISOString().slice(0, 10));
      }
      if (Array.isArray(filtros.clientesId) && filtros.clientesId.length > 0) {
        options.params = options.params.set('clientesId', filtros.clientesId);
      }
      if (Array.isArray(filtros.regionaisId) && filtros.regionaisId.length > 0) {
        options.params = options.params.set('regionaisId', filtros.regionaisId);
      }
      if (Array.isArray(filtros.centrosCustoId) && filtros.centrosCustoId.length > 0) {
        options.params = options.params.set('centrosCustoId', filtros.centrosCustoId);
      }
      if (filtros.placa) {
        options.params = options.params.set('placa', filtros.placa);
      }
      if (filtros.estado) {
        options.params = options.params.set('estado', filtros.estado);
      }
      if (filtros.dataTerminoContratoMaster) {
        options.params = options.params.set('dataTerminoContratoMaster', filtros.dataTerminoContratoMaster);
      }
      if (filtros.faixaIdade) {
        options.params = options.params.set('faixaIdade', filtros.faixaIdade);
      }
      if (filtros.grupoVeiculoId) {
        options.params = options.params.set('grupoVeiculoId', filtros.grupoVeiculoId);
      }
      if (filtros.modeloId) {
        options.params = options.params.set('modeloId', filtros.modeloId);
      }
      if (filtros.idadeVeiculo) {
        options.params = options.params.set('idadeVeiculo', filtros.idadeVeiculo);
      }
      if (filtros.kmVeiculo) {
        options.params = options.params.set('kmVeiculo', filtros.kmVeiculo);
      }
      if (filtros.subalocado) {
        options.params = options.params.set('subalocado', filtros.subalocado);
      }
      if (typeof filtros.base === 'boolean') {
        options.params = options.params.set('base', filtros.base);
      }
    }

    return this._http.get<any>(`${url}/indicadores`, options);
  }
}
