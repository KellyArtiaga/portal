import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ArquivoService } from 'src/app/core/services/arquivos.service';
import { AtendimentoStorageService } from 'src/app/core/services/atendimento-storage.service';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { TipoAtendimentoSolicitacaoService } from 'src/app/core/services/tipo-atendimento.solicitacao.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { ModalConfirmComponent } from 'src/app/shared/components/modal-confirm/modal-confirm.component';
import { DadosModalMV } from 'src/app/shared/interfaces/dados-modal.model';
import { FornecedorAtendimentoMV } from 'src/app/shared/interfaces/fornecedor-atendimento.model';
import { PostAtendimentosMV } from 'src/app/shared/interfaces/post-atendimentos.model';
import { Util } from 'src/app/shared/util/utils';
import { UnirentService } from 'src/app/core/services/unirent.service';

@Component({
  selector: 'app-manutencao',
  templateUrl: './manutencao.component.html',
  styleUrls: ['./manutencao.component.scss']
})
export class ManutencaoComponent implements OnInit {

  @ViewChild('abaZero') abaZero: ElementRef;
  @ViewChild('abaUm') abaUm: ElementRef;
  @ViewChild('abaDois') abaDois: ElementRef;

  goBackTo: string;

  veiculoApreendido: boolean;
  observacoes: string;

  siglaLoja: any;

  constructor(
    private router: Router,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private modalService: NgbModal,
    private dadosModalService: DadosModalService,
    private userContextService: UserContextService,
    private atendimentoClientesService: AtendimentoClienteService,
    private arquivoService: ArquivoService,
    private tipoAtendimento: TipoAtendimentoSolicitacaoService,
    private activatedRoute: ActivatedRoute,
    private unirentService: UnirentService
  ) { }

  ngOnInit() {
    AtendimentoStorageService.reset();
    AtendimentoStorageService.abaSelecionada = 0;
    AtendimentoStorageService.functionSalvar = this.salvar.bind(this);
    this.goBackTo = this.activatedRoute.queryParams['value']['goBackTo'];
  }

  getStorage(): any {
    return AtendimentoStorageService;
  }

  selecionarAba(event: MatTabChangeEvent) {
    AtendimentoStorageService.abaSelecionada = event.index;
  }

  getAbaAtual(): any {
    let abaAtual;

    if (AtendimentoStorageService.abaSelecionada === 0) {
      abaAtual = this.abaZero;
    } else if (AtendimentoStorageService.abaSelecionada === 1) {
      abaAtual = this.abaUm;
    } else if (AtendimentoStorageService.abaSelecionada === 2) {
      abaAtual = this.abaDois;
    }

    return abaAtual;
  }

  proxima() {
    if (this.getAbaAtual() && this.getAbaAtual()['validarForm']()) {
      AtendimentoStorageService.abaSelecionada = AtendimentoStorageService.abaSelecionada + 1;
    }
  }

  anterior() {
    if (AtendimentoStorageService.abaSelecionada > 0) {
      AtendimentoStorageService.abaSelecionada = AtendimentoStorageService.abaSelecionada - 1;
    }
  }

  resetarRac() {
    AtendimentoStorageService.abaSelecionada = 0;

    this.resetForms();
  }

