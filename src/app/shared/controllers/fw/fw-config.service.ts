import { Component, Input, Injectable, InjectionToken, Inject } from '@angular/core';
import { FormControl, ValidatorFn, AbstractControl } from '@angular/forms';


import * as _ from 'lodash';
@Injectable()
export class FwConfigService {

    config = {
        defaultIdProperty:'id',
        defaultNameProperty:'name',
        omniSearchProp : 'name',
        resultArrayProp: 'content',
        pageablePageProp : 'page',
        pageablePageTotalProp : 'totalPages'
    };

    

    constructor(@Inject('FwConfig') param: FwConfig) {

        if(!!param) {
            this.config = _.extend(this.config, param);
        }
        
    }

    

}