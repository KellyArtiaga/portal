import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { ArquivoService } from '../../../../app/core/services/arquivos.service';
import { DadosModalService } from '../../../../app/core/services/dados-modal.service';
import { SnackBarService } from '../../../../app/core/services/snack-bar.service';
import { TipoAtendimentoSolicitacaoService } from '../../../../app/core/services/tipo-atendimento.solicitacao.service';
import { UserContextService } from '../../../../app/core/services/user-context.service';
import { ArquivoMV } from '../../interfaces/arquivos.model';
import { DadosModalMV } from '../../interfaces/dados-modal.model';
import { Util } from '../../util/utils';
import { ModalConfirmComponent } from '../modal-confirm/modal-confirm.component';
import { ArquivosOsService } from 'src/app/core/services/arquivos-os.service';

@Component({
  selector: 'app-modal-arquivos',
  templateUrl: './modal-arquivos.component.html',
  styleUrls: ['./modal-arquivos.component.scss']
})
export class ModalArquivosComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;

  private id: number;
  private entidadeId: string;
  private chaveEntidade: number;

  private salvarImagemAtendimento: boolean;
  public showForm: boolean;
  public hasFiles: boolean;
  public arquivosOS: boolean;

  public docs: Array<ArquivoMV> = [];


  public docToUpload: File;
  public formArquivos: FormGroup;

  public tipoArquivos: any[] = Util.getTipoArquivos();
  public extensoesValidas = 'jfif,jpg,jpeg,gif,png,bmp,pdf';
  private btnToolTip = this.translateService.instant('PORTAL.ATENDIMENTO.TOOLTIP.BTN_ANEXO');

  public totalDocs: number;
  public totalImages: number;
  public totalVideos: number;

  constructor(
    private arquivoService: ArquivoService,
    private snackBar: SnackBarService,
    private userContext: UserContextService,
    private modalService: NgbModal,
    private modalActiveService: NgbActiveModal,
    private dadosModalService: DadosModalService,
    private tipoAtendimento: TipoAtendimentoSolicitacaoService,
    private sanitizer: DomSanitizer,
    private translateService: TranslateService,
    private arquivosOsService: ArquivosOsService
  ) { }

  ngOnInit() {
    this.totalDocs = 0;
    this.totalImages = 0;
    this.totalVideos = 0;

    this.buscarArquivos();

    this.criaForm();
  }

  private criaForm() {
    if (this.showIncludes()) {
      this.formArquivos = new FormGroup({
        tipoArquivo: new FormControl('', Validators.required)
      });
    }
  }

  showIncludes(): boolean {
    return !!this.showForm;
  }

  private getId(): number {
    return this.id;
  }

  private getEntidadeId(): string {
    return this.entidadeId;
  }

  private buscarArquivos() {

    if (this.arquivosOS) {
      this.buscarArquivosAvarias();
    } else {
      const url = this.arquivoService.recuperarArquivo();

      this.totalDocs = 0;
      this.totalImages = 0;
      this.totalVideos = 0;

      this.arquivoService.getAll(
        this.getEntidadeId(),
        this.getId()
      ).subscribe(response => {
        this.hasFiles = response.data.length > 0;

        if (response && response.data.length > 0) {
          this.docs = response.data.map((docApi: ArquivoMV) => {
            docApi.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(`${url}${docApi.href}`);
            docApi.href = `${url}${docApi.href}`;

            if (
              docApi.extensao === 'jpg' ||
              docApi.extensao === 'png' ||
              docApi.extensao === 'jpeg' ||
              docApi.extensao === 'jfif' ||
              docApi.extensao === 'gif'
            ) {
              this.totalImages += 1;
              docApi.isImage = true;
            } else if (
              docApi.extensao === 'mp4'
            ) {
              this.totalVideos += 1;
              docApi.isVideo = true;
            } else {
              this.totalDocs += 1;
              docApi.isDoc = true;
            }

            return docApi;
          });
        }
      }, res => {
        this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }
  }

  buscarArquivosAvarias() {
    const url = this.arquivoService.recuperarArquivo();

    this.totalDocs = 0;
    this.totalImages = 0;
    this.totalVideos = 0;

    this.arquivosOsService.get(this.chaveEntidade).subscribe(response => {
      this.hasFiles = response.data.results.length > 0;

      if (response && response.data.results.length > 0) {
        this.docs = response.data.results.map((docApi: ArquivoMV) => {
          docApi.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(`${url}/attachments/${docApi.id}`);
          docApi.href = `${url}/attachments/${docApi.id}`;

          if (docApi.extensao) {
            if (
              docApi.extensao === 'jpg' ||
              docApi.extensao === 'png' ||
              docApi.extensao === 'jpeg' ||
              docApi.extensao === 'jfif' ||
              docApi.extensao === 'gif'
            ) {
              this.totalImages += 1;
              docApi.isImage = true;
            } else if (
              docApi.extensao === 'mp4'
            ) {
              this.totalVideos += 1;
              docApi.isVideo = true;
            } else {
              this.totalDocs += 1;
              docApi.isDoc = true;
            }
          } else {
            this.totalImages += 1;
            docApi.isImage = true;
          }

          return docApi;
        });
      }
    }, res => {
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });

  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const arquivos = Array.from(event.target.files);

      arquivos.forEach((arquivo: File) => {
        const file = arquivo;
        const fileExt = file.name.split('.').pop();

        if (file.type.match(/image\/*/)) {
          if (!this.extensoesValidas.includes(fileExt)) {
            this.snackBar.open(this.translateService.instant('PORTAL.MENSAGENS.EXTENSAO_INVALIDA'), 3000);
            this.fileInput.nativeElement.value = '';
            return;
          }
          if (file.size / 1000 > 3100) {
            this.snackBar.open(this.translateService.instant('PORTAL.MENSAGENS.TAMANHO_INVALIDO'), 3000);
            this.fileInput.nativeElement.value = '';
            return;
          }
        } else {
          if (file.size / 1000 > 10100) {
            this.snackBar.open(this.translateService.instant('PORTAL.MENSAGENS.TAMANHO_INVALIDO_VIDEO'), 3000);
            this.fileInput.nativeElement.value = '';
            return;
          }
        }
        if (file != null) {
          this.docToUpload = file;
        }

        this.salvarArquivoUpload();
      });
    }
  }

  formatarMensagemArquivoSelecionado(): string {
    return `Nome arquivo: ${this.docToUpload.name}`;
  }

  salvarArquivoUpload() {
    Util.habilitarValidacoes(this.formArquivos, ['tipoArquivo']);

    if (!this.docToUpload) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_SELECIONAR_ARQUIVO'), 5000, 'X');
      return;
    }
    if (!this.formArquivos.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_NOME_TIPO_OBRIGATORIO'), 5000, 'X');
      return;
    }

    this.fileInput.nativeElement.value = null;

    const tipoArquivo = String(this.formArquivos.get('tipoArquivo').value.descricao.replace(/\s/g, '_')).toLowerCase();
    const descricao = `${tipoArquivo}.${this.docToUpload.type.split('/')[1]}`;
    const input = new FormData();
    let fileToUpload: File;

    fileToUpload = this.docToUpload;
    input.append('file', fileToUpload, descricao);

    const body = {
      atendimentoId: Number(this.getId()),
      descricaoArquivo: descricao,
      tipoDocumento: this.formArquivos.get('tipoArquivo').value.id,
      usuarioId: Number(this.userContext.getID())
    };

    this.onSaveSuccess(descricao, input, body);
  }

  private onSaveSuccess(descricao: string, input: FormData, body: any): void {
    this.arquivoService
      .postArquivo(
        Number(this.userContext.getID()),
        this.getEntidadeId(),
        Number(this.getId()),
        'OUTROS',
        descricao,
        input
      ).subscribe(res => {
        this.docToUpload = null;
        if (this.salvarImagemAtendimento) {
          body.chave = `${res['data'].id}.${body.descricaoArquivo.split('.')[1]}`;

          this.tipoAtendimento.postArquivos(body).subscribe(response => {
            this.mensagemSucesso();
          }, response => {
            this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
          });
        } else {
          this.mensagemSucesso();
        }
      }, res => {
        this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
  }

  private mensagemSucesso(): void {
    this.formArquivos.reset();
    this.formArquivos.setErrors(null);

    this.snackBar.success('Arquivo salvo com sucesso!', 5000);
    Util.desabilitarValidacoes(this.formArquivos, ['tipoArquivo']);

    this.docs = [];
    this.buscarArquivos();
  }

  private onDeleteSuccess(response: any): void {
    this.docs = [];
    this.buscarArquivos();
    this.snackBar.success(response.data.message, 7000, 'X');
  }

  public deletarArquivo(doc: any): void {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.LABELS.EXCLUIR_ARQUIVO',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);
    modalConfirm.componentInstance.mensagem = 'PORTAL.MENSAGENS.EXCLUIR_ARQUIVO';
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);
      if (result) {
        this.delete(doc);
      }
    });
  }

  delete(doc: any): void {
    if (doc.href != null) {
      const index = this.docs.indexOf(doc);
      const body = {
        arquivoId: doc.id
      };
      if (index !== -1) {
        this.arquivoService.deleteArquivo(doc.id).subscribe(res => {
          if (!this.salvarImagemAtendimento) {
            this.onDeleteSuccess(res);
            return;
          }
          this.tipoAtendimento.deleteArquivo(this.getId(), body).subscribe(response => {
            this.onDeleteSuccess(res);
          }, response => {
            this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
          });
        }, res => {
          this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      }
    }
  }

  openDocument(href: any): void {
    const arquivo = href;
    const downloadLink = document.createElement('a');

    downloadLink.href = arquivo;
    downloadLink.target = '_blank';
    downloadLink.click();
  }

  closeModal(): void {
    this.modalActiveService.close();
  }
}
