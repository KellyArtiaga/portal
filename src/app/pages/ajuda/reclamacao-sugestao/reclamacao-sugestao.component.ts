import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { EmailService } from 'src/app/core/services/email.service';
import { MotivoService } from 'src/app/core/services/motivo.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { TipoAtendimentoSolicitacaoService } from 'src/app/core/services/tipo-atendimento.solicitacao.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import { ClienteCondutorMV } from 'src/app/shared/interfaces/cliente-condutor.model';
import { EmailPost } from 'src/app/shared/interfaces/email.model';
import { MotivoMV } from 'src/app/shared/interfaces/motivo.model';
import { TipoAtendimentoMV } from 'src/app/shared/interfaces/tipo-atendimento.model';
import { VeiculosMV } from 'src/app/shared/interfaces/veiculos.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-reclamacao-sugestao',
  templateUrl: './reclamacao-sugestao.component.html',
  styleUrls: ['./reclamacao-sugestao.component.scss']
})
export class ReclamacaoSugestaoComponent implements OnInit {
  formReclamacao: FormGroup;

  tipos: Array<TipoAtendimentoMV> = [];
  motivos: Array<MotivoMV> = [];
  veiculos: Array<VeiculosMV> = [];
  cnpjs: Array<ClienteCondutorMV> = [];

  constructor(
    private snackBar: SnackBarService,
    private router: Router,
    private tipoAtendimentoSolicitacaoService: TipoAtendimentoSolicitacaoService,
    private motivoService: MotivoService,
    private emailService: EmailService,
    private veiculoService: VeiculoService,
    private userContext: UserContextService,
    private clienteService: ClientesService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.criaForm();
  }

  criaForm(): void {
    this.formReclamacao = new FormGroup({
      nomeContato: new FormControl('', Validators.required),
      cnpj: new FormControl('', Validators.required),
      veiculo: new FormControl('', Validators.required),
      telefoneGestor: new FormControl('', Validators.required),
      emailGestor: new FormControl('', [Validators.required, Validators.email]),
      tipo: new FormControl(''),
      motivo: new FormControl('', Validators.required),
      observacoes: new FormControl('', Validators.required)
    });

    this.getTipoAtendimento();
    this.getMotivos();
    this.getClienteCondutorCNPJ();
  }

  voltar(): void {
    this.formReclamacao.reset();
    this.router.navigateByUrl('gerenciador-atendimento/abrir-atendimento');
  }

  postReclamacao(): void {
    if (!this.formReclamacao.valid) {
      if (this.formReclamacao.hasError('email', ['emailGestor'])) {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_EMAIL_INVALIDO'), 7000, 'X');
        return;
      }
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    const email: EmailPost = {};
    email.from = `noreply@unidas.com.br`;
    email.to = [`${this.userContext.getEmailPadrao()}`];
    email.subject = `Nova solicitação - Reclamações e Sugestões`;

    email.html = '<html><head></head><body>';
    email.html += `<h4>Um novo atendimento foi solicitado através do Portal do Cliente. Seguem as informações:</h4>`;
    email.html += `<span style="font-weight: bold;">Nome do contato:</span> ${this.getFormValue('nomeContato')}<br />`;
    email.html += `<span style="font-weight: bold;">E-mail do gestor responsável:</span> ${this.getFormValue('emailGestor')}<br />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<span style="font-weight: bold;">Telefone do gestor responsável:</span> ${Util.formataTelefone(this.getFormValue('telefoneGestor'))}<br />`;
    email.html += `<span style="font-weight: bold;">Veículo:</span> ${this.getFormValue('veiculo')}<br />`;
    email.html += `<span style="font-weight: bold;">Tipo:</span> ${this.getFormValue('tipo')}<br />`;
    email.html += `<span style="font-weight: bold;">Motivo:</span> ${this.getFormValue('motivo')}<br />`;
    email.html += `<span style="font-weight: bold;">Observação:</span> ${this.getFormValue('observacoes')}`;
    email.html += `<br /><br />`;
    email.html += `<h4 style="color: red;">Portal do Cliente - Unidas</h4>`;
    email.html += '</body></html>';

    this.emailService.postEmail(email).subscribe(res => {
      this.snackBar.success('Atendimento enviado com sucesso!', 7000, 'X');
      this.formReclamacao.reset();
      this.voltar();
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getClienteCondutorCNPJ(): void {
    this.clienteService.getClienteCondutor(Number(this.userContext.getCondutorId())).subscribe(res => {
      res.data.results.map((item, i) => {
        if (i === 0) {
          this.getVeiculos(item);
        }
      });

      this.cnpjs = res.data.results;
    }, res => {
      this.snackBar.error(res.error.message, 7000);
    });
  }

  getTipoAtendimento(): void {
    this.tipoAtendimentoSolicitacaoService.getAll().subscribe(res => {
      this.tipos = res.data.results;
    }, err => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getMotivos(): void {
    this.motivoService.all().subscribe(res => {
      this.motivos = (res.data.results || [])
      .filter(item => ['reclamações', 'sugestões'].includes(item.descricaoMotivoSolicitacao.trim().toLowerCase()));
    }, err => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getVeiculos(cliente: any): void {
    this.veiculoService.getAll({ clientesId: [cliente.clienteId] }).subscribe(res => {
      this.veiculos = res.data.results;
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  formataDocumento(doc: string): string {
    if (!doc) {
      return '';
    }
    return Util.formataDocumento(doc);
  }

  getFormValue(campo: string): any {
    return this.formReclamacao.get(campo).value;
  }

  formataPlaca(placa: string): string {
    return placa;
  }

  callGetVeiculos(event: MatSelectChange): void {
    if (!event && !event.value) {
      return;
    }

    this.getVeiculos(event.value);
  }
}
