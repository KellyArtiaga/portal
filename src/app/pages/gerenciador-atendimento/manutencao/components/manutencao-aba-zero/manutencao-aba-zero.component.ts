import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AtendimentoStorageService } from 'src/app/core/services/atendimento-storage.service';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { CondutorService } from 'src/app/core/services/condutor.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoAtendimentoService } from 'src/app/core/services/veiculos-atendimentos.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import { ModalArquivosComponent } from 'src/app/shared/components/modal-arquivos/modal-arquivos.component';
import { VeiculosMV } from 'src/app/shared/interfaces/veiculos.model';
import { Util } from 'src/app/shared/util/utils';
import { ModalTipoAtendimentoComponent } from './components/modal-tipo-atendimento/modal-tipo-atendimento.component';
import { VeiculosRestritosService } from 'src/app/core/services/veiculos-restritos.service';


// tslint:disable-next-line: max-line-length
@Component({
  selector: 'app-manutencao-aba-zero',
  templateUrl: './manutencao-aba-zero.component.html',
  styleUrls: ['./manutencao-aba-zero.component.scss']
})
export class ManutencaoAbaZeroComponent implements OnInit {

  @ViewChild('placaInput') placaInput: ElementRef;

  form: FormGroup;

  clientes = [] as Array<any>;
  melhoresFormasContato = [] as Array<any>;
  placas: Array<VeiculosMV> = [] as Array<any>;
  placasFiltered: Array<VeiculosMV> = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCusto = [] as Array<any>;

  hasCPF = false;
  hasEmail = false;
  dadosControlePreventiva: any;
  atendimentoIdEdicao: number;
  placaAnterior: string;

  constructor(
    private formBuilder: FormBuilder,
    private atendimentoClienteService: AtendimentoClienteService,
    private userContextService: UserContextService,
    private snackBar: SnackBarService,
    private condutorService: CondutorService,
    private translate: TranslateService,
    private clientesService: ClientesService,
    private veiculoService: VeiculoService,
    private veiculoAtendimentoService: VeiculoAtendimentoService,
    private veiculosRestritosService: VeiculosRestritosService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.createForm();
    this.tratarURL();
  }

  tratarURL() {
    if (AtendimentoStorageService.abaSelecionada === 0 && this.activatedRoute.queryParams['value'].tpsAt) {
      this.navigateTo({
        tpsAt: null
      }, 0);
    }

    setTimeout(() => {
      this.carregarCombos();
    }, 100);
  }

  private createForm() {
    this.form = this.formBuilder.group({
      'cliente': [''],
      'placa': ['', Validators.compose([Validators.required])],
      'cpfUsuario': [''],
      'nomeUsuario': [''],
      'telefoneUsuario': [''],
      'celularUsuario': [''],
      'emailUsuario': [''],
      'melhorFormaContato': [''],
      'veiculo': ['', Validators.compose([Validators.required])],
      // 'regionais': [''],
      // 'centrosCusto': [''],
      'segmentoNegocioId': ['']
    });

    this.form.get('cliente').setValidators(Validators.compose([]));
    this.form.get('cpfUsuario').setValidators(Validators.compose([Validators.required]));
    this.form.get('nomeUsuario').setValidators(Validators.compose([Validators.required]));
    this.form.get('emailUsuario').setValidators(Validators.compose([Validators.required, Validators.email, Validators.maxLength(75)]));
    this.form.get('melhorFormaContato').setValidators(Validators.compose([Validators.required]));

    // Quando vem da tela Controle Preventiva
    if (this.activatedRoute.queryParams['value'].pesquisa) {
      this.dadosControlePreventiva = {
        placa: this.activatedRoute.queryParams['value'].placa,
        cnpjCpfCliente: this.activatedRoute.queryParams['value'].cnpjCpf,
        lastSearch: this.activatedRoute.queryParams['value'].pesquisa
      };
    }
  }

