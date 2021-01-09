import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FwSearchService } from './fw-search.service';
import { Pageable, ArrayPage, Sort, Order, Direction} from '../../../util/pageable';
import * as _ from 'lodash';
import { MessageService } from 'src/app/shared/communication/message.service';
import { MatTableDataSource } from '@angular/material';
import { Subject } from 'rxjs';
import { FwController } from '../fw-controller';
import { Router } from '@angular/router';
import { SerializationService } from '../util/serialization.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'fw-search',
  templateUrl: './fw-search.component.html',
  styleUrls : ['./fw-search.component.scss']
})
export class FwSearch implements OnInit, OnChanges, FwController{
    static DEFAULT_OPTIONS = {
        title : 'Search',
        searchOnLoad: true
    };

    subject : Subject<any> = new Subject();

    @Input()
    showHeader = false;

    @Input()
    showFilters = true;

    @Input()
    title = 'Search';
    
    @Input()
    options : any = FwSearch.DEFAULT_OPTIONS;

    @Input()
    filtersFn : Function;
    
    @Input() 
    path :string;

    @Input() 
    pageSize : number = 10;

    @Input()
    enableSelection : boolean = false;

    @Input()
    selectionCondition : (any) => boolean;

    @Input()
    idCol :string = 'id';

    @Input()
    cols :any[] = [
        { title :'Id', prop : 'id'},
        { title: 'Nome', prop: 'name'}
    ];

    @Input()
    addFields : string[];

    @Input()
    openRecordAction = 'edit';

    @Input()
    actions :any[] = [
        {
            title : 'Ações',
            subActions : [
                { title :'Editar', action : 'edit'},
                { title :'Remover', action : 'remove'}
            ]
        }
    ];

    @Input()
    formActions :any[];

    @Input()
    searchOnFilterChange = false;

    @Output()
    onClear = new EventEmitter<any>();

    @Output()
    onSearch = new EventEmitter<any>();

    @Output()
    onSelect = new EventEmitter<any>();

    @Output()
    onPage = new EventEmitter<any>();

    @Output()
    onAction = new EventEmitter<any>();

    @Input()
    displayClear = true;

    @Input()
    hasFilters = true;

    @Input()
    filtersExpanded = false;

    @Input()
    firstPage = 0;

    filters : any = {};
    lastFilters : any = {};
    pageable : Pageable;
    page : ArrayPage<any>; 
    currentPageTotal = 0;
    displayedColumns: string[] = [];
    isSortAsc = true;
    lastCol = null;
    dataSource = new MatTableDataSource<any>();
    selection : SelectionModel<any> = new SelectionModel(true);

    @Input()
    mapAsFiltersStrategy = 'replace';

    allSelected = false;
    
    constructor(
        private searchService: FwSearchService,
        private serializer : SerializationService,
        private messageService : MessageService,
        private router : Router) {
        this.pageable = new Pageable(this.firstPage, this.pageSize);
    }

    ngOnInit(): void {
        if (this.path == null) {
            throw new Error("Define a path.");
        }
        if (this.cols == null || this.cols.length == 0) {
            throw new Error("Columns not defined.");
        }
        this.options = _.merge({},FwSearch.DEFAULT_OPTIONS,this.options);
        this.makeColumns();
        this.pageable = new Pageable(this.firstPage, this.pageSize);
        if (this.props('searchOnLoad')===true) {
            this.search();
        }
        if (this.enableSelection) {
            this.selection.onChange.subscribe((selectionChange)=> {
                this.updatedSelectionView();
            });
        }
    }

    private updatedSelectionView() {
        const numSelected = _(this.dataSource.data).filter((item)=>this.selection.selected.includes(item)).size();
        const numRows = this.dataSource.data.length;
        
        this.allSelected = numSelected == numRows;
    }
    update() {
        this.onFilterChange({});
    }

