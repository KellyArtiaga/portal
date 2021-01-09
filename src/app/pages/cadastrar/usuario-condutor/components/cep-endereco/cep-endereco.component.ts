import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { ConsultaCepService } from '../../../../../core/services/consulta-cep.service';
import { SnackBarService } from '../../../../../core/services/snack-bar.service';
import { EnderecoMV } from '../../../../../shared/interfaces/endereco.model';
import { Util } from '../../../../../shared/util/utils';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-cep-endereco',
  templateUrl: './cep-endereco.component.html',
  styleUrls: ['./cep-endereco.component.scss']
})
export class CepEnderecoComponent implements OnInit {
  

  isValidCEP = false;
  @Input()
  form: FormGroup;
  subject = new Subject<any>();
  @Input()
  subscribeTo : Observable<any>;

  constructor(
    private formBuilder: FormBuilder, 
    private snackBar: SnackBarService,
    private consultaCEP: ConsultaCepService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    if (_.isNil(this.form)) {
      this.form = CepEnderecoComponent.criarFormulario(this.formBuilder);
    }

    this.form.statusChanges.subscribe(value => {
      this.subject.next({eventName:'formStatusChange'});
    });
    if(!_.isNil(this.subscribeTo)) {
      this.subscribeTo.subscribe((event)=> {
        if (event.eventName  === 'endereco') {
          Util.validateAllFormFields(this.form);
          this.form.get('uf').enable();
          this.form.get('cidade').enable();
          this.form.get('uf').disable();
          this.form.get('cidade').disable();
        } else if (event.eventName === 'clear') {
          this.form.reset();
        }
      });
    }
  }
  static criarFormulario(formBuilder: FormBuilder, value: any = null): FormGroup {
    const form = formBuilder.group({
      cep: ['', Validators.compose([Validators.required])],
      logradouro: ['', Validators.compose([Validators.required])],
      numero: ['', Validators.compose([Validators.required])],
      complemento: [''],
      bairro: ['', Validators.compose([Validators.required])],
      uf: ['', Validators.compose([Validators.required])],
      cidade: ['', Validators.compose([Validators.required])],
      municipioId: ['']
    });
    if (!_.isNil(value)) {
      form.get('cep').setValue(value.cep || '');
      form.get('logradouro').setValue(value.logradouro || '');
      form.get('numero').setValue(value.numero || '');
      form.get('complemento').setValue(value.complemento || '');
      form.get('bairro').setValue(value.bairro || '');
      form.get('uf').setValue(value.uf || '');
      form.get('cidade').setValue(value.cidade || '');
      form.get('municipioId').setValue(value.municipioId);
    }
    form.get('uf').disable();
    form.get('cidade').disable();
    return form;
  }

  onPaste(event: ClipboardEvent): void {
    const pasteValue = event.clipboardData || window['clipboardData'];
    this.validarCEP(pasteValue.getData('text'));
  }

  validarCEP(str: string): void {
    if (!str) {
      return;
    }
    const cep = Util.removeSpecialCharacters(str);
    if (cep.length === 8) {
      this.isValidCEP = Util.validarCEP(cep);
      if (!Util.validarCEP(cep)) {
        this.form.controls['cep'].setErrors({ 'incorrect': true });
        this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_INVALIDO'), 3500);
        this.form.reset();
        this.form.enable();
        return;
      }
      this.form.controls['cep'].setErrors(null);
      this.consultaCEP.getEnderecoByCep(cep).subscribe(res => {
        if (res.data.length === 0) {
          this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_NOT_FOUND'), 3500);
          this.form.reset();
          this.form.enable();
          return;
        }
        this.montarEndereco(res.data);
      }, res => {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_NOT_FOUND'), 3500);
        this.form.reset();
        this.form.enable();
      });
    }
  }

  private montarEndereco(endereco: EnderecoMV): void {
    this.form.get('logradouro').setValue(endereco.logradouro || '');
    this.form.get('bairro').setValue(endereco.bairro || '');
    this.form.get('cidade').setValue(endereco.cidade || '');
    this.form.get('uf').setValue(endereco.uf || '');
    this.disableFields(['cidade', 'uf']);
    this.form.get('municipioId').setValue(endereco.cidadeId);
  }

  private disableFields(fields: any): void {
    if (Array.isArray(fields)) {
      fields.forEach(field => {
        this.form.get(field).disable();
      });
      return;
    }
    this.form.get(fields).disable();
  }
}
