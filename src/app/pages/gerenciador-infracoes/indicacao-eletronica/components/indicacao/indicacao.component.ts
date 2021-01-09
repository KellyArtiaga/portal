import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'src/app/shared/take-until-destroy';
import { TipoDocumentoEnum } from 'src/assets/data/enums/tipo-documento.enum';

import { ArquivoService } from '../../../../../core/services/arquivos.service';
import { CondutorService } from '../../../../../core/services/condutor.service';
import { ConsultaCepService } from '../../../../../core/services/consulta-cep.service';
import { DadosModalService } from '../../../../../core/services/dados-modal.service';
import { MultasService } from '../../../../../core/services/multas.service';
import { SnackBarService } from '../../../../../core/services/snack-bar.service';
import { UserContextService } from '../../../../../core/services/user-context.service';
import { ModalConfirmComponent } from '../../../../../shared/components/modal-confirm/modal-confirm.component';
import { CondutorMV } from '../../../../../shared/interfaces/condutor.model';
import { DadosModalMV } from '../../../../../shared/interfaces/dados-modal.model';
import { Util } from '../../../../../shared/util/utils';
import { MultasNotificacaoService } from 'src/app/core/services/multas-notificacao.service';
import { MultasPrincipalService } from 'src/app/core/services/multas-principal.service';
import { EntidadeDocumentoEnum } from 'src/assets/data/enums/entidade-documento.enum';
import { EnderecoMV } from 'src/app/shared/interfaces/endereco.model';
import { environment } from 'src/environments/environment';
import * as moment from 'moment'
import { FeriadoService } from 'src/app/core/services/feriados.service';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { StatusNotificacaoEnum } from 'src/assets/data/enums/status-notificacao.enum';



@Component({
  selector: 'app-indicacao',
  templateUrl: './indicacao.component.html',
  styleUrls: ['./indicacao.component.scss']
})
export class IndicacaoComponent implements OnInit, OnDestroy {
  @ViewChild('cnhInput') cnhInput;
  @ViewChild('termoInput') termoInput;

  isValidCEP = false;
  isForaPrazo: boolean = false;

  dtFinal: any;

  formCondutor: FormGroup;
  condutorSelecionado = new FormControl();
  condutores: CondutorMV[];
  maskData: any;

  showForm: boolean;
  showActions: boolean;

  termoGerado: boolean = false;

  cnh: any;
  termo: any;
  notificacao: any;
  termoImage: any;

  atendimentoId: number;
  condutorSemCadastro: boolean;
  habilitarCadastroEndereco: boolean;
  dadosMulta: any;
  condutor: any;

  feriados: any[];


  ufs: any[];
  municipios: any[];
  municipioControl: FormControl;
  municipioCondutor: any;
  municipioProprietario: any;
  condutorAtual: any;
  idCondutorSemCadastroCriado: any;

