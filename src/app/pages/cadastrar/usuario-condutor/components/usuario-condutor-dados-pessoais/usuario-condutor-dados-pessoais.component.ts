import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { includes } from 'lodash';
import * as moment from 'moment';

import { BarraNavegacaoService } from '../../../../../core/services/barra-navegacao.service';
import { CondutorService } from '../../../../../core/services/condutor.service';
import { ReloadListasService } from '../../../../../core/services/reload-listas.service';
import { SnackBarService } from '../../../../../core/services/snack-bar.service';
import { Util } from '../../../../../shared/util/utils';

@Component({
  selector: 'app-usuario-condutor-dados-pessoais',
  templateUrl: './usuario-condutor-dados-pessoais.component.html',
  styleUrls: ['./usuario-condutor-dados-pessoais.component.scss']
})
export class UsuarioCondutorDadosPessoaisComponent implements OnInit {
  @Input() formValue: any;
  @ViewChild('cpfInput') cpfInput: ElementRef;

  isValidCPF = false;

  formDadosPessoais: FormGroup;

  maxDate = new Date();

  datePattern = 'DD/MM/YYYY';
  now = new Date().toISOString();

  constructor(
    private formBuilder: FormBuilder,
    private barraNavegacao: BarraNavegacaoService,
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private condutorService: CondutorService
  ) { }

  ngOnInit() {
    const _this = this;

    _this.criaForm();
    _this.barraNavegacao.get().canDeactivate = false;

    _this.formDadosPessoais.statusChanges.subscribe(value => {
      if (_this.barraNavegacao.get().aba !== 0) {
        return;
      }
      _this.barraNavegacao.get().canDeactivate = true;

      const formValid = value === 'VALID'
        && (_this.formDadosPessoais.get('cpf').value ? _this.formDadosPessoais.get('cpf').value.length === 11 : false);

      _this.barraNavegacao.navegar(formValid);
      if (_this.formDadosPessoais.valid && _this.isValidCPF) {
        _this.barraNavegacao.validar('dadosPessoais', true);
        _this.barraNavegacao.habilitar('prosseguir', true);
      }
    });

    ReloadListasService.get('dadosPessoais').subscribe(data => {
      Util.validateAllFormFields(_this.formDadosPessoais);
      if (!_this.formDadosPessoais.get('cpf').value) {
        return;
      }
      if (!Util.validarCPF(_this.getFormValue('cpf'))) {
        _this.formDadosPessoais.controls['cpf'].setErrors({ 'incorrect': true });
        _this.cpfInput.nativeElement.focus();
        _this.snackBar.open(_this.translate.instant('PORTAL.MSG_CPF_INVALIDO'), 3500, 'X');
        return;
      }
      _this.formDadosPessoais.get('cpf').enable();
      _this.barraNavegacao.concatUserData(_this.formDadosPessoais.value);
      if (_this.barraNavegacao.get().edicao) {
        _this.formDadosPessoais.get('cpf').disable();
      }
    });
    ReloadListasService.get('resetDadosPessoais').subscribe(data => {
      _this.formDadosPessoais.reset();
    });
  }

  applyDataMascara(value, field) {
    const date = value.split('');

    if (date.length >= 8 && !includes(date, '/')) {
      value = value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
      const newDate = moment(value, 'DD/MM/YYYY').toDate();
      this.formDadosPessoais.get(field).setValue(newDate);
    } else {
      this.formDadosPessoais.get(field).setValue(null);
    }
    if (date.length === 10) {
      const newDate = moment(value, 'DD/MM/YYYY').toDate();
      this.formDadosPessoais.get(field).setValue(newDate);
    }
    this.onChangeMethod(field);
  }

  onChangeMethod(field: any) {
    if (typeof field.onChangeMethod !== 'undefined') {
      field.onChangeMethod(this.formDadosPessoais);
    }
  }

  regexMethod(paramsObj) {
    this.regexLetras(paramsObj.value, paramsObj.type);
  }

  regexLetras(value, type) {
    if (/[a-zA-Z]/.test(value)) {
      this.formDadosPessoais.get(type).setValue(null);
    }
  }

