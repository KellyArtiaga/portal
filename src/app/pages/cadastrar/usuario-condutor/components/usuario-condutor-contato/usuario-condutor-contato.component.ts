import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { BarraNavegacaoService } from '../../../../../core/services/barra-navegacao.service';
import { CondutorService } from '../../../../../core/services/condutor.service';
import { ReloadListasService } from '../../../../../core/services/reload-listas.service';
import { SnackBarService } from '../../../../../core/services/snack-bar.service';
import { Util } from '../../../../../shared/util/utils';

@Component({
  selector: 'app-usuario-condutor-contato',
  templateUrl: './usuario-condutor-contato.component.html',
  styleUrls: ['./usuario-condutor-contato.component.scss']
})
export class UsuarioCondutorContatoComponent implements OnInit {
  @Input() formValue: any;

  formContato: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private barraNavegacao: BarraNavegacaoService,
    private condutorService: CondutorService,
    private translate: TranslateService,
    private snackBar: SnackBarService
  ) { }

  ngOnInit() {
    this.criaForm();
    this.barraNavegacao.mostrar('prosseguir', false);

    this.formContato.statusChanges.subscribe(value => {
      if (this.barraNavegacao.get().aba !== 1) {
        return;
      }
      this.barraNavegacao.validar('contato', value === 'VALID');
      this.barraNavegacao.habilitar('prosseguir', value === 'VALID');
    });

    if (this.barraNavegacao.get().reset) {
      this.formContato.reset();
    }
    if (this.barraNavegacao.get().edicao && this.formContato.get('email').value) {
      this.formContato.get('email').disable();
    }

    ReloadListasService.get('contato').subscribe(data => {
      this.enableField('email');
      Util.validateAllFormFields(this.formContato);
      this.barraNavegacao.concatUserData(this.formContato.value);
      if (this.barraNavegacao.get().edicao && this.formContato.get('email').value) {
        this.disableField('email');
      }
    });
    ReloadListasService.get('resetContato').subscribe(data => {
      this.formContato.reset();
    });
  }

  private enableField(field: string): void {
    this.formContato.get(field).enable();
  }

  private disableField(field: string): void {
    this.formContato.get(field).disable();
  }

  criaForm(): void {
    this.formContato = this.formBuilder.group({
      telefone: [''],
      celular: [''],
      email: ['', Validators.compose([Validators.required, Validators.email])],
    }, { validator: this.atLeastOnePhoneRequired });

    if (this.formValue && this.formValue.contato) {
      const dados = this.formValue.contato;

      this.formContato.get('telefone').setValue(dados.telefone);
      this.formContato.get('celular').setValue(dados.celular);
      this.formContato.get('email').setValue(dados.email);

      this.barraNavegacao.validar('contato', this.formContato.status === 'VALID');
    }
  }

  atLeastOnePhoneRequired(group: FormGroup): { [s: string]: boolean } {
    if (group) {
      if (group.controls['telefone'].value || group.controls['celular'].value) {
        return null;
      }
    }
    return { 'error': true };
  }

  onPaste(event: ClipboardEvent): void {
    const pasteValue = event.clipboardData || window['clipboardData'];

    this.verificarInformacoesUsuario('email', pasteValue.getData('text'));
  }

  verificarInformacoesUsuario(field: string, value: string): void {
    const obj = {};

    if (value.length > 5) {
      obj[field] = value;

      this.condutorService.get(obj).subscribe(res => {
        if (res.data && res.data.results.length > 0) {
          this.snackBar.open(this.translate.instant('PORTAL.MSG_USUARIO_JA_CADASTRADO'), 7000, 'X');

          this.formContato.get(field).setValue(null);
        }
      }, res => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }
  }
}
