import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnderecoMV } from 'src/app/shared/interfaces/endereco.model';
import { MunicipioMV } from 'src/app/shared/interfaces/municipio.model';

import { AppService } from './service';
import { UserContextService } from './user-context.service';
import { Util } from 'src/app/shared/util/utils';
import { AppConfig } from 'src/assets/config/app.config';

@Injectable({
  providedIn: 'root'
})
export class ConsultaCepService extends AppService {
  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('', _http, _userContextService);
  }

  getEnderecoByCep(cep: string): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('cep', cep);

    return this._http.get<any>(`${this.getServerAPICep()}/enderecos`, options);
  }

  getAllUF(dados?: MunicipioMV): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    if (dados) {
      if (dados.uf) {
        options.params = options.params.set('uf', dados.uf);
      }
      if (dados.estado) {
        options.params = options.params.set('estado', dados.estado);
      }
    }

    return this._http.get<any>(`${this.getServerAPICep()}/unidadesfederacoes`, options);
  }

  getAllMunicipio(dados?: EnderecoMV): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    if (dados) {
      if (dados.uf) {
        options.params = options.params.set('uf', dados.uf);
      }
      if (dados.cidade) {
        options.params = options.params.set('municipio', Util.removeSpecialCharacters(dados.cidade.municipio ? dados.cidade.municipio : dados.cidade));
      }
    }

    return this._http.get<any>(`${this.getServerAPICep()}/municipios`, options);
  }

  getUF(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();

    return this._http.get<any>(`${this.getServerAPICep()}/unidadesfederacoes/${id}`, options);
  }

  getMunicipio(id: number): Observable<any> {
    const options = this.getHttpHeaderOptionToken();

    return this._http.get<any>(`${this.getServerAPICep()}/municipios/${id}`, options);
  }

  getLatLng(endereco: EnderecoMV): Observable<any> {
    const key = AppConfig.KEY_MAPS;
    let enderecoFormatado = '';

    if (endereco.logradouro) {
      enderecoFormatado += endereco.logradouro;
    }
    if (endereco.bairro) {
      enderecoFormatado += (enderecoFormatado ? ',' : '') + endereco.bairro;
    }
    if (endereco.cidade) {
      enderecoFormatado += (enderecoFormatado ? ',' : '') + endereco.cidade;
    }
    if (endereco.uf) {
      enderecoFormatado += (enderecoFormatado ? ',' : '') + endereco.uf;
    }
    if (endereco.cep) {
      enderecoFormatado += (enderecoFormatado ? ',' : '') + endereco.cep;
    }

    return this._http.get<any>(`${this.getMapsServerAPI()}?key=${key}&address=${enderecoFormatado}`);
  }

  getLatitudeLongitude(values: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('endereco', values.endereco)
      .set('municipio', values.municipio)
      .set('uf', values.uf);

    return this._http.get<any>(`${this.getServerAPICep()}/enderecos/coordenadas`, options);
  }
}
