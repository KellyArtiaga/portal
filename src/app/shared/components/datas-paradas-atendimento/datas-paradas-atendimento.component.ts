import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { Util } from '../../util/utils';

@Component({
  selector: 'app-datas-paradas-atendimento',
  templateUrl: './datas-paradas-atendimento.component.html',
  styleUrls: ['./datas-paradas-atendimento.component.scss']
})
export class DatasParadasAtendimentoComponent implements OnInit {
  exibirFornecedores: boolean;

  @Input() veiculo: any;

  now: string;
  formDatas: FormGroup;

  constructor(
    private snackBar: SnackBarService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.criaForm();
    this.now = new Date().toISOString();
  }

  criaForm() {
    this.formDatas = new FormGroup({
      dataParadaUm: new FormControl('', [Validators.required]),
      horaParadaUm: new FormControl('', [Validators.required]),
      dataParadaDois: new FormControl('', [Validators.required]),
      horaParadaDois: new FormControl('', [Validators.required]),
      dataParadaTres: new FormControl('', [Validators.required]),
      horaParadaTres: new FormControl('', [Validators.required])
    });
  }

  changeDataParada(field: string) {
    let data = this.formDatas.get(field).value;
    data = data ? new Date(data) : null;

    if (data && (data.getDay() === 0 || data.getDay() === 6)) {
      const message = this.translate.instant('PORTAL.MANUTENCAO.MESSAGE.DIA_UTIL');
      this.formDatas.get(field).setValue(null);
      this.snackBar.open(this.translate.instant(message.replace('{0}', Util.formataData(data))), 3500, 'X');
      this.formDatas.get(field).setValue(null);
      return;
    }

    if (!this.isMinHorasDiferenca(data, 48)) {
      const message = this.translate.instant('PORTAL.MANUTENCAO.MESSAGE.ANTECEDENCIA_DOIS_DIAS');
      this.snackBar.open(message, 7000, 'X');
      this.formDatas.get(field).setValue(null);
      return;
    }

    if (this.isDataParadaRepetida(field)) {
      const message = this.translate.instant('PORTAL.MANUTENCAO.MESSAGE.INFORMAR_DATAS_DISTINTAS');
      this.snackBar.open(message, 7000, 'X');
      this.formDatas.get(field).setValue(null);
    }
  }

  isDataParadaRepetida(field: string): boolean {
    const data = this.formDatas.get(field);
    const dataUm = this.formDatas.get('dataParadaUm');
    const dataDois = this.formDatas.get('dataParadaDois');
    const dataTres = this.formDatas.get('dataParadaTres');

    if (dataUm.value && data !== dataUm && data.value.toISOString() === dataUm.value.toISOString()) {
      return true;
    }

    if (dataDois.value && data !== dataDois && data.value.toISOString() === dataDois.value.toISOString()) {
      return true;
    }

    if (dataTres.value && data !== dataTres && data.value.toISOString() === dataTres.value.toISOString()) {
      return true;
    }

    return false;
  }

  isMinHorasDiferenca(data: any, minDiff: number) {
    data = data.getTime();
    const now = new Date().getTime();
    if ((data - now) / (60 * 60 * 1000) < minDiff) {
      return false;
    }

    return true;
  }

  changeHoraParada(event: any, field: string) {
    let hora = event.target.value;
    if (hora && hora.length === 5) {
      hora = hora.split(':');
      if (hora[0] > 23 || hora[1] > 59) {
        this.formDatas.get(field).setValue(null);
        this.snackBar.open(this.translate.instant('PORTAL.MSG_HORA_INVALIDA'), 7000, 'X');
        return;
      }

      if (this.veiculo && this.veiculo.servicoLevaTraz === 'S') {
        if (+hora[0] < 10 || (+hora[0] > 17 || (+hora[0] >= 17 && +hora[1] > 0))) {
          this.formDatas.get(field).setValue(null);
          this.snackBar.open(this.translate.instant('PORTAL.MANUTENCAO.MESSAGE.HORARIO_ATENDIMENTO_LEVA_TRAZ'), 7000, 'X');
          return;
        }
      } else {
        if (+hora[0] < 8 || (+hora[0] > 18 || (+hora[0] >= 18 && +hora[1] > 0))) {
          this.formDatas.get(field).setValue(null);
          this.snackBar.open(this.translate.instant('PORTAL.MANUTENCAO.MESSAGE.HORARIO_ATENDIMENTO'), 7000, 'X');
          return;
        }
      }
    } else if (event.type === 'change') {
      this.formDatas.get(field).setValue(null);
    }
  }

}
