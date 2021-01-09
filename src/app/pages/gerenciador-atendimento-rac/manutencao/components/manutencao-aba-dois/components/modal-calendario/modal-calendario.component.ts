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
  selector: 'app-modal-rac-calendario',
  templateUrl: './modal-calendario.component.html',
  styleUrls: ['./modal-calendario.component.scss']
})
export class ModalCalendarioRacComponent implements OnInit {

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
        const date = moment(new Date(Util.removerTimezone(item.data))).format('DD/MM/YYYY');
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

    if (this.isRac()) {
      this.formDataMarcacao.get('dataEvento').setValue(this.now);
      this.formDataMarcacao.get('dataEventoTimestamp').setValue(new Date(this.now).getTime());
    }
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

    return true;
  }

  preencherDatas(event: any): void {

    let date = event.start || event.date || event.target.value;

    if (!date) {
      return;
    }

    date = this.converterData(date);

    if (!this.isRac()) {
      this.formDataMarcacao.get('dataEvento').setValue(moment(date).format('DD/MM/YYYY'));
    } else {
      this.formDataMarcacao.get('dataEvento').setValue(date.toISOString());
    }

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

    this.formDataMarcacao.get('dataEvento').setValue(this.now);
    this.formDataMarcacao.get('dataEventoTimestamp').setValue(new Date(this.now).getTime());
    /*
        const dataPrevisaoEntrega1 = this.formDataMarcacao.get('dataEvento').value;
        let horarioPreferencia;
        if (dataPrevisaoEntrega1) {
          horarioPreferencia = dataPrevisaoEntrega1.toTimeString();
          horarioPreferencia = Util.removerSegundos(horarioPreferencia);
        }
        */

    const d = new Date();
    const horaAtual = d.getHours() + ':' + d.getMinutes();
    this.formDataMarcacao.get('horarioPreferencia').setValue(horaAtual);

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
      new Date(this.now).getHours()
    ).minutes(new Date(this.now).getMinutes());

    if (!this.validarDataSelecionada({ date: dataPrevisaoParada }, true, false)) {
      return;
    }

    //const teste2 = this.getTimestamp();

    // const testeMichel = moment(this.formDataMarcacao.get('dataEventoTimestamp').value, 'America/Sao_Paulo');

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
      //AtendimentoStorageService.functionSalvar();
    });
  }

  /*
  getTimestamp(): any {

    const dateObj = new Date(this.now);

    let date = dateObj.getDate();
    let month = dateObj.getMonth() + 1; // 0 a 11
    let year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    let seconds = dateObj.getSeconds();

    if (date < 10) {
      date = `0${date}`;
    }
    if (month < 10) month = `0${month}`;
    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;
    if (seconds < 10) seconds = `0${seconds}`;

    const dateFormat = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

    // return moment.
    return moment2.tz(dateFormat, 'America/Sao_Paulo').valueOf();

  }
  */


  changeHora(event: any): void {
    if (event.target.value && event.target.value.length === 5) {
      let horaSinistro = event.target.value;
      horaSinistro = horaSinistro.split(':');
      if (!this.isRac() && this.veiculo.servicoLevaTraz) {
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

  isRac(): boolean {
    return true;
    //return !!this.getRac();
  }

  getRac(): any {

    let tokenRac = this.userContextService.getTokenRac();
    if (tokenRac) {
      tokenRac = JSON.parse(tokenRac);
    }

    return tokenRac;
  }

}