  private carregarCombos() {

    this.userContextService.setSegmentoProduto('');

    this.getVeiculos();

    this.condutorService.getAllFormaContato().subscribe(response => {

      this.getVeiculos();
      this.melhoresFormasContato = response.data;

      if (this.userContextService.getDados()) {
        if (localStorage.getItem('placaLogada')) {
          const clienteLogadoPlaca = {
            clienteId: this.userContextService.getDados().clienteId,
            cnpjCpf: this.userContextService.getDados().cpfCnpjCliente,
            nomeFantasia: this.userContextService.getDados().nomeCliente
          };

          this.clientes = [clienteLogadoPlaca];

          this.form.get('cliente').disable();
          this.form.get('placa').disable();

          this.form.get('cliente').setValue(clienteLogadoPlaca);
          this.form.get('placa').setValue(localStorage.getItem('placaLogada'));

          if (this.userContextService.getDados().cpfCondutor) {
            this.form.get('cpfUsuario').setValue(this.userContextService.getDados().cpfCondutor);
            this.cpfChange({ target: { value: this.userContextService.getDados().cpfCondutor } });
          } else {
            if (this.userContextService.getDados().condutorId) {
              this.preencherCondutorPorId(this.userContextService.getDados().condutorId);
            }
          }

          this.prepararAtendimentoEdicao();
        } else {
          this.getVeiculos();
          this.clientesService.getClienteCondutor(Number(this.userContextService.getDados().condutorId)).subscribe(res => {

            this.clientes = res.data.results;

            setTimeout(() => {
              this.prepararAtendimentoEdicao();
            }, 100);
          }, res => {
            this.snackBar.error(res.error.message, 7000, 'X');
          });
        }
      }
    }, error => {
      this.snackBar.error(error.error.message, 3500, 'X');
    });
  }

  /**
   * Prepara os dados para edição
   */
  prepararAtendimentoEdicao(): void {
    const queryParams = this.activatedRoute.queryParams['value'];
    if (Object.keys(queryParams).length > 0 && queryParams.atendimentoId) {
      this.carregarAtendimentoEdicao(queryParams.atendimentoId);
    }

    if (this.dadosControlePreventiva) {
      this.form.get('cliente').setValue(this.clientes.find(item => this.dadosControlePreventiva.cnpjCpfCliente === item.cnpjCpf));
      setTimeout(() => {
        this.form.get('placa').setValue(this.dadosControlePreventiva.placa);
        this.validarCNPJvsPlaca();
      }, 100);
    } else {
      this.validarCNPJvsPlaca();
    }
  }

  openModalImagens(atendimento: any): NgbModalRef {
    const modalInstance = this.modalService.open(ModalArquivosComponent, { size: 'lg' });
    modalInstance.componentInstance.id = atendimento.atendimentoId;
    modalInstance.componentInstance.entidadeId = 'ATENDIMENTO';
    modalInstance.componentInstance.salvarImagemAtendimento = true;
    modalInstance.componentInstance.showForm = atendimento.situacao === 'ABERTO';
    return modalInstance;
  }

