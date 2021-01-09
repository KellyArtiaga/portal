// import { Component, Input, Output, OnInit, EventEmitter, Host, Inject, forwardRef, Optional } from '@angular/core';
// import { FormControl } from '@angular/forms';

// import { MAT_DATE_FORMATS, DateAdapter, NativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
// import { Platform, PlatformModule } from '@angular/cdk/platform';
// import { Observable, from, Subject, Subscription, of } from 'rxjs';

// import { startWith, map, flatMap, filter, tap, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
// import {FwSearchService} from '../fw-search/fw-search.service';
// import { Pageable } from '../../../util/pageable';
// import { FwController } from '../fw-controller';
// import { FwValidateService } from '../fw-validate/fw-validate.service';
// import { FwConfigService } from '../fw-config.service';
// import * as _ from 'lodash';

// export abstract class AbstractSelection {

 

//     @Input()
//     label : string;

//     @Input()
//     fields: string = 'id,name,description';

//     @Input()
//     path : string;

//     @Input()
//     control = new FormControl();

//     @Input()
//     displayFn : Function = tryDisplayName;

//     @Input()
//     matchesDisplayFn : Function = tryDisplayName;
    
//     @Input()
//     value: any;

//     @Output()
//     valueChange: EventEmitter<any> = new EventEmitter();

//     @Output()
//     onOptionSelect: EventEmitter<any> = new EventEmitter();


//     @Input()
//     onSelectEmmit : string | Function = 'object';

//     @Input()
//     mapAs: string;

//     matches: Observable<any[]>;

//     @Input()
//     subscribeTo : any | any[];

//     @Input()
//     dataArrayProperty = 'data';


//     @Input()
//     nameProperty = 'name';

//     @Input()
//     idProperty = 'id';

//     @Input()
//     showIdProperty = false;

//     @Input()
//     zipControls : any[];
    
//     @Input()
//     disabled = false;

//     @Input()
//     readonly = false;
//     @Input()
//     integerId = true;


//     private subcriptions : Subscription[] = [];

//     constructor(
//         private fwService : FwSearchService,
//         public validate : FwValidateService,
//         @Inject('FwConfig') protected config : FwConfig) {
        
//         this.dataArrayProperty = this.config.resultArrayProp;
//         this.nameProperty = this.config.omniSearchProp;
//     }

//     onSelect(value: any) {
//         let valueToEmit;

//         if(!_.isNil(value)) {
//             if (this.onSelectEmmit == 'object') {
//                 valueToEmit = value;
//                 if (!!this.mapAs) {
//                     valueToEmit._mapAs = this.mapAs;
//                 }
//             } else if (typeof this.onSelectEmmit === 'string'){
//                 valueToEmit = value[this.onSelectEmmit.toString()];
//             } 
//         }
        
//         if (this.onSelectEmmit instanceof Function){
//             valueToEmit = this.onSelectEmmit(value);
//         }

//         this.value = valueToEmit;
//         this.valueChange.emit(valueToEmit);

//         this.onOptionSelect.emit({name : 'select', value : valueToEmit})

//         this.notifyParents();
//     }

//     private clearSelectionAndPromise() {
//         this.clearSelection();
//         return this.getEmptyPromise();
//     }
//     private clearSelection() {
//         this.value = null;
//         this.valueChange.emit(null);
//     }

//     onParentEvent(evt : any) {
//         if (_.isNil(evt)) {
//             return;
//         }
//         if (!!evt && evt.name === 'clear') {
//             this.value = null;
//             this.control.reset();
//         }

        
//     }

//     protected trySubscribeTo(object : any) {
//         if ( object.subject && object.subject instanceof Subject) {
//             this.subscribe(<Subject<any>> object.subject);
//         } else if (object instanceof Subject) {
//             this.subscribe(<Subject<any>> object);
//         }else if (object instanceof Array) {
//             (<Array<any>>object).forEach(item=> this.trySubscribeTo(item));
//         }
//     }
     
//     protected subscribe(subject : Subject<any>) {
//         const sb = subject.subscribe(
//             evt => this.onParentEvent(evt)
//         );

//         this.subcriptions.push(sb);
//     }


//     protected notifyParents() {
//         if (this.subscribeTo) {
//             if (this.subscribeTo instanceof Array) {
//                 _(this.subscribeTo).each((a)=> {
//                     if (a.update) {
//                         a.update();
//                     }
//                 })
//             } else {
//                 if (this.subscribeTo.update) {
//                     this.subscribeTo.update();
//                 }
//             }
//         }
//     }
 
//     isEnabled() {
//         return !this.disabled 
//         // && (
//         //     !this.zipControls || 
//         //     _(this.zipControls).mapValues((control : FormControl)=> !!control.value).reduce((a,b)=> a && b)
//         // );
//     }
 
//     isShowPanel() {
//         return  this.localMatches
//     }

//     displayField(line : any) {
//         return tryDisplayName(line, {showId : this.showIdProperty, idProp : this.idProperty, nameProp: this.nameProperty});
//     }

//     renderOption(line : any) {
//         return tryDisplayName(line, {showId : this.showIdProperty, idProp : this.idProperty, nameProp: this.nameProperty});
//     }

//     protected getEmptyPromise() {
//         let empty = {};
//         empty[this.dataArrayProperty] = [];
//         this.onSelect(null);
//         return Promise.resolve(empty);
//     }

//     protected createSearchParams(value) {
//         let params = {};
//         if (!_.isNil(value)) {
//             params[this.omniSearchProperty] = value;
//         }
//         if(this.zipControls) {
//             _.mapKeys(this.zipControls,(control,key)=> {
//                 if (control) {
//                     let val = control.value;
//                     if ( typeof val ==='object' && !_.isNil(val)) {
//                         val = val['id'];
//                     }
//                     params[key] = val;
//                 }
//             });
//         }
//         return params;
//     }

    
// }



// function tryDisplayName(line : any, options : any) : string {

//     if (!line) {
//         return null;
//     }

//     const name = line[options.nameProp];
//     if (!_.isNil(options.idProp) && this.options.showId) {
//         const id = line[options.idProp];
//         `${id} - ${name}`; 
//     } else {
//         return name;
//     }
// }  
