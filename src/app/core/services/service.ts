import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { AppConfig } from 'src/assets/config/app.config';


export class AppService {
  private resource: string;
  private http: HttpClient;
  private userContext: UserContextService;

  constructor(resource, http, userContext) {
    this.resource = resource;
    this.http = http;
    this.userContext = userContext;
  }

  getServerAPI() {
    return `${AppConfig.API_SERVER}/${this.resource}`;
  }

  getServerAPIAutenticacao(): string {
    return `${AppConfig.API_AUTENTICACAO}/${this.resource}`;
  }

  getServerAPICommon(): string {
    return `${AppConfig.API_COMMON}`;
  }

  getServerAPIFeriados(): string {
    return `${AppConfig.API_FERIADOS}/${this.resource}`;
  }

  getEnderecoServerAPI() {
    return this.getServerAPI();
  }

  getServerAPICep(): any {
    return `${AppConfig.API_CEP}${this.resource}`;
  }

  getEmailServerAPI() {
    return `${AppConfig.API_EMAIL_SERVER}/${this.resource}`;
  }

  getArquivoServerAPI() {
    return `${AppConfig.ARQUIVO_API_SERVER}`;
  }

  getMapsServerAPI() {
    return `${AppConfig.MAPS_API_SERVER}`;
  }

  getHttpHeaderOptionToken(): any {
    const httpOptions = {
      headers: new HttpHeaders({
        'client_id': `${AppConfig.CLIENT_ID}`,
        'access_token': `${this.userContext.getToken()}`,
        'Content-Type': 'application/json'
      })
    };
    return httpOptions;
  }

  getHttpHeaderOptionTokenUsuarioId(): any {
    const httpOptions = {
      headers: new HttpHeaders({
        'client_id': `${AppConfig.CLIENT_ID}`,
        'access_token': `${this.userContext.getToken()}`,
        'Content-Type': 'application/json',
        'usuarioId': `${this.userContext.getUsuarioId()}`
      })
    };
    return httpOptions;
  }

  getHttpHeaderOptionTokenJWT(): any {
    const httpOptions = {
      headers: new HttpHeaders({
        // tslint:disable-next-line:max-line-length
        'Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJ1bmlkYXMyMDE5IiwiaWF0IjoxNTU2NjMyNzQyfQ.qZG3fNJqi4aMXn6Bwl3eaHVSVug8NY2_S2pGCfdoCf4',
        'Content-Type': 'application/json'
      })
    };
    return httpOptions;
  }

  getHttpHeaderOptionMultipart(): any {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${
          this.userContext.getTokenBearer()
          }`
      })
    };
    return httpOptions;
  }

  getTokenAPIFeriados(): string {
    return 'ZGF2aW1hdG9zQGZyYW1ld29ya3N5c3RlbS5jb20maGFzaD0xOTY5MzEwOTI';
  }
}