    onFilterChange(val : any) {    
        Object.keys(this.filters).filter(key=>_.isNil(this.filters[key])).forEach(key => delete this.filters[key] );
        if(this.searchOnFilterChange && !_.isEqual(this.filters,this.lastFilters)) {
            this.lastFilters = _.clone(this.filters);
            // sessionStorage.setItem('lastFilters',JSON.stringify(this.lastFilters));
            this.search(true);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {}

    private makeColumns() {
        if (this.enableSelection) {
            this.displayedColumns = ['selection'];    
        }
        this.displayedColumns = this.displayedColumns.concat( 
            _(this.cols)
                .map(col=>col.prop)
                .union(
                    _(this.actions).map(col=>col.action).value()
                ).value()
        );
    }

    checkUncheckAll(current : boolean) {
        if (!this.enableSelection) {
            return;
        }
        if (!!this.dataSource.data) {
            this.dataSource.data.forEach(elem=> elem.checked = !current);
        }
    }

    checkSelectionCondition(element:any) {
        return !this.selectionCondition || this.selectionCondition(element);
    }

    startSelecting() {
        this.enableSelection =true;
        this.makeColumns();
    }

    selectItem(element:any) {
        this.selection.toggle(element);
        // this.onSelect.emit({selected:_.clone(this.selection.selected)});
    }

    selectAllById(ids:any[]) {
        if (_.isEmpty(ids)) {
            return;
        }
        _(this.dataSource.data).each((item)=> {
            if(ids.includes(item[this.idCol])) {
                this.selection.select(item);
            }
        });
    }

    filter(name, value) {
        this.filters[name] = value;
    }

    props(name: string) : any {
        if (!this.options || !this.options[name]) {
            return null;
        }
        return this.options[name];
    }

    private updateDatasource(page: ArrayPage<any>) {
        this.dataSource.data = page.content;
        this.currentPageTotal = this.dataSource.data.length;
        this.updatedSelectionView();
    }

    search(resetPage=true) {
        const params = this.serializer.serialize(_.clone(this.filters));
        if (this.filtersFn) {
            this.filtersFn(params);
        }
        params.fields =_(this.cols)
            .map(col=>col.prop)
            .union([this.idCol])
            .union(this.addFields || [])
            .join(',');
        Object.keys(params).forEach(key => {
            if (params[key] === undefined || params[key] == null) { 
                delete params[key];
            }
            else if (typeof params[key] == 'object' && params[key]['_mapAs']) {
                const mapAs = <string>params[key]['_mapAs'];
                if (mapAs.length < 1) {
                    throw new Error('Property mapAs empty!');
                }
                let val;
                if (_.isUndefined(params[key]) )  {
                    val = null;
                } else if (_.isArray(params[key])) {
                    val = _(params[key]).map(mapAs).value();
                } else {
                    val = _.isUndefined(params[key][mapAs])? null : params[key][mapAs];
                }
                if (this.mapAsFiltersStrategy == 'concat') {
                    const cc = mapAs.length === 1 ? mapAs.toUpperCase() : mapAs.substring(0,1).toUpperCase() + mapAs.substring(1);
                    params[key + cc] = val;
                    delete params[key];
                } else {
                    params[key] = val;
                }
            }
        });
        if (resetPage) {
            this.pageable.page = this.firstPage;
        }
        this.searchService.search(this.path, params, this.pageable)
            .subscribe(
                (page)=> {
                    this.page = page;
                    this.updateDatasource(page);
                    this.subject.next({name:'search'});
                },
                (error)=> {
                    this.messageService.dealWithError(error);
                }
            );
    }

    clear() {
        this.onClear.emit({
            previousFilters: _.clone(this.filters)
        });
        this.subject.next({name:'clear'});
        Object.keys(this.filters).forEach(key => delete this.filters[key]);
        this.update();
    }

    sort(col){
        if (this.lastCol === col) {
            this.isSortAsc = !this.isSortAsc;
        }
        this.pageable.sort = new Sort([new Order(col,this.isSortAsc?Direction.asc : Direction.desc)]);
        this.lastCol = col;
        this.search(false);
        this.onPage.emit({});
    }

    onPageEvent(event : any) {
        this.pageable.page = event.pageIndex;
        this.search(false);
        this.onPage.emit(event);
    }

    execute(action : any, line : any, index : number) {
        const id = line[this.idCol];
        if (action.command) {
            if (action.command.name ==='routeWithId' && !!action.command.params && !!action.command.params.route) {
                this.router.navigate([action.command.params.route + id]);
            }
            if (action.command.name ==='searchAndDelete') {
                this.searchService.removeAfterSearch(this.path, id)
                    .subscribe(
                        ()=> this.search()
                    );
            }
        }
        this.onAction.emit({ action: action, id : id, index : index, line :  line});
    }

    getAvailableCols() {
        return _(this.cols).filter(col => !col.customTemplate).value();
    }

    isActive(action, line) {
        return !action.condition || (typeof action.condition == 'function' && action.condition(line));
    }

    getActions(line) {
        return _(this.actions)
        .filter(action=> !action.condition || (typeof action.condition == 'function' && action.condition(line)) )
        .value();
    }

    getSubActions(action : any, line : any) {
        return _(action.subActions)
        .filter(sub=> !sub.condition || (typeof sub.condition == 'function' && sub.condition(line)) )
        .value();
    }
 
    renderColTitle(col :any , type : string = 'col') : string {
        if (!col) {
            throw new Error(`Column ${type} not defined : ${col}`);
        }
        if (type === 'col') {
            const name = col.title || col.prop || '?';
            if (!_.isNil(col.sort) && this.lastCol === col.prop) {
                return name + ' ' + (this.isSortAsc ? '▲' : '▼');
            } else {
                return name;
            }            
        } else {
            return col.title;
        }
    }

    renderColTitleClass(col: any, type : string = 'col') {
        if (!col) {
            throw new Error(`Column ${type} not defined : ${col}`);
        }
        return col.ngClass || '';
    }

    renderColValue(col : any, line : any, index:number, type : string = 'col') {
        if (_.isNil(col)) {
            throw new Error(`Column ${type} not defined : ${col}`);
        }
        if (_.isNil(line)) {
            return null;
        }
        if (type === 'col' ) {
            let val = !!col.prop ? _.get(line,col.prop) : line.toString();
            if (!!col.converter && col.converter instanceof Function) {
                val = col.converter(val, {line : line, index : index});
            }
            return val;
        } else if (col.actionByValue === true) {
            return this.renderColValue(col, line, index, 'col');
        } else if (!!col.icon && col.icon.iconOnly === true) {
            return null;
        } else {
            return col.title;
        }
    }

    renderColValueClass(col: any, type : string = 'col') : any {
        if (!col) {
            throw new Error(`Column ${type} not defined : ${col}`);
        }
        return col.ngClass || '';
    }

    renderActionIconClass(act : any) : any {
        if (!act) {
            throw new Error(`Action not defined : ${act}`);
        }
        if (!act.icon) {
            return null;
        }
        return act.icon.ngClass || '';
    }
    
    hasIcon(act: any) : boolean {
        return !!act && !!act.icon;
    }

    renderIconName(act: any) {
        if (!act) {
            throw new Error(`Action not defined : ${act}`);
        }
        if (!act.icon) {
            return null;
        }
        return act.icon.name;
    }

    isDiabled(act: any, line : any, index : number) : boolean {
        return !!act && (act.disabled === true || (!!act.checkDisabled && act.checkDisabled(act, line, index)===true ));
    }


    toggleFilters() {
        this.showFilters = !this.showFilters;
    }

    openRecord(row: any, i: number) {
        const action = _(this.actions).filter((action)=> action.action === this.openRecordAction).head();
        if (_.isNil(action)) {
            console.warn('Action not found for '+this.openRecordAction)
            return;
        }
        this.execute(action,row,i);
    }

    isAllSelected() {
        
       return this.allSelected;
    }
    
    masterToggle() {
        this.isAllSelected() ?
            this.dataSource.data 
                .forEach(row => this.selection.deselect(row)) :
            this.dataSource.data 
                .forEach(row => this.selection.select(row));
    }    
}