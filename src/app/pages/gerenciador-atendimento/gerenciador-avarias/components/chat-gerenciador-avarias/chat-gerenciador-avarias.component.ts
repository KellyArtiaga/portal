import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChatService } from 'src/app/core/services/chat.service';
import { HistoricoCobrancaService } from 'src/app/core/services/historico-cobranca.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { GenericMenuBoxMV } from 'src/app/shared/interfaces/generic-menu-box.model';
import { MensagensChatMV } from 'src/app/shared/interfaces/mensagens-chat.model';
import { MenuMV } from 'src/app/shared/interfaces/menu.model';
import { takeUntilDestroy } from 'src/app/shared/take-until-destroy';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-chat-gerenciador-avarias',
  templateUrl: './chat-gerenciador-avarias.component.html',
  styleUrls: ['./chat-gerenciador-avarias.component.scss']
})
export class ChatGerenciadorAvariasComponent implements OnInit, OnDestroy {

  dataMenuBox: GenericMenuBoxMV;
  dadosAtendimentos: any[] = [];
  dadosAtendimentoSelecionado: any = {};
  menuChat: MenuMV[] = [];
  mensagensChat: MensagensChatMV[];
  selectedMenuItem: any;
  placaCobranca: FormControl;
  filtro: any = {};
  historicos: any[];

  lastSearch = 0;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private chatService: ChatService,
    private snackBar: SnackBarService,
    private userContext: UserContextService,
    private historicoCobrancaService: HistoricoCobrancaService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.placaCobranca = new FormControl();
    this.dataMenuBox = {
      formControlSearch: this.placaCobranca,
      menuHeaderStyle: { textAlign: 'right', fontSize: '10px' },
      menuBodyStyle: { textAlign: 'left', fontSize: '12px' },
      menuNoFooter: true,
      labelFiltro: 'PORTAL.LABELS.LBL_PLACA',
      backFunction: this.backToAvarias.bind(this),
      researchFunction: this.getCobranca.bind(this),
      autoCompleteSelectionFunction: this.getAtendimentoPlaca.bind(this),
      boxColClass: 'col-md-12',
      boxColWidth: 'col-md-12'
    };
    Object.assign(this.dadosAtendimentoSelecionado, JSON.parse(this.activatedRoute.queryParams['value'].atendimentoSelecionado));
    Object.assign(this.dadosAtendimentos, JSON.parse(this.activatedRoute.queryParams['value'].atendimentos));
    Object.assign(this.filtro, JSON.parse(this.activatedRoute.queryParams['value'].filtro));

