import { HttpHeaders } from "@angular/common/http";
import { AppConfig } from "src/assets/config/app.config";


export class AbstractService {

  getHttpHeaderOptionToken(): any {
      
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const dados = this.getDados();
      const usuarioId = dados.id || dados.usuarioId;
      const httpOptions = {
        headers: new HttpHeaders({
          'client_id': `${AppConfig.CLIENT_ID}`,
          'access_token': token,
          'From' : `${usuarioId}`,
          'usuarioId' : `${usuarioId}`,
          'Content-Type': 'application/json'
        })
      };
      return httpOptions;
  } 
  getDados(): any {
    return JSON.parse(localStorage.getItem('dados')) || null;
  }
      
}