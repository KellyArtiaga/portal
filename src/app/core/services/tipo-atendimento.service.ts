import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class TipoAtendimentoService extends AppService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('atendimentostipo', _http, _userContextService);
  }

  getAll(nomeTipo?: string, numPage?: number, numRows?: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const nome = 'nome';
    const numeroPagina = 'numeroPagina';
    const linhasPagina = 'linhasPagina';

    if (nomeTipo) {
      options.params = new HttpParams()
        .set(nome, nomeTipo)
        .set(numeroPagina, JSON.stringify(numPage))
        .set(linhasPagina, JSON.stringify(numRows));

    } else {
      options.params = new HttpParams()
        .set(numeroPagina, JSON.stringify(numPage))
        .set(linhasPagina, JSON.stringify(numRows));
    }
    const url = this.getServerAPI();
    return this._http.get<any>(`${url}`, options);
  }

  getTipoAtendimento(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}/${id}`, options);
  }

  postTipoAtendimento(bodyPost: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);
    const url = this.getServerAPI();

    return this._http.post<any>(`${url}`, body, options);
  }

  putTipoAtendimento(id: number, bodyPut: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPut);
    const url = this.getServerAPI();

    return this._http.put<any>(`${url}?id=${bodyPut.id}`, body, options);
  }

  deleteTipoAtendimento(id: number): Observable<any> {
    const url = this.getServerAPI();
    const options = this.getHttpHeaderOptionToken();

    return this._http.delete<any>(`${url}/${id}`, options);
  }

}
