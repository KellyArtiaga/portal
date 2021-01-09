import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { EmailService } from '../../../core/services/email.service';
import { MotivoService } from '../../../core/services/motivo.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { TipoAtendimentoSolicitacaoService } from '../../../core/services/tipo-atendimento.solicitacao.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { EmailPost } from '../../../shared/interfaces/email.model';

@Component({
  selector: 'app-gestao-contrato',
  templateUrl: './gestao-contrato.component.html',
  styleUrls: ['./gestao-contrato.component.scss']
})
export class GestaoContratoComponent implements OnInit {
  form: FormGroup;

  cnpjs: Array<any> = [];
  veiculos: Array<any> = [];
  tipos: Array<any> = [];
  motivos: Array<any> = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: SnackBarService,
    private translateService: TranslateService,
    private emailService: EmailService,
    private tipoAtendimentoSolicitacaoService: TipoAtendimentoSolicitacaoService,
    private motivoService: MotivoService,
    private userContext: UserContextService
  ) { }

  ngOnInit() {
    this.createFormGroup();
    // this.getTipoAtendimento();
    this.getMotivos();
  }

  createFormGroup() {
    this.form = this.formBuilder.group({
      'nomeContato': ['', Validators.compose([Validators.required])],
      'telefoneGestor': ['', Validators.compose([Validators.required])],
      'emailGestor': ['', Validators.compose([Validators.required, Validators.email])],
      'tipo': ['', Validators.compose([])],
      'motivo': ['', Validators.compose([Validators.required])],
      'descricaoDocumento': ['', Validators.compose([Validators.required])]
    });
  }

  getTipoAtendimento(): void {
    this.tipoAtendimentoSolicitacaoService.getAll().subscribe(res => {
      this.tipos = res.data.results.sort((a, b) => a.descricaoSolicitacao.localeCompare(b.descricaoSolicitacao));
    }, err => {
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getMotivos(): void {
    this.motivoService.all({ atendimentoSolicitacaoTipoId: 1 }).subscribe(res => {
      this.motivos = res.data.results.sort((a, b) => a.descricaoMotivoSolicitacao.localeCompare(b.descricaoMotivoSolicitacao));
    }, err => {
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  validarEmail() {
    if (!this.form.get('emailGestor').valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_EMAIL_INVALIDO'), 7000, 'X');
      return false;
    }

    return true;
  }

  validarTelefone() {
    if (this.form.get('telefoneGestor').value.length < 11) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_TELEFONE_INVALIDO'), 7000, 'X');
      return false;
    }
    return true;
  }

  enviar() {
    if (!this.form.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    if (!this.validarEmail()) {
      return;
    }
    if (!this.validarTelefone()) {
      return;
    }

    const sendEmail = () => {
      const email: EmailPost = {};

      email.from = `noreply@unidas.com.br`;
      email.to = [`${this.userContext.getEmailPadrao()}`];
      email.subject = 'Nova solicitação - Gestão de Contrato';

      email.html = `<h4>Um novo Atendimento foi solicitado através do Portal do Cliente. Seguem as informações:</h4>`;

      if (false /* TODO: Usuário logado como placa */) {
        email.html += '<br />&nbsp;<br />';
        email.html += '<br />';
      }

      email.html += `<span style="font-weight: bold;">Nome do contato:</span> ${this.form.get('nomeContato').value}<br />`;
      email.html += `<span style="font-weight: bold;">E-mail do gestor responsável:</span> ${this.form.get('emailGestor').value}<br />`;
      email.html += `<span style="font-weight: bold;">Telefone do gestor responsável:</span> ${this.form.get('telefoneGestor').value}<br />`;
      email.html += `<span style="font-weight: bold;">Tipo:</span> ${this.form.get('tipo').value}<br />`;
      email.html += `<span style="font-weight: bold;">Motivo:</span> ${this.form.get('motivo').value}<br />`;
      email.html += `<span style="font-weight: bold;">Descrição do Documento:</span> ${this.form.get('descricaoDocumento').value}`;
      email.html += '<br /><br />';
      email.html += '<h4 style="color: red;">Portal do Cliente - Unidas</h4>';

      this.emailService.postEmail(email).subscribe(res => {
        this.snackBar.success(this.translateService.instant('PORTAL.GESTAO_CONTRATO.FORM.MESSAGE.SUCESSO_ENVIO'), 7000, 'X');
        this.voltar();
      }, res => {
        this.snackBar.error(this.translateService.instant('PORTAL.GESTAO_CONTRATO.FORM.MESSAGE.ERRO_ENVIO'), 7000, 'X');
      });
    };

    sendEmail();
  }

  voltar() {
    this.form.reset();
    this.router.navigateByUrl('gerenciador-atendimento/abrir-atendimento');
  }
}
