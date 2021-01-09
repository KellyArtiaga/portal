import { AfterContentChecked, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import { AtendimentoStorageService } from 'src/app/core/services/atendimento-storage.service';
import { ConsultaCepService } from 'src/app/core/services/consulta-cep.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { EnderecoMV } from 'src/app/shared/interfaces/endereco.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-filtro-fornecedores',
  templateUrl: './filtro-fornecedores.component.html',
  styleUrls: ['./filtro-fornecedores.component.scss']
})
export class FiltroFornecedoresComponent implements OnInit, AfterContentChecked {

  @Input() callPesquisar: Function;

  @Input() habilitaSalvar: any;

  form: FormGroup;

  ufs = [] as Array<any>;
  cidades = {
    data: [] as Array<any>,
    filteredData: [] as Array<any>
  };

  disablePesquisa: boolean;

  enderecoFornecedorEdicao: any;
  alreadyChecked: boolean;
  cepAnterior: Number;

  constructor(
    private formBuilder: FormBuilder,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private consultaCepService: ConsultaCepService,
    private userContextService: UserContextService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  ngAfterContentChecked(): void {
    if (this.cepAnterior !== this.getRac().cepLoja) {
      this.preencherCEPEdicao();
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      'planoManutencaoId': [0, Validators.compose([])],
      'veiculoId': ['', Validators.compose([])],
      'cep': ['', Validators.compose([])],
      'endereco': ['', Validators.compose([])],
      'uf': ['', Validators.compose([])],
      'cidade': ['', Validators.compose([])],
      'municipioId': ['', Validators.compose([])],
      'latitude': ['', Validators.compose([])],
      'longitude': ['', Validators.compose([])],
      'listaServicos': ['', Validators.compose([])],
      'fornecedor24Horas': [false, Validators.compose([])],
      'isencao': [false, Validators.compose([])],
      'loja': ['', Validators.compose([])],
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
        _this.cidades.data = [];
        _this.cidades.filteredData = [];
        return;
      }

      if (typeof _this.form.get('cidade').value === 'string') {
        const selectedUf = _this.form.get('uf').value;
        _this.consultaCepService.getAllMunicipio({ uf: selectedUf.uf, cidade: value }).subscribe(res => {
          if (res.data.length === 0) {
            _this.snackBarService.open(_this.translateService.instant('PORTAL.MSG_CIDADE_NOT_FOUND'), 3500, 'X');
          }

          _this.cidades.data = res.data;
          _this.cidades.filteredData = _this.cidades.data;
        }, res => {
          _this.snackBarService.error(res.error.message || _this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      } else {
        _this.form.get('municipioId').setValue(_this.form.get('cidade').value.id);
      }
    });
  }

  preencherCEPEdicao() {
    const _this = this;
    const cepLoja = _this.getRac().cepLoja;
    const siglaLoja = _this.getRac().siglaLoja;
    _this.form.get('cep').setValue(cepLoja);
    _this.form.get('loja').setValue(siglaLoja);
    _this.changeCEP({
      target: {
        value: cepLoja
      }
    });
    this.cepAnterior = cepLoja;
    this.alreadyChecked = true;
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
    const cidade = this.form.get('cidade');
    this.cidades.data = [];
    this.cidades.filteredData = [];
    cidade.reset();
    cidade.enable();

    const selectedUf = this.form.get('uf').value;
    if (selectedUf) {
      this.consultaCepService.getAllMunicipio({ uf: selectedUf.uf, cidade: nomeCidade }).subscribe(res => {
        if (res.data.length === 0) {
          this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CIDADE_NOT_FOUND'), 3500, 'X');
          return;
        }

        this.cidades.data = res.data;
        this.cidades.filteredData = this.cidades.data;

        if (res.data.length === 1) {
          this.form.get('cidade').setValue(this.cidades.data[0]);
        }

      }, res => {
        this.snackBarService.error(res.error.message || this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }
  }

  preencherBairro(): void {
    if (!this.form.get('cep').value && !this.form.get('endereco').value) {
      this.form.get('endereco').setValue('CENTRO');
    }
  }

  changeCEP(event) {
    const cep = Util.removeSpecialCharacters(event.target.value);

    if (cep.length === 8) {
      if (!Util.validarCEP(cep)) {
        this.form.controls['cep'].setErrors({ 'incorrect': true });
        return;
      }
      this.form.controls['cep'].setErrors(null);

      this.consultaCepService.getEnderecoByCep(cep).subscribe(
        res => {
          if (res.data.length === 0) {
            if (this.enderecoFornecedorEdicao) {
              const endereco = this.montarEnderecoEdicao(this.enderecoFornecedorEdicao);
              this.montarEndereco(endereco);
              return;
            }

            return;
          }
          this.montarEndereco(res.data);
        }, err => {

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
    this.enableInputCidade(atendimento.municipio);
  }

  getCoord(endereco: EnderecoMV): void {
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
      this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return false;
    }

    return true;
  }

  pesquisar() {
    this.validarForm();
    this.callPesquisar(this.form);
  }

  getRac(): any {

    let tokenRac = this.userContextService.getTokenRac();
    if (tokenRac) {
      tokenRac = JSON.parse(tokenRac);
    }

    return tokenRac;
  }

  public salvarSemFornecedor() {
    AtendimentoStorageService.functionSalvar();
  }

}
