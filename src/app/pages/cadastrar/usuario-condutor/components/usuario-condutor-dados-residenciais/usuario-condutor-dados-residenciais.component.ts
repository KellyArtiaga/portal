import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { BarraNavegacaoService } from '../../../../../core/services/barra-navegacao.service';
import { ConsultaCepService } from '../../../../../core/services/consulta-cep.service';
import { ReloadListasService } from '../../../../../core/services/reload-listas.service';
import { SnackBarService } from '../../../../../core/services/snack-bar.service';
import { EnderecoMV } from '../../../../../shared/interfaces/endereco.model';
import { Util } from '../../../../../shared/util/utils';

@Component({
  selector: 'app-usuario-condutor-dados-residenciais',
  templateUrl: './usuario-condutor-dados-residenciais.component.html',
  styleUrls: ['./usuario-condutor-dados-residenciais.component.scss']
})
export class UsuarioCondutorDadosResidenciaisComponent implements OnInit {
  @Input() formValue: any;

  isValidCEP = false;

  formDadosResidenciais: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private barraNavegacao: BarraNavegacaoService,
    private snackBar: SnackBarService,
    private consultaCEP: ConsultaCepService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.criaForm();

    this.formDadosResidenciais.statusChanges.subscribe(value => {
      if (this.barraNavegacao.get().aba !== 2) {
        return;
      }
      this.barraNavegacao.habilitar('prosseguir', true);
      this.barraNavegacao.validar('dadosResidenciais', true);
    });

    ReloadListasService.get('endereco').subscribe(data => {
      Util.validateAllFormFields(this.formDadosResidenciais);

      this.formDadosResidenciais.get('uf').enable();
      this.formDadosResidenciais.get('cidade').enable();

      this.barraNavegacao.concatUserData(this.formDadosResidenciais.value);

      this.formDadosResidenciais.get('uf').disable();
      this.formDadosResidenciais.get('cidade').disable();
    });
    ReloadListasService.get('resetEndereco').subscribe(data => {
      this.formDadosResidenciais.reset();
    });
  }

  criaForm(): void {
    this.formDadosResidenciais = this.formBuilder.group({
      cep: ['', Validators.compose([])],
      logradouro: ['', Validators.compose([])],
      numero: ['', Validators.compose([])],
      complemento: [''],
      bairro: ['', Validators.compose([])],
      uf: ['', Validators.compose([])],
      cidade: ['', Validators.compose([])],
      municipioId: ['']
    });

    if (this.formValue && this.formValue.endereco) {
      const dados = this.formValue.endereco;

      this.formDadosResidenciais.get('cep').setValue(dados.cep || '');
      this.formDadosResidenciais.get('logradouro').setValue(dados.logradouro || '');
      this.formDadosResidenciais.get('numero').setValue(dados.numero || '');
      this.formDadosResidenciais.get('complemento').setValue(dados.complemento || '');
      this.formDadosResidenciais.get('bairro').setValue(dados.bairro || '');
      this.formDadosResidenciais.get('uf').setValue(dados.uf || '');
      this.formDadosResidenciais.get('cidade').setValue(dados.cidade || '');
      this.formDadosResidenciais.get('municipioId').setValue(dados.municipioId);

      this.barraNavegacao.validar('dadosResidenciais');
    }

    this.formDadosResidenciais.get('uf').disable();
    this.formDadosResidenciais.get('cidade').disable();
  }

  onPaste(event: ClipboardEvent): void {
    const pasteValue = event.clipboardData || window['clipboardData'];

    // this.validarCEP(pasteValue.getData('text'));
  }

  validarCEP(str: string): void {
    if (!str) {
      return;
    }

    const cep = Util.removeSpecialCharacters(str);
    if (cep.length === 8) {
      this.isValidCEP = Util.validarCEP(cep);
      if (!Util.validarCEP(cep)) {
        this.formDadosResidenciais.controls['cep'].setErrors({ 'incorrect': true });
        this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_INVALIDO'), 3500);
        this.formDadosResidenciais.reset();
        this.formDadosResidenciais.enable();
        return;
      }
      this.formDadosResidenciais.controls['cep'].setErrors(null);
      this.consultaCEP.getEnderecoByCep(cep).subscribe(res => {
        if (res.data.length === 0) {
          this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_NOT_FOUND'), 3500);
          this.formDadosResidenciais.reset();
          this.formDadosResidenciais.enable();
          return;
        }

        this.montarEndereco(res.data);
      }, res => {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_NOT_FOUND'), 3500);
        this.formDadosResidenciais.reset();
        this.formDadosResidenciais.enable();
      });
    }
  }

  montarEndereco(endereco: EnderecoMV): void {
    this.formDadosResidenciais.get('logradouro').setValue(endereco.logradouro || '');
    this.formDadosResidenciais.get('bairro').setValue(endereco.bairro || '');
    this.formDadosResidenciais.get('cidade').setValue(endereco.cidade || '');
    this.formDadosResidenciais.get('uf').setValue(endereco.uf || '');

    this.disableFields(['cidade', 'uf']);

    this.formDadosResidenciais.get('municipioId').setValue(endereco.cidadeId);
  }

  private disableFields(fields: any): void {
    if (Array.isArray(fields)) {
      fields.forEach(field => {
        this.formDadosResidenciais.get(field).disable();
      });
      return;
    }

    this.formDadosResidenciais.get(fields).disable();
  }
}
