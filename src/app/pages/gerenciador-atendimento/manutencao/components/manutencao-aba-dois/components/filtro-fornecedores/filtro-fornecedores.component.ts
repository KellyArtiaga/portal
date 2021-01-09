import { AfterContentChecked, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import { AtendimentoStorageService } from 'src/app/core/services/atendimento-storage.service';
import { ConsultaCepService } from 'src/app/core/services/consulta-cep.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { EnderecoMV } from 'src/app/shared/interfaces/endereco.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-filtro-fornecedores',
  templateUrl: './filtro-fornecedores.component.html',
  styleUrls: ['./filtro-fornecedores.component.scss']
})
export class FiltroFornecedoresComponent implements OnInit, AfterContentChecked {

  @Input() callPesquisar: Function;

  form: FormGroup;

  ufs = [] as Array<any>;
  cidades = [] as Array<any>;

  disablePesquisa: boolean;

  alreadyChecked: boolean;
  enderecoFornecedorEdicao: any;
  semAgendamentoParada: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private consultaCepService: ConsultaCepService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  ngAfterContentChecked(): void {
    if (!this.alreadyChecked) {
      this.preencherCEPEdicao();
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      'planoManutencaoId': [0, Validators.compose([])],
      'veiculoId': ['', Validators.compose([])],
      'cep': ['', Validators.compose([])],
      'endereco': ['', Validators.compose([])],
      'uf': ['', Validators.compose([Validators.required])],
      'cidade': ['', Validators.compose([])],
      'municipioId': ['', Validators.compose([Validators.required])],
      'latitude': ['', Validators.compose([])],
      'longitude': ['', Validators.compose([])],
      'listaServicos': ['', Validators.compose([])],
      'fornecedor24Horas': [false, Validators.compose([])],
      'isencao': [false, Validators.compose([])],
      'segmentoNegocioId': [false, Validators.compose([])],
      'tipoManutencao': [false, Validators.compose([])]
    });

