import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VeiculoReservaMV } from 'src/app/shared/interfaces/veiculo-reserva.model';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class VeiculoReservaService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('veiculosreservas', _http, _userContextService);
  }

  set veiculoReservaSelecionado(item) {
    sessionStorage.setItem('veiculoReserva', JSON.stringify(item));
  }

  get veiculoReservaSelecionado() {
    return JSON.parse(sessionStorage.getItem('veiculoReserva'));
  }

  get(filtro?: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtro.numeroReserva) {
      options.params = options.params.set('numeroReserva', filtro.numeroReserva);
    }
    if (filtro.atendimentoId) {
      options.params = options.params.set('atendimentoId', filtro.atendimentoId);
    }
    return this._http.get<any>(`${url}`, options);
  }

  getAll(filtro?: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();

    options.params = new HttpParams()
      .set('clienteId', filtro.clienteId);

    if (filtro) {
      if (filtro.veiculoId) {
        options.params = options.params.set('veiculoId', filtro.veiculoId);
      }
      if (filtro.status) {
        options.params = options.params.set('status', filtro.status);
      }
      if (filtro.ufSolicitacao) {
        options.params = options.params.set('ufSolicitacao', filtro.ufSolicitacao);
      }
      if (filtro.cidadeSolicitacao) {
        options.params = options.params.set('cidadeSolicitacao', filtro.cidadeSolicitacao);
      }
      if (filtro.paginar) {
        options.params = options.params.set('paginar', !!filtro.paginar);

        if (filtro.linhasPagina) {
          options.params = options.params.set('linhasPagina', filtro.linhasPagina);
        }
        if (filtro.numeroPagina) {
          options.params = options.params.set('numeroPagina', filtro.numeroPagina);
        }
      }
    }

    return this._http.get<any>(`${url}`, options);
  }

  getGerenciamento(filtro?: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtro) {
      if (Array.isArray(filtro.clientesId)) {
        options.params = options.params.set('clientesId', filtro.clientesId);
      }
      if (Array.isArray(filtro.regionaisId)) {
        options.params = options.params.set('regionaisId', filtro.regionaisId);
      }
      if (Array.isArray(filtro.centrosCustoId)) {
        options.params = options.params.set('centrosCustoId', filtro.centrosCustoId);
      }
      if (filtro.veiculoId) {
        options.params = options.params.set('veiculoId', filtro.veiculoId);
      }
      if (filtro.status) {
        options.params = options.params.set('status', filtro.status);
      }
      if (filtro.ufSolicitacao) {
        options.params = options.params.set('ufSolicitacao', filtro.ufSolicitacao);
      }
      if (filtro.cidadeSolicitacao) {
        options.params = options.params.set('cidadeSolicitacao', filtro.cidadeSolicitacao);
      }
      if (filtro.paginar) {
        options.params = options.params.set('paginar', !!filtro.paginar);

        if (filtro.linhasPagina) {
          options.params = options.params.set('linhasPagina', filtro.linhasPagina);
        }
        if (filtro.numeroPagina) {
          options.params = options.params.set('numeroPagina', filtro.numeroPagina);
        }
      }
    }

    return this._http.get<any>(`${url}/gerenciamento`, options);
  }

  post(bodyPost: VeiculoReservaMV): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);

    return this._http.post<any>(`${url}`, body, options);
  }
}
