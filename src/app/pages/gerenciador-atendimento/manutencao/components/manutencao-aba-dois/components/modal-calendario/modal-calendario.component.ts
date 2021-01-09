import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AtendimentoStorageService } from 'src/app/core/services/atendimento-storage.service';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { FornecedorService } from 'src/app/core/services/fornecedores.service';
import { ReloadListasService } from 'src/app/core/services/reload-listas.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { Util } from '../../../../../../../shared/util/utils';

@Component({
  selector: 'app-modal-calendario',
  templateUrl: './modal-calendario.component.html',
  styleUrls: ['./modal-calendario.component.scss']
})
export class ModalCalendarioComponent implements OnInit {

  datas: Array<any>;

  minDate: Date;
  maxDate: Date;

  veiculo: any;

  formDataMarcacao: FormGroup;
  isRevisao: any;
  showCalendario: boolean;

  now = new Date().toISOString();

  constructor(
    public fornecedorService: FornecedorService,
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private dadosModalService: DadosModalService,
    private userContextService: UserContextService
  ) { }

  ngOnInit() {
    const _this = this;
    moment.locale('pt-BR');

    _this.veiculo = _this.dadosModalService.get()['veiculo'];
    _this.isRevisao = _this.dadosModalService.get()['isRevisao'];

    _this.criaForm();

    ReloadListasService.get('preencherCalendario').subscribe(data => {
      _this.datas = [];
      _this.showCalendario = false;
      AtendimentoStorageService.calendarioFornecedor.forEach(item => {
        const date = moment(new Date((item.data))).format('DD/MM/YYYY');
        _this.datas.push(date);
      });
      _this.getRangeDates();
      setTimeout(() => {
        _this.showCalendario = true;
      }, 100);
    });
  }

  criaForm(): void {
    this.formDataMarcacao = new FormGroup({
      dataEventoTimestamp: new FormControl(''),
      dataEvento: new FormControl(''),
      horarioPreferencia: new FormControl('', Validators.required)
    });

  }

  getRangeDates(): void {
    if (AtendimentoStorageService.calendarioFornecedor.length > 0) {
      this.minDate = AtendimentoStorageService.calendarioFornecedor[0].data;
      this.maxDate = AtendimentoStorageService.calendarioFornecedor[AtendimentoStorageService.calendarioFornecedor.length - 1].data;
    }
  }

  converterData(date) {
    date = date.toISOString().split('-');
    date[2] = date[2].includes('T') ? date[2].split('T')[0] : date[2];
    return new Date(date[0], (+date[1] - 1), date[2]);
  }

  validarDataSelecionada(event: any, validarHora: boolean, alertarRiscoNaoAtendimento): boolean {

    let date = event.start || event.date || event.target.value;

    if (!date) {
      return;
    }

    date = this.converterData(date) as any;
    let dataSelecionada = date ? date.setHours(0, 0, 0, 0) : 0;

    if (!this.formDataMarcacao.get('horarioPreferencia').value) {
      if (this.veiculo.servicoLevaTraz === 'S') {
        this.formDataMarcacao.get('horarioPreferencia').setValue('10:00');
      } else {
        this.formDataMarcacao.get('horarioPreferencia').setValue('08:00');
      }
    }

    let time = this.formDataMarcacao.get('horarioPreferencia').value || '';
    if (time.length === 4) {
      time = time.substring(0, 2) + ':' + time.substring(2, 4);
    }

    if (!AtendimentoStorageService.fornecedor) {
      this.snackBar.open(this.translate.instant('PORTAL.ATENDIMENTO.MESSAGES.FORNECEDOR_NAO_SELECIONADO'), 7000, 'X');
      return false;
    }

    if (dataSelecionada > 0 && validarHora) {
      const dateTime = new Date(dataSelecionada);
      dataSelecionada = moment(dateTime)
        .hours(time.split(':')[0])
        .minutes(time.split(':')[1])
        .seconds(0)
        .milliseconds(0)
        .toDate().getTime();
    }

    let hoje = new Date() as any;
    if (validarHora) {
      hoje = hoje.setSeconds(0, 0);
    } else {
      hoje = hoje.setHours(0, 0, 0, 0);
    }

    if (dataSelecionada < hoje) {
      this.snackBar.open(this.translate.instant('PORTAL.CALENDARIO.MESSAGES.DATA_RETROATIVA'), 3500, 'X');
      this.formDataMarcacao.get('dataEvento').setValue(null);
      this.formDataMarcacao.get('horarioPreferencia').setValue(null);
      return false;
    }

    if (date.getDay() === 0 || date.getDay() === 6) {
      const message = this.translate.instant('PORTAL.MANUTENCAO.MESSAGE.DIA_UTIL');
      this.snackBar.open(this.translate.instant(message.replace('{0}', Util.formataData(date))), 3500, 'X');
      this.formDataMarcacao.get('dataEvento').setValue(null);
      this.formDataMarcacao.get('horarioPreferencia').setValue(null);
      return false;
    }

    if (this.isRevisao && !this.isMinHorasDiferenca(date, 72)) {
      const message = this.translate.instant('PORTAL.MANUTENCAO.MESSAGE.ANTECEDENCIA_72_HORAS');
      this.snackBar.open(message, 7000, 'X');
      this.formDataMarcacao.get('dataEvento').setValue(null);
      this.formDataMarcacao.get('horarioPreferencia').setValue(null);
      return false;
    }

    if (alertarRiscoNaoAtendimento && !this.datas.includes(moment(date).format('DD/MM/YYYY'))) {
      this.snackBar.open(this.translate.instant('PORTAL.CALENDARIO.MESSAGES.HORARIO_INVALIDO'), 10000, 'X');
    }

    return true;
  }

