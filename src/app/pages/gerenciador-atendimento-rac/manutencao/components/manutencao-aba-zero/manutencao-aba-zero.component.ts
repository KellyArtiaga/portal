import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { interval } from 'rxjs';
import { debounce, filter } from 'rxjs/operators';
import { AtendimentoStorageService } from 'src/app/core/services/atendimento-storage.service';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { CondutorService } from 'src/app/core/services/condutor.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import {
  ModalEscolherTipoAtendimentoRacComponent
  // tslint:disable-next-line: max-line-length
} from 'src/app/pages/gerenciador-atendimento-rac/manutencao/components/manutencao-aba-zero/components/manutencao-aba-zero/components/modal-escolher-tipo-atendimento/modal-escolher-tipo-atendimento.component';
import { VeiculosMV } from 'src/app/shared/interfaces/veiculos.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-manutencao-aba-zero',
  templateUrl: './manutencao-aba-zero.component.html',
  styleUrls: ['./manutencao-aba-zero.component.scss']
})
export class ManutencaoAbaZeroComponent implements OnInit {

  form: FormGroup;

  cnpjs = [] as Array<any>;
  melhoresFormasContato = [] as Array<any>;
  placas: Array<VeiculosMV> = [] as Array<any>;
  placasFiltered: Array<VeiculosMV> = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCusto = [] as Array<any>;

  planosManutencaoExecutar = [] as Array<any>;
  isIsencao: boolean;

  kmAlterado: boolean;
  hideAgendamento: boolean;
  exibirFornecedores: boolean;

  hasCPF = false;
  hasEmail = false;
  atendimentoIdEdicao: number;
  placaAnterior: string;

