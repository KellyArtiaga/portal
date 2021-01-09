import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PostRenavamMV } from 'src/app/shared/interfaces/post-renavam.model';

import { AppService } from './service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class RenavamService extends AppService {

  constructor(
    public _http: HttpClient,
    private _userContextService: UserContextService
  ) {
    super('renavam', _http, _userContextService);
  }

  get(placa: string): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams()
      .set('placa', placa.replace(/[^a-zA-Z0-9 ]/g, ''));
    const url = this.getServerAPI();

    return this._http.get<any>(`${url}`, options);
  }

  post(bodyPost: PostRenavamMV): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(bodyPost);
    const url = this.getServerAPI();

    return this._http.post<any>(`${url}`, body, options);
  }

}
