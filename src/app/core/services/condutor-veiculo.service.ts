import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from './service';
import { UserContextService } from './user-context.service';
import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class CondutorVeiculoService extends AppService {
  constructor(
    public _http: HttpClient,
    _userContextService: UserContextService
  ) {
    super('condutorveiculo', _http, _userContextService);
  }

  validar(veiculoId : number,condutorId:number, condutorAnteriorId?: number) {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('condutorId', condutorId.toString())
      .set('veiculoId', veiculoId.toString());
    if (!_.isNil(condutorAnteriorId)) {
      options.params = options.params.set('condutorAnteriorId', condutorAnteriorId.toString());
    }
    const url = this.getServerAPI();
    return this._http.get<any>(`${url}/${veiculoId}/validacao`, options);
  }

  getAll(filtro?: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('statusCondutor', filtro.statusCondutor)
      .set('paginar', filtro.paginar ? filtro.paginar : false);

    if (filtro) {
      if (filtro.clientesId) {
        options.params = options.params.set('clientesId', filtro.clientesId);
      }
      if (filtro.regionaisId) {
        options.params = options.params.set('regionaisId', filtro.regionaisId);
      }
      if (filtro.centrosCustoId) {
        options.params = options.params.set('centrosCustoId', filtro.centrosCustoId);
      }
      if (filtro.regionaisId) {
        options.params = options.params.set('regionaisId', filtro.regionaisId);
      }
      if (filtro.centroCustosId) {
        options.params = options.params.set('centroCustosId', filtro.centroCustosId);
      }
      if (filtro.placa) {
        options.params = options.params.set('placa', filtro.placa);
      }
      if (filtro.nomeCondutor) {
        options.params = options.params.set('nomeCondutor', filtro.nomeCondutor);
      }
      if (filtro.paginar && filtro.numeroPagina) {
        options.params = options.params.set('numeroPagina', filtro.numeroPagina);
      }
      if (filtro.paginar && filtro.linhasPagina) {
        options.params = options.params.set('linhasPagina', filtro.linhasPagina);
      }
    }

    const url = this.getServerAPI();

    return this._http.get<any>(`${url}`, options);
  }

  postCondutorVeiculo(bodyPost): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);
    const url = this.getServerAPI();

    return this._http.post<any>(`${url}`, body, options);
  }

  patchCondutorVeiculo(idVeiculo: number, bodyPatch: any) {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPatch);
    const url = this.getServerAPI();

    return this._http.patch<any>(`${url}/${idVeiculo}`, body, options);
  }
}
