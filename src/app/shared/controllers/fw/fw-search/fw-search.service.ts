import { SearchProvider } from "../../search-provider";
import { Injectable } from "@angular/core";
import { Observable  } from "rxjs";
import {map} from 'rxjs/operators/map';
import { HttpClient, HttpResponse } from "@angular/common/http";
import { environment } from '../../../../../environments/environment';
import { Pageable, Page, ArrayPage } from "../../../util/pageable";
import * as _ from 'lodash';
import { AbstractService } from "../common/abstract-service.service";
import { Options } from "selenium-webdriver/safari";
@Injectable()
export class FwSearchService extends AbstractService {
 
  constructor(private httpClient : HttpClient) { 
    super();
  }

  search(path: string, filters: any, pageable: Pageable, opts : any = {intercept:true, apiEndpoint : null}): Observable<ArrayPage<any>> {
    const merged = _.merge({},filters || {},pageable || {});
    const options = this.getHttpHeaderOptionToken();    
    merged.numeroPagina = merged.page + 1;
    merged.linhasPagina = merged.size;
    if (!opts.intercept) {
      options.headers.skipLoading = true;
    }
    const apiEndpoint = opts.apiEndpoint || environment.APIEndpoint;
    return this.httpClient.get(
        apiEndpoint+ '/' + path, 
        {
          params : merged,
          headers: options.headers
        }
    ).pipe(
      map((response: any)=> {
        let items = [];
        let totalElements = 0;
        if (!_.isNil(response.data)) {
          if (!_.isNil(response.data.results)) {
            items = response.data.results;
            totalElements = response.data.totalPages;
          } else {
            items = response.data;
            totalElements = response.totalElements;
          }
        } else if (!_.isNil(response.content)) {
          items = response.content;
          totalElements = response.totalElements;
        }

        return new ArrayPage<any>(items, totalElements, pageable);
      })
    ) as Observable<ArrayPage<any>>;
  }

  removeAfterSearch(path: string, id : any) : Observable<void> {
    return this.httpClient.delete(environment.APIEndpoint + '/' + path + '/' +id,this.getHttpHeaderOptionToken())
      .pipe(map(()=>{return;}))
  }

  
}