  preencherDatas(event: any): void {

    let date = event.start || event.date || event.target.value;

    if (!date) {
      return;
    }

    date = this.converterData(date);

    this.formDataMarcacao.get('dataEvento').setValue(moment(date).format('DD/MM/YYYY'));
    this.formDataMarcacao.get('dataEventoTimestamp').setValue(date.getTime());
  }

  dadosDia(event: any): void {
    if (this.validarDataSelecionada(event, false, true)) {
      this.preencherDatas(event);
    }
  }

  dadosEvento(event: any): void {
    if (this.validarDataSelecionada(event, false, true)) {
      this.preencherDatas(event);
    }
  }

  confirmarAgendamento(): void {

    if (!this.formDataMarcacao.valid || !this.formDataMarcacao.get('dataEventoTimestamp').value) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }

    if (!AtendimentoStorageService.fornecedor) {
      this.snackBar.open(this.translate.instant('PORTAL.ATENDIMENTO.MESSAGES.FORNECEDOR_NAO_SELECIONADO'), 3500, 'X');
      this.formDataMarcacao.get('dataEvento').setValue('');
      this.formDataMarcacao.get('horarioPreferencia').setValue('');
      return;
    }

    const dataPrevisaoParada = moment(
      this.formDataMarcacao.get('dataEventoTimestamp').value
    ).hours(
      this.formDataMarcacao.get('horarioPreferencia').value.substring(0, 2)
    ).minutes(this.formDataMarcacao.get('horarioPreferencia').value.substring(2, 4));

    if (!this.validarDataSelecionada({ date: dataPrevisaoParada }, true, false)) {
      return;
    }

    const fornecedor = AtendimentoStorageService.fornecedor;
    const dataPrevisaoEntrega = moment(dataPrevisaoParada).add(fornecedor.diasTrabalhados, 'days');

    fornecedor['dataPrevisaoParada'] = dataPrevisaoParada.toDate();
    fornecedor['dataPrevisaoEntrega'] = dataPrevisaoEntrega.toDate();

    AtendimentoStorageService.fornecedorSelecionado = {
      fornecedor: fornecedor,
      dataPrevisaoEntrega: dataPrevisaoEntrega,
      dataPrevisaoParada: dataPrevisaoParada
    };

    setTimeout(() => {
      ReloadListasService.get('closeCalendar').emit();
    });
  }

  changeHora(event: any): void {
    if (event.target.value && event.target.value.length === 5) {
      let horaSinistro = event.target.value;
      horaSinistro = horaSinistro.split(':');
      if (this.veiculo.servicoLevaTraz === 'S') {
        if (+horaSinistro[0] < 10 || (+horaSinistro[0] > 17 || (+horaSinistro[0] >= 17 && +horaSinistro[1] > 0))) {
          this.formDataMarcacao.get('horarioPreferencia').setValue(null);
          this.snackBar.open(this.translate.instant('PORTAL.MSG_HORA_INVALIDA'), 3500, 'X');
        }
      } else {
        if (+horaSinistro[0] < 8 || (+horaSinistro[0] > 18 || (+horaSinistro[0] >= 18 && +horaSinistro[1] > 0))) {
          this.formDataMarcacao.get('horarioPreferencia').setValue(null);
          this.snackBar.open(this.translate.instant('PORTAL.MSG_HORA_INVALIDA'), 3500, 'X');
        }
      }

      this.formDataMarcacao.get('horarioPreferencia').setErrors(null);
      this.formDataMarcacao.get('horarioPreferencia').updateValueAndValidity();
    } else if (event.type === 'change') {
      this.formDataMarcacao.get('horarioPreferencia').setValue(null);
      this.snackBar.open(this.translate.instant('PORTAL.MSG_HORA_INVALIDA'), 3500, 'X');
    }
  }

  isMinHorasDiferenca(data: any, minDiff: number) {
    data = data.getTime();
    const now = new Date().getTime();
    if ((data - now) / (60 * 60 * 1000) < minDiff) {
      return false;
    }

    return true;
  }

  getCalendario() {
    return AtendimentoStorageService.calendarioFornecedor;
  }

}
