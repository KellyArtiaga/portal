import { Component, Input, Output, OnInit, EventEmitter, Host, Inject, forwardRef, Optional, ViewChild } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';

import { MAT_DATE_FORMATS, DateAdapter, NativeDateAdapter, MAT_DATE_LOCALE, MatOption } from '@angular/material/core';
import { Platform, PlatformModule } from '@angular/cdk/platform';
import { Observable, from, Subject, Subscription, of } from 'rxjs';

import { startWith, map, flatMap, filter, tap, debounceTime, distinctUntilChanged, switchMap, catchError, finalize } from 'rxjs/operators';
import { FwSearchService } from '../fw-search/fw-search.service';
import { Pageable, ArrayPage } from '../../../util/pageable';
import { FwController } from '../fw-controller';
import { FwValidateService } from '../fw-validate/fw-validate.service';
import { FwConfigService } from '../fw-config.service';
import * as _ from 'lodash';
@Component({
  selector: 'fw-autocomplete',
  template: `
    <mat-form-field [appearance]="appearance">
        <mat-label>{{label}}{{isRequired()?'*':''}}</mat-label>
        <input matInput type="text"
            [formControl]="control"
            [readonly]="readonly"
            [maxlength]="maxlength"
            [matAutocomplete]="auto" autocomplete="off">
        <mat-autocomplete #auto="matAutocomplete"
            (optionSelected)='onSelect($event.option.value)'
            [displayWith]="displayField.bind(this)" >
            <mat-option *ngIf="enableAllOption" #allSelected  [value]="allOptionValue">Todos(as)</mat-option>
            <mat-option *ngIf="enableAllOption" #noneSelected [value]="noneOptionValue">Nenhum</mat-option>
            <hr *ngIf="enableAllOption">
            <mat-option *ngFor="let option of matches | async" [value]="option">
                {{renderOption(option)}}
            </mat-option>
            <mat-option *ngIf="isLoading" class="is-loading"><small>Pesquisando registros ...</small></mat-option>
        </mat-autocomplete>
        <mat-error>{{validate.message(control)}}</mat-error>
        <mat-hint align="end" *ngIf="hint">{{hint}}</mat-hint>
    </mat-form-field>
`
})
export class FwAutocompleteComponent {
  @Input()
  apiEndpoint = null;

  @Input()
  appearance = 'outline';

  @Input()
  clearIncompleteInpuOnParentEvent = true;

  @Input()
  maxlength = 50;

  @Input()
  hint: string;

  @Input()
  flex: string;

  @Input()
  label: string;

  @Input()
  fields: string = 'id,name,description';

  @Input()
  path: string;

  @Input()
  control = new FormControl();

  @Input()
  displayFn: Function = tryDisplayName;

  @Input()
  matchesDisplayFn: Function = tryDisplayName;

  @Input()
  value: any;

  @Output()
  valueChange: EventEmitter<any> = new EventEmitter();

  @Output()
  onOptionSelect: EventEmitter<any> = new EventEmitter();


  @Input()
  onSelectEmmit: string | Function = 'object';

  @Input()
  mapAs: string;

  matches: Observable<any[]>;

  @Input()
  subscribeTo: any | any[];

  @Input()
  dataArrayProperty = 'data';

  @Input()
  omniSearchProperty = 'name';

  @Input()
  nameProperty = 'name';

  @Input()
  idProperty = 'id';

  @Input()
  showIdProperty = false;

  @Input()
  zipControls: any[];

  @Input()
  disabled = false;

  @Input()
  readonly = false;

  @Input()
  validateInput = true;

  @Input()
  minLengthFetch = 3;

  localMatches = [];

  @Input()
  integerId = true;

  @Input()
  retryWhenEmpty = false;

  @Input()
  mapperFn: (item: any, opts?: any) => any = null;

  @Input()
  enableAllOption = false;

  @Input()
  toggleAllByDefault = false;

  @ViewChild('allSelected')
  private allSelected: MatOption;

  @ViewChild('noneSelected')
  private noneSelected: MatOption;

  @Input()
  allOptionValue = { id: 0 };
  @Input()
  noneOptionValue = { id: -1 };

  public isLoading = false;
  private subcriptions: Subscription[] = [];

  constructor(
    private fwService: FwSearchService,
    public validate: FwValidateService,
    @Inject('FwConfig') private config: FwConfig) {
    this.dataArrayProperty = this.config.resultArrayProp;
    this.omniSearchProperty = this.config.omniSearchProp;
    this.nameProperty = this.config.defaultNameProperty;
    this.idProperty = this.config.defaultIdProperty;
  }

  onSelect(value: any) {
    let valueToEmit;

    if (!_.isNil(value)) {
      if (this.onSelectEmmit == 'object') {
        valueToEmit = value;
        if (!!this.mapAs) {
          valueToEmit._mapAs = this.mapAs;
        }
      } else if (typeof this.onSelectEmmit === 'string') {
        valueToEmit = value[this.onSelectEmmit.toString()];
      }
    }
    if (this.onSelectEmmit instanceof Function) {
      valueToEmit = this.onSelectEmmit(value);
    }
    this.value = valueToEmit;
    this.valueChange.emit(valueToEmit);
    this.onOptionSelect.emit({ name: 'select', value: valueToEmit })
    this.notifyParents();
  }

  private clearSelectionAndPromise() {
    this.clearSelection();
    return this.getEmptyPromise();
  }
  private clearSelection() {
    this.value = null;
    this.valueChange.emit(null);
  }

