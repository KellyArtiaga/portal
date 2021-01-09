import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect, MatSelectChange } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { ConsultaCepService } from 'src/app/core/services/consulta-cep.service';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { EntregaDevolucaoService } from 'src/app/core/services/entrega-devolucao.service';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoEntregaDevolucaoService } from 'src/app/core/services/veiculo-entrega-devolucao.service';
import {
  ModalCondutorRetiradaVeiculoComponent,
} from 'src/app/shared/components/modal-condutor-retirada-veiculo/modal-condutor-retirada-veiculo.component';
import { ModalConfirmComponent } from 'src/app/shared/components/modal-confirm/modal-confirm.component';
import {
  ModalFornecedorAgendarComponent,
} from 'src/app/shared/components/modal-fornecedor-agendar/modal-fornecedor-agendar.component';
import { ColunasTabelaMV } from 'src/app/shared/interfaces/colunas-tabela.model';
import { DadosModalMV } from 'src/app/shared/interfaces/dados-modal.model';
import { EnderecoMV } from 'src/app/shared/interfaces/endereco.model';
import { PermissoesAcessoMV } from 'src/app/shared/interfaces/permissoes-acesso.model';
import { PostEntregaDevolucaoMV } from 'src/app/shared/interfaces/post-entrega-devolucao.model';
import { PutEntregaDevolucaoMV } from 'src/app/shared/interfaces/put-entrega-devolucao.model';
import { Util } from 'src/app/shared/util/utils';
import { EntregaDevolucaoStorageService } from 'src/app/core/services/entrega-devolucao-storage.service';

@Component({
  selector: 'app-agendar-entrega-devolucao',
  templateUrl: './agendar-entrega-devolucao.component.html',
  styleUrls: ['./agendar-entrega-devolucao.component.scss']
})
export class AgendarEntregaDevolucaoComponent implements OnInit {
  @ViewChild('inputTipo') inputTipo: MatSelect;
  @ViewChild('inputMunicipio') inputMunicipio: ElementRef;
  @ViewChild('tableVeiculos') tableVeiculos: ElementRef;

  form: FormGroup;
  formPesquisarFornecedor: FormGroup;

  email: any;

  isEditar: boolean;
  showTable = false;
  showEndereco = false;

  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centroCustos = [] as Array<any>;
  ufs = [] as Array<any>;

  municipios: any[];

  tipos = [
    {
      id: 'E',
      descricao: 'Receber 0km'
    },
    {
      id: 'D',
      descricao: 'Devolver Usado'
    },
    {
      id: 'A',
      descricao: 'Devolver Usado e Receber 0km'
    }
  ];

  fornecedoresSelecionados = [];
  veiculoToEdit = null;
  obj = [];

  id: number;
  clienteId: number;

  situacao: string;
  mensagem: string;

