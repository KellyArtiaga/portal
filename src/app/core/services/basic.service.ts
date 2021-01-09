import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { AppConfig } from 'src/assets/config/app.config';
import { environment } from 'src/environments/environment';

export class BasicService {

  private baseResource: string;
  private baseHttp: HttpClient;
  private baseUserContext: UserContextService;
  public request = {
    get(base: string, uri: string, options: any): Observable<any> {
      return null;
    },
    api: {
      get(uri: string, options: any): Observable<any> {
        return this.request.get(AppConfig.API_SERVER, uri, options);
      }
    }
  };

  constructor(resource: string, http: HttpClient, userContext: UserContextService) {
    this.baseResource = resource;
    this.baseHttp = http;
    this.baseUserContext = userContext;
    this.request.get = (base: string, uri: string, options: any): Observable<any> => {
      return this.baseHttp.get(`${base}${uri}`, options);
    };
  }

  getUserContext(): UserContextService {
    return this.baseUserContext;
  }

  getHttp(): HttpClient {
    return this.baseHttp;
  }

  getServerAPI(): string {
    return `${AppConfig.API_SERVER}/${this.baseResource}`;
  }

  getServerAPIMultas(): string {
    return `${AppConfig.API_MULTAS_SERVER}/${this.baseResource}`;
  }

  getServerAPIAutenticacao(): string {
    return `${AppConfig.API_AUTENTICACAO}/${this.baseResource}`;
  }

  getServerAPIFeriados(): string {
    return `${AppConfig.API_FERIADOS}/${this.baseResource}`;
  }

  getServerAPIAlterarSenha() {
    return `${AppConfig.API_ALTERAR_SENHA}/${this.baseResource}`;
  }

  getResource(): string {
    return this.baseResource;
  }

  getHttpHeaderOptionToken(): any {
    const usuarioId = localStorage.getItem('usuarioId');
    const httpOptions = {
      headers: new HttpHeaders({
        'client_id': `${AppConfig.CLIENT_ID}`,
        'access_token': `${this.baseUserContext.getToken()} `,
        'Content-Type': 'application/json',
        'usuarioId': usuarioId || '',
      })
    };
    return httpOptions;
  }

  getGerenciadorAtividadesHeaderOptions(): any {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      })
    };
    return httpOptions;
  }

  getHttpHeaderOptions(): any {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Basic ${environment.bearerCliente}`
      })
    };
    return { headers: httpOptions.headers };
  }

  getTokenAPIFeriados(): string {
    return 'ZGF2aW1hdG9zQGZyYW1ld29ya3N5c3RlbS5jb20maGFzaD0xOTY5MzEwOTI';
  }
}