  private carregarAtendimentoEdicao(atendimentoId: number): void {
    this.atendimentoIdEdicao = atendimentoId;

    this.atendimentoClienteService.get(atendimentoId).subscribe(res => {
      const atendimento = res.data;

      this.preencherTelaEdicao(atendimento);

      if (atendimento && atendimento.situacao === 'ABERTO') {
        this.exibirModalSelecionarTipoAtendimento(this.form.get('veiculo').value);
        setTimeout(() => {
          if (document.getElementsByClassName('modal') && document.getElementsByClassName('modal')[0]) {
            document.getElementsByClassName('modal')[0]['click']();
          }
        }, 250);
      }
    }, err => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private preencherTelaEdicao(atendimento: any) {
    AtendimentoStorageService.atendimento = atendimento;

    if (atendimento) {
      /*
      if (!localStorage.getItem('placaLogada')) {
        atendimento.cnpj
          && this.form.get('cliente').value !== null && this.form.get('cliente').value !== undefined
          && this.form.get('cliente').value.cnpjCpf !== atendimento.cnpj
          ? this.form.get('cliente').setValue(this.clientes.find(item => item.cnpjCpf === atendimento.cnpj)) : (() => { })();

        atendimento.placa && this.form.get('placa').value !== atendimento.placa
          ? this.form.get('placa').setValue(atendimento.placa) : (() => { })();
      }
      */

      atendimento.cpf && this.form.get('cpfUsuario').value !== atendimento.cpf
        ? this.form.get('cpfUsuario').setValue(atendimento.cpf) : (() => { })();
      atendimento.motorista && this.form.get('nomeUsuario').value !== atendimento.motorista
        ? this.form.get('nomeUsuario').setValue(atendimento.motorista) : (() => { })();
      this.form.get('telefoneUsuario').setValue(atendimento.telefone);
      this.form.get('celularUsuario').setValue(atendimento.telefone);
      this.form.get('emailUsuario').setValue(atendimento.email);

      const veiculo = {
        atendimentoId: atendimento.atendimentoId,
        veiculoId: atendimento.veiculoId,
        anoFabricacaoModelo: atendimento.anoFabricacaoModelo,
        chassi: atendimento.chassi,
        placa: atendimento.placa,
        placaReserva: atendimento.placaReserva,
        modelo: atendimento.modelo,
        manutencaoPreventiva: atendimento.preventiva,
        manutencaoCorretiva: atendimento.corretiva,
        manutencaoSinistro: atendimento.sinistro,
        semAgendamentoParada: atendimento.semAgendamentoParada
      };
      this.form.get('veiculo').setValue(veiculo);
      this.atualizarFormAbaZeroNoStorageService();

      this.form.get('cliente').disable();

      // Carregar dados extras do veículo
      this.complementarDadosVeiculo(veiculo);

      // Fix para carregar forma contato
      this.carregarFormaAtendimento(atendimento.condutorId);
    }
  }

  private carregarFormaAtendimento(condutorId: number) {
    if (condutorId) {
      this.condutorService.getById(condutorId).subscribe(res => {
        this.form.get('melhorFormaContato').setValue(res.data.condutorFormaContatoId);
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }
  }

  validarForm() {
    Util.validateAllFormFields(this.form);

    if (!this.validarTelefoneOuCelular()) {
      return;
    }

    if (!this.form.valid) {
      if (typeof this.form.get('placa').value === 'string') {
        window.scrollTo(0, 0);
        this.placaInput.nativeElement.focus();
      }

      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return false;
    }

    if (!this.validarCPF()) {
      return false;
    }

    if (!this.validarEmail()) {
      return false;
    }

    if (this.atendimentoIdEdicao) {
      this.form.get('placa').disable();
    }

    this.atualizarFormAbaZeroNoStorageService();

    this.preencherSegmentoNegocioId();

    return true;
  }

  validarTelefoneOuCelular() {
    if (!this.form.get('telefoneUsuario').value && !this.form.get('celularUsuario').value) {
      this.snackBar.open(this.translate.instant('PORTAL.MANUTENCAO.MESSAGE.CONTATO_OBRIGATORIO'), 3500, 'X');
      this.form.get('telefoneUsuario').setErrors({ incorrect: true });
      this.form.get('celularUsuario').setErrors({ incorrect: true });
      return false;
    }

    this.form.get('telefoneUsuario').setErrors(null);
    this.form.get('celularUsuario').setErrors(null);

    return true;
  }

  getVeiculos(): void {

    this.veiculosRestritosService.getAll({ clienteId: this.form.get('cliente').value.clienteId }).subscribe(res => {
      this.placas = res.data;
      this.placasFiltered = this.placas;

      if (!localStorage.getItem('placaLogada')) {
        this.form.get('placa').setValue(null);
      }
    }, err => {
      this.snackBar.error(err.error.message.error, 3500, 'X');
    });
  }

  filtrarPlaca(event) {
    if (['ctrl', 'alt', 'tab', 'capslock', 'shift'].includes(event.key.toLowerCase())) {
      return;
    }

    let placa = event.target.value;

    this.navigateTo({
      atendimentoId: null,
      tpsAt: null
    }, 0);

    if (placa && placa.length === 7) {
      this.validarCNPJvsPlaca();
    }

    if (placa) {
      placa = placa.toUpperCase();
      this.placasFiltered = this.placas.filter(item => item.placa.includes(placa));
    } else {
      this.placasFiltered = this.placas;
    }
  }

  validarCNPJvsPlaca() {
    const _this = this;
    let placa = _this.form.get('placa').value;
    let cliente = [];

    let placaSelecionada = [];

    placa = placa ? placa.toUpperCase() : '';
    placaSelecionada = this.placasFiltered.filter(item => item.placa.includes(placa));

    cliente = placaSelecionada.length > 0 ? placaSelecionada[0].cliente : null;

    if (this.placaAnterior === placa) {
      //return;
    }
    this.placaAnterior = placa;

    if ((cliente && cliente['id']) && placa && placa.length >= 7) {
      _this.atendimentoClienteService.getValidarVeiculo(
        cliente['id'],
        placa
      ).subscribe(res => {
        const veiculos = res.data.results || [];

        veiculos.every(veiculo => {
          const veiculoAtual = _this.form.get('veiculo').value;
          AtendimentoStorageService.resetarAbaUm = !veiculoAtual || (+veiculo.veiculoId !== +veiculoAtual.veiculoId);

          if ((!_this.atendimentoIdEdicao || +veiculo.atendimentoId === +_this.atendimentoIdEdicao)
            && veiculo['situacaoAtendimento'] === 'A') {
            _this.carregarAtendimentoEdicao(veiculo['atendimentoId']);
            return false;
          } else {
            _this.form.get('veiculo').setValue(veiculo);
            this.preencherSegmentoNegocioId();
          }
        });

        _this.atualizarFormAbaZeroNoStorageService();
      }, err => {
        _this.placasFiltered = _this.placas;

        // if (!localStorage.getItem('placaLogada')) {
        _this.form.get('placa').reset();
        _this.form.get('placa').setErrors({ incorrect: true });
        // }

        _this.snackBar.open(_this.translate.instant('PORTAL.MANUTENCAO.MESSAGE.' + err.error.message.error), 7000, 'X');
      });
    }
  }

  private complementarDadosVeiculo(veiculo: any): void {
    const _this = this;
    const placa = _this.form.get('placa').value;

    if (_this.form.get('cliente').value && placa && placa.length >= 7) {
      _this.atendimentoClienteService.getValidarVeiculo(
        _this.form.get('cliente').value.clienteId,
        placa
      ).subscribe(res => {
        const veiculos = res.data.results || [];
        veiculos.forEach(obj => {
          if (!_this.atendimentoIdEdicao || +obj.atendimentoId === +_this.atendimentoIdEdicao) {
            Util.combineObj(veiculo, obj);
            _this.form.get('veiculo').setValue(veiculo);
            _this.atualizarFormAbaZeroNoStorageService();
          }
        });
      });
    }
  }

  private exibirModalSelecionarTipoAtendimento(veiculo: any): void {
    const _this = this;
    const modal = _this.modalService.open(ModalTipoAtendimentoComponent, { size: 'sm' });

    modal.componentInstance.isPreventiva = veiculo.manutencaoPreventiva;
    modal.componentInstance.isCorretiva = veiculo.manutencaoCorretiva;
    modal.componentInstance.isSinistro = veiculo.manutencaoSinistro;
    modal.componentInstance.isPlacaLogada = !!localStorage.getItem('placaLogada');

    modal.result.then(result => {
      if (!result) {
        const cliente = _this.form.get('cliente').value;
        _this.atendimentoIdEdicao = null;
        _this.placasFiltered = _this.placas;
        _this.form.get('cliente').enable();
        _this.form.get('placa').enable();
        _this.placaAnterior = null;
        _this.form.reset();
        setTimeout(() => {
          _this.form.get('cliente').setValue(cliente);
          _this.navigateTo({
            atendimentoId: null
          }, 0);
        });
        return;
      }

      const params = {};
      let combosParaExibir;

      if (result === 's') {
        combosParaExibir = result;

        _this.form.get('cpfUsuario').setValue(null);
        _this.form.get('nomeUsuario').setValue(null);
        _this.form.get('telefoneUsuario').setValue(null);
        _this.form.get('celularUsuario').setValue(null);
        _this.form.get('emailUsuario').setValue(null);
        _this.form.get('melhorFormaContato').setValue(null);
        AtendimentoStorageService.reset();
      } else {
        combosParaExibir = result === 'p-c'
          && veiculo.manutencaoCorretiva
          && !veiculo.manutencaoPreventiva ? 'p-c-s'

          : result === 'p-c'
            && veiculo.manutencaoPreventiva ? 'c-s'

            : (result === 'c' || result === 'p')
              && veiculo.manutencaoCorretiva
              && !veiculo.manutencaoPreventiva ? 'p-c'

              : (result === 'c' || result === 'p')
                && veiculo.manutencaoPreventiva ? 'c'

                : result === 's' ? 's' : 'p-c-s';
      }

      // Desabilita Cliente e Placa quando é Sinistro
      _this.form.get('cliente').disable();
      _this.form.get('placa').disable();

      _this.atualizarFormAbaZeroNoStorageService();

      _this.preencherSegmentoNegocioId();

      params['atendimentoId'] = result === 's' ? null : veiculo.atendimentoId;
      params['tpsAt'] = combosParaExibir;
      _this.navigateTo(params, result === 's' ? 0 : 1);
      _this.modalService.dismissAll();
    });
  }

  private preencherSegmentoNegocioId() {
    const _this = this;
    _this.veiculoService.get(_this.form.get('veiculo').value.veiculoId).subscribe(res => {
      _this.userContextService.setSegmentoProduto(res.data.segmentoProdutoId);
      let veic = _this.form.get('veiculo').value;
      veic = Util.combineObj(veic, res.data);
      _this.form.get('veiculo').setValue(veic);
      _this.form.get('segmentoNegocioId').setValue(veic.segmentoNegocioId);
      _this.atualizarFormAbaZeroNoStorageService();
    }, err => {
      _this.snackBar.error(err.error.message.error, 3500, 'X');
    });
  }

  private atualizarFormAbaZeroNoStorageService() {
    AtendimentoStorageService.abaZeroForm = this.form;
  }

  validarCPF(event?: any): boolean {
    if (!Util.validarCPF(this.form.get('cpfUsuario').value)) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CPF_INVALIDO'), 3500, 'X');
      this.hasCPF = false;
      return false;
    }
    if (event) {
      this.cpfChange(event);
    }
    return true;
  }

  validarEmail(event?: any): boolean {
    if (!this.form.get('emailUsuario').valid) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_EMAIL_INVALIDO'), 3500, 'X');
      this.form.get('emailUsuario').setValue('');
      this.hasEmail = false;
      return false;
    }
    if (event) {
      this.emailChange(event);
    }

    return true;
  }

  private preencherCondutorPorId(id: number): void {
    this.condutorService.getById(id).subscribe(res => {
      if (res.data) {
        const condutor = res.data;
        this.form.get('nomeUsuario').setValue(condutor.nomeCondutor);
        this.form.get('telefoneUsuario').setValue(condutor.telefone || '00000000000');
        this.form.get('celularUsuario').setValue(condutor.celular || '00000000000');
        this.form.get('cpfUsuario').setValue(condutor.cpf);
        this.form.get('emailUsuario').setValue(condutor.email);
        this.form.get('melhorFormaContato').setValue(condutor.condutorFormaContatoId);
        this.hasCPF = !!condutor.cpf;
      }
    }, err => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  formatCNPJ(value) {
    return Util.formataDocumento(value);
  }

  cpfChange(event) {
    if (!this.hasEmail) {
      const cpf = event.target.value.replace(/[.-]/g, '');
      this.condutorService.get({ 'cpf': cpf }).subscribe(res => {
        if (res.data && res.data.results.length > 0) {
          const condutor = res.data.results[0];
          this.form.get('nomeUsuario').setValue(condutor.nomeCondutor);
          this.form.get('telefoneUsuario').setValue(condutor.telefone);
          this.form.get('celularUsuario').setValue(condutor.celular);
          this.form.get('emailUsuario').setValue(condutor.email);
          this.form.get('melhorFormaContato').setValue(condutor.condutorFormaContatoId);
          this.hasCPF = true;
        }
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }
  }

  emailChange(event) {
    if (!this.hasCPF) {
      this.condutorService.get({ 'email': event.target.value }).subscribe(res => {
        if (res.data && res.data.results.length > 0) {
          const condutor = res.data.results[0];
          this.form.get('cpfUsuario').setValue(condutor.cpf);
          this.form.get('nomeUsuario').setValue(condutor.nomeCondutor);
          this.form.get('telefoneUsuario').setValue(condutor.telefone);
          this.form.get('celularUsuario').setValue(condutor.celular);
          this.form.get('melhorFormaContato').setValue(condutor.condutorFormaContatoId);
          this.hasEmail = true;
        }
      }, err => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }
  }

  displayVeiculo(placa: any) {
    if (placa) {
      return placa;
    }
  }

  private navigateTo(params: any, numeroAba: number) {
    AtendimentoStorageService.abaSelecionada = numeroAba;
    this.router.navigate(['gerenciador-atendimento/manutencao'], {
      queryParams: params,
      queryParamsHandling: 'merge',
      skipLocationChange: false
    });
  }

}
