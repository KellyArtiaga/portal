import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { AppService } from './service';
import { UserContextService } from './user-context.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClientesService extends AppService {
  teste: Observable<any>;
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('clientes', _http, _userContextService);
  }

  getAll(filtro?: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('tipoPessoa', 'JURIDICA');
    if (filtro) {
      if (filtro.filtroGenerico) {
        options.params = options.params.set('filtroGenerico', filtro.filtroGenerico);
      }
      if (filtro.cnpjCpf) {
        options.params = options.params.set('cnpjCpf', filtro.cnpjCpf);
      }
      if (filtro.nomeCliente) {
        options.params = options.params.set('nomeCliente', filtro.nomeCliente);
      }
      if (filtro.descricaoCidade) {
        options.params = options.params.set('descricaoCidade', filtro.descricaoCidade);
      }
    }
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}`, options);
  }

  get(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/${id}`, options);
  }

  getClienteCondutor(condutorId?: number): Observable<any> {
    const utilizaPlaca = !!localStorage.getItem('placaLogada');
    const options = this.getHttpHeaderOptionTokenUsuarioId();

    options.params = new HttpParams()
      .set('utilizaPlaca', JSON.stringify(utilizaPlaca));

    if (this._userContextService.getGrupoEconomicoId()) {
      options.params = options.params.set('grupoEconomicoId', this._userContextService.getGrupoEconomicoId());
    }

    if (localStorage.getItem('placaLogada')) {
      return this.getClienteCondutorPorId(condutorId);
    }

    const url = this.getServerAPI();

    return this._http.get<any>(`${url}`, options).pipe(
      map(status => {
        if (status) {
          const resultado = status['data'].results;

          resultado.forEach(res => {
            res.clienteId = res.id;
          });

          return status;
        }
      })
    );
  }

  getClienteCondutorPorId(condutorId?: number): Observable<any> {
    const utilizaPlaca = !!localStorage.getItem('placaLogada');
    const options = this.getHttpHeaderOptionToken();

    options.params = new HttpParams()
      .set('utilizaPlaca', JSON.stringify(utilizaPlaca));
    if (condutorId) {
      options.params = options.params.set('condutorId', condutorId);
    }
    if (localStorage.getItem('placaLogada')) {
      options.params = options.params.set('placa', localStorage.getItem('placaLogada'));
    }
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/condutor`, options);

  }
}