  autoPreenchimentoKM: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private atendimentoClienteService: AtendimentoClienteService,
    private userContextService: UserContextService,
    private snackBar: SnackBarService,
    private condutorService: CondutorService,
    private translate: TranslateService,
    private clientesService: ClientesService,
    private veiculoService: VeiculoService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modal: NgbModal,
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
      'regionais': [''],
      'centrosCusto': [''],
      'kmVeiculo': ['', Validators.required],
      'ultimoPlanoExecutado': [''],
      'planoManutencaoExecutar': [''],
      'registrarAtualizacaoKm': [''],
      'segmentoNegocioId': ['']
    });

    let lastKM;

    this.form.get('kmVeiculo').valueChanges.pipe(
      debounce(() => interval(750)),
      filter(value => {
        // Evita validações em duplicidade
        if (value !== lastKM && !this.autoPreenchimentoKM) {
          lastKM = value;
          return true;
        }
        this.autoPreenchimentoKM = false;
        return false;
      })
    ).subscribe(km => {
      this.changeKM(km);
    });
  }

  private carregarCombos() {
    this.condutorService.getAllFormaContato().subscribe(response => {
      this.melhoresFormasContato = response.data;

      if (this.userContextService.getDados()) {
        if (localStorage.getItem('placaLogada')) {
          const clienteLogadoPlaca = {
            clienteId: this.userContextService.getDados().clienteId,
            cnpjCpf: this.userContextService.getDados().cpfCnpjCliente,
            nomeFantasia: this.userContextService.getDados().nomeCliente
          };

          this.cnpjs = [clienteLogadoPlaca];

          this.form.get('cliente').disable();

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
          this.clientesService.getClienteCondutorPorId(Number(this.userContextService.getDados().condutorId)).subscribe(res => {

            this.cnpjs = res.data.results;

            // Segue o FLUXO RAC
            this.preencherDadosRac();

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

  private preencherDadosRac(): void {
    if (this.getRac()) {
      const dados = this.userContextService.getDados();
      this.form.get('cliente').setValue(this.cnpjs.find(item => item.clienteId === dados.clienteId));
      setTimeout(() => {
        if (this.getRac()['placa']) {
          this.form.get('placa').setValue(this.getRac()['placa'].replace('-', ''));
        }
        this.preencherCondutorPorId(dados.condutorId);
      });
    }
  }

  /**
   * Prepara os dados para edição
   */
  prepararAtendimentoEdicao(): void {
    const queryParams = this.activatedRoute.queryParams['value'];
    if (Object.keys(queryParams).length > 0 && queryParams.atendimentoId) {
      this.carregarAtendimentoEdicao(queryParams.atendimentoId);
    }

    this.validarCNPJvsPlaca();
  }

  private carregarAtendimentoEdicao(atendimentoId: number): void {
    this.atendimentoIdEdicao = atendimentoId;

    this.atendimentoClienteService.get(atendimentoId).subscribe(res => {
      this.preencherTelaEdicao(res.data);

      if (res.data && res.data.situacao === 'ABERTO') {
        this.exibirModalSelecionarTipoAtendimento(this.form.get('veiculo').value);
        setTimeout(() => {
          document.getElementsByClassName('modal')[0]['click']();
        }, 250);
      }
    }, err => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private preencherTelaEdicao(atendimento: any) {
    AtendimentoStorageService.atendimento = atendimento;

    if (atendimento) {
      this.form.get('cliente').setValue(this.cnpjs.find(item => item.cnpjCpf === atendimento.cnpj));
      this.form.get('placa').value !== atendimento.placa ? this.form.get('placa').setValue(atendimento.placa) : (() => { })();
      this.form.get('cpfUsuario').setValue(atendimento.cpf);
      this.form.get('nomeUsuario').setValue(atendimento.motorista);
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
      AtendimentoStorageService.abaZeroForm = this.form;

      this.form.get('cliente').disable();

      // Fix
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

    if (!this.form.get('placa').value) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return false;
    }

    AtendimentoStorageService.abaZeroForm = this.form;

    this.preencherSegmentoNegocioId();

    return true;
  }

  getVeiculos(): void {
    if (this.form.get('cliente').value) {
      this.veiculoService.getAll({ clientesId: [this.form.get('cliente').value.cnpjCpf] }).subscribe(res => {
        this.placas = res.data.results;
        this.placasFiltered = this.placas;
        if (!localStorage.getItem('placaLogada')) {
          this.form.get('placa').setValue(null);
        }
      }, res => {
        this.snackBar.error(res.error.message, 3500, 'X');
      });
    }
  }

  filtrarPlaca(event: any, paste?: ClipboardEvent) {
    /*
    if (['ctrl', 'alt', 'tab', 'capslock', 'shift'].includes(event.key.toLowerCase())) {
      return;
    }
    */

    let placa: string;
    if (!!paste) {
      const pasteValue = paste.clipboardData || window['clipboardData'];

      placa = pasteValue.getData('text');
    } else {
      placa = event.target.value;
    }

    if (this.placaAnterior === placa) {
      return;
    }
    this.placaAnterior = placa;

    this.navigateTo({
      atendimentoId: null,
      tpsAt: null
    }, 0);

    if (placa && placa.length >= 7) {
      this.form.get('placa').setValue(placa);
      this.validarCNPJvsPlaca();
    }
  }

  validarCNPJvsPlaca() {
    const _this = this;
    const placa = _this.form.get('placa').value;

    const cliente = _this.form.get('cliente');
    if (!cliente.value) {
      const dados = this.userContextService.getDados();
      //cliente.setValue(this.cnpjs.find(item => item.clienteId === dados.clienteId));
      cliente.setValue({ clienteId: dados.clienteId });
    }

    if ((cliente.value && cliente.value.clienteId) && placa && placa.length >= 7) {
      _this.atendimentoClienteService.getValidarVeiculo(
        cliente.value.clienteId,
        placa
      ).subscribe(res => {
        const veiculos = res.data.results || [];

        veiculos.every(veiculo => {
          const veiculoAtual = _this.form.get('veiculo').value;
          AtendimentoStorageService.resetarAbaUm = !veiculoAtual || (veiculo.veiculoId !== veiculoAtual.veiculoId);

          if ((!_this.atendimentoIdEdicao || veiculo.atendimentoId === _this.atendimentoIdEdicao)
            && veiculo['situacaoAtendimento'] === 'A') {
            _this.carregarAtendimentoEdicao(veiculo['atendimentoId']);
            _this.form.get('veiculo').setValue(veiculo);
            return false;
          } else {
            _this.form.get('veiculo').setValue(veiculo);
          }

          if (veiculo.kmVeiculo) {
            _this.autoPreenchimentoKM = true;
            _this.changeKM(veiculo.kmVeiculo);
          }
        });

        this.preencherSegmentoNegocioId();

        _this.preencherCondutorPorId(_this.userContextService.getDados().condutorId);
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
    const placa = this.form.get('placa').value;

    if (this.form.get('cliente').value && placa && placa.length >= 7) {
      this.atendimentoClienteService.getValidarVeiculo(
        this.form.get('cliente').value.clienteId,
        placa
      ).subscribe(res => {
        const veiculos = res.data.results || [];
        veiculos.forEach(obj => {
          if (!this.atendimentoIdEdicao || obj.atendimentoId === this.atendimentoIdEdicao) {
            Util.combineObj(veiculo, obj);
            this.form.get('veiculo').setValue(veiculo);
            AtendimentoStorageService.abaZeroForm = this.form;
          }
        });
      });
    }
  }

  private exibirModalSelecionarTipoAtendimento(veiculo: any): void {
    const _this = this;
    const modal = _this.modal.open(ModalEscolherTipoAtendimentoRacComponent, { size: 'sm' });

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

      AtendimentoStorageService.abaZeroForm = _this.form;

      _this.preencherSegmentoNegocioId();

      params['atendimentoId'] = result === 's' ? null : veiculo.atendimentoId;
      params['tpsAt'] = combosParaExibir;
      _this.navigateTo(params, result === 's' ? 0 : 1);
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
      AtendimentoStorageService.abaZeroForm = _this.form;
    }, err => {
      _this.snackBar.error(err.error.message.error, 3500, 'X');
    });
  }

  validarCPF(event?: any): boolean {
    if (!Util.validarCPF(this.form.get('cpfUsuario').value)) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CPF_INVALIDO'), 3500, 'X');
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

  resetPage() {
    this.form.reset();
    this.kmAlterado = false;
    this.hideAgendamento = false;
    this.exibirFornecedores = false;
    this.form.get('kmVeiculo').enable();
  }

  changeKM(value: any) {
    const _this = this;
    _this.planosManutencaoExecutar = [];

    const veiculo = _this.form.get('veiculo').value;

    AtendimentoStorageService.abaZeroForm = _this.form;

    if (+value) {
      _this.form.get('kmVeiculo').setValue(+value);
      _this.veiculoService.getPlanoManutencao({ km: value, veiculoId: veiculo.veiculoId }).subscribe(res => {
        if (res.data.results && res.data.results[0]) {
          const planoManutencao = res.data.results[0];
          _this.form.get('registrarAtualizacaoKm').setValue(planoManutencao.registrarAtualizacaoKm);

          if (planoManutencao.id > 0) {
            AtendimentoStorageService.abaZeroForm.value['veiculo'].planoManutencaoId = planoManutencao.id;

            _this.isIsencao = planoManutencao.isencao;

            if (planoManutencao.acaoPlano === 'USER_SELECT') {
              _this.form.get('planoManutencaoExecutar').enable();
              _this.planosManutencaoExecutar.push({ id: null, descriptionPlanoManutencao: 'Selecione' });
            }

            _this.planosManutencaoExecutar.push(
              { id: planoManutencao.id, descriptionPlanoManutencao: planoManutencao.descricaoPlanoManutencao });
            _this.form.get('planoManutencaoExecutar').setValue(planoManutencao.id);
          }

          setTimeout(() => {
            const planoManutencaoExecutar = document.getElementById('planoManutencaoExecutar');
            const label = planoManutencaoExecutar.getElementsByClassName('mat-select-value-text')[0];
            if (planoManutencao.acaoPlano === 'SELECT_PAINT') {
              label.setAttribute('style', 'font-weight: bold; color: red;');
            }
          });

          _this.form.get('ultimoPlanoExecutado').setValue(planoManutencao.ultimoPlanoRealizado);

          if (planoManutencao.mensagem) {
            _this.snackBar.open(planoManutencao.mensagem, 10000, 'X');
          }
        }
        _this.kmAlterado = +value > 0;
      }, err => {
        console.log(err);
      });
    } else {
      this.hideAgendamento = false;
      this.exibirFornecedores = false;
      this.form.get('kmVeiculo').enable();
    }
  }

  private navigateTo(params: any, numeroAba: number) {
    AtendimentoStorageService.abaSelecionada = numeroAba;
    this.router.navigate(['gerenciador-atendimento-rac/manutencao'], {
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }

  getRac(): any {
    let tokenRac = this.userContextService.getTokenRac();
    if (tokenRac) {
      tokenRac = JSON.parse(tokenRac);
    }
    return tokenRac;
  }

}
