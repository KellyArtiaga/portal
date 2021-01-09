import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import * as _ from 'lodash';
import { MessageService } from '../../../communication/message.service';

import { Subject, empty, Observable } from 'rxjs';
import { FwController } from '../fw-controller';
import { FormGroup } from '@angular/forms';
import { FwEditService } from './fw-edit.service';
import { switchMap, map, flatMap } from 'rxjs/operators';
import { FormUtils } from '../../../util/form-utils';

@Component({
  selector: 'fw-edit',
  templateUrl: './fw-edit.component.html',
  styleUrls : ['./fw-edit.component.scss']
})
export class FwEdit implements OnInit, FwController{
    @Input()
    showHeader = false;
    
    @Input()
    showSubtitle = false;

    @Input()
    options : any = {
        title : 'Edit',
        onCancel : 'redirectToPrevious',
        successInsertMessage : 'UN-S002'
    };

    subject : Subject<any> = new Subject();

    context : any = {};

    @Input() 
    path :string;

    @Input()
    idCol :string = 'id';

    @Input()
    fields : string;

    @Input()
    form : FormGroup;

    @Input()
    routeTo : string;

    @Output()
    onClear = new EventEmitter<any>();

    @Output()
    onSave = new EventEmitter<any>();

    @Output()
    onSaveException = new EventEmitter<any>();

    @Output()
    onLoad = new EventEmitter<any>();

    @Input()
    evaluateDisplay : (component:string, formGroup : any) => boolean;

    @Input()
    validateFn : (formGroup : any, messageService ?: MessageService) => any;

    @Input()
    serializeFn : (formGroup : any) => any;

    @Input()
    deserializeFn : (formGroup : any) => any;

    @Input()
    saveLabel : string = 'Salvar';

    @Input()
    cancelLabel : string = 'Cancelar';

    @Input()
    displaySave = true;

    @Input()
    disableSave = false;

    @Input()
    displayCancel = true;

    @Input()
    enableSave = true;

    @Input()
    routeOneSave = true;

    @Input()
    loadStrategyFn : (params:any, loaderService : (params: any)=> Observable<any>) => Observable<any>;

    @Input()
    showMessageOnSaveError = true;
  
    loaded = false;
    private id : any; 
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private editService: FwEditService,
        private messageService : MessageService) {}

    ngOnInit(): void {
        if (_.isNil(this.options)) {
            this.options = {
                title : 'Edit',
                onCancel : 'redirectToPrevious',
                successInsertMessage : 'UN-S002'
            };
        }
        if (this.path == null) {
            throw new Error("Define a path.");
        }

        if (this.form == null) {
            throw new Error("Define a form.");
        }

        let sb = this.route.paramMap.pipe(
            switchMap((params: any) => {
                if(_.isNil(this.loadStrategyFn)) {
                    return this.execDefaultLoadParameterStrategy(params);
                } else {
                    return this.loadStrategyFn(params, this.createLoader());
                }
            }),
            map(entity=> this.deserialize(entity))
        ).subscribe(
            (entity)=> {
                this.form.patchValue(entity);
                // this.form.markAsPristine();
                this.loaded = true;
                this.notifySuccessLoad(entity);
            },
            (error)=> this.dealWithError(error)
        );
    }
    private createLoader() {
        return (params)=> {
            return this.editService.load(this.path, params, this.fields);
        };
    }
    private execDefaultLoadParameterStrategy(params : any) {
        this.id = params.get('id');
        return _.isNil(this.id) ? empty() : this.editService.load(this.path, this.id, this.fields)
    }
    

    protected deserialize(entity: any): { [key: string]: any; } {
        if (this.deserializeFn) {
            return this.deserializeFn(entity);
        }
        return entity;
    }
    
    protected serialize(entity: any): { [key: string]: any; } {
        if (this.serializeFn) {
            return this.serializeFn(entity);
        }
        return entity;
    }


    props(name: string) : any {


        if (!this.options || !this.options[name]) {
            const camelCaseName = 
                (!!this.id ? 'update' : 'insert') + 
                (name.length == 1? name.toUpperCase() : name.substring(0,1).toUpperCase() + name.substring(1) );

            if (!this.options[camelCaseName]) {
                return null;
            }

            return this.options[camelCaseName];
        }
        return this.options[name];
    }



    save() {
      
        if (this.form.invalid) {
            let messageThrown = false;
            if(!!this.validateFn) {
                messageThrown = this.validateFn(this.form, this.messageService) === false;
            }
            if (!messageThrown) {
                this.messageService.error('UN-E002');
            }
            FormUtils.markChildrenAsDirty(this.form);
            return;
        }
        
        try {
            if (!this.id) {
                this.editService.insert(this.path,this.serialize(this.form.value))
                    .subscribe(
                        (res)=> this.notifySuccessInsert(res),
                        (error)=> {
                            this.onSaveException.emit(error);
                            if (this.showMessageOnSaveError) {
                                this.dealWithError(error)
                            }
                        }
                    );
            } else {
                this.editService.update(this.path,this.id,this.serialize(this.form.value))
                    .subscribe(
                        (res)=> this.notifySuccessUpdate(res),
                        (error)=> {
                            this.onSaveException.emit(error);
                            if (this.showMessageOnSaveError) {
                                this.dealWithError(error);
                            }
                        }
                    );
            }

        } catch (e) {
            this.messageService.error('UN-E001');
        }
    }

    protected dealWithError(error : any) {
        
        this.messageService.dealWithError(error);
    }

    protected notifySuccessLoad(result : any) {
        this.onLoad.emit(result);
    }

    protected notifySuccessInsert(result : any) {
        this.messageService.success(this.options.successInsertMessage || 'UN-S002');
        if (this.routeOneSave) {
            if (this.routeTo) {
                this.router.navigate(['../'], { relativeTo: this.route });
            } else {
                this.router.navigate([this.routeTo]);
            }
        }
        this.onSave.emit(result);
    }

    protected notifySuccessUpdate(result : any) {
        this.messageService.success('UN-S003');
        if (this.routeOneSave) {
            if (this.routeTo) {
                this.router.navigate(['../'], { relativeTo: this.route });
            } else {
                this.router.navigate([this.routeTo]);
            }
        }
        this.onSave.emit(result);
    }
    show(componentName:string) {
        if (!!this.evaluateDisplay) {
            return this.evaluateDisplay(componentName, this.form);
        }
        if (componentName === 'save') {
            return this.displaySave;
        }
        if (componentName === 'cancel') {
            return this.displayCancel;
        }
        
        return true;
    }

    clear() {
        this.form.reset();

        this.subject.next({name:'clear'});

        this.onClear.emit();

    }

    cancel() {
        if (this.routeTo) {
            this.router.navigate([this.routeTo]);
        } else {
            this.router.navigate(['../'], { relativeTo: this.route });
        }
    }


    isPersistent() {
        return this.id != null;
    }
   
        
}



