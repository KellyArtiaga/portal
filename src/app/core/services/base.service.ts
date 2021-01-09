import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { DataBasicCrudMV } from 'src/app/shared/interfaces/data-basic-crud.model';
import { BasicService } from './basic.service';


export interface BaseCRUDService {
  all(data?: any): Observable<any>;
  get(data: DataBasicCrudMV): Observable<any>;
  save(data: any): Observable<any>;
  remove(data: DataBasicCrudMV): Observable<any>;
  patch(id: number, data: any, api?: string): Observable<any>;
}

export class BaseService extends BasicService implements BaseCRUDService {
  constructor(resource: string, http: HttpClient, userContext: UserContextService) {
    super(resource, http, userContext);
  }

  all(data?: any, path?: string): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    if (data) {
      options.params = new HttpParams();
      Object.keys(data).forEach(key => {
        if ((data[key] !== null && data[key] !== undefined) || typeof data[key] === 'number') {
          options.params = options.params.set(key, data[key]);
        }
      });
    }
    return this.getHttp().get<any>(`${this.getServerAPI()}` + (path ? `/${path}` : ''), options);
  }

  get(data: DataBasicCrudMV): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    return this.getHttp().get<any>(`${this.getServerAPI()}/${data.id}`, options);
  }

  save(data: any): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    if (data.id) {
      return this.getHttp().put<any>(`${this.getServerAPI()}/${data.id}`, data, options);
    }
    return this.getHttp().post<any>(this.getServerAPI(), data, options);
  }

  remove(data: DataBasicCrudMV): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    if (data.id) {
      return this.getHttp().delete<any>(`${this.getServerAPI()}/${data.id}`, options);
    }
    return;
  }

  getHttpHeaderOptionTokenJWT(projeto: string): any {
    const httpOptions = {
      headers: new HttpHeaders({
        // tslint:disable-next-line:max-line-length
        'Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJVbmlkYXNAMTkiLCJpYXQiOjE1NjAxOTU4OTF9.gTQbwi8kYuHGJQOb5yLd1IFH8tBWWtyur8MQLUP-nno',
        'Content-Type': 'application/json',
        'projeto': projeto
      })
    };

    return httpOptions;
  }

  getHttpHeaderOptionsUNIRENT(token: string): any {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
    return httpOptions;
  }

  patch(id: number, data: any, api?: string): Observable<any> {
    const options = this.getHttpHeaderOptionToken();
    options.params = new HttpParams();
    const API = api === 'MULTAS' ? this.getServerAPIMultas() : this.getServerAPI();

    if (data) {
      options.params = new HttpParams();
      Object.keys(data).forEach(key => {
        if ((data[key] !== null && data[key] !== undefined) || typeof data[key] === 'number') {
          options.params = options.params.set(key, data[key]);
        }
      });
    }

    if (id) {
      return this.getHttp().patch<any>(`${API}/${id}`, data, options);
    } else {
      return this.getHttp().patch<any>(`${API}`, data, options);
    }
  }

}
