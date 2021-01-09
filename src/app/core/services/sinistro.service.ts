import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { UserContextService } from './user-context.service';
import { Util } from 'src/app/shared/util/utils';

@Injectable({
  providedIn: 'root'
})
export class SinistroService extends BaseService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('sinistros', _http, _userContextService);
  }

  getTipos(params?: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (params && Object.keys(params).length > 0) {
      Object.keys(params).forEach(key => {
        const param = params[key];
        if (param) {
          options.set(key, param);
        }
      });
    }

    const url = this.getServerAPI();
    return this._http.get<any>(`${url}/tipo`, options);
  }

  getIndicadores(filtro: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtro) {
      if (filtro.dataInicio) {
        options.params = options.params.set('dataInicio', new Date(filtro.dataInicio).toISOString().slice(0, 10));
      }
      if (filtro.dataFim) {
        options.params = options.params.set('dataFim', new Date(filtro.dataFim).toISOString().slice(0, 10));
      }
      if (Array.isArray(filtro.clientesId)) {
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
      if (filtro.diaSemana) {
        options.params = options.params.set('diaSemana', filtro.diaSemana);
      }
      if (filtro.faixaHorario) {
        options.params = options.params.set('faixaHorario', filtro.faixaHorario);
      }
      if (filtro.faixaHorarioComercial) {
        options.params = options.params.set('faixaHorarioComercial', filtro.faixaHorarioComercial);
      }
      if (filtro.tipoSinistro) {
        options.params = options.params.set('tipoSinistro', filtro.tipoSinistro);
      }
      if (filtro.codigoDeclaracaoCulpa) {
        options.params = options.params.set('codigoDeclaracaoCulpa', filtro.codigoDeclaracaoCulpa);
      }
      if (typeof filtro.base === 'boolean') {
        options.params = options.params.set('base', filtro.base);
      }
    }

    const url = this.getServerAPI();
    return this._http.get<any>(`${url}/indicadores`, options);
  }
}