    this.getMensagensHeader();
  }

  organizarMenu(menu: MenuMV[]): MenuMV[] {
    menu = menu.sort((b, a) => (a ? a.qtdNaoLidas : 0) - (b ? b.qtdNaoLidas : 0));
    const itemSelecionado = menu.filter(element => element && element.selectedItem === true);
    const indexItemSelecionado = menu.indexOf(itemSelecionado[0]);

    if (menu && menu.length > 1) {
      menu.splice(indexItemSelecionado, 1);
      menu.unshift(itemSelecionado[0]);
    }

    return menu;
  }

  getCobranca(placa: any) {
    this.filtro.paginar = 0;
    this.filtro.placa = placa.display ? placa.display : placa.toUpperCase();

    if (placa) {
      if (placa.length < 2) {
        this.historicoCobrancaService.all(this.filtro).subscribe(res => {
          this.historicos = res.data.results;
          this.dataMenuBox.dataResearch = this.historicos.map(historico => {
            return {
              historico: historico,
              display: historico ? historico.placa : ''
            };
          });
        }, error => {
          this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      } else {
        if (this.historicos) {
          const historicosFiltrados = this.historicos.filter(
            filtro => filtro.placa.toUpperCase().includes(this.filtro.placa.toUpperCase()));

          this.dataMenuBox.dataResearch = historicosFiltrados.map(historico => {
            return {
              historico: historico,
              display: historico ? historico.placa : ''
            };
          });
        }
      }
    } else {
      this.resetMenu();
      this.dadosAtendimentos.forEach(atendimento => {
        this.getMensagens(atendimento, false);
      });
    }
  }

  getAtendimentoPlaca(event, data): void {
    const _this = this;

    if (typeof data === 'string') {
      if (event.key !== 'Alt'
        && event.key !== 'CapsLock'
        && event.key !== 'Control'
        && event.key !== 'Shift'
        && event.key !== 'Tab') {
        if (data.length >= 3) {
          const now = new Date().getTime();
          if ((now - _this.lastSearch) < 50) {
            return;
          }
          _this.lastSearch = now;

          _this.menuChat = [];

          const ids = [];
          _this.dadosAtendimentos.forEach(atendimento => {
            if (atendimento.placa.toUpperCase().includes(data.toUpperCase())) {
              if (!ids.includes(atendimento.atendimentoId)) {
                ids.push(atendimento.atendimentoId);
              }
            }
          });

          if (ids.length > 0) {
            _this.getMensagensHeader(ids);
          } else {
            _this.dataMenuBox.menuData = [];
          }
        } else if (data.length === 0) {
          _this.menuChat = [];
          this.getMensagensHeader();
        }
      }
    } else {
      _this.getMensagens(data.historico, true);
    }
  }

  getMensagensHeader(atendimentosId?: Array<any>): void {
    const _this = this;

    if (!atendimentosId) {
      atendimentosId = [];
      this.dadosAtendimentos.forEach(atendimento => {
        atendimentosId.push(atendimento.atendimentoId);
      });
    }

    _this.chatService.getMessageHeaders(atendimentosId).subscribe(res => {
      const headers = res.data.results;
      if (headers && headers.length > 0) {
        headers.forEach(header => {
          const atendimento = this.dadosAtendimentos.find(item => item.atendimentoId === header.atendimentoId);

          const menu = {
            menuHeader: header.inseridoEm ? Util.formataData(header.inseridoEm, 'DD/MM/YYYY HH:mm') : '',
            menuBody: atendimento.placa,
            menuFunction: _this.loadMessages.bind(_this),
            data: atendimento,
            qtdNaoLidas: header.quantidadeMensagens,
            selectedItem: _this.dadosAtendimentoSelecionado.atendimentoId === atendimento.atendimentoId
          };

          if (!_this.menuChat.find(item => item && menu && item.data.atendimentoId === menu.data.atendimentoId)) {
            _this.menuChat.push(menu);
            _this.menuChat = _this.organizarMenu(_this.menuChat);
          }

          _this.dataMenuBox.menuData = _this.menuChat;
          _this.dadosAtendimentoSelecionado.atendimentoId === atendimento.atendimentoId ? _this.loadMessages(menu) : (() => { })();
        });
      }
    }, err => {
      _this.snackBar.error(_this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getMensagens(atendimento, placaFoiPesquisada): void {
    const mensagensChatData = {
      atendimentoId: atendimento.atendimentoId
    };

    this.chatService.all(mensagensChatData).pipe(takeUntilDestroy(this)).subscribe(res => {
      this.mensagensChat = res.data.results;

      const mensagens = this.mensagensChat.filter(mensagem => mensagem.lidaPortal === false);
      const qtdMsgNaoLidas = mensagens ? mensagens.length : 0;

      const menu = {
        menuHeader: this.mensagensChat[0] ? Util.formataData(this.mensagensChat[0].dataHora, 'DD/MM/YYYY HH:mm') : '',
        menuBody: atendimento.placa,
        menuFunction: this.loadMessages.bind(this),
        data: atendimento,
        qtdNaoLidas: qtdMsgNaoLidas,
        selectedItem: this.dadosAtendimentoSelecionado.atendimentoId === atendimento.atendimentoId
      };

      this.menuChat.push(menu);
      this.menuChat = this.organizarMenu(this.menuChat);

      if (placaFoiPesquisada) {
        this.resetMenu();
        this.menuChat.push(menu);
        this.dataMenuBox.menuData = this.menuChat;
      }

      this.dataMenuBox.menuData = this.menuChat;
      this.dadosAtendimentoSelecionado.atendimentoId === atendimento.atendimentoId || placaFoiPesquisada
        ? this.loadMessages(menu) : (() => { })();
    }, error => {
      this.snackBar.open(error.message, 3500);
    });
  }

  backToAvarias() {
    this.router.navigate(['gerenciador-atendimento/gerenciador-avarias']);
  }

  loadMessages(menu) {
    const itemSelecionado = this.menuChat.filter(item => item && item.selectedItem === true);
    (itemSelecionado && itemSelecionado.length > 0) ? itemSelecionado[0].selectedItem = false : (() => { })();
    menu.selectedItem = true;

    this.selectedMenuItem = menu;
    const atendimento = menu.data;
    this.dataMenuBox.boxChat = [];
    this.mensagensChat = [];
    this.dataMenuBox.sendFunction = this.enviarMensagem.bind(this);

    const mensagensChatData = {
      atendimentoId: atendimento.atendimentoId
    };

    this.chatService.all(mensagensChatData).pipe(takeUntilDestroy(this)).subscribe(res => {
      this.mensagensChat = res.data.results;
      this.dataMenuBox.boxChat = this.mensagensChat.map(mensagem => {
        return {
          from: mensagem.mensagemCliente,
          to: !mensagem.mensagemCliente,
          header: mensagem.usuario,
          body: mensagem.texto,
          footer: mensagem.dataHora ? Util.formataData(mensagem.dataHora, 'DD/MM/YYYY HH:mm') : '',
          icon: !mensagem.mensagemCliente ? 'pfu-user-chat' : 'pfu-unidas-chat',
          iconStyle: { transform: 'scale(2)', margin: '18px' }
        };
      });

      if (this.mensagensChat.some(chat => chat.usuario !== this.userContext.getNomeUsuario())) {
        this.atualizarStatusMensagens(atendimento.atendimentoId, menu);
      }
    }, error => {
      this.snackBar.open(error.message, 3500);
    });

    this.dataMenuBox.boxTitleLn1 = `${atendimento.atendimentoId}`;
    this.dataMenuBox.boxTitleLn2 = `${atendimento.tipoAvaria ? atendimento.tipoAvaria : 'N/A'}`;
    this.dataMenuBox.boxTitleLn3 = `${atendimento.placa.concat(' - ').concat(atendimento.veiculoModelo)}`;
  }

  enviarMensagem(message): void {
    if (!Boolean(message.value)) {
      return;
    }
    const atendimento = this.selectedMenuItem.data;
    const data = {
      atendimentoId: atendimento.atendimentoId,
      texto: message.value,
      usuarioId: this.userContext.getUsuarioId()
    };
    this.chatService.save(data).pipe(takeUntilDestroy(this)).subscribe(res => {
      this.loadMessages(this.selectedMenuItem);
      message.value = null;
    }, error => {
      this.snackBar.open(error.message, 3500);
    });
  }

  atualizarStatusMensagens(atendimentoId: number, menu: any) {
    const data = {
      usuarioId: this.userContext.getUsuarioId()
    };

    this.chatService.patch(atendimentoId, data).pipe(takeUntilDestroy(this)).subscribe(res => {
      menu.qtdNaoLidas = null;
    }, error => {
      this.snackBar.open(error.message, 3500);
    });
  }

  resetMenu() {
    this.menuChat = [];
    this.dataMenuBox.boxChat = null;
    this.dataMenuBox.boxTitle = null;
    this.dataMenuBox.boxTitleLn1 = null;
    this.dataMenuBox.boxTitleLn2 = null;
    this.dataMenuBox.boxTitleLn3 = null;
    this.dadosAtendimentoSelecionado.atendimentoId = null;
  }

  ngOnDestroy() { }

}