  onParentEvent(evt: any) {
    if (_.isNil(evt)) {
      return;
    }
    const ctrlValue = this.control.value;
    const clearInput = this.clearIncompleteInpuOnParentEvent &&
      !_.isNil(ctrlValue) &&
      _.isNil(ctrlValue.id)
    _.isString(ctrlValue);
    if (evt.name === 'clear' || clearInput) {
      this.value = null;
      this.control.reset();
    }

    if (evt.name === 'select' && !_.isNil(this.zipControls)) {
      if (!_.isNil(evt.value)) {
        this.fetchLocalMatches();
      }
      else {
        this.localMatches = [];
      }
    }
  }

  private trySubscribeTo(object: any) {
    if (object.subject && object.subject instanceof Subject) {
      this.subscribe(<Subject<any>>object.subject);
    } else if (object instanceof Subject) {
      this.subscribe(<Subject<any>>object);
    } else if (object instanceof Array) {
      (<Array<any>>object).forEach(item => this.trySubscribeTo(item));
    }
  }

  private subscribe(subject: Subject<any>) {
    const sb = subject.subscribe(
      evt => this.onParentEvent(evt)
    );
    this.subcriptions.push(sb);
  }

  ngOnInit() {
    if (!!this.subscribeTo) {
      this.trySubscribeTo(this.subscribeTo);
    }

    if (_.isNil(this.config)) {
      this.control = new FormControl();
    }
    const empty = { [this.dataArrayProperty]: [] };
    this.matches = this.control.valueChanges
      .pipe(
        filter(value => _.isString(value)),
        // startWith(''),
        debounceTime(250),
        distinctUntilChanged(),
        tap(() => this.isLoading = true),
        switchMap(value =>
          !this.filter(value)
            ? this.clearSelectionAndPromise()
            : this.fetch(value).pipe(
              catchError((error) => from(Promise.resolve(empty))),
              finalize(() => this.isLoading = false)
            )
        ),
        map(array => array[this.dataArrayProperty]),
        map(array => {
          if (_.isArray(array) && !_.isNil(this.mapperFn)) {
            return _(array)
              .map((item) =>
                this.mapperFn(item, { dftIdProp: this.idProperty, dftDescProp: this.nameProperty })
              )
              .value();
          } else {
            return array;
          }
        }),

      );

  }

  isRequired() {
    if (!this.control.validator) {
      return false;
    }

    const validator = this.control.validator({} as AbstractControl);
    return (validator && validator.required);
  }

  private notifyParents() {
    if (this.subscribeTo) {
      if (this.subscribeTo instanceof Array) {
        _(this.subscribeTo).each((a) => {
          if (a.update) {
            a.update();
          }
        })
      } else {
        if (this.subscribeTo.update) {
          this.subscribeTo.update();
        }
      }
    }
  }

  private filter(value) {
    if (this.localMatches.length > 0) {
      return true;
    }
    return !!value && value.length >= this.minLengthFetch;
  }

  private fetch(value) {
    if (this.localMatches.length > 0) {
      return of(this.localMatches);
    }
    else if (value) {
      const empty = { [this.dataArrayProperty]: [] };
      return from(
        this.fwService.search(this.path,
          this.createSearchParams(value),
          new Pageable(0, 10),
          { intercept: false, apiEndpoint: this.apiEndpoint }
        )
      ).pipe(
        switchMap((arrayPage: ArrayPage<any>) =>
          _.isEmpty(arrayPage.content)
            ? (
              this.retryWhenEmpty
                ? this.fetch('%%%').pipe(catchError((error) => from(Promise.resolve(empty))))
                : this.clearSelectionAndPromise()
            )
            : of(arrayPage)
        )
      );
    } else {
      return from(this.getEmptyPromise())
    }
  }

  private fetchLocalMatches() {
    this.localMatches = [];
    this.fwService.search(this.path, this.createSearchParams(null), new Pageable(0, 10))
      .pipe(map(a => a[this.dataArrayProperty]))
      .subscribe(result => {
        this.localMatches = result;
      });
  }

  canFetch(value) {
    return !this.validateInput || (!_.isNil(value) && value.length >= this.minLengthFetch)
  }

  isEnabled() {
    return !this.disabled;
  }

  isShowPanel() {
    return this.localMatches
  }

  displayField(line: any) {
    return this.displayFn(line, { showId: this.showIdProperty, idProp: this.idProperty, nameProp: this.nameProperty });
  }

  renderOption(line: any) {
    return this.matchesDisplayFn(line, { showId: this.showIdProperty, idProp: this.idProperty, nameProp: this.nameProperty });
  }

  private getEmptyPromise() {
    let empty = {};
    empty[this.dataArrayProperty] = [];
    this.onSelect(null);
    return Promise.resolve(empty);
  }

  private createSearchParams(value) {
    let params = {};
    if (!_.isNil(value)) {
      params[this.omniSearchProperty] = value;
    }
    if (this.zipControls) {
      _.mapKeys(this.zipControls, (control, key) => {
        if (control) {
          let val = control.value || control;
          if (_.isPlainObject(val) && !_.isNil(val)) {
            val = val['id'];
          }
          params[key] = val;
        }
      });
    }
    return params;
  }
}

function tryDisplayName(line: any, options: any): string {

  if (!line) {
    return null;
  }

  const name = line[options.nameProp];
  if (!_.isNil(options.idProp) && options.showId) {
    const id = line[options.idProp];
    return `${id} - ${name}`;
  } else if (_.isEmpty(name) && !_.isNil(line[options.idProp])) {

    return 'Sem descrição - id ' + line[options.idProp];

  } else {
    return name;
  }
}