  constructor(
    private activeRouter: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private dadosModalService: DadosModalService,
    private userContext: UserContextService,
    private condutorService: CondutorService,
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private consultaCEP: ConsultaCepService,
    private arquivoService: ArquivoService,
    private sanitizer: DomSanitizer,
    private multasService: MultasService,
    private notificacaoService: MultasNotificacaoService,
    private principalService: MultasPrincipalService,
    private feriadoService: FeriadoService,
    private ngxXml2jsonService: NgxXml2jsonService

  ) {
    this.maskData = { mask: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/] };
    this.condutor = {};
    this.condutorAtual = {};
  }

  ngOnInit() {
    this.showActions = true;
    this.condutorSemCadastro = false;
    this.habilitarCadastroEndereco = false;
    this.dadosMulta = {};
    Object.assign(this.dadosMulta, JSON.parse(sessionStorage.getItem('multa')));
    this.dtFinal = Util.formataData(this.dadosMulta.dataVencimento)
    if (this.dadosMulta.dtLimiteFici) {
      this.dtFinal = Util.formataData(this.dadosMulta.dtLimiteFici);
    }
    this.initFormCondutor();
    this.getUfs();

    this.activeRouter.params.subscribe(val => {
      this.atendimentoId = val.id;
      this.getCondutor();
      this.initCondutorInput();
    });
    this.validarStatusNotificacao();
  }

  validarStatusNotificacao() {
    if (this.dadosMulta.idStatusIndicacaoNotificacao === StatusNotificacaoEnum.PE ||
      this.dadosMulta.idStatusIndicacaoNotificacao === StatusNotificacaoEnum.RE ||
      this.dadosMulta.idStatusIndicacaoNotificacao === StatusNotificacaoEnum.IEO ||
      this.dadosMulta.idStatusIndicacaoNotificacao === StatusNotificacaoEnum.VD) {
      this.isForaPrazo = true;
    }
    return;
  }

  openDocument(event) {
    window.open(environment.APIArquivos + event.href)
  }

  getUfs() {
    this.consultaCEP.getAllUF().pipe(takeUntilDestroy(this)).subscribe(res => {
      this.ufs = res.data;
    }, error => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 1500);
    });
  }

  getMunicipios(data: any, component: any) {
    const UF = {
      uf: this.formCondutor.get('uf').value ? this.formCondutor.get('uf').value.uf : '',
      cidade: this.municipioControl.value
    };
    this.consultaCEP.getAllMunicipio(UF).pipe(takeUntilDestroy(this)).subscribe(res => {
      this.municipios = res.data;
    },
      error => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 1500);
      }
    );
  }

  initFormCondutor(): void {
    this.municipioControl = new FormControl();
    this.formCondutor = new FormGroup({
      cpf: new FormControl('', Validators.required),
      nome: new FormControl('', Validators.required),
      dataNascimento: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      rg: new FormControl('', Validators.required),
      emissor: new FormControl('', Validators.required),
      numeroRegistro: new FormControl('', Validators.required),
      primeiraHabilitacao: new FormControl('', Validators.required),
      logradouro: new FormControl(),
      logradouro_numero: new FormControl(),
      logradouro_complemento: new FormControl(),
      bairro: new FormControl(),
      municipio: new FormControl(),
      uf: new FormControl(),
      cep: new FormControl()
    });
  }

  getCondutor(): void {
    const body = { idMulta: this.dadosMulta.multaId };
    this.multasService.getCondutorMulta(body).subscribe(res => {
      this.condutor = res.data[0];
      const condutor = res.data[0];
      this.condutorAtual = condutor;
      this.condutorSemCadastro = Boolean(this.condutor.isCondutorSemCadastro);
      this.habilitarCadastroEndereco = this.condutorSemCadastro;
      this.getMunicipioCondutorProprietario();
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 1500);
    });
  }

  getMunicipioCondutorProprietario() {
    this.consultaCEP.getMunicipio(this.condutor.proprietarioVeiculoMunicipio).pipe(takeUntilDestroy(this)).subscribe(res => {
      this.municipioProprietario = res.data;
      if (this.condutor.condutorIdMunicipio) {
        this.consultaCEP.getMunicipio(this.condutor.condutorIdMunicipio).pipe(takeUntilDestroy(this)).subscribe(res => {
          this.municipioCondutor = res.data;
          this.criaForm(this.condutor);
        }, error => {
          this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 1500);
        });
      } else {
        this.criaForm(this.condutor);
      }
    }, error => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 1500);
    });
  }

  initCondutorInput(): void {
    this.condutorSelecionado.valueChanges.pipe(
      tap(() => this.condutorSelecionado.value
        && this.condutorSelecionado.value.length >= 3),
      debounceTime(100),
      startWith(''),
    ).subscribe(value => {
      if (!value || value.length < 3) {
        this.condutores = [];
        return;
      }

      if (typeof this.condutorSelecionado.value === 'string') {
        this.condutorService.getAll(null, null, value).subscribe(res => {
          if (res.data.results.length === 0) {
            this.snackBar.open(this.translate.instant('PORTAL.MSG_CONDUTOR_NOT_FOUND'), 7000);
          }
          this.condutores = res.data.results;
        }, res => {
          this.snackBar.error(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000);
        });
      }
    });
  }

  formataDocumento(documento: string): string {
    if (!documento) {
      return;
    }

    return Util.formataDocumento(documento);
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
        this.formCondutor.controls['cep'].setErrors({ 'incorrect': true });
        this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_INVALIDO'), 3500);
        return;
      }

      this.formCondutor.controls['cep'].setErrors(null);

      this.consultaCEP.getEnderecoByCep(cep).subscribe(res => {
        if (res.data.length === 0) {
          this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_NOT_FOUND'), 3500);
          return;
        }

        this.montarEndereco(res.data);
      }, res => {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_NOT_FOUND'), 3500);
      });
    }
  }

  montarEndereco(endereco: EnderecoMV): void {
    this.formCondutor.get('logradouro').setValue(endereco.logradouro || '');
    this.formCondutor.get('bairro').setValue(endereco.bairro || '');
    this.ufs.forEach(element => {
      if (this.compare(element, { uf: endereco.uf })) {
        this.formCondutor.get('uf').patchValue(element);
      }
    });

    this.consultaCEP.getAllMunicipio({ uf: endereco.uf, cidade: endereco.cidade }).pipe(takeUntilDestroy(this)).subscribe(res => {
      res.data.forEach(element => {
        if (this.compareMunicipio(element, { municipio: endereco.cidade })) {
          this.municipioControl.setValue(element);
        }
      })
    })


  }

  compare(a, b): boolean {
    return a.uf === b.uf;
  }

  compareMunicipio(a, b): boolean {
    return a.municipio === b.municipio;
  }

  private getDocumento(doc?: any): void {
    const url = this.arquivoService.recuperarArquivo('MULTAS');

    this.arquivoService.getAll(
      doc || doc === null ? EntidadeDocumentoEnum.NOTIFICACAO : EntidadeDocumentoEnum.TERMO_RESPONSABILIDADE_MULTA,
      this.dadosMulta.multaId,
      doc,
      'MULTAS'
    ).subscribe(response => {
      if (response.data && response.data.length > 0) {
        if (doc === TipoDocumentoEnum.CNH) {
          this.cnh = response.data[0];
          this.cnh.url = this.sanitizer.bypassSecurityTrustResourceUrl(`${url}${response.data[0].href}`);
        } else if (doc === TipoDocumentoEnum.OUTROS || doc === null) {
          this.notificacao = this.validarTipo(response.data);
          this.notificacao.url = this.sanitizer.bypassSecurityTrustResourceUrl(`${url}${this.notificacao.href}`);
        } else {
          this.termo = response.data[0];
          this.termo.url = this.sanitizer.bypassSecurityTrustResourceUrl(`${url}${response.data[0].href}`);
        }
      }
    }, error => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  validarTipo(data) {
    let response;
    for (let index = 0; index < data.length; index++) {
      if (data[index].tipo === null || data[index].tipo === 'OUTROS') {
        response = data[index];
        break;
      }
    }
    return response;
  }

  display(condutor: any) {
    if (condutor) {
      return `${condutor['nomeCondutor']} - ${condutor['cpf']}`;
    }
  }

  public alterarCondutor(): void {
    this.showActions = false;
    this.habilitarCadastroEndereco = false;
    Util.desabilitarValidacoes(this.formCondutor, ['dataNascimento', 'primeiraHabilitacao', 'cep', 'logradouro', 'logradouro_numero', 'logradouro_complemento', 'bairro', 'municipio', 'uf'])
    document.getElementById('botaoIndicarCondutor').removeAttribute('enabled');
    document.getElementById('botaoIndicarCondutor').setAttribute('disabled', 'true');
  }

  public cancelarAlteracao(): void {
    this.condutor = this.condutorAtual;
    this.habilitarCadastroEndereco = Boolean(this.condutor.isCondutorSemCadastro);
    this.criaForm(this.condutor);
    this.showActions = true;
    this.condutores = [];
    this.condutorSelecionado.setValue(null);
    document.getElementById('botaoIndicarCondutor').removeAttribute('disabled');
    document.getElementById('botaoIndicarCondutor').setAttribute('enabled', 'true');
  }

  public getPerfil(): string {
    return this.userContext.getPerfil();
  }

  public redirectTo(url: string): void {
    this.router.navigate([url], {
      queryParams: { 'new': true, 'backTo': `/gerenciador-infracoes/indicacoes-eletronicas/${this.atendimentoId}` },
      skipLocationChange: true
    });
  }

  criaForm(condutor): void {
    const idCondutorSemCadastro = condutor.idCondutorSemCadastro;
    this.condutor = condutor;
    this.condutor.idCondutorSemCadastro = idCondutorSemCadastro;
    this.getDocumento(TipoDocumentoEnum.CNH);
    this.getDocumento(null);
    this.getDocumento();


    this.formCondutor.get('cpf').setValue(condutor && condutor.cpf ? condutor.cpf : null);
    this.formCondutor.get('nome').setValue(condutor && condutor.nomeCondutor ? condutor.nomeCondutor : null);
    this.formCondutor.get('email').setValue(condutor && condutor.email ? condutor.email : null);
    this.formCondutor.get('rg').setValue(condutor && condutor.rg ? condutor.rg : null);
    this.formCondutor.get('emissor').setValue(condutor && condutor.orgaoEmissorRG ? condutor.orgaoEmissorRG : null);
    this.formCondutor.get('numeroRegistro').setValue(condutor && condutor.numeroRegistro ? condutor.numeroRegistro : null);


    if (Boolean(this.condutor.isCondutorSemCadastro)) {

      this.formCondutor.get('dataNascimento').setValue(condutor && condutor.dtNascimento ?
        Util.formataData(condutor.dtNascimento, 'DD/MM/YYYY') : null);
      this.formCondutor.get('primeiraHabilitacao').setValue(condutor && condutor.dtPrimeiraHabilitacao ?
        Util.formataData(condutor.dtPrimeiraHabilitacao, 'DD/MM/YYYY') : null);
      this.formCondutor.get('cep').setValue(condutor ? condutor.condutorCEP : null);
      this.formCondutor.get('logradouro').setValue(condutor ? condutor.condutorLogradouro : null);
      this.formCondutor.get('logradouro_numero').setValue(condutor ? condutor.condutorLogradouroNumero : null);
      this.formCondutor.get('logradouro_complemento').setValue(condutor ? condutor.condutorLogradouroComplemento : null);
      this.formCondutor.get('bairro').setValue(condutor ? condutor.condutorBairro : null);
      this.formCondutor.get('municipio').setValue(this.municipioCondutor);
      this.formCondutor.get('uf').setValue(this.ufs.filter(uf => uf.uf === condutor.condutorSiglaUF)[0]);
    } else {
      this.formCondutor.get('dataNascimento').setValue(condutor && condutor.dataNascimento ?
        Util.formataData(condutor.dataNascimento, 'DD/MM/YYYY') : null);
      this.formCondutor.get('primeiraHabilitacao').setValue(condutor && condutor.dataPrimeiraHabilitacao ?
        Util.formataData(condutor.dataPrimeiraHabilitacao, 'DD/MM/YYYY') : null);
    }

    Util.habilitarCampoSomenteLeitura(this.formCondutor);
  }

  public cancelarIndicacao(): void {
    this.router.navigateByUrl('gerenciador-infracoes/indicacoes-eletronicas');
  }

  public recusarIndicacao(): void {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.NOTIFICACAO_MULTA.LABELS.RECUSAR_INDICACAO',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);
    modalConfirm.componentInstance.mensagem = 'PORTAL.NOTIFICACAO_MULTA.MESSAGES.RECUSAR_INDICACAO';
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(confirmado => {
      this.dadosModalService.set(null);
      if (confirmado) {
        this.executarRecusaIndicacao();
      }
    });
  }

  public executarRecusaIndicacao(): void {
    const bodyPrincipal = {
      idMulta: this.dadosMulta.multaId,
      idUsuario: this.userContext.getUsuarioId(),
      idStatusIndicacaoNotificacao: 3
    };

    this.principalService.patch(null, bodyPrincipal, 'MULTAS').pipe(takeUntilDestroy(this)).subscribe(res => {
      this.snackBar.success(this.translate.instant('PORTAL.NOTIFICACAO_MULTA.MESSAGES.RECUSA_REALIZADA'), 1500);
      this.cancelarIndicacao();
    });
  }

  preview(files: any, entidadeId: string, tipo?: string): void {
    if (!files) {
      return;
    }

    const file = files.target.files[0];
    const mimeType = file.type;
    if (tipo === TipoDocumentoEnum.CNH && mimeType.match(/image\/*/) == null) {
      this.snackBar.open('Somente imagens são permitidas', 3500);
      return;
    } else if (!tipo && mimeType.match(/pdf\/*/) == null) {
      this.snackBar.open('Somente pdfs são permitidos', 3500);
      return;
    }

    const input = new FormData();
    const descricaoArquivo = tipo === TipoDocumentoEnum.CNH ? `cnh.${file.type.split('/')[1]}` : `termo.${file.type.split('/')[1]}`;
    let fileToUpload: File;

    fileToUpload = file;
    input.append('file', fileToUpload, descricaoArquivo);

    const doc = {
      descricao: descricaoArquivo,
      fileFormData: input,
    };

    this.arquivoService
      .postArquivo(
        Number(this.userContext.getID()),
        entidadeId,
        this.dadosMulta.multaId,
        tipo,
        doc['descricao'],
        doc['fileFormData'],
        'MULTAS'
      ).subscribe(res => {
        this.getDocumento(tipo);
      }, res => {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
  }

  removerArquivo(cnh: boolean): void {
    let id;

    if (cnh) {
      id = this.cnh.id;
      this.cnh = null;
      this.cnhInput.nativeElement.value = null;
    } else {
      id = this.termo.id;
      this.termo = null;
      this.termoInput.nativeElement.value = null;
    }

    this.arquivoService.deleteArquivo(id, 'MULTAS').subscribe(res => {
      cnh ? this.getDocumento(TipoDocumentoEnum.CNH) : this.getDocumento();
      this.snackBar.success(this.translate.instant('PORTAL.MSG_DADOS_ALTERADOS'), 7000);
    }, res => {
      this.snackBar.open(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000, 'X');
    });
  }

  gerarTermoResponsabilidade() {
    if (!this.formCondutor.valid) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 1500);
      return;
    }

    const condutorSemCadastro = Boolean(this.condutor.isCondutorSemCadastro);
    const temIdCondutorSemCadastro = this.condutor.idCondutorSemCadastro;
    let body: any = {};

    if (condutorSemCadastro) {
      body = {
        cpf: this.formCondutor.get('cpf').value,
        nomeCondutor: this.formCondutor.get('nome').value,
        dtNascimento: Util.stringToDate(this.formCondutor.get('dataNascimento').value, '/').getTime(),
        email: this.formCondutor.get('email').value,
        rg: this.formCondutor.get('rg').value,
        numRegistro: this.formCondutor.get('numeroRegistro').value,
        orgaoEmissoRG: this.formCondutor.get('emissor').value,
        dtPrimeiraHabilitacao: Util.stringToDate(this.formCondutor.get('primeiraHabilitacao').value, '/').getTime(),
        condutorCEP: this.formCondutor.get('cep').value,
        logradouro: this.formCondutor.get('logradouro').value,
        logradouroNumero: this.formCondutor.get('logradouro_numero').value,
        logradouroComplemento: this.formCondutor.get('logradouro_complemento').value,
        bairro: this.formCondutor.get('bairro').value,
        idMunicipio: this.municipioControl.value ? this.municipioControl.value.id : this.formCondutor.get('municipio').value.id,
        siglaUF: this.formCondutor.get('uf').value.uf,
        isCondutorSemCadastro: Boolean(this.condutor.isCondutorSemCadastro),
        idUsuario: this.userContext.getUsuarioId()
      };
    }

    if ((condutorSemCadastro && temIdCondutorSemCadastro) || (this.termoGerado === true && temIdCondutorSemCadastro)) {
      this.multasService.patchCondutorMulta(this.condutor.idCondutorSemCadastro, body).pipe(takeUntilDestroy(this)).subscribe(res => {
        this.gerarTermo();
      }, error => {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 1500);
      });
    } else if (condutorSemCadastro && !temIdCondutorSemCadastro) {
      body.idMulta = this.dadosMulta.multaId;
      body.idCondutorOrigem = this.condutor.codigoCondutor;
      this.multasService.postCondutorMulta(body).pipe(takeUntilDestroy(this)).subscribe(res => {
        this.idCondutorSemCadastroCriado = Object.values(res.data.insertId[0])[0];
        this.gerarTermo();
      }, error => {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 1500);
      });
    } else if (!condutorSemCadastro && temIdCondutorSemCadastro) {
      this.atualizarDadosCondutorSemCadastro(true);
    } else {
      this.atualizarCondutorMulta();
    }
  }

  gerarTermo() {
    this.termoGerado = true;
    const titulo = 'TERMO DE RESPONSABILIDADE POR INFRAÇÃO DE TRÂNSITO\n\n';

    const cabecalho = `Contrato nº:  ${this.condutorAtual.numeroContrato}\n`
      .concat(`Cliente: ${this.condutorAtual.nomeCliente}\n`)
      .concat(`Placa: ${this.condutorAtual.placa}\n`)
      .concat(`Modelo: ${this.condutorAtual.modelo}\n\n`);

    const tituloInfoCondutor = `INFORMAÇÕES DO CONDUTOR QUE SERA INDICADO\n\n`;

    // tslint:disable-next-line: max-line-length
    let informacoesCondutor = 'Nome do condutor: ' + this.formCondutor.get('nome').value + '        CPF: ' + this.formCondutor.get('cpf').value + '\n'
      // tslint:disable-next-line: max-line-length
      .concat('RG: ' + this.formCondutor.get('rg').value + '        Órgão emissor: ' + this.formCondutor.get('emissor').value + '\n')
      // tslint:disable-next-line: max-line-length
      .concat('Nº Registro Carteira Nacional de Habilitação: ' + this.formCondutor.get('numeroRegistro').value + '\n');

    if (this.condutor.isCondutorSemCadastro && this.formCondutor.get('logradouro').value) {
      informacoesCondutor =
        informacoesCondutor.concat('Endereço: ' + this.formCondutor.get('logradouro').value + ', ')
          .concat(this.formCondutor.get('logradouro_numero').value + ', ');
      if (this.formCondutor.get('logradouro_complemento').value) {
        informacoesCondutor = informacoesCondutor.concat(this.formCondutor.get('logradouro_complemento').value + ', ');
      }
      informacoesCondutor = informacoesCondutor.concat(this.formCondutor.get('bairro').value + ', ' + this.municipioControl.value.municipio + ', ')
        .concat(this.formCondutor.get('uf').value.uf + '\n');
    }

    informacoesCondutor =
      informacoesCondutor.concat('\nO usuário/condutor identificado acima declara que estava em posse do carro placa ')
        // tslint:disable-next-line: max-line-length
        .concat(this.condutor.placa + ' de propriedade da ' + this.condutorAtual.proprietarioVeiculoNome)
        .concat(', pessoa jurídica de direito privado , inscrita no CNPJ ' + this.condutorAtual.proprietarioVeiculoCNPJ)
        .concat(' com sede em ' + this.municipioProprietario.municipio + '-' + this.condutorAtual.proprietarioVeiculoUF)
        .concat(', no dia ' + Util.formataData(this.condutorAtual.dtInfracao, 'DD/MM/YYYY') + ' às '
          + Util.formataData(this.condutorAtual.dtInfracao, 'HH:MM:SS') + ' horas, ')
        // tslint:disable-next-line: max-line-length
        .concat('momento do cometimento da infração nº ' + this.condutorAtual.numeroAIT + ' emitida pelo(a) órgão ' + this.condutorAtual.orgaoAutuador + ':\n\n');

    const clausulas = {
      ul: [
        'Assume a responsabilidade pela infração supracitada cometida na condução do carro alugado e pela pontuação '
          .concat('decorrente desta infração, nos termos do artigo 4º e seus parágrafos, da resolução 404/12 do CONTRAN, ')
          .concat('e da cláusula 11.1 do Contrato.'),
        'Autoriza a Locadora Unida S/A a assinar o termo de apresentação do condutor/ infrator das multas de trânsito '
          .concat('que envolvam o Carro alugado nos termos do artigo 257, parágrafos 1º, 3º, 7º e 8º do Código Brasileiro de Trânsito ')
          .concat('e da cláusula 11.1 do Contrato.'),
        'É preposto autorizado pelo Cliente a conduzir os Carros alugados nos termos do Contrato.\n\n\n\n'
      ], fontSize: 10, alignment: 'justify', lineHeight: 1.5, marginLeft: 20, marginRight: 20
    };

    const dataAssinatura = 'Data: _______ /_______ /_______\n\n\n';
    const assinatura = 'Assinatura: ___________________________________________________________________________________\n';
    const notaAssinatura = '(Idêntica à assinatura da CNH)';

    const documentDefinition = {
      content: [
        { text: titulo, fontSize: 15, alignment: 'center', bold: true },
        { text: cabecalho, fontSize: 10, alignment: 'justify', lineHeight: 1.5 },
        { text: tituloInfoCondutor, fontSize: 15, alignment: 'center', bold: true },
        { text: informacoesCondutor, fontSize: 10, alignment: 'justify', lineHeight: 1.5 },
        clausulas,
        { text: dataAssinatura, fontSize: 10 },
        { text: assinatura, fontSize: 10 },
        { text: notaAssinatura, fontSize: 10, marginLeft: 165 }
      ]
    };

    pdfMake.createPdf(documentDefinition, null, null, pdfFonts.pdfMake.vfs).open();
    Util.habilitarCampoSomenteLeitura(this.formCondutor);
  }

  gerenciarCondutorResponsavel() {
    this.condutor.isCondutorSemCadastro = true;
    Util.desabilitarCampoSomenteLeitura(this.formCondutor);
    !this.condutorSemCadastro ? this.formCondutor.reset() : '';
    this.habilitarCadastroEndereco = true;
  }

  displayMunicipio(municipio?: any): any {
    return municipio ? municipio.municipio : '';
  }

  validarData() {
    const contemDataNascimento = this.formCondutor.get('dataNascimento').value &&
      this.formCondutor.get('dataNascimento').value.replace('_', '').length === 10;
    const contemDataPrimeiraHabilitacao = this.formCondutor.get('primeiraHabilitacao').value &&
      this.formCondutor.get('primeiraHabilitacao').value.replace('_', '').length === 10;

    if (contemDataNascimento && !Util.birthdateIsValid(this.formCondutor.get('dataNascimento').value, 'DD/MM/YYYY')) {
      this.snackBar.open(this.translate.instant('PORTAL.LABELS.DATA_INVALIDA'), 1500);
      this.formCondutor.get('dataNascimento').reset();
      return;
    } else if (contemDataPrimeiraHabilitacao &&
      !Util.dateIsValid(this.formCondutor.get('primeiraHabilitacao').value, 'DD/MM/YYYY')) {
      this.snackBar.open(this.translate.instant('PORTAL.LABELS.DATA_INVALIDA'), 1500);
      this.formCondutor.get('primeiraHabilitacao').reset();
      return;
    }

    if (contemDataNascimento) {
      const dataInserida = Util.stringToDate(this.formCondutor.get('dataNascimento').value, '/');
      const dataAtual = new Date();
      dataInserida.setHours(0, 0, 0, 0);
      dataAtual.setHours(0, 0, 0, 0);
      const dataAtualTime = dataAtual.getTime();
      const dataInseridaTime = dataInserida.getTime();

      if (dataAtualTime <= dataInseridaTime) {
        this.snackBar.open(
          this.translate.instant('PORTAL.LABELS.DATA_NASCIMENTO_INVALIDA'),
          3000
        );
        this.formCondutor.get('dataNascimento').reset();
      }
    }

    if (contemDataPrimeiraHabilitacao) {
      const dataInserida = Util.stringToDate(this.formCondutor.get('primeiraHabilitacao').value, '/');
      const dataAtual = new Date();
      dataInserida.setHours(0, 0, 0, 0);
      dataAtual.setHours(0, 0, 0, 0);
      const dataAtualTime = dataAtual.getTime();
      const dataInseridaTime = dataInserida.getTime();

      if (dataAtualTime < dataInseridaTime) {
        this.snackBar.open(
          this.translate.instant('PORTAL.LABELS.DATA_PRIMEIRA_HABILITACAO_INVALIDA'),
          3000
        );
        this.formCondutor.get('primeiraHabilitacao').reset();
      }

      if (!Util.firstLiscenceIsValidDate(this.formCondutor.get('dataNascimento').value,
        this.formCondutor.get('primeiraHabilitacao').value, 'DD/MM/YYYY')) {
        this.snackBar.open(
          this.translate.instant('PORTAL.LABELS.DATA_PRIMEIRA_HABILITACAO_INVALIDA'),
          3000
        );
        this.formCondutor.get('primeiraHabilitacao').reset();
      }
    }
  }

  enviarIndicacao() {
    const termoAnexado = this.termo && this.termo.url;
    const cnhAnexada = this.cnh && this.cnh.url;

    if (!this.formCondutor.valid) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 1500);
      return;
    }

    if (this.formCondutor.valid && (!termoAnexado || !cnhAnexada)) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_ANEXO_DOCUMENTO_OBRIGATORIO'), 1500);
      return;
    }

    const dataIndicacao = new Date();
    const bodyPrincipal = {
      idMulta: this.dadosMulta.multaId,
      idUsuario: this.userContext.getUsuarioId(),
      idStatusIndicacaoNotificacao: 7,
      idIndicacoesNotificacao: 3,
      nomeCondutor: this.formCondutor.get('nome').value,
      idCondutor: this.idCondutorSemCadastroCriado ? this.idCondutorSemCadastroCriado : this.condutor.codigoCondutor,
      dtDataIndicacao: `${dataIndicacao.getFullYear()}-${dataIndicacao.getMonth() + 1}-${dataIndicacao.getDate()} 00:01`
    };

    const bodyNotificacao = {
      idMulta: this.dadosMulta.multaId,
      idUsuario: this.userContext.getUsuarioId(),
      dtDataRecebimentoNotificacaoCliente: null,
      idJustificativaRecebimentoNotificacaoPrazo: null,
      recebimentoNotificacaoDivergencia: false
    };

    const condutor = this.condutor;

    this.notificacaoService.patch(null, bodyNotificacao, 'MULTAS').pipe(takeUntilDestroy(this)).subscribe(res => {
      this.principalService.patch(null, bodyPrincipal, 'MULTAS').pipe(takeUntilDestroy(this)).subscribe(res => {
        if (!condutor.isCondutorSemCadastro && condutor.idCondutorSemCadastro) {
          this.atualizarDadosCondutorSemCadastro(false);
        } else {
          this.snackBar.success(this.translate.instant('PORTAL.NOTIFICACAO_MULTA.MESSAGES.INDICACAO_REALIZADA'), 1500);
        }
        setTimeout(() => {
          this.cancelarIndicacao();
        }, 10);
      }, error => {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 1500);
      });
    }, error => {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 1500);
    });
  }

  atualizarDadosCondutorSemCadastro(gerarTermo) {
    this.multasService.patchCondutorMulta(this.condutor.idCondutorSemCadastro, { isCondutorSemCadastro: false })
      .pipe(takeUntilDestroy(this)).subscribe(res => {
        if (gerarTermo) {
          this.gerarTermo();
        }
        this.snackBar.success(this.translate.instant('PORTAL.NOTIFICACAO_MULTA.MESSAGES.INDICACAO_REALIZADA'), 1500);
      }, error => {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 1500);
      });
  }

  atualizarCondutorMulta() {
    const bodyPrincipal = {
      idMulta: this.dadosMulta.multaId,
      idUsuario: this.userContext.getUsuarioId(),
      nomeCondutor: this.formCondutor.get('nome').value,
      idCondutor: this.idCondutorSemCadastroCriado ? this.idCondutorSemCadastroCriado : this.condutor.codigoCondutor
    };
    this.principalService.patch(null, bodyPrincipal, 'MULTAS').pipe(takeUntilDestroy(this)).subscribe(res => {
      this.gerarTermo();
    }, error => {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 1500);
    });
  }

  ngOnDestroy() {
  }
}