  cancelar() {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.BUTTONS.BTN_CANCEL',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);
    modalConfirm.componentInstance.mensagem = 'PORTAL.MANUTENCAO.MESSAGE.CANCELAR_ABERTURA_ATENDIMENTO';
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);
      if (result) {
        this.resetarRac();
      }
    });
  }

  salvar() {
    if (AtendimentoStorageService.abaSelecionada === 2) {
      if (this.abaDois['validarForm']()) {
        AtendimentoStorageService.abaDoisForm = this.abaDois['getFormData']();

        const agendamento = AtendimentoStorageService.atendimento;
        if (agendamento) {
          this.putManutencao(agendamento.atendimentoId, this.montarObjetoParaSalvar(agendamento.atendimentoId));
        } else {
          this.postManutencao(this.montarObjetoParaSalvar());
        }
      }
    }
  }

  getFornecedorPrincipal(fornecedores: Array<FornecedorAtendimentoMV>): number {

    if (fornecedores.length === 0) {
      return null;
    }

    const sortDates = (a, b) => {
      return a.dataPrevisaoParada - b.dataPrevisaoParada;
    };

    const fornecedoresSorted = fornecedores.sort(sortDates);

    return fornecedoresSorted[0].fornecedorId;
  }

  getFormVal(form: FormGroup, field: string) {
    if (form.get(field) && form.get(field).value) {
      return form.get(field).value;
    }
    return null;
  }

  getConfirmacoes(tipo: string): boolean {
    const existe = AtendimentoStorageService.getArquivos().some(arquivo => {
      return arquivo.dadosAPICliente.tipoDocumento.descricao === tipo;
    });

    return existe;
  }

  montarObjetoParaSalvar(atendimentoId?: number): PostAtendimentosMV {

    const abaZeroForm = AtendimentoStorageService.abaZeroForm;
    const abaUmForm = AtendimentoStorageService.abaUmForm;
    const abaDoisForm = AtendimentoStorageService.abaDoisForm;
    const fornecedores = this.abaDois['getFornecedoresSelecionados']();

    let dataParadaUm = this.getFormVal(abaDoisForm, 'dataParadaUm');
    let dataParadaDois = this.getFormVal(abaDoisForm, 'dataParadaDois');
    let dataParadaTres = this.getFormVal(abaDoisForm, 'dataParadaTres');

    let horaParadaUm = null, horaParadaDois = null, horaParadaTres = null;
    if (dataParadaUm && dataParadaDois && dataParadaTres) {
      dataParadaUm = Util.removerTime(dataParadaUm);
      dataParadaDois = Util.removerTime(dataParadaDois);
      dataParadaTres = Util.removerTime(dataParadaTres);

      horaParadaUm = Util.formatarHora(this.getFormVal(abaDoisForm, 'horaParadaUm'));
      horaParadaDois = Util.formatarHora(this.getFormVal(abaDoisForm, 'horaParadaDois'));
      horaParadaTres = Util.formatarHora(this.getFormVal(abaDoisForm, 'horaParadaTres'));
    }

    const checklistServicos = [];
    const preventiva = this.getFormVal(abaUmForm, 'preventiva') || [];
    if (preventiva) {
      preventiva.forEach(servico => {
        checklistServicos.push({
          'questionarioId': servico.questionarioAtendimentoId,
          'observacao': null
        });
      });
    }

    const corretiva = this.getFormVal(abaUmForm, 'corretiva') || [];
    if (corretiva) {
      corretiva.forEach(servico => {
        checklistServicos.push({
          'questionarioId': servico.questionarioAtendimentoId,
          'observacao': null
        });
      });
    }

    const sinistro = this.getFormVal(abaUmForm, 'sinistro') || [];
    if (sinistro) {
      sinistro.forEach(servico => {
        checklistServicos.push({
          'questionarioId': servico.questionarioAtendimentoId,
          'observacao': null
        });
      });
    }

    const acessorio = [];
    const isAcessorio = corretiva.find(item => ['Acessórios (Implementos)'].includes(item.descricaoQuestionario));
    if (!!isAcessorio && this.getFormVal(abaUmForm, 'acessorio')) {
      this.getFormVal(abaUmForm, 'acessorio').forEach(item => {
        acessorio.push({
          'equipamentoId': item.equipamentoId,
          'questionarioAtendimentoId': isAcessorio.questionarioAtendimentoId,
          'descricaoEquipamento': item.descricao
        });
      });
    }

    let tipoServico;
    if (sinistro && sinistro.length > 0) {
      tipoServico = 'Sinistro';
    } else if (corretiva && corretiva.length > 0) {
      tipoServico = 'Manutenção corretiva';
    } else {
      tipoServico = 'Manutenção preventiva';
    }

    this.veiculoApreendido = this.getFormVal(abaUmForm, 'veiculoApreendido');

    this.observacoes = this.getFormVal(abaUmForm, 'complementoServicos');

    this.siglaLoja = this.getFormVal(abaUmForm, 'siglaLojaUnidas');

    const body: PostAtendimentosMV = {
      veiculoId: this.getFormVal(abaZeroForm, 'veiculo') ? this.getFormVal(abaZeroForm, 'veiculo').veiculoId : null,
      clienteId: Number(this.userContextService.getClienteId()),
      usuarioId: Number(this.userContextService.getUsuarioId()),
      km: Number(this.getFormVal(abaDoisForm, 'kmVeiculo')),
      municipioId: this.abaDois['getMunicipioCliente'](),
      motorista: this.getFormVal(abaZeroForm, 'nomeUsuario'),
      telefone: this.getFormVal(abaZeroForm, 'telefoneUsuario'),
      email: this.getFormVal(abaZeroForm, 'emailUsuario'),
      descricaoOcorridoGeral: this.getFormVal(abaUmForm, 'descricaoOcorridoGeral') + this.abaDois['getDescricaoDatasParada'](),
      checklist: checklistServicos.length > 0 ? checklistServicos : null,
      atendimentosFornecedor: fornecedores,
      atendimentosAcessorios: acessorio.length > 0 ? acessorio : null,
      manutencaoCorretiva: corretiva.length > 0,
      manutencaoPreventiva: preventiva.length > 0,
      sinistro: sinistro.length > 0 || (this.getFormVal(abaUmForm, 'isSinistroEdicao') || false),
      celular: this.getFormVal(abaZeroForm, 'celularUsuario'),
      cpfCondutor: this.getFormVal(abaZeroForm, 'cpfUsuario'),
      logradouroSinistro: this.getFormVal(abaUmForm, 'logradouroSinistro'),
      bairroSinistro: this.getFormVal(abaUmForm, 'bairroSinistro'),
      cidadeSinistro: this.getFormVal(abaUmForm, 'cidadeSinistro'),
      municipioSinistroId: this.getFormVal(abaUmForm, 'municipioSinistroId'),
      cepSinistro: this.getFormVal(abaUmForm, 'cepSinistro'),
      boletimOcorrenciaSinistro: this.getFormVal(abaUmForm, 'numeroBoletimOcorrencia'),
      estadoSinistro: this.getFormVal(abaUmForm, 'ufSinistro'),
      dataSinistro: this.getFormVal(abaUmForm, 'timestampSinistro')
        ? moment(this.getFormVal(abaUmForm, 'timestampSinistro')).toDate().getTime() : null,
      horaSinistro: Util.formatarHora(this.getFormVal(abaUmForm, 'horaSinistro')),
      houveVitima: this.getFormVal(abaUmForm, 'hasVitima') || false,
      houveVitimaFatal: this.getFormVal(abaUmForm, 'hasVitimaFatal') || false,
      descricaoOcorridoSinistro: this.getFormVal(abaUmForm, 'relatoOcorrido'),
      // Fornecedor no qual a data e hora de parada é a menor
      fornecedorId: this.getFornecedorPrincipal(fornecedores) || null,
      formaContatoId: this.getFormVal(abaZeroForm, 'melhorFormaContato'),
      // Sempre S
      agendamentoPrevio: 'S',
      // Flag semDocumentacaoSinitro no recurso atendimentosclientes/questionario
      //confirmacaoDocumentacaoNp: this.abaUm['isComDocumentacaoSinitro']() ? 'N' : 'S',

      confirmacaoDocumentacaoNp: this.getFormVal(abaUmForm, 'isComDocumentacaoSinitro') ? 'N' : 'S',
      dataParada1: dataParadaUm,
      dataParada2: dataParadaDois,
      dataParada3: dataParadaTres,
      horaParada1: horaParadaUm,
      horaParada2: horaParadaDois,
      horaParada3: horaParadaTres,
      // Sempre N
      direcionadoOficina: 'N',
      // Endereco que o usuario informar na pesquisa de fornecedores
      enderecoLocalCliente: this.abaDois['getEnderecoCliente'](),
      motivoTipo: this.getFormVal(abaUmForm, 'tipoSinistro') ? this.getFormVal(abaUmForm, 'tipoSinistro').tipoId : null,
      nomeTerceiro: this.getFormVal(abaUmForm, 'nomeTerceiro'),
      planoManutencaoId: this.getFormVal(abaDoisForm, 'planoManutencaoExecutar'),
      // Flag retornada no recurso de Plano Manutencao
      registrarAtualizacaoKm: this.getFormVal(abaDoisForm, 'registrarAtualizacaoKm'),
      // Flag no recurso atendimentosclientes/questionario
      socorroMecanico: this.getFormVal(abaUmForm, 'isSocorroMecanico'),
      telefoneTerceiro: this.getFormVal(abaUmForm, 'celularTerceiro'),
      tipo: tipoServico,
      confirmacaoAVS: this.getConfirmacoes('AVS') ? 'S' : 'N',
      confirmacaoBO: this.getConfirmacoes('BO') ? 'S' : 'N',
      confirmacaoCNH: this.getConfirmacoes('CNH') ? 'S' : 'N',
      confirmacaoDUT: this.getConfirmacoes('DUT') ? 'S' : 'N',
      confirmacaoFoto: this.getConfirmacoes('Foto Padrão') ? 'S' : 'N',
      semAgendamentoParada: !atendimentoId && this.getFormVal(abaUmForm, 'semAgendamentoParada') || false,
      sinistroAnteriorId: this.getFormVal(abaUmForm, 'sinistroAnteriorId'),
      segmentoNegocioId: this.getFormVal(abaZeroForm, 'segmentoNegocioId'),
      atendimentoLoja: this.getFormVal(abaUmForm, 'atendimentoLoja'),
      siglaLojaUnidas: this.getFormVal(abaUmForm, 'siglaLojaUnidas')
    };

    return body;
  }

  resetForms() {

    const clienteLogadoPlaca = {
      clienteId: this.userContextService.getDados().clienteId,
      cnpjCpf: this.userContextService.getDados().cpfCnpjCliente,
      nomeFantasia: this.userContextService.getDados().nomeCliente
    };

    AtendimentoStorageService.abaZeroForm.reset();
    AtendimentoStorageService.abaZeroForm.get('cliente').setValue(clienteLogadoPlaca);

    if (AtendimentoStorageService.abaUmForm) {
      AtendimentoStorageService.abaUmForm.reset();
    }

    if (AtendimentoStorageService.abaDoisForm) {
      AtendimentoStorageService.abaDoisForm.reset();
    }

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  putManutencao(atendimentoId: number, body: PostAtendimentosMV): void {
    this.atendimentoClientesService.putAtendimento(atendimentoId, body).subscribe(res => {

      // Movimentação UNIRENT
      this.realizarMovimentacaoUnirent(atendimentoId, body);

      this.router.navigateByUrl(`gerenciador-atendimento-rac/manutencao`);

      this.snackBarService.success(res.data.message, 3500, 'X');

      if (AtendimentoStorageService.getArquivos().length > 0) {
        const arquivosParaExcluir = this.abaUm['arquivosParaExcluir'];
        if (arquivosParaExcluir && arquivosParaExcluir.length > 0) {
          arquivosParaExcluir.forEach(id => {
            this.arquivoService.deleteArquivo(id).subscribe(res1 => {
              this.abaUm['arquivosParaExcluir'].splice(arquivosParaExcluir.indexOf(id), 1);
            }, err1 => {
              this.snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
            });
          });
        }

        AtendimentoStorageService.getArquivos().forEach(arquivo => {
          if (arquivo.tipoArquivo !== 'EDICAO') {
            this.postArquivos(arquivo, atendimentoId);
          }
        });
      }
    }, err => {
      if (err.error.message.error) {
        this.snackBarService.error(err.error.message.error, 7000, 'X');
        this.resetarRac();
      } else {
        this.snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        this.resetarRac();
      }
    });
  }

  postManutencao(body: PostAtendimentosMV): void {
    this.atendimentoClientesService.postAtendimento(body).subscribe(res => {

      // Movimentação UNIRENT
      this.realizarMovimentacaoUnirent(res.data.insertId, body);

      if (!this.isRac()) {
        this.navigateTo('abrir-atendimento');
      } else {
        // this.resetarRac();
      }

      this.snackBarService.success(this.translateService.instant('PORTAL.MANUTENCAO.MESSAGE.SUCESSO_ENVIO'), 3500, 'X');

      const arquivosParaExcluir = this.abaUm['arquivosParaExcluir'];
      if (arquivosParaExcluir) {
        arquivosParaExcluir.forEach(id => {
          this.arquivoService.deleteArquivo(id).subscribe(res1 => {
            this.abaUm['arquivosParaExcluir'].splice(arquivosParaExcluir.indexOf(id), 1);
          }, err1 => {
            this.snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
          });
        });
      }

      AtendimentoStorageService.getArquivos().forEach(arquivo => {
        this.postArquivos(arquivo, res.data.insertId);
      });

    }, err => {
      if (err.error.message.error) {
        this.snackBarService.error(err.error.message.error, 7000, 'X');
        this.resetarRac();
      } else {
        this.snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        this.resetarRac();
      }
    });
  }

  private realizarMovimentacaoUnirent(atendimentoId: number, body: PostAtendimentosMV) {

    let listaDescricaoServicos = this.abaDois['abaUmForm'].descricaoServicos;

    if (this.abaDois['fornecedorList'].listaFornecedores.length > 0) {
      listaDescricaoServicos = this.abaDois['fornecedorList'].listaFornecedores[0].listaDescricaoServico;
    }

    const unirentParamsGET = {
      atendimentoId: atendimentoId,
      veiculoId: body.veiculoId,
      segmentoNegocioId: body.segmentoNegocioId
    };

    this.unirentService.all(unirentParamsGET).subscribe(res1 => {
      if (res1.data.results.length > 0) {
        const unirentBodyPOST = res1.data.results[0];
        unirentBodyPOST.codigoMVA = body.veiculoId;
        unirentBodyPOST.dataHoraOperacao = res1.data.results[0].dataOperacao;
        unirentBodyPOST.siglaLoja = this.siglaLoja;
        unirentBodyPOST.siglaLojaDestino = unirentBodyPOST.siglaLoja;
        unirentBodyPOST.siglaUnidade = unirentBodyPOST.siglaLoja;
        unirentBodyPOST.descricaoPrestador = unirentBodyPOST.nomeFornecedor;
        unirentBodyPOST.descricaoServico = listaDescricaoServicos;

        if (this.veiculoApreendido) {
          unirentBodyPOST.veiculoStatusNO = 'AP';
          unirentBodyPOST.descricaoServico = this.observacoes;
          unirentBodyPOST.descricaoPrestador = listaDescricaoServicos;
        }

        this.unirentService.movimentar(unirentBodyPOST).subscribe(res3 => {
          console.log(res3.data.message);
          this.resetarRac();
        }, err3 => {
          this.snackBarService.error('Erro ao realizar Movimentação UNIRENT', 3500, 'X');
          this.resetarRac();
        });
      } else {
        this.resetarRac();
      }
    }, err1 => {
      this.snackBarService.error('Erro ao realizar Movimentação UNIRENT', 3500, 'X');
      this.resetarRac();
    });
  }

  postArquivos(arquivo: any, id: number): void {
    const bodyArquivos = {
      atendimentoId: Number(id),
      descricaoArquivo: arquivo.descricao,
      tipoDocumento: arquivo.dadosAPICliente.tipoDocumento.id,
      usuarioId: Number(this.userContextService.getID()),
      chave: null
    };

    this.arquivoService.postArquivo(
      Number(this.userContextService.getID()),
      'ATENDIMENTO',
      id,
      'OUTROS',
      arquivo.descricao,
      arquivo.fileFormData
    ).subscribe(res => {
      bodyArquivos.chave = `${res['data'].id}.${bodyArquivos.descricaoArquivo.split('.')[1]}`;
      this.tipoAtendimento.postArquivos(bodyArquivos).subscribe(res1 => {
        this.router.navigateByUrl(`gerenciador-atendimento-rac/manutencao`);
      }, err1 => {
        this.snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }, err => {
      this.snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  goControlePreventiva() {
    const dadosPesquisa: NavigationExtras = {
      queryParams: {
        'lastSearch': this.abaZero['dadosControlePreventiva'].lastSearch
      },
      fragment: 'anchor',
      skipLocationChange: true
    };
    this.router.navigate(['gerenciador-atendimento/controle-preventivas'], dadosPesquisa);
  }

  navigateTo(page: string) {
    if (page === 'manutencao') {
      const index = this.router.url.indexOf('?');
      const url = this.router.url.substring(0, index > 0 ? index : this.router.url.length);
      window.location.href = url;
    } else {
      this.router.navigateByUrl(`gerenciador-atendimento-rac/${page}`);
    }
  }

  isRac(): boolean {
    return true;
    //return !!this.getRac();
  }

  getRac(): any {

    let tokenRac = this.userContextService.getTokenRac();
    if (tokenRac) {
      tokenRac = JSON.parse(tokenRac);
    }

    return tokenRac;
  }

}
