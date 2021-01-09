import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { EmailPost } from 'src/app/shared/interfaces/email.model';
import { AppService } from './service';

@Injectable({
  providedIn: 'root'
})
export class EmailService extends AppService {

  constructor(public _http: HttpClient, private _userContextService: UserContextService) {
    super('emails', _http, _userContextService);
  }

  postEmail(email: EmailPost): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    const body = JSON.stringify(email);
    const url = this.getEmailServerAPI();
    return this._http.post<any>(`${url}`, body, options);
  }
}
