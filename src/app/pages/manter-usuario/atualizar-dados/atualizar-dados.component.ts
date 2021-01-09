import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { findIndex, includes } from 'lodash';
import * as moment from 'moment';
import { debounceTime, startWith, tap } from 'rxjs/operators';

import { ArquivoService } from '../../../core/services/arquivos.service';
import { CategoriaHabilitacaoService } from '../../../core/services/categoria-habilitacao.service';
import { CondutorService } from '../../../core/services/condutor.service';
import { ConsultaCepService } from '../../../core/services/consulta-cep.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { CategoriaHabilitacaoMV } from '../../../shared/interfaces/categoria-habilitacao.model';
import { EnderecoMV } from '../../../shared/interfaces/endereco.model';
import { Util } from '../../../shared/util/utils';

@Component({
  selector: 'app-atualizar-dados',
  templateUrl: './atualizar-dados.component.html',
  styleUrls: ['./atualizar-dados.component.scss']
})
export class AtualizarDadosComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;

  categorias: CategoriaHabilitacaoMV[];

  formAtualizarDados: FormGroup;

  imgURL: any;
  dadosCondutor: any;
  endereco: any;
  cnhCondutor: any;
  docToUpload: any;

  showForm = false;
  showDocumento = false;

  ufs = [];
  municipios = {
    data: [],
    filteredData: []
  };

  editedId: string;
  phoneMask: string;
  cellPhoneMask: string;
  entidadeId = 'CONDUTOR';

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: SnackBarService,
    private userContext: UserContextService,
    private consultaCEP: ConsultaCepService,
    private categoriaService: CategoriaHabilitacaoService,
    private condutorService: CondutorService,
    private translate: TranslateService,
    private route: Router,
    private arquivoService: ArquivoService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.criaForm();
    this.carregarUfs();
    this.carregarCategorias();
    this.carregarDados();

    this.showForm = true;
    this.docToUpload = null;
  }

  criaForm(): void {
    this.formAtualizarDados = this.formBuilder.group({
      cep: ['', Validators.compose([])],
      logradouro: ['', Validators.compose([])],
      numero: ['', Validators.compose([])],
      complemento: ['', Validators.compose([])],
      cidade: ['', Validators.compose([])],
      bairro: ['', Validators.compose([])],
      uf: ['', Validators.compose([])],
      categoriaId: ['', Validators.compose([])],
      municipioId: ['', Validators.compose([])],
      telefone: ['', Validators.compose([])],
      celular: ['', Validators.compose([])],
      numeroRegistro: ['', Validators.compose([])],
      dataValidade: ['', Validators.compose([])],
      dataEmissao: ['', Validators.compose([])],
      dataPrimeiraHabilitacao: ['', Validators.compose([])],
      ufEmissorId: ['', Validators.compose([])],
      municipioEmissor: ['', Validators.compose([])],
      municipioEmissorId: ['', Validators.compose([])],
      observacoes: ['', Validators.compose([])]
    });

    this.getCNH();
  }

  carregarUfs() {
    this.consultaCEP.getAllUF().subscribe(res => {
      this.ufs = res.data;
    }, err => {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  carregarCategorias() {
    this.categoriaService.getAll().subscribe(res => {
      this.categorias = res.data.results;
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  carregarDados() {
    this.filtrarMunicipioEmissor();

    this.condutorService.getById(this.userContext.getDados().condutorId).subscribe(res => {
      this.dadosCondutor = res.data;

      if (this.dadosCondutor.telefone) {
        this.phoneMask = this.dadosCondutor.telefone.length <= 8 ? '0000-0000' : '(00) 0000-0000';
      } else {
        this.phoneMask = '(00) 0000-0000';
      }
      if (this.dadosCondutor.celular) {
        this.cellPhoneMask = this.dadosCondutor.celular.length <= 9 ? '00000-0000' : '(00) 00000-0000';
      } else {
        this.cellPhoneMask = '(00) 00000-0000';
      }

      this.formAtualizarDados.get('uf').disable();
      this.formAtualizarDados.get('cidade').disable();
      this.formAtualizarDados.get('municipioEmissor').disable();

      this.getDadosMunicipios(res.data);
    });
  }

  private getDadosMunicipios(dados: any): void {
    if (dados.municipioId) {
      this.consultaCEP.getMunicipio(dados.municipioId).subscribe(res2 => {
        dados.municipio = res2.data;

        if (dados.municipioEmissorId) {
          this.consultaCEP.getMunicipio(dados.municipioEmissorId).subscribe(res3 => {
            dados.municipioEmissor = res3.data;
            this.atualizaDadosCondutor(dados);
          });
        } else {
          this.atualizaDadosCondutor(dados);
        }
      });
    } else {
      if (dados.municipioEmissorId) {
        this.consultaCEP.getMunicipio(dados.municipioEmissorId).subscribe(res2 => {
          dados.municipioEmissor = res2.data;
          this.atualizaDadosCondutor(dados);
        });
      } else {
        this.atualizaDadosCondutor(dados);
      }
    }
  }

  atualizaDadosCondutor(dadosCondutor: any) {
    let uf;
    let ufEmissor;

    if (dadosCondutor.municipioId) {
      uf = this.ufs[findIndex(this.ufs, ['uf', dadosCondutor.municipio.uf])];
    }
    if (dadosCondutor.municipioEmissorId) {
      ufEmissor = this.ufs[findIndex(this.ufs, ['uf', dadosCondutor.municipioEmissor.uf])];
    }

    this.formAtualizarDados.get('cep').setValue(dadosCondutor.cep);
    this.formAtualizarDados.get('numero').setValue(dadosCondutor.numero);
    this.formAtualizarDados.get('complemento').setValue(dadosCondutor.complemento);
    this.formAtualizarDados.get('logradouro').setValue(dadosCondutor.logradouro);
    this.formAtualizarDados.get('bairro').setValue(dadosCondutor.bairro);
    this.formAtualizarDados.get('uf').setValue(dadosCondutor.municipio && dadosCondutor.municipio.uf ? dadosCondutor.municipio.uf : null);
    this.formAtualizarDados.get('cidade').setValue(dadosCondutor.municipio && dadosCondutor.municipio.municipio ? dadosCondutor.municipio.municipio : null);
    this.formAtualizarDados.get('municipioId').setValue(dadosCondutor.municipio && dadosCondutor.municipio.id ? dadosCondutor.municipio.id : null);

    this.formAtualizarDados.get('telefone').setValue(dadosCondutor.telefone);
    this.formAtualizarDados.get('celular').setValue(dadosCondutor.celular);

    this.formAtualizarDados.get('categoriaId').setValue(dadosCondutor.habilitacaoCategoriaId);
    this.formAtualizarDados.get('numeroRegistro').setValue(dadosCondutor.numeroRegistro);
    this.formAtualizarDados.get('dataValidade').setValue(this.parseDate(dadosCondutor.dataValidade));
    this.formAtualizarDados.get('dataPrimeiraHabilitacao').setValue(this.parseDate(dadosCondutor.dataPrimeiraHabilitacao));
    this.formAtualizarDados.get('dataEmissao').setValue(this.parseDate(dadosCondutor.dataEmissao));
    this.formAtualizarDados.get('observacoes').setValue(dadosCondutor.observacoes);
    this.formAtualizarDados.get('ufEmissorId').setValue(ufEmissor && ufEmissor.id ? ufEmissor.id : null);
    this.formAtualizarDados.get('municipioEmissor').setValue(dadosCondutor.municipioEmissor);
    this.formAtualizarDados.get('municipioEmissorId').setValue(dadosCondutor.municipioEmissorId || null);
  }

  enableFieldCidade(): void {
    this.formAtualizarDados.get('municipioEmissor').enable();
    this.formAtualizarDados.get('municipioEmissor').setValue(null);
    this.municipios = {
      data: [],
      filteredData: []
    };
  }

  getBodyCondutor(): any {
    const body = {};

    let dataNascimento = this.dadosCondutor.dataNascimento;

    if (dataNascimento && typeof dataNascimento === 'string') {
      dataNascimento = new Date(dataNascimento.replace('Z', '')).getTime();
    }

    body['status'] = this.dadosCondutor.status || null;
    body['nome'] = this.dadosCondutor.nomeCondutor || null;
    body['dataNascimento'] = dataNascimento || null;
    body['rg'] = this.dadosCondutor.rg || null;
    body['orgaoEmissor'] = this.dadosCondutor.orgaoEmissorRG || null;
    body['cpf'] = this.dadosCondutor.cpf || null;
    body['nomeMae'] = this.dadosCondutor.nomeMae || null;
    body['nomePai'] = this.dadosCondutor.nomePai || null;
    body['telefone'] = this.formAtualizarDados.get('telefone').value || null;
    body['celular'] = this.formAtualizarDados.get('celular').value || null;
    body['email'] = this.dadosCondutor.email || null;
    body['clienteId'] = this.dadosCondutor.clienteId || null;
    body['assinaMulta'] = this.dadosCondutor.assinaMulta || false;
    body['usuarioId'] = this.userContext.getUsuarioId();
    body['grupoEconomico'] = this.dadosCondutor.grupoEconomico;
    body['condutorFormaContatoId'] = this.dadosCondutor.condutorFormaContatoId || null;

    return body;
  }

  getBodyEndereco() {
    const body = {};

    body['cep'] = this.formAtualizarDados.get('cep').value;
    body['logradouro'] = this.formAtualizarDados.get('logradouro').value ? this.formAtualizarDados.get('logradouro').value.replace(/^\s+|\s+$/gm, '') : null;
    body['numero'] = this.formAtualizarDados.get('numero').value;
    body['complemento'] = this.formAtualizarDados.get('complemento').value;
    body['bairro'] = this.formAtualizarDados.get('bairro').value;
    body['municipioId'] = this.formAtualizarDados.get('municipioId').value;
    body['usuarioId'] = this.userContext.getUsuarioId();

    return body;
  }

  save(): void {
    if (!this.validarDatas()) {
      return;
    }
    if (!this.formAtualizarDados.valid) {
      Util.validateAllFormFields(this.formAtualizarDados);

      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    delete this.formAtualizarDados.value['categoriaId'];

    const condutorId = this.userContext.getDados().condutorId;

    this.condutorService.put(condutorId, this.getBodyCondutor()).subscribe(res => {
      this.condutorService.putEndereco(condutorId, this.getBodyEndereco()).subscribe(res1 => {
        this.condutorService.putHabilitacao(condutorId, this.getBodyHabilitacao()).subscribe(res2 => {
          if (this.editedId) {
            if (this.docToUpload) {
              this.putCNH(this.editedId, this.docToUpload);
            } else {
              this.deleteCNH(this.editedId);
            }
          } else {
            if (this.docToUpload) {
              this.postCNH(this.docToUpload);
            } else {
              this.snackBar.success(this.translate.instant('PORTAL.MSG_DADOS_ALTERADOS'), 7000);
            }
          }

          this.carregarDados();
        }, err2 => {
          this.snackBar.error('Falha ao atualizar Habilitação.', 7000);
        });
      }, err1 => {
        this.snackBar.error('Falha ao atualizar Endereço.', 7000);
      });
    }, err => {
      this.snackBar.error('Falha ao atualizar Dados Pessoais.', 7000);
    });
  }

  validarDatas(): boolean {
    let primeiraHabilitacao = this.formAtualizarDados.get('dataPrimeiraHabilitacao').value;
    let emissao = this.formAtualizarDados.get('dataEmissao').value;
    let validade = this.formAtualizarDados.get('dataValidade').value;

    primeiraHabilitacao = primeiraHabilitacao ? new Date(primeiraHabilitacao).getTime() : 0;
    emissao = emissao ? new Date(emissao).getTime() : 0;
    validade = validade ? new Date(validade).getTime() : 0;

    if (primeiraHabilitacao > emissao || primeiraHabilitacao > validade) {
      this.snackBar.open(this.translate.instant('PORTAL.ERROR_DATA_1_HABILITACAO'), 3500, 'X');
      this.formAtualizarDados.get('dataPrimeiraHabilitacao').setErrors({ incorrect: true });
      return false;
    } else {
      this.formAtualizarDados.get('dataPrimeiraHabilitacao').setErrors(null);
    }

    if (emissao < primeiraHabilitacao) {
      this.snackBar.open(this.translate.instant('PORTAL.ERROR_DATA_EMISSAO'), 3500, 'X');
      this.formAtualizarDados.get('dataEmissao').setErrors({ incorrect: true });
      return false;
    } else {
      this.formAtualizarDados.get('dataEmissao').setErrors(null);
    }

    if (validade < primeiraHabilitacao || validade < emissao) {
      this.snackBar.open(this.translate.instant('PORTAL.ERROR_DATA_VALIDADE'), 3500, 'X');
      this.formAtualizarDados.get('dataValidade').setErrors({ incorrect: true });
      return false;
    } else {
      this.formAtualizarDados.get('dataValidade').setErrors(null);
    }

    return true;
  }

  getBodyHabilitacao(): any {
    const dados = this.formAtualizarDados.value;
    const body = {
      numeroRegistro: dados.numeroRegistro,
      dataValidade: dados.dataValidade ? new Date(dados.dataValidade).getTime() : null,
      dataPrimeiraHabilitacao: dados.dataPrimeiraHabilitacao ? new Date(dados.dataPrimeiraHabilitacao).getTime() : null,
      habilitacaoCategoriaId: this.formAtualizarDados.get('categoriaId').value,
      municipioEmissorId: this.formAtualizarDados.get('municipioEmissor').value.id,
      dataEmissao: dados.dataEmissao ? new Date(dados.dataEmissao).getTime() : null,
      observacoes: this.formAtualizarDados.get('observacoes').value,
      usuarioId: Number(this.userContext.getID())
    };

    return body;
  }

  getNomeUsuario(): string {
    if (!this.userContext.getDados() || !this.userContext.getDados().nomeUsuario) {
      return '-';
    }
    return this.userContext.getDados().nomeUsuario;
  }

  getDocumento(): string {
    if (!this.userContext.getDados() || !this.userContext.getDados().cpfCondutor) {
      return '-';
    }
    return this.formataDocumento(this.userContext.getDados().cpfCondutor);
  }

  formataDocumento(str: string): string {
    if (!str) {
      return '';
    }

    return Util.formataDocumento(str);
  }

  buscarCep(str: string): void {
    if (!str) {
      return;
    }

    const cep = Util.removeSpecialCharacters(str);
    if (cep.length === 8) {
      if (!Util.validarCEP(cep)) {
        this.formAtualizarDados.controls['cep'].setErrors({ 'incorrect': true });
        this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_INVALIDO'), 3500, 'X');
        this.limparInformacoesEndereco();
        return;
      }
      this.formAtualizarDados.controls['cep'].setErrors(null);

      this.consultaCEP.getEnderecoByCep(cep).subscribe(res => {
        if (!res.data || res.data.length === 0) {
          this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_INVALIDO'), 3500, 'X');
          this.limparInformacoesEndereco();
          return;
        }

        this.montarEndereco(res.data);
      }, res => {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_CEP_NOT_FOUND'), 3500, 'X');
        this.limparInformacoesEndereco();
      });
    }
  }

  private limparInformacoesEndereco(): void {
    this.formAtualizarDados.get('logradouro').setValue('');
    this.formAtualizarDados.get('cidade').setValue('');
    this.formAtualizarDados.get('bairro').setValue('');
    this.formAtualizarDados.get('uf').setValue('');
    this.formAtualizarDados.get('municipioId').setValue('');
    this.formAtualizarDados.get('numero').setValue('');
    this.formAtualizarDados.get('complemento').setValue('');
  }

  montarEndereco(endereco: EnderecoMV): void {
    this.formAtualizarDados.get('logradouro').setValue(endereco.logradouro || '');
    this.formAtualizarDados.get('cidade').setValue(endereco.cidade || '');
    this.formAtualizarDados.get('bairro').setValue(endereco.bairro || '');
    this.formAtualizarDados.get('uf').setValue(endereco.uf || '');
    this.formAtualizarDados.get('municipioId').setValue(endereco.cidadeId || '');
  }

  parseDate(date?: any) {
    if (date) {
      if (typeof date === 'string') {
        date = date.replace('Z', '');
      }
      return new Date(date).toISOString();
    }

    return null;
  }

  filtrarMunicipioEmissor(): void {
    this.formAtualizarDados.get('municipioEmissor').valueChanges.pipe(
      tap(() =>
        this.formAtualizarDados.get('municipioEmissor').value &&
        this.formAtualizarDados.get('municipioEmissor').value.length >= 3
      ),
      debounceTime(100),
      startWith(''),
    ).subscribe(value => {
      if (!value || value.length < 3) {
        this.municipios.filteredData = [];
        return;
      }

      if (typeof this.formAtualizarDados.get('municipioEmissor').value === 'string') {
        const idxUF = this.ufs.findIndex(item => item.id === this.formAtualizarDados.get('ufEmissorId').value);
        this.consultaCEP.getAllMunicipio({ uf: this.ufs[idxUF].uf, cidade: value }).subscribe(res => {
          if (res.data.length === 0) {
            this.formAtualizarDados.get('municipioEmissor').setValue(null);
            this.formAtualizarDados.get('municipioEmissorId').setValue(null);
            this.snackBar.open(this.translate.instant('PORTAL.MSG_CIDADE_NOT_FOUND'), 7000, 'X');
          } else {
            this.municipios.data = res.data;
            this.municipios.filteredData = res.data;
          }
        }, res => {
          this.snackBar.error(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      } else {
        this.formAtualizarDados.get('municipioEmissorId').setValue(value.id);
      }
    });
  }

  display(municipio) {
    if (municipio) {
      return municipio.municipio;
    }
  }

  cancelar() {
    this.route.navigateByUrl('home');
  }

  private getCNH(): void {
    const url = this.arquivoService.recuperarArquivo();

    this.removeImage();
    this.editedId = null;

    this.arquivoService.getAll(
      this.entidadeId,
      Number(this.userContext.getCondutorId()),
      'CNH'
    ).subscribe(response => {
      if (response.data && response.data[0]) {
        response.data[0].safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(`${url}${response.data[0].href}`);
        response.data[0].href = `${url}${response.data[0].href}`;

        this.imgURL = response.data[0].safeURL;
        this.cnhCondutor = response.data[0];
      }

      this.showDocumento = true;
    }, res => {
      this.showDocumento = true;
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  onFileChange(files: any): void {
    if (!files) {
      return;
    }

    const file = files.target.files[0];
    const mimeType = file.type;

    if (mimeType.match(/image\/*/) == null) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_IMAGENS_PERMITIDAS'), 3500);
      this.fileInput.nativeElement.value = '';
      return;
    }
    if (file.size / 1000 > 3100) {
      this.snackBar.open(this.translate.instant('PORTAL.MENSAGENS.TAMANHO_INVALIDO'), 3500);
      this.fileInput.nativeElement.value = '';
      return;
    }

    const input = new FormData();
    const descricaoArquivo = `cnh.${file.type.split('/')[1]}`;
    let fileToUpload: File;

    fileToUpload = file;
    input.append('file', fileToUpload, descricaoArquivo);

    this.docToUpload = {
      descricao: descricaoArquivo,
      fileFormData: input,
    };

    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    };
  }

  removeImage(): void {
    if (this.cnhCondutor && this.cnhCondutor.id) {
      this.editedId = this.cnhCondutor.id;
    } else {
      this.editedId = null;
    }

    this.cnhCondutor = null;
    this.docToUpload = null;
    this.imgURL = null;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = null;
    }
  }

  getDataMaxHabilitacao() {
    if (!this.formAtualizarDados.get('dataEmissao').value) {
      return new Date();
    }
    return this.formAtualizarDados.get('dataEmissao').value;
  }

  getDataMaxEmissao() {
    return new Date();
  }

  getDataMinEmissao() {
    return this.formAtualizarDados.get('dataPrimeiraHabilitacao').value;
  }

  getDataMinValidade() {
    return this.formAtualizarDados.get('dataEmissao').value;
  }

  private putCNH(id: string, file: any): void {
    this.arquivoService.putArquivo(
      id,
      Number(this.userContext.getID()),
      this.entidadeId,
      Number(this.userContext.getCondutorId()),
      'CNH',
      file.descricao,
      file.fileFormData
    ).subscribe(res => {
      this.removeImage();
      this.snackBar.success(this.translate.instant('PORTAL.MSG_DADOS_ALTERADOS'), 7000, 'X');
      this.getCNH();
    }, res => {
      this.snackBar.open(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private postCNH(file: any): void {
    this.arquivoService
      .postArquivo(
        Number(this.userContext.getID()),
        this.entidadeId,
        Number(this.userContext.getCondutorId()),
        'CNH',
        file.descricao,
        file.fileFormData
      ).subscribe(res3 => {
        this.removeImage();
        this.snackBar.success(this.translate.instant('PORTAL.MSG_DADOS_ALTERADOS'), 7000, 'X');
        this.getCNH();
      }, res3 => {
        this.snackBar.open(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
  }

  private deleteCNH(id: string): void {
    this.arquivoService.deleteArquivo(id).subscribe(res4 => {
      this.removeImage();
      this.snackBar.success(this.translate.instant('PORTAL.MSG_DADOS_ALTERADOS'), 7000, 'X');
      this.getCNH();
    }, res4 => {
      this.snackBar.open(res4.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  applyDataMascara(value, field) {
    const date = value.split('');

    if (date.length >= 8 && !includes(date, '/')) {
      value = value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
      const newDate = moment(value, 'DD/MM/YYYY').toDate();
      this.formAtualizarDados.get(field).setValue(newDate);
    } else {
      this.formAtualizarDados.get(field).setValue(null);
    }
    if (date.length === 10) {
      const newDate = moment(value, 'DD/MM/YYYY').toDate();
      this.formAtualizarDados.get(field).setValue(newDate);
    }

    this.validarDatas();
    this.onChangeMethod(field);
  }

  onChangeMethod(field: any) {
    if (typeof field.onChangeMethod !== 'undefined') {
      field.onChangeMethod(this.formAtualizarDados);
    }
  }

  regexMethod(paramsObj) {
    this.regexLetras(paramsObj.value, paramsObj.type);
  }

  regexLetras(value, type) {
    if (/[a-zA-Z]/.test(value)) {
      this.formAtualizarDados.get(type).setValue(null);
    }
  }
}