    this.form.get('cidade').disable();
    this.carregarCombos();
  }

  carregarCombos() {
    const _this = this;

    _this.getUFs();

    _this.form.get('cidade').valueChanges.pipe(
      tap(() => _this.form.get('cidade').value && _this.form.get('cidade').value.length >= 3),
      debounceTime(300),
      startWith(''),
    ).subscribe(value => {
      if (!value || (typeof value === 'string' && value.length < 3)) {
        _this.cidades = [];
        _this.form.get('municipioId').setValue(null);
        return;
      }

      if (typeof _this.form.get('cidade').value === 'string') {
        const selectedUf = _this.form.get('uf').value;
        _this.consultaCepService.getAllMunicipio({ uf: selectedUf.uf, cidade: value }).subscribe(res => {
          if (res.data.length === 0) {
            _this.form.get('municipioId').setValue(null);
            _this.snackBarService.open(_this.translateService.instant('PORTAL.MSG_CIDADE_NOT_FOUND'), 3500, 'X');
          }

          _this.cidades = res.data;
        }, res => {
          _this.snackBarService.error(res.error.message || _this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      } else if (_this.form.get('cidade').value) {
        _this.form.get('municipioId').setValue(_this.form.get('cidade').value.id);
      }
    });
  }

  preencherCEPEdicao() {
    const _this = this;

    if (_this.enderecoFornecedorEdicao) {
      _this.enderecoFornecedorEdicao = _this.enderecoFornecedorEdicao.split(',');
      const cep = _this.enderecoFornecedorEdicao[_this.enderecoFornecedorEdicao.length - 1];
      if (cep.trim()) {
        _this.form.get('cep').setValue(cep.trim());
        _this.changeCEP({
          target: {
            value: cep.trim()
          }
        });
        this.alreadyChecked = true;
      } else if (AtendimentoStorageService.atendimento) {
        this.montarEnderecoEdicaoDatasParada(AtendimentoStorageService.atendimento);
        this.alreadyChecked = true;
      }
    } else if (AtendimentoStorageService.atendimento) {
      this.montarEnderecoEdicaoDatasParada(AtendimentoStorageService.atendimento);
      this.alreadyChecked = true;
    }
  }

  getUFs(): void {
    const _this = this;

    _this.consultaCepService.getAllUF().subscribe(res => {
      _this.ufs = res.data;
    }, res => {
      _this.snackBarService.error(res.error.message, 3500, 'X');
    });
  }

  enableInputCidade(nomeCidade?: string): void {
    this.form.get('cidade').enable();

    const selectedUf = this.form.get('uf').value;
    if (selectedUf) {
      this.consultaCepService.getAllMunicipio({ uf: selectedUf.uf, cidade: nomeCidade }).subscribe(res => {
        if (res.data.length === 0) {
          this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CIDADE_NOT_FOUND'), 3500, 'X');
          return;
        }

        this.cidades = res.data;

        if (res.data.length === 1) {
          this.form.get('cidade').setValue(this.cidades[0]);
        }
      }, res => {
        this.snackBarService.error(res.error.message || this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }
  }

  preencherBairro(): void {
    if (!this.form.get('cep').value && (!this.form.get('endereco').value
      || this.form.get('endereco').value.toUpperCase() === 'CENTRO')) {
      this.form.get('endereco').setValue('CENTRO');

      const endereco = {} as EnderecoMV;
      endereco.bairro = this.form.get('endereco').value;
      endereco.cidade = this.form.get('cidade').value.municipio || this.form.get('cidade').value;
      endereco.uf = this.form.get('uf').value.uf;

      this.montarEndereco(endereco);
    }
  }

  changeCEP(event) {
    const cep = Util.removeSpecialCharacters(event.target.value);

    if (cep.length === 8) {
      if (!Util.validarCEP(cep)) {
        this.form.controls['cep'].setErrors({ 'incorrect': true });
        this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CEP_INVALIDO'), 3500, 'X');
        return;
      }
      this.form.controls['cep'].setErrors(null);

      this.consultaCepService.getEnderecoByCep(cep).subscribe(
        res => {
          if (!res.data || res.data.length === 0) {
            if (this.enderecoFornecedorEdicao) {
              const endereco = this.montarEnderecoEdicao(this.enderecoFornecedorEdicao);
              this.montarEndereco(endereco);
              return;
            }
            this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CEP_INVALIDO'), 3500, 'X');
            return;
          }

          this.montarEndereco(res.data);
        }, err => {
          this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CEP_INVALIDO'), 3500, 'X');
        }
      );
    }
  }

  montarEndereco(endereco: EnderecoMV): void {
    this.getMunicipioId(endereco);
    this.getCoord(endereco);

    if (endereco.logradouro) {
      this.form.get('endereco').setValue(endereco.logradouro || '');
      this.form.get('endereco').setValue(
        (this.form.get('endereco').value ? this.form.get('endereco').value + ' ' : '') + (endereco.bairro || ''));
    }
    if (endereco['ufId']) {
      this.form.get('uf').setValue(this.ufs.find(item => +item.id === +endereco['ufId']));
    } else if (endereco['ufId']) {
      this.form.get('uf').setValue(this.ufs.find(item => item.uf === endereco['uf']));
    }

    this.enableInputCidade(endereco.cidade);
  }

  montarEnderecoEdicao(enderecoText: Array<string>): EnderecoMV {
    const endereco = {} as EnderecoMV;
    if (enderecoText && enderecoText.length > 0) {
      endereco.logradouro = enderecoText[0] ? enderecoText[0].trim() : null;
      endereco.numero = enderecoText[1] ? +enderecoText[1].trim() : null;
      endereco.complemento = enderecoText[2] ? enderecoText[2].trim() : null;
      endereco.bairro = enderecoText[3] ? enderecoText[3].trim() : null;
      endereco.cidade = enderecoText[4] ? enderecoText[4].trim() : null;
      endereco.uf = enderecoText[5] ? enderecoText[5].trim() : null;
      endereco.cep = enderecoText[6] ? enderecoText[6].trim() : null;
    }

    return endereco;
  }

  montarEnderecoEdicaoDatasParada(atendimento): void {
    this.form.get('endereco').setValue(atendimento.enderecoLocalCliente);
    this.form.get('uf').setValue(this.ufs.find(item => item.uf === atendimento.uf));

    const cidade = this.form.get('cidade');
    this.cidades = [];
    cidade.reset();

    this.enableInputCidade(atendimento.municipio);
  }

  getCoord(endereco: EnderecoMV): void {
    // Foi a firma que mandou
    endereco.cep = null;

    this.consultaCepService.getLatLng(endereco).subscribe(res => {
      if (res.results) {
        const localizacao = res.results[0].geometry;
        this.form.get('latitude').setValue(localizacao.location.lat);
        this.form.get('longitude').setValue(localizacao.location.lng);
      }
    }, res => {
      this.snackBarService.error(res.error.message, 3500);
    });
  }

  getMunicipioId(endereco: any): void {
    this.consultaCepService.getAllMunicipio(endereco).subscribe(res => {
      this.form.get('municipioId').setValue(res.data[0].id);
    }, res => {
      this.snackBarService.error(res.error.message, 3500);
    });
  }

  displayCidade(cidade: any) {
    if (cidade) {
      return cidade['municipio'];
    }
  }

  validarForm() {
    if (!this.form.valid) {
      this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return false;
    }

    return true;
  }

  pesquisar() {
    this.validarForm();
    this.callPesquisar(this.form);
  }

}
