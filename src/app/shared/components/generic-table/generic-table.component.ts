import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material';
import { ReplaySubject } from 'rxjs';

import { ColunasTabelaMV } from '../../interfaces/colunas-tabela.model';
import { GenericButtonMV } from '../../interfaces/generic-button.model';
import { IconesMV } from '../../interfaces/icones.model';
import { Util } from '../../util/utils';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss']
})
export class GenericTableComponent implements OnInit, OnDestroy {
  @Input() genericIcons: IconesMV[];
  @Input() inputData: any;
  @Input() inputDataSubject: ReplaySubject<any>;
  @Input() columns: ColunasTabelaMV[];
  @Input() genericButtons: GenericButtonMV[];
  @Input() totalRows: number;
  @Input() infoMessage: string;
  @Input() hidePaginator: boolean;

  @Output() sortMethod = new EventEmitter<any>();
  @Output() nextPage = new EventEmitter<any>();

  @ViewChild('genericTable') genericTable: MatTable<any>;

  public pageEvent: any;
  public displayedColumns: any;

  public hasValues: boolean;
  public showTable = true;

  public pageIndex = 0;
  public totalRowsPage = 20;

  public columnsToDisplay: string[];

  public toggleValues: any[] = [];

  constructor() { }

  ngOnInit() {
    this.displayedColumns = this.columns.map(x => x.columnDef);
    this.columnsToDisplay = this.displayedColumns.map(x => x);

    if (this.inputData) {
      this.hasValues = this.inputData.length > 0;
    }

    this.inputData = new MatTableDataSource(this.inputData);

    if (this.inputData.data && this.inputData.data.length > 0) {
      this.totalRowsPage = this.inputData.data.length;
    } else {
      this.inputData.data = [];
    }
  }

  getLabel(icone?: any): string {
    if (icone) {
      if (icone.info) {
        return this.infoMessage;
      }
      if (typeof icone.show === 'boolean' && !icone.show) {
        return 'Ação indisponível';
      }
      if (icone.label) {
        return icone.label;
      }
    }
  }

  loadMoreData(event: any): void {
    this.inputData = [];

    this.pageIndex = event.pageIndex;

    event.pageIndex++;

    this.nextPage.emit(event.pageIndex);
  }

  formataData(date: string | number, formato: string): string {
    if (!date) {
      return '-';
    }

    return Util.formataData(date, formato);
  }

  formataPlaca(placa: string): string {
    if (!placa) {
      return '-';
    }

    return placa;
  }

  formataTelefone(telefone: string): string {
    if (!telefone) {
      return '-';
    }

    return Util.formataTelefone(telefone);
  }

  getYesNo(bool: boolean): string {
    if (bool) {
      return 'Sim';
    }

    return 'Não';
  }

  formataInfoMensagem(mensagem: string): string {
    return mensagem;
  }

  formataDocumento(documento: string): string {
    if (!documento) {
      return '-';
    }

    return Util.formataDocumento(documento);
  }

  commonColumn(column: ColunasTabelaMV, rowValue?: any): boolean {
    if (!column.telefone &&
      !column.placa &&
      !column.date &&
      !column.documento &&
      !column.currency &&
      !column.boolean &&
      !column.datetime &&
      !column.time &&
      !column.toggle &&
      !column.checkbox &&
      !column.etapas &&
      !column.action
    ) {
      return true;
    }
    return false;
  }

  hasValue(): boolean {
    if (this.inputData || this.inputData.data) {
      return true;
    }
    return this.inputData.data.length > 0;
  }

  updateTable() {
    this.showTable = false;

    setTimeout(() => {
      this.inputDataSubject.subscribe((data) => {
        this.showTable = true;
        if (this.genericTable) {
          this.genericTable.dataSource = data;
          this.genericTable.renderRows();
        }
      });
    }, 1);
  }

  showToggle(event: any): void {
    const values = this.inputData.data || this.inputData;
    const idx = values.findIndex(val => val === event);

    if (idx !== -1) {
      values[idx].toggle = !values[idx].toggle;

      values[idx].icones = values[idx].icones.map(value => {
        value.show = !value.show;

        return value;
      });

      this.inputData = new MatTableDataSource(values);
    }
  }

  checkAllToggle(value: any): void {
    let values = this.inputData.data || this.inputData;

    values = values.map(val => {
      val['isAtivo'] = value;
      return val;
    });

    this.inputData = new MatTableDataSource(values);
  }

  ngOnDestroy(): void {
    if (this.inputDataSubject) {
      this.inputDataSubject.unsubscribe();
    }
    if (this.inputData) {
      this.inputData = [];
    }
  }
}
