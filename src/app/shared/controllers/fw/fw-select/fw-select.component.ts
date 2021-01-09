import { AfterViewInit, Component, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import * as _ from 'lodash';
import { Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Pageable } from '../../../util/pageable';
import { FwSearchService } from '../fw-search/fw-search.service';
import { FwValidateService } from '../fw-validate/fw-validate.service';

@Component({
  selector: 'fw-select',
  template: `
    <mat-form-field [ngClass]="{'readonly-wrapper': readonly}" [appearance]="appearance" >
        <mat-label>{{getFullLabel()}}{{isRequired()?'*':''}}</mat-label>
        <mat-select  placeholder="{{getFullLabel()}}"
            [multiple]="multiple"
            [formControl]="control"
            [compareWith]="compareObjects">
            <mat-option *ngIf="enableAllOption" #allSelectedMatSelect (click)="toggleAllSelection()" [value]="allOptionValue">Todos(as)</mat-option>
            <mat-option *ngIf="enableAllOption" #noneSelectedMatSelect (click)="toggleNoneSelection()" [value]="noneOptionValue">Nenhum</mat-option>
            <hr *ngIf="enableAllOption">
            <mat-option *ngFor="let option of localMatches" [value]="option" (onSelectionChange)="onAnyValuedSelection(option, $event)">
                {{renderOption(option)}}
            </mat-option>
        </mat-select>
        <mat-error>{{validate.message(control)}}</mat-error>
        <mat-icon matPrefix *ngIf="showEmptyHint && searchEmpty === true">error_outline</mat-icon>
    </mat-form-field>
    `,
  styles: [
    `
            .readonly-wrapper {
                cursor: not-allowed;
                pointer-events: none;
            }
        `
  ]
})
export class FwSelectComponent implements AfterViewInit {

  @Input()
  multiple = false;

  @Input()
  apiEndpoint = null;

  @Input()
  appearance = 'outline';

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

  @Output()
  onLoad: EventEmitter<any> = new EventEmitter();


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
  zipControls: any;

  @Input()
  disabled = false;

  @Input()
  readonly = false;

  @Input()
  validateInput = true;

  @Input()
  minLengthFetch = 3;

  @Input()
  localMatches = [];

  searchEmpty: boolean;

  @Input()
  showEmptyHint: boolean = false;

  @Input()
  strategy: string = 'none';

  @Input()
  clearLocalIfZipped = true;

  @Input()
  mapperFn: (item: any, opts?: any) => any = null;

  @Input()
  enableAllOption = false;

  @Input()
  toggleAllByDefault = false;

  @ViewChild('allSelectedMatSelect')
  private allSelected: MatOption;

  @ViewChild('noneSelectedMatSelect')
  private noneSelected: MatOption;

  @Input()
  allOptionValue = { id: 0 };
  @Input()
  noneOptionValue = { id: -1 };

  lastValue = null;


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
  ngOnInit() {

    if (!!this.subscribeTo) {
      this.trySubscribeTo(this.subscribeTo);
    }

    if (_.isNil(this.zipControls)) {
      this.fetchLocalMatches();
    } else {
      this.fetchLocalMatches(true);
    }
    if (this.control.value) {
      this.onSelect(this.control.value);
    }
    this.control.valueChanges
      .subscribe((value) => {
        if (!_.eq(this.lastValue, value)) {
          this.lastValue = value;
          this.onSelect(value);
        }
      });

  }

  ngAfterViewInit(): void {

    if (this.enableAllOption && this.toggleAllByDefault) {
      this.allSelected.select();
      this.toggleAllSelection();
    }
  }

  onSelect(value: any) {
    let valueToEmit;


    if (this.onSelectEmmit == 'object') {
      valueToEmit = value;
      if (!!this.mapAs && !!valueToEmit) {
        valueToEmit._mapAs = this.mapAs;
      }
    } else if (typeof this.onSelectEmmit === 'string') {
      valueToEmit = value[this.onSelectEmmit.toString()];
    } else if (this.onSelectEmmit instanceof Function) {
      valueToEmit = this.onSelectEmmit(value);
    }


    this.valueChange.emit(valueToEmit);

    this.onOptionSelect.emit({ name: 'select', value: valueToEmit })

    this.notifyParents();
  }
  getFullLabel() {
    const sufix = this.showEmptyHint && this.searchEmpty === true ? ` (sem valores)` : ''

    return `${this.label}${sufix}`;
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

  compareObjects(o1: any, o2: any): boolean {
    if (_.isNil(o1) || _.isNil(o2)) {
      return false;
    }
    return o1.id === o2.id;
  }

  onParentEvent(evt: any) {
    if (_.isNil(evt)) {
      return;
    }
    if (!!evt && evt.name === 'clear') {
      this.value = null;
      this.control.reset();
      this.lastValue = null;
      if (!_.isNil(this.zipControls) && this.clearLocalIfZipped) {
        this.localMatches = [];
      }
    }

    if (evt.name === 'select' && !_.isNil(this.zipControls)) {
      if (!_.isNil(evt.value)) {
        this.fetchLocalMatches();
      }
      else {
        this.localMatches = [];
        this.control.setValue(null);
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





  private fetchLocalMatches(requireZipValues = false) {
    this.localMatches = [];
    try {
      this.fwService.search(
        this.path,
        this.createSearchParams(null, requireZipValues),
        new Pageable(0, 10),
        { apiEndpoint: this.apiEndpoint }
      )
        .pipe(
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
          })
        )
        .subscribe(result => this._loadAvaiableMatches(result));
    } catch (e) {
      this.localMatches = [];
      this.onLoad.emit({ eventName: 'matchesLoad', data: [] });
      this.control.setValue(null);
    }
  }

  private _loadAvaiableMatches(result) {
    this.localMatches = result;
    if (!!result && result.length > 0) {
      this.searchEmpty = false;
    } else {
      this.searchEmpty = true;
    }
    if (!_.isNil(this.control.value) && !_.isNil(this.control.value.id)) {
      const hasItem = !_.isNil(_(result).find((item) => item.id === this.control.value.id));
      if (!hasItem) {
        this.control.setValue(null);
      }
    }

    this.onLoad.emit({ eventName: 'matchesLoad', data: _.clone(this.localMatches) });
  }

  canFetch(value) {
    return !this.validateInput || (!_.isNil(value) && value.length >= this.minLengthFetch)
  }

  isEnabled() {
    return !this.disabled
    // && (
    //     !this.zipControls ||
    //     _(this.zipControls).mapValues((control : FormControl)=> !!control.value).reduce((a,b)=> a && b)
    // );
  }


  displayField(line: any) {
    return this.displayFn(line, { showId: this.showIdProperty, idProp: this.idProperty, nameProp: this.nameProperty });
  }

  renderOption(line: any) {
    const opts = { showId: this.showIdProperty, idProp: this.idProperty, nameProp: this.nameProperty };
    if (!_.isNil(this.matchesDisplayFn)) {
      return this.matchesDisplayFn(line, opts);
    }
    return tryDisplayName(line, opts);
  }

  private getEmptyPromise() {
    let empty = {};
    empty[this.dataArrayProperty] = [];
    return Promise.resolve(empty);
  }

  private createSearchParams(value, requireZipValues = false) {
    let params = {};
    if (!_.isNil(value)) {
      params[this.omniSearchProperty] = value;
    }
    if (this.zipControls) {
      _.mapKeys(this.zipControls, (control, key) => {
        if (!_.isNil(control)) {

          let val = null;
          if (control instanceof FormControl) {
            val = control.value;
          } else if (_.isPlainObject(control)) {
            val = control;
          }

          if (!!this.zipControls[key + 'Fn']) {
            val = this.zipControls[key + 'Fn'](val);
          } else if (!_.isNil(val) && !_.isUndefined(val.id)) {
            val = val['id'];
          } else if (this.strategy === 'requirePojoId') {
            throw new Error('');
          }
          params[key] = val;

          if (val == null && requireZipValues) {
            throw new Error('');
          }
        }
      });
    }
    return params;
  }

  isRequired() {
    if (!this.control.validator) {
      return false;
    }
    const validator = this.control.validator({} as AbstractControl);
    return (validator && validator.required);
  }

  tosslePerOne(all) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (!_.isNil(this.control.value) && this.control.value.length == this.localMatches.length) {
      this.allSelected.select();
    }
  }
  toggleAllSelection() {
    if (this.allSelected.selected) {
      const all = _.clone(this.localMatches);
      all.push(this.allOptionValue);
      this.control.patchValue([...all, 0]);
    } else {
      this.control.patchValue([]);
    }
  }
  toggleNoneSelection() {
    if (this.noneSelected.selected) {
      this.control.patchValue([this.noneOptionValue]);
    }
  }
  onAnyValuedSelection(value: any, event: any) {
    if (this.enableAllOption) {
      if (event.source.selected) {
        this.noneSelected.deselect();
      } else {
        this.allSelected.deselect();
      }
    }
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
