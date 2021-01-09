import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, startWith, tap } from 'rxjs/operators';

import { BarraNavegacaoService } from '../../../../../core/services/barra-navegacao.service';
import { CategoriaHabilitacaoService } from '../../../../../core/services/categoria-habilitacao.service';
import { ConsultaCepService } from '../../../../../core/services/consulta-cep.service';
import { ReloadListasService } from '../../../../../core/services/reload-listas.service';
import { SnackBarService } from '../../../../../core/services/snack-bar.service';
import { CategoriaHabilitacaoMV } from '../../../../../shared/interfaces/categoria-habilitacao.model';
import { UnidadeFederacaoMV } from '../../../../../shared/interfaces/unidade-federacao.model';
import { Util } from '../../../../../shared/util/utils';
import * as moment from 'moment';
import { includes } from 'lodash';

@Component({
  selector: 'app-usuario-condutor-habilitacao',
  templateUrl: './usuario-condutor-habilitacao.component.html',
  styleUrls: ['./usuario-condutor-habilitacao.component.scss']
})
export class UsuarioCondutorHabilitacaoComponent implements OnInit {
  @Input() formValue: any;

  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('inputCidadeEmissor') cidadeEmissorField: ElementRef;

  public imagePath;

  formHabilitacao: FormGroup;
  cidadeEmissorHab = new FormControl();

  imgURL: any;
  cidades: any[];
  filteredCidades: any[];

  categorias: CategoriaHabilitacaoMV[];

  datePattern = 'DD/MM/YYYY';
  public message: string;

  ufs: UnidadeFederacaoMV[];

