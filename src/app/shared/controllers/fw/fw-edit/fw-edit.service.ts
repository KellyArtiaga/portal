import { SearchProvider } from "../../search-provider";
import { Injectable } from "@angular/core";
import { Observable  } from "rxjs";
import {map} from 'rxjs/operators/map';
import { HttpClient, HttpResponse, HttpHeaders } from "@angular/common/http";
import { environment } from '../../../../../environments/environment';
import { Pageable, Page, ArrayPage } from "../../../util/pageable";
import * as _ from 'lodash';
import { AbstractService } from "../common/abstract-service.service";
@Injectable()
export class FwEditService extends AbstractService {
 
  constructor(private httpClient : HttpClient) { 
    super();
  }



  load(path: string, id : any, fields : string) : Observable<any>  {
    const config : any = {};
    if (fields) {
      config.params = {fields : fields};
    }
    return this.httpClient.get(
      environment.APIEndpoint + '/' + path + '/' + id,
      this.getHttpHeaderOptionToken()
    );
  }

  insert(path: string, entity: any): Observable<any> {
    
    return this.httpClient.post(
        environment.APIEndpoint + '/' + path, 
        entity,
        this.getHttpHeaderOptionToken()
    );
  }

  update(path: string, id: any, entity: any): Observable<any> {
    
    return this.httpClient.put(
        environment.APIEndpoint + '/' + path  + '/' + id,
        entity,
        this.getHttpHeaderOptionToken()
    );
  }

  
  
}
