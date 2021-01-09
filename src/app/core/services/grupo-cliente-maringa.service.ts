import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VeiculoReservaMV } from 'src/app/shared/interfaces/veiculo-reserva.model';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class GrupoClienteMaringaService extends AppService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('gruposclientesmaringa', _http, _userContextService);
  }


  getAll(filtro?: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtro) {
      if (filtro.descricao) {
        options.params = options.params.set('descricao', filtro.descricao);
      }
    }

    return this._http.get<any>(`${url}`, options);
  }

  getById(id: number, filtro?: any): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();

    if (filtro) {
      if (filtro.descricao) {
        options.params = options.params.set('descricao', filtro.descricao);
      }
    }

    return this._http.get<any>(`${url}/${id}`, options);
  }
}