  constructor(
    private formBuilder: FormBuilder,
    private barraNavegacao: BarraNavegacaoService,
    private categoriaService: CategoriaHabilitacaoService,
    private snackBar: SnackBarService,
    private consultaCEP: ConsultaCepService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.criaForm();
    this.getCategorias();
    this.getUFs();

    this.cidadeEmissorHab.valueChanges.pipe(
      tap(() => this.cidadeEmissorHab.value && this.cidadeEmissorHab.value.length >= 3),
      debounceTime(100),
      startWith(''),
    ).subscribe(value => {
      if (!value || value.length < 3) {
        this.filteredCidades = [];
        return;
      }

      if (typeof this.cidadeEmissorHab.value === 'string') {
        const selectedUf = this.formHabilitacao.get('ufEmissor').value;
        this.consultaCEP.getAllMunicipio({ uf: selectedUf.uf, cidade: value }).subscribe(res => {
          if (res.data.length === 0) {
            this.snackBar.open(this.translate.instant('PORTAL.MSG_CIDADE_NOT_FOUND'), 7000, 'X');
          }
          this.filteredCidades = res.data;
        }, res => {
          this.snackBar.error(res.error.message || this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      } else {
        this.formHabilitacao.get('municipioEmissorId').setValue(this.cidadeEmissorHab.value.id);
      }
    });

    this.formHabilitacao.statusChanges.subscribe(value => {
      if (this.barraNavegacao.get().aba !== 3) {
        return;
      }

      const prosseguir = typeof this.cidadeEmissorHab.value !== 'string' && value === 'VALID';

      this.barraNavegacao.habilitar('prosseguir', prosseguir);
      this.barraNavegacao.validar('habilitacao', prosseguir);
    });

    ReloadListasService.get('habilitacao').subscribe(data => {
      if (!this.formHabilitacao.get('municipioEmissorId').value) {
        window.scroll(0, 0);
        this.cidadeEmissorField.nativeElement.focus();
      }

      Util.validateAllFormFields(this.formHabilitacao);

      this.validarDatas();

      this.barraNavegacao.concatUserData(this.formHabilitacao.value);
    });

    ReloadListasService.get('resetHabilitacao').subscribe(data => {
      this.formHabilitacao.reset();
    });

    setTimeout(() => {
      this.setEditionValues();
    }, 1000);
  }

  private validarDatas(): boolean {
    let primeiraHabilitacao = this.formHabilitacao.get('dataPrimeiraHabilitacao').value;
    let emissao = this.formHabilitacao.get('dataEmissao').value;
    let validade = this.formHabilitacao.get('dataValidade').value;


    primeiraHabilitacao = primeiraHabilitacao ? new Date(primeiraHabilitacao).getTime() : new Date().getTime();
    emissao = emissao ? new Date(emissao).getTime() : new Date().getTime();
    validade = validade ? new Date(validade).getTime() : new Date().getTime();

    if (primeiraHabilitacao > emissao || primeiraHabilitacao > validade) {
      this.snackBar.open(this.translate.instant('PORTAL.ERROR_DATA_1_HABILITACAO'), 3500, 'X');
      this.formHabilitacao.get('dataPrimeiraHabilitacao').setErrors({ incorrect: true });
      return false;
    } else {
      this.formHabilitacao.get('dataPrimeiraHabilitacao').setErrors(null);
    }

    if (emissao < primeiraHabilitacao) {
      this.snackBar.open(this.translate.instant('PORTAL.ERROR_DATA_EMISSAO'), 3500, 'X');
      this.formHabilitacao.get('dataEmissao').setErrors({ incorrect: true });
      return false;
    } else {
      this.formHabilitacao.get('dataEmissao').setErrors(null);
    }

    if (validade < primeiraHabilitacao || validade < emissao) {
      this.snackBar.open(this.translate.instant('PORTAL.ERROR_DATA_VALIDADE'), 3500, 'X');
      this.formHabilitacao.get('dataValidade').setErrors({ incorrect: true });
      return false;
    } else {
      this.formHabilitacao.get('dataValidade').setErrors(null);
    }

    return true;
  }

  preview(files: any): void {
    if (!files) {
      return;
    }

    const file = files.target.files[0];
    const mimeType = file.type;

    if (mimeType.match(/image\/*/) == null) {
      this.snackBar.open('Somente imagens são permitidas', 3500);
      return;
    }

    const input = new FormData();
    const descricaoArquivo = `cnh.${file.type.split('/')[1]}`;
    let fileToUpload: File;

    fileToUpload = file;
    input.append('file', fileToUpload, descricaoArquivo);

    const doc = {
      descricao: descricaoArquivo,
      fileFormData: input,
    };

    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.barraNavegacao.setCondutorCNH(doc);
      this.imgURL = reader.result;
    };
  }

  removeImage(): void {
    this.imgURL = null;
    this.fileInput.nativeElement.value = null;

    if (this.barraNavegacao.getCondutorCNH() && this.barraNavegacao.getCondutorCNH()['id']) {
      this.barraNavegacao.editedCNHId = this.barraNavegacao.getCondutorCNH()['id'];
    }

    this.barraNavegacao.setCondutorCNH(null);
  }

  getDataMaxEmissao() {
    return new Date();
  }

  getDataMinEmissao() {
    return this.formHabilitacao.get('dataPrimeiraHabilitacao').value;
  }

  getDate(): any {
    if (this.formHabilitacao.get('dataEmissao').value) {
      return this.formHabilitacao.get('dataEmissao').value;
    }
    return new Date();
  }

  criaForm(): void {
    this.formHabilitacao = this.formBuilder.group({
      numeroRegistro: ['', Validators.compose([])],
      habilitacaoCategoriaId: ['', Validators.compose([])],
      dataValidade: ['', Validators.compose([])],
      dataPrimeiraHabilitacao: ['', Validators.compose([])],
      ufEmissor: ['', Validators.compose([])],
      municipioEmissorId: ['', Validators.compose([])],
      dataEmissao: ['', Validators.compose([])],
      observacoes: ['', Validators.compose([])]
    });

    if (this.barraNavegacao.getCondutorCNH()) {
      this.imgURL = this.barraNavegacao.getCondutorCNH()['safeURL'];
    }
    this.cidadeEmissorHab.disable();
  }

  display(cidade: any) {
    if (cidade) {
      return cidade['municipio'];
    }
  }

  getCategorias(): void {
    this.categoriaService.getAll().subscribe(res => {
      this.categorias = res.data.results;
    }, res => {
      this.snackBar.error(res.error.message, 7000, 'X');
    });
  }

  getUFs(): void {
    this.consultaCEP.getAllUF().subscribe(res => {
      this.ufs = res.data;
    }, res => {
      this.snackBar.error(res.error.message, 7000, 'X');
    });
  }

  setEditionValues(): void {
    if (!this.ufs) {
      setTimeout(() => {
        this.setEditionValues();
      }, 200);
      return;
    }

    if (this.formValue && this.formValue.habilitacao) {
      const dados = this.formValue.habilitacao;

      this.formHabilitacao.get('numeroRegistro').setValue(dados.numeroRegistro);
      this.formHabilitacao.get('habilitacaoCategoriaId').setValue(dados.habilitacaoCategoriaId);
      this.formHabilitacao.get('dataValidade').setValue(dados.dataValidade ? new Date(dados.dataValidade) : null);
      this.formHabilitacao.get('dataPrimeiraHabilitacao').setValue(dados.dataPrimeiraHabilitacao
        ? new Date(dados.dataPrimeiraHabilitacao) : null);
      this.formHabilitacao.get('dataEmissao').setValue(dados.dataEmissao ? new Date(dados.dataEmissao) : null);
      this.formHabilitacao.get('municipioEmissorId').setValue(this.getDadosUF(dados) ? this.getDadosUF(dados).id : null);
      this.formHabilitacao.get('ufEmissor').setValue(this.getDadosUF(dados) ? this.getDadosUF(dados) : null);
      this.formHabilitacao.get('observacoes').setValue(dados.observacoes);

      this.cidadeEmissorHab.setValue(dados.ufEmissor);

      setTimeout(() => {
        this.barraNavegacao.validar('habilitacao', this.formHabilitacao.valid);
      }, 250);
    }
  }

  getDadosUF(dados): any {
    if (!dados || !dados.ufEmissor) {
      return;
    }
    return this.ufs[this.ufs.findIndex(uf => uf.uf === dados.ufEmissor.uf)];
  }

  enableInputCidade(): void {
    this.filteredCidades = [];

    this.cidadeEmissorHab.reset();
    this.cidadeEmissorHab.enable();
    this.formHabilitacao.get('municipioEmissorId').setValue(null);
  }

  applyDataMascara(value, field) {
    const date = value.split('');

    if (date.length >= 8 && !includes(date, '/')) {
      value = value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
      const newDate = moment(value, 'DD/MM/YYYY').toDate();
      this.formHabilitacao.get(field).setValue(newDate);
    } else {
      this.formHabilitacao.get(field).setValue(null);
    }
    if (date.length === 10) {
      const newDate = moment(value, 'DD/MM/YYYY').toDate();
      this.formHabilitacao.get(field).setValue(newDate);
    }

    this.validarDatas();
    this.onChangeMethod(field);
  }

  onChangeMethod(field: any) {
    if (typeof field.onChangeMethod !== 'undefined') {
      field.onChangeMethod(this.formHabilitacao);
    }
  }

  regexMethod(paramsObj) {
    this.regexLetras(paramsObj.value, paramsObj.type);
  }

  regexLetras(value, type) {
    if (/[a-zA-Z]/.test(value)) {
      this.formHabilitacao.get(type).setValue(null);
    }
  }

  validarDateInput(textDate: string): boolean {
    if (!moment(textDate, this.datePattern).isValid()) {
      return false;
    }
    return true;
  }
}