  constructor(
    private formBuilder: FormBuilder,
    private clientesService: ClientesService,
    private snackBarService: SnackBarService,
    private regionalService: RegionalService,
    private centroCustoService: CentroCustoService,
    private consultaCEPService: ConsultaCepService,
    private translateService: TranslateService,
    private userContext: UserContextService,
    private modalService: NgbModal,
    private router: Router,
    private dadosModalService: DadosModalService,
    private veiculoEntregaDevolucao: VeiculoEntregaDevolucaoService,
    private entregaDevolucao: EntregaDevolucaoService,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.isEditar = !!this.activeRoute.params['value'].id;

    if (this.isEditar) {
      this.id = Number(this.activeRoute.params['value'].id);
      this.situacao = this.activeRoute.params['value'].situacao;
    }

    this.createForm();
    this.initListener();
    EntregaDevolucaoStorageService.functionSalvar = this.salvar.bind(this);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      'cliente': ['', Validators.compose([Validators.required])],
      'solicitante': ['', Validators.compose([Validators.required])],
      'emailSolicitante': ['', Validators.compose([Validators.required, Validators.email])],
      'telefone': ['', Validators.compose([Validators.required])],
      'tipo': ['', Validators.compose([Validators.required])],
      'regional': [''],
      'centroCusto': ['']
    });

    this.form.get('solicitante').disable();
    this.form.get('emailSolicitante').disable();
    this.form.get('telefone').disable();

    if (this.isEditar) {
      this.form.get('cliente').disable();
      this.form.get('tipo').disable();
    } else {
      this.form.get('solicitante').setValue(this.userContext.getDados().nomeUsuario);
      this.form.get('emailSolicitante').setValue(this.userContext.getDados().email);
      this.form.get('telefone').setValue(this.userContext.getDados().telefone);
    }

    if (!this.form.get('emailSolicitante').value || !Util.validateEmail(this.form.get('emailSolicitante').value)) {
      this.form.get('emailSolicitante').enable();
    }
    if (!this.form.get('telefone').value) {
      this.form.get('telefone').enable();
    }

    this.formPesquisarFornecedor = this.formBuilder.group({
      'cep': [''],
      'endereco': [''],
      'uf': ['', Validators.compose([Validators.required])],
      'municipio': ['', Validators.compose([Validators.required])],
      'municipioId': ['', Validators.compose([Validators.required])]
    });

    this.formPesquisarFornecedor.get('municipio').disable();

    this.carregarCombos();
  }

  carregarCombos(): void {
    this.clientesService.getClienteCondutor(Number(this.userContext.getDados().condutorId)).subscribe(res => {
      this.clientes = res.data.results;

      if (!this.isEditar && this.entregaDevolucao.clienteSelecionado) {
        const cliente = this.clientes.find(item => item.clienteId === this.entregaDevolucao.clienteSelecionado);

        this.form.get('cliente').setValue(cliente);
      }

      this.regionalService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res1 => {
        this.regionais = res1.data.results;

        this.centroCustoService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res2 => {
          this.centroCustos = res2.data.results;

          if (this.isEditar) {
            this.entregaDevolucao.get(this.id, this.situacao).subscribe(res3 => {
              const agendamento = res3.data.results[0];

              this.form.get('cliente').setValue(this.clientes.find(item => item.clienteId === agendamento.clienteId));
              this.form.get('solicitante').setValue(this.userContext.getNomeUsuario());
              this.form.get('emailSolicitante').setValue(this.userContext.getDados().email);
              this.form.get('tipo').setValue(this.situacao);
              this.form.get('telefone').setValue(agendamento.telefone);

              this.showEndereco = this.situacao === 'D';

              this.form.get('emailSolicitante').disable();

              if (!this.form.get('emailSolicitante').value || !Util.validateEmail(this.form.get('emailSolicitante').value)) {
                this.form.get('emailSolicitante').enable();
              }

              this.fornecedoresSelecionados.push({
                action: true,
                condutor: agendamento.solicitante || null,
                entidadeId: agendamento.entidadeId || null,
                veiculoId: agendamento.veiculoId || null,
                placa: agendamento.placa || null,
                fornecedorId: agendamento.fornecedorId || null,
                fornecedor: agendamento.fornecedor || null,
                telefone: agendamento.telefoneFornecedor ? Util.formataTelefone(agendamento.telefoneFornecedor) : null,
                logradouro: agendamento.logradouro || null,
                data: agendamento.dataHoraAgendamento ? Util.formataData(Util.removerTimezone(agendamento.dataHoraAgendamento), 'DD/MM/YYYY HH:mm') : null,
                mensagem: agendamento.mensagem || null,
                icones: [
                  {
                    function: this.setInformacoes.bind(this),
                    info: true,
                    show: !!agendamento.mensagem,
                    svg: 'pfu-info'
                  },
                  {
                    function: this.indicarCondutorRetiradaVeiculo.bind(this),
                    label: this.translateService.instant('PORTAL.LABELS.CONDUTOR_RETIRADA_VEICULO'),
                    show: true,
                    svg: 'pfu-permittion',
                  },
                  {
                    function: this.editarVeiculoSelecionado.bind(this),
                    label: this.translateService.instant('PORTAL.LABELS.EDITAR_AGENDAMENTO'),
                    show: true,
                    svg: 'pfu-calendario-entrega-devolucao',
                  },
                  {
                    function: this.removerVeiculoSelecionado.bind(this),
                    label: this.translateService.instant('PORTAL.LABELS.EXCLUIR'),
                    show: !this.isEditar,
                    svg: 'pfu-delete'
                  }
                ]
              });

              this.showTable = true;
              this.getUFs();
            }, res3 => {
              this.snackBarService.error(res2.error.message, 3500, 'X');
            });
          } else {
            this.getUFs();
          }
        }, res2 => {
          this.snackBarService.error(res2.error.message, 3500, 'X');
        });
      }, res1 => {
        this.snackBarService.error(res1.error.message, 3500, 'X');
      });
    }, res => {
      this.snackBarService.error(res.error.message, 3500, 'X');
    });
  }

  private setInformacoes(agendamento: any): void {
    this.mensagem = agendamento.mensagem;
  }

  validarAntesDataFim(): void {
    if (this.form.get('dataFim').value) {
      if (moment(this.form.get('dataFim').value).isBefore(this.form.get('dataInicio').value)) {
        this.form.get('dataFim').setValue(null);
        this.form.get('dataFim').setErrors(null);
      }
    }
  }

  getUFs(): void {
    this.consultaCEPService.getAllUF().subscribe(res => {
      this.ufs = res.data;
    }, res => {
      this.snackBarService.error(res.error.message, 3500, 'X');
    });
  }

  enableInputMunicipio(): void {
    const municipio = this.formPesquisarFornecedor.get('municipio');

    this.municipios = [];

    municipio.reset();
    municipio.enable();
  }

  preencherBairro(): void {
    if (!this.formPesquisarFornecedor.get('cep').value && !this.formPesquisarFornecedor.get('endereco').value) {
      this.formPesquisarFornecedor.get('endereco').setValue('CENTRO');
    }
  }

  changeCEP(event: any): void {
    const cep = Util.removeSpecialCharacters(event.target.value);

    if (cep.length === 8) {
      if (!Util.validarCEP(cep)) {
        this.formPesquisarFornecedor.controls['cep'].setErrors({ 'incorrect': true });
        this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CEP_INVALIDO'), 3500, 'X');
        return;
      }
      this.formPesquisarFornecedor.controls['cep'].setErrors(null);

      this.consultaCEPService.getEnderecoByCep(cep).subscribe(res => {
        if (res.data.length === 0) {
          this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CEP_INVALIDO'), 3500, 'X');
          return;
        }
        this.municipios = [];
        this.consultaCEPService.getAllMunicipio({ uf: res.data.uf, cidade: res.data.cidade }).subscribe(res1 => {
          this.municipios = res1.data;
          this.montarEndereco(res.data);
        }, res1 => {
          this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CEP_INVALIDO'), 3500, 'X');
        });
      }, err => {
        this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CEP_INVALIDO'), 3500, 'X');
      });
    }
  }

  montarEndereco(endereco: EnderecoMV): void {
    const idxUf = this.ufs.findIndex(item => item.id === endereco.ufId);

    this.formPesquisarFornecedor.get('endereco').setValue(endereco.logradouro || '');
    this.formPesquisarFornecedor.get('uf').setValue(this.ufs[idxUf] || '');
    this.formPesquisarFornecedor.get('municipio').setValue(this.municipios[0] || '');
    this.formPesquisarFornecedor.get('municipioId').setValue(endereco.cidadeId || '');
  }


  displayMunicipio(municipio: any): string {
    if (municipio) {
      return municipio['municipio'];
    }
  }

  pesquisarFornecedor(): void {
    if (!this.form.get('cliente').value) {
      this.form.get('cliente').markAsTouched({ onlySelf: true });
      this.form.get('cliente').setErrors({ incorrect: true });
      this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }

    if (!this.form.get('tipo').value) {
      if (this.inputTipo) {
        this.inputTipo.focus();
      }

      this.form.get('tipo').markAsTouched({ onlySelf: true });
      this.form.get('tipo').setErrors({ incorrect: true });
      this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }

    if (!this.isEditar && this.showEndereco && !this.formPesquisarFornecedor.valid) {
      if (typeof this.formPesquisarFornecedor.get('municipio').value === 'string') {
        this.inputMunicipio.nativeElement.focus();
        this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO_MUNICIPIO'), 3500, 'X');
      } else {
        this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      }
      return;
    }

    if (this.form.get('tipo').value === 'D') {
      let logradouro = null;

      if (!this.formPesquisarFornecedor.get('endereco').value) {
        logradouro = 'CENTRO';
        this.formPesquisarFornecedor.get('endereco').setValue('CENTRO');
      } else {
        logradouro = this.formPesquisarFornecedor.get('endereco').value;
      }

      const cidade = typeof this.formPesquisarFornecedor.get('municipio').value === 'string' ?
        this.formPesquisarFornecedor.get('municipio').value :
        this.formPesquisarFornecedor.get('municipio').value.municipio;

      const filtroLatLng = {
        logradouro: this.isEditar ? this.fornecedoresSelecionados[0].logradouro : logradouro,
        cidade: cidade,
        uf: this.formPesquisarFornecedor.get('uf').value.uf
      };

      this.consultaCEPService.getLatLng(filtroLatLng).subscribe(res => {
        const coordenadas = res.results[0].geometry.location;

        coordenadas.uf = this.formPesquisarFornecedor.get('uf').value.uf;
        coordenadas.municipio = cidade;
        coordenadas.municipioId = this.formPesquisarFornecedor.get('municipioId').value;

        this.openModalFornecedores(true, coordenadas);
      }, res => {
        this.snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    } else {
      this.openModalFornecedores();
    }
  }

  private openModalFornecedores(isDevolucao?: boolean, coordenadas?: any): void {
    const modal = this.modalService.open(ModalFornecedorAgendarComponent, { size: 'lg' });

    if (isDevolucao) {
      modal.componentInstance.coordenadasFornecedor = coordenadas;
    }
    modal.componentInstance.isEditar = this.isEditar;
    modal.componentInstance.clienteId = this.getClienteIdModal();
    modal.componentInstance.tipo = this.form.get('tipo').value;
    modal.componentInstance.veiculoSelecionadoTable = this.fornecedoresSelecionados;
    modal.componentInstance.veiculoToEdit = this.veiculoToEdit;

    modal.result.then(result => {
      this.showTable = false;


      if (result && result.length > 0) {
        result = result.filter((item, index) => this.fornecedoresSelecionados.indexOf(item.veiculoId) !== index);

        this.fornecedoresSelecionados = result.map(veiculo => {
          veiculo.action = true;
          veiculo.icones = [
            {
              function: this.setInformacoes.bind(this),
              info: true,
              show: !!veiculo.mensagem,
              svg: 'pfu-info'
            },
            {
              function: this.indicarCondutorRetiradaVeiculo.bind(this),
              label: this.translateService.instant('PORTAL.LABELS.CONDUTOR_RETIRADA_VEICULO'),
              show: true,
              svg: 'pfu-permittion',
            },
            {
              function: this.editarVeiculoSelecionado.bind(this),
              label: this.translateService.instant('PORTAL.LABELS.EDITAR_AGENDAMENTO'),
              show: true,
              svg: 'pfu-calendario-entrega-devolucao',
            },
            {
              function: this.removerVeiculoSelecionado.bind(this),
              label: this.translateService.instant('PORTAL.LABELS.EXCLUIR'),
              show: true,
              svg: 'pfu-delete'
            }
          ];
          return veiculo;
        });
      }

      setTimeout(() => {
        this.veiculoToEdit = null;
        this.showTable = true;
      });
    });
  }

  private indicarCondutorRetiradaVeiculo(veiculo: any): void {
    const titulo = `${this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.CONDUTOR_RETIRADA_VEICULO')} - ${veiculo.placa}`;

    const conteudoModal: DadosModalMV = {
      titulo: titulo,
      conteudo: '',
      modalMensagem: true,
      tamanhoTitulo: 'h5'
    };

    this.dadosModalService.set(conteudoModal);

    const modalCondutorRetirada = this.modalService.open(ModalCondutorRetiradaVeiculoComponent);

    modalCondutorRetirada.componentInstance.veiculo = veiculo;

    modalCondutorRetirada.result.then(result => {
      this.dadosModalService.set(null);

      if (result) {
        const index = this.fornecedoresSelecionados.findIndex(item => item.veiculoId === veiculo.veiculoId);

        if (index !== -1) {
          this.fornecedoresSelecionados[index] = result;
        }
      }

      setTimeout(() => {
        if (this.tableVeiculos) {
          this.tableVeiculos['genericTable']._forceRenderDataRows();
        }
      });
    });
  }

  private getClienteIdModal(): any {
    if (this.form.get('cliente').value && this.form.get('cliente').value.clienteId) {
      return this.form.get('cliente').value.clienteId;
    } else {
      return this.userContext.getClienteId();
    }
  }

  cancelar(): void {
    this.form.reset();
    this.router.navigateByUrl('gerenciador-frota/acompanhar-entrega-devolucao');
  }

  salvar(): void {
    Util.validateAllFormFields(this.form);

    if (!this.form.valid) {
      this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    if (this.fornecedoresSelecionados.some(item => !item.condutor)) {
      this.snackBarService.open(this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.DEFINIR_CONDUTOR_RETIRADA'), 7000, 'X');
      this.indicarCondutorRetiradaVeiculo(this.fornecedoresSelecionados.filter(item => !item.condutor)[0]);
      return;
    }

    if (this.isEditar) {
      const body = this.montarObjetoPut(this.fornecedoresSelecionados[0]);

      this.veiculoEntregaDevolucao.put(this.id, body).subscribe(res => {
        this.snackBarService.success(this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.SUCESSO_AO_SALVAR'), 7000, 'X');
        this.router.navigateByUrl('gerenciador-frota/acompanhar-entrega-devolucao');
      }, res => {
        this.snackBarService.open(this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.ERRO_AO_SALVAR'), 7000, 'X');
      });
    } else {
      if (this.form.get('tipo').value === 'A') {
        if (
          this.fornecedoresSelecionados.filter(item => item.situacao === 'Devolucao').length >
          this.fornecedoresSelecionados.filter(item => item.situacao === 'Disponível para Agendamento').length
        ) {
          this.snackBarService.open('Favor selecionar um veiculo para Entrega.', 7000, 'X');
          return;
        }
        if (
          this.fornecedoresSelecionados.filter(item => item.situacao === 'Disponível para Agendamento').length >
          this.fornecedoresSelecionados.filter(item => item.situacao === 'Devolucao').length
        ) {
          this.snackBarService.open('Favor selecionar um veiculo para Devolução.', 7000, 'X');
          return;
        }
      } else {
        if (this.fornecedoresSelecionados.length === 0) {
          this.snackBarService.open('Favor selecionar um veiculo para o Agendamento.', 7000, 'X');
          return;
        }
      }

      const body = {
        veiculosEntregaDevolucao: this.montarObjetoPost(),
        usuarioId: this.userContext.getUsuarioId()
      };

      this.veiculoEntregaDevolucao.post(body).subscribe(res => {
        this.snackBarService.success(this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.SUCESSO_AO_SALVAR'), 7000, 'X');
        this.router.navigateByUrl('gerenciador-frota/acompanhar-entrega-devolucao');
      }, res => {
        this.snackBarService.open(this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.ERRO_AO_SALVAR'), 7000, 'X');
      });
    }
  }

  private montarObjetoPost(): PostEntregaDevolucaoMV[] {
    const veiculos = this.fornecedoresSelecionados.map(item => {
      const hora = new Date(item.dataTimestamp.value).getHours();
      const minuto = new Date(item.dataTimestamp.value).getMinutes();

      const obj: PostEntregaDevolucaoMV = {
        cep: item.cep,
        clienteId: this.form.get('cliente').value.clienteId,
        dataAgendamento: item.dataTimestamp.value,
        horaAgendamento: `${hora < 10 ? `0${hora}` : hora}${minuto < 10 ? `0${minuto}` : minuto}`,
        email: this.form.get('emailSolicitante').value,
        entrega: item.situacao === 'Disponível para Agendamento',
        estado: item.estado,
        fornecedorId: item.fornecedorId,
        logradouro: item.logradouro,
        municipioId: this.formPesquisarFornecedor.get('municipioId').value || null,
        solicitante: item.condutor,
        tipo: this.form.get('tipo').value,
        telefone: this.form.get('telefone').value || null,
        veiculoId: item.veiculoId
      };

      return obj;
    });

    return veiculos;
  }

  private montarObjetoPut(veiculo: any): PutEntregaDevolucaoMV {
    const dia = new Date().setDate(veiculo.data.split(' ')[0].split('/')[0])
    const mes = new Date(dia).setMonth(Number(veiculo.data.split(' ')[0].split('/')[1]) - 1);
    const ano = new Date(mes).setFullYear(veiculo.data.split(' ')[0].split('/')[2]);
    const hora = new Date(ano).setHours(veiculo.data.split(' ')[1].split(':')[0]);
    const minutos = new Date(hora).setMinutes(veiculo.data.split(' ')[1].split(':')[1]);
    const data = new Date(minutos).setSeconds(0);

    const dataAgendamento = data;

    return {
      dataHoraAgendamento: dataAgendamento,
      tipo: this.form.get('tipo').value,
      usuarioId: Number(this.userContext.getUsuarioId()),
      cep: veiculo.cep,
      fornecedorId: veiculo.fornecedorId,
      estado: veiculo.estado,
      logradouro: veiculo.logradouro,
      municipioId: veiculo.municipioId,
      telefone: veiculo.telefone
    };
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.PLACA'),
        columnDef: 'placa',
        style: {
          minWidth: 60
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.CONDUTOR'),
        columnDef: 'condutor',
        style: {
          minWidth: 80
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.FORNECEDOR'),
        columnDef: 'fornecedor',
        style: {
          minWidth: 120
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.TELEFONE'),
        columnDef: 'telefone',
        style: {
          minWidth: 80
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.ENDERECO'),
        columnDef: 'logradouro',
        style: {
          minWidth: 120
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.DATA_PREVISAO_PARADA'),
        columnDef: 'data',
        style: {
          minWidth: 80
        }
      },
      {
        description: this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.ACOES'),
        columnDef: 'acoes',
        action: true,
        style: {
          minWidth: 160
        }
      }
    ];

    return colunas;
  }

  private editarVeiculoSelecionado(veiculo: any): void {
    this.veiculoToEdit = veiculo;
    this.pesquisarFornecedor();
  }

  private removerVeiculoSelecionado(veiculo: any): void {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.TITLE_CONFIRMAR_REMOCAO',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);

    modalConfirm.componentInstance.mensagem = 'PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.MSG_CONFIRMAR_REMOVER';
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);

      if (result) {
        this.fornecedoresSelecionados.splice(this.fornecedoresSelecionados.findIndex(item => item === veiculo), 1);
      }

      setTimeout(() => {
        if (this.tableVeiculos) {
          this.tableVeiculos['genericTable']._forceRenderDataRows();
        }
      });
    });
  }

  getPermissao(): PermissoesAcessoMV {
    return AuthService.getRouteRoles();
  }

  validateEndereco(selectionChange: MatSelectChange): void {
    this.showEndereco = selectionChange.value === 'D';
    this.formPesquisarFornecedor.reset();
    this.formPesquisarFornecedor.setErrors(null);
  }

  private initListener(): void {
    this.formPesquisarFornecedor.get('municipio').valueChanges.pipe(
      tap(() =>
        this.formPesquisarFornecedor.get('municipio').value
      ),
      debounceTime(100),
      startWith(''),
    ).subscribe(value => {
      if (!value || value.length < 3) {
        this.municipios = [];
        return;
      }

      if (typeof this.formPesquisarFornecedor.get('municipio').value === 'string') {
        const selectedUf = this.formPesquisarFornecedor.get('uf').value;
        const filter = {
          uf: selectedUf.uf,
          cidade: value
        };

        this.consultaCEPService.getAllMunicipio(filter).subscribe(res => {
          if (res.data.length === 0) {
            this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CIDADE_NOT_FOUND'), 7000, 'X');
          }
          this.municipios = res.data;
        }, res => {
          this.snackBarService.error(res.error.message || this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      } else {
        this.formPesquisarFornecedor.get('municipioId').setValue(value.id);
      }
    });
  }
}