  validarDateInput(textDate: string): boolean {
    if (!moment(textDate, this.datePattern).isValid()) {
      return false;
    }
    return true;
  }

  onPaste(field: string, event: ClipboardEvent): void {
    const pasteValue = event.clipboardData || window['clipboardData'];

    this.verificarInformacoesUsuario(field, pasteValue.getData('text').replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, ''));
  }

  verificarInformacoesUsuario(field: string, value: string): void {
    const obj = {};

    if (!value) {
      return;
    }
    if (field === 'cpf') {
      if (value.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, '').length < 11) {
        return;
      }

      this.validarCPF(value);

      value = value.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, '');
    }
    obj[field] = value;

    if (this.isValidCPF) {
      this.condutorService.get(obj).subscribe(res => {
        if (res.data && res.data.results.length > 0) {
          this.snackBar.open(this.translate.instant('PORTAL.MSG_USUARIO_JA_CADASTRADO'), 7000, 'X');

          this.formDadosPessoais.get(field).setValue(null);
        }
      }, res => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }
  }

  criaForm(): void {
    this.formDadosPessoais = this.formBuilder.group({
      codigo: ['', Validators.compose([])],
      status: ['', Validators.compose([])],
      nome: ['', Validators.compose([Validators.required])],
      dataNascimento: ['', Validators.compose([])],
      rg: ['', Validators.compose([])],
      orgaoEmissor: ['', Validators.compose([])],
      cpf: ['', Validators.compose([Validators.required])],
      nomeMae: ['', Validators.compose([])],
      nomePai: ['', Validators.compose([])]
    });

    if (this.formValue && this.formValue.dadosPessoais) {
      const dados = this.formValue.dadosPessoais;
      const cpf = dados.cpf ? dados.cpf.replace(/\s/g, '') : null;

      this.formDadosPessoais.get('codigo').setValue(dados.id);
      this.formDadosPessoais.get('status').setValue(dados.status === 'ATIVO');
      this.formDadosPessoais.get('nome').setValue(dados.nomeCondutor);
      this.formDadosPessoais.get('dataNascimento').setValue(dados.dataNascimento ? new Date(dados.dataNascimento) : null);
      this.formDadosPessoais.get('rg').setValue(dados.rg);
      this.formDadosPessoais.get('orgaoEmissor').setValue(dados.orgaoEmissor);
      this.formDadosPessoais.get('cpf').setValue(cpf);
      this.formDadosPessoais.get('nomeMae').setValue(dados.nomeMae);
      this.formDadosPessoais.get('nomePai').setValue(dados.nomePai);

      if (cpf) {
        this.isValidCPF = Util.validarCPF(cpf);
        if (!this.isValidCPF) {
          this.formDadosPessoais.controls['cpf'].setErrors({ 'incorrect': true });
          this.snackBar.open(this.translate.instant('PORTAL.MSG_CPF_INVALIDO'), 3500, 'X');
        } else {
          this.formDadosPessoais.get('cpf').disable();
        }
      }
      if (this.formDadosPessoais.valid && this.isValidCPF) {
        this.barraNavegacao.validar('dadosPessoais', true);
        this.barraNavegacao.habilitar('prosseguir', true);
      }

    } else {
      this.formDadosPessoais.get('status').setValue(true);
    }

    this.formDadosPessoais.get('codigo').disable();
  }

  isEdition(): boolean {
    return this.barraNavegacao.get().edicao;
  }

  validarCPF(str: string): void {
    if (!str) {
      return;
    }
    const cpf = Util.removeSpecialCharacters(str);
    if (cpf.length === 11) {
      if (!Util.validarCPF(cpf)) {
        this.formDadosPessoais.controls['cpf'].setErrors({ 'incorrect': true });
        this.snackBar.open(this.translate.instant('PORTAL.MSG_CPF_INVALIDO'), 3500, 'X');
        return;
      }
      this.isValidCPF = true;
      this.formDadosPessoais.controls['cpf'].setErrors(null);
    } else {
      this.formDadosPessoais.controls['cpf'].setErrors({ 'incorrect': true });
    }
  }

  getFormValue(val: string): any {
    return this.formDadosPessoais.get(val).value;
  }
}
