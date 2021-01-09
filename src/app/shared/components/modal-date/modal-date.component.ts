import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCalendar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ModalDateMV } from '../../interfaces/modal-date.model';
import { Util } from '../../util/utils';

@Component({
  selector: 'app-modal-date',
  templateUrl: './modal-date.component.html',
  styleUrls: ['./modal-date.component.scss']
})
export class ModalDateComponent implements OnInit {
  @ViewChild('calendarioDataInicio') calendarioDataInicio: MatCalendar<Moment>;
  @ViewChild('calendarioDataFim') calendarioDataFim: MatCalendar<Moment>;

  @Input() params: ModalDateMV;

  form: FormGroup;

  selectedDataInicio = null;
  selectedDataFim = null;

  datePattern = 'DD/MM/YYYY';
  now = new Date().toISOString();

  maxDate: any;
  minDate: any;

  constructor(
    private snackBarService: SnackBarService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    moment.locale('pt-BR');

    this.createform();
  }

  createform() {
    this.form = new FormGroup({
      dataInicio: new FormControl('', Validators.compose([Validators.required])),
      dataFim: new FormControl()
    });

    this.maxDate = new Date().toISOString();

    if (this.params && this.params.minDate) {
      this.minDate = new Date(this.params.minDate).toISOString();
    }
  }

  dateChanged(date: any, field: string, isString?: boolean): void {
    if (isString && date.target.value.length < 10) {
      return;
    }

    if (isString) {
      if (!this.validarDateInput(date.target.value)) {
        this.snackBarService.open(this.translateService.instant('PORTAL.MSG_DATA_INVALIDA'), 3500, 'X');
        this.form.get(field).setValue('');
        return;
      }
      date = moment(date.target.value, this.datePattern).toDate();
    }

    if (field === 'dataInicio') {
      if (this.params.minDate && moment(moment(date)).isBefore(moment(this.params.minDate))) {
        const mensagem = this.translateService.instant('PORTAL.DATA_INICIO_INFERIOR_QUE');

        this.snackBarService.open(mensagem.replace('{1}', Util.formataData(new Date(this.params.minDate).getTime(), 'DD/MM/YYYY')), 3500, 'X');
        const minDate: any = moment(new Date(this.params.minDate), this.datePattern).toDate();

        this.calendarioDataInicio.selected = minDate;
        this.calendarioDataInicio.activeDate = minDate;

        this.form.get(field).setValue(minDate.toLocaleDateString('pt-BR'));
        return;
      }
      this.calendarioDataInicio.selected = date;
      this.calendarioDataInicio.activeDate = date;
      this.form.get('dataInicio').setValue(date.toLocaleDateString('pt-BR'));
    } else {
      this.maxDate = date;
      this.calendarioDataFim.selected = date;
      this.calendarioDataFim.activeDate = date;
      this.form.get('dataFim').setValue(date.toLocaleDateString('pt-BR'));
    }

    if (!this.validarPeriodo()) {
      this.snackBarService.open(this.translateService.instant('PORTAL.DATA_INICIO_MAIOR_FIM'), 3500, 'X');
      this.calendarioDataInicio.activeDate = null;
      this.form.get(field).setValue('');
      this.form.get(field).setErrors(null);
      return;
    }
  }

  enviar(): void {
    if (!this.form.valid) {
      this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }

    if (!this.validarPeriodo()) {
      this.snackBarService.open(this.translateService.instant('PORTAL.DATA_INICIO_MAIOR_FIM'), 3500, 'X');
      return;
    }

    if (this.calendarioDataInicio.selected) {
      this.params.campoDataInicio.setValue(this.calendarioDataInicio.selected);
    }

    if (this.calendarioDataFim.selected) {
      this.params.campoDataFim.setValue(this.calendarioDataFim.selected);
    } else {
      this.form.get('dataFim').setValue(Util.formataData(new Date().getTime(), this.datePattern));
    }

    const dataInicio = new Date(this.params.campoDataInicio.value).getTime();
    const dataFim = this.params.campoDataFim.value ? new Date(this.params.campoDataFim.value).getTime() : new Date().getTime();

    this.params.campoPeriodo.setValue(
      `${Util.formataData(dataInicio, 'DD/MM/YYYY')} - ${Util.formataData(dataFim, 'DD/MM/YYYY')}`
    );

    this.params.matMenu['closed'].emit('click');
  }

  validarDateInput(textDate: string): boolean {
    if (textDate && !moment(textDate, this.datePattern).isValid()) {
      return false;
    }

    return true;
  }

  validarPeriodo(): boolean {
    if (
      this.form.get('dataFim').value &&
      moment(this.form.get('dataInicio').value, this.datePattern).isAfter(moment(this.form.get('dataFim').value, this.datePattern))
    ) {
      return false;
    }
    if (
      !this.form.get('dataFim').value &&
      moment(this.form.get('dataInicio').value, this.datePattern).isAfter(moment(moment(), this.datePattern))
    ) {
      return false;
    }

    return true;
  }

  getMaxDataInicio(): string {
    if (this.form.get('dataFim').value) {
      return moment(this.form.get('dataFim').value, this.datePattern).toISOString();
    }
    return Util.addDaysInDate(1, new Date());
  }

  limparForm(): void {
    this.form.reset();
    this.form.setErrors(null);
    this.form.markAsPristine();

    this.selectedDataInicio = null;
    this.selectedDataFim = null;
  }

}
