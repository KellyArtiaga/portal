import { Component, Input, Injectable, Inject } from '@angular/core';
import { FormControl, ValidatorFn, AbstractControl } from '@angular/forms';



import * as _ from 'lodash';

@Injectable()
export class SerializationService {

    constructor(
        @Inject('FwConfig') private config : FwConfig){
            
    }
    
    serialize(data : any, depth = 9999, current = 1){
        _.mapKeys(data,(value, key)=>{
            if (!_.isNil(value) && value instanceof Date) {
                data[key] = this.convertDate(value);
            }
            if (_.isUndefined(value)) {
                data[key] = null;
            } 
            if (_.isPlainObject(value) && current < depth) {
                this.serialize(value, depth, ++depth);
            }
        });

        return data;
    }

    private deserialize(data : any) {

    }

    private convertDate(val: Date){
        return val.toISOString();
    }

}