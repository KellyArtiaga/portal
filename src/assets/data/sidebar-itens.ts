import { ItensSidebarMV } from '../../app/shared/interfaces/sidebar-itens.model';

export const SIDEBAR_ITENS: ItensSidebarMV[] = [
  {
    state: 'home', type: 'link', name: 'PORTAL.MENU.HOME', icon: 'pfu-home'
  },
  {
    state: 'dashboard', type: 'link', name: 'PORTAL.MENU.DASHBOARD.TITLE', icon: 'pfu-dashboard', funcionalidade: 'INDICADORES_GERAIS',
    children: [
      {
        state: 'dashboard/dashboard-gerais', type: 'link', name: 'PORTAL.MENU.DASHBOARD.DASHBOARD_GERAIS',
        icon: 'pfu-dashboard-total', funcionalidade: 'INDICADORES_GERAIS'
      },
      {
        state: 'dashboard/dashboard-frotas', type: 'link', name: 'PORTAL.MENU.DASHBOARD.DASHBOARD_FROTAS',
        icon: 'pfu-dashboard-frotas', funcionalidade: 'INDICADORES_FROTAS'
      },
      {
        state: 'dashboard/dashboard-financeiros', type: 'link', name: 'PORTAL.MENU.DASHBOARD.DASHBOARD_FINANCEIRO',
        icon: 'pfu-dashboard-financeiros', funcionalidade: 'INDICADORES_FINANCEIROS'
      },
      {
        state: 'dashboard/dashboard-infracoes', type: 'link', name: 'PORTAL.MENU.DASHBOARD.DASHBOARD_INFRACOES',
        icon: 'pfu-dashboard-infracoes', funcionalidade: 'INDICADORES_INFRACOES'
      },
      {
        state: 'dashboard/dashboard-atendimentos', type: 'link', name: 'PORTAL.MENU.DASHBOARD.DASHBOARD_ATENDIMENTOS',
        icon: 'pfu-dashboard-atendimentos', funcionalidade: 'INDICADORES_ATENDIMENTOS'
      },
      {
        state: 'dashboard/dashboard-sinistros', type: 'link', name: 'PORTAL.MENU.DASHBOARD.DASHBOARD_SINISTROS',
        icon: 'pfu-dashboard-sinistros', funcionalidade: 'INDICADORES_SINISTROS'
      },
      {
        state: 'dashboard/dashboard-avarias', type: 'link', name: 'PORTAL.MENU.DASHBOARD.DASHBOARD_AVARIAS',
        icon: 'pfu-dashboard-avarias', funcionalidade: 'INDICADORES_AVARIAS'
      },
      {
        state: 'dashboard/dashboard-pool-pneus', type: 'link', name: 'PORTAL.MENU.DASHBOARD.DASHBOARD_POOL_PNEUS',
        icon: 'pfu-dashboard-pneus', funcionalidade: 'INDICADORES_POOL_PNEUS'
      },
      {
        state: 'dashboard/dashboard-pool-reserva-veiculos', type: 'link', name: 'PORTAL.MENU.DASHBOARD.DASHBOARD_POOL_RESERVA',
        icon: 'pfu-dashboard-veiculos', funcionalidade: 'INDICADORES_RESERVA_PNEUS'
      }
    ]
  },
  {
    state: 'gerenciador-atendimento', type: 'link', name: 'PORTAL.MENU.ATENDIMENTO.TITLE', icon: 'pfu-call',
    funcionalidade: 'GERENCIADOR_ATENDIMENTO',
    children: [
      {
        state: 'gerenciador-atendimento/abrir-atendimento', type: 'link', name: 'PORTAL.MENU.ATENDIMENTO.ABRIR_ATENDIMENTO',
        icon: 'pfu-abrir-atendimento-branco', funcionalidade: 'ATENDIMENTO_ABRIR_MANUTENCAO_SINISTRO'
      },
      {
        state: 'gerenciador-atendimento/administrar-atendimento', type: 'link', name: 'PORTAL.MENU.ATENDIMENTO.ADMINISTRAR_ATENDIMENTO',
        icon: 'pfu-acompanhar-atendimento-branco', funcionalidade: 'ATENDIMENTO_ACOMPANHAR'
      },
      {
        state: 'gerenciador-atendimento/acompanhar-veiculo-reserva', type: 'link',
        name: 'PORTAL.MENU.ATENDIMENTO.ACOMPANHAR_SOLICITACAO_DE_VEICULO_RESERVA', icon: 'pfu-solicitacao-branco', funcionalidade: 'ATENDIMENTO_VEICULO_RESERVA'
      },
      {
        state: 'gerenciador-atendimento/gerenciador-avarias', type: 'link', name: 'PORTAL.MENU.ATENDIMENTO.AVARIAS',
        icon: 'pfu-gerenciador-avarias', funcionalidade: 'ATENDIMENTO_AVARIAS'
      },
      {
        state: 'gerenciador-atendimento/manutencoes-realizadas', type: 'link', name: 'PORTAL.MENU.ATENDIMENTO.MANUTENCOES_REALIZADAS',
        icon: 'pfu-manutencao-realizada-branco', funcionalidade: 'ATENDIMENTO_MANUTENCOES'
      },
      {
        state: 'gerenciador-atendimento/controle-preventivas', type: 'link', name: 'PORTAL.MENU.ATENDIMENTO.CONTROLE_DE_PREVENTIVA',
        icon: 'pfu-controle-preventivas-branco', funcionalidade: 'ATENDIMENTO_PREVENTIVAS'
      }
    ]
  },
  {
    state: 'gerenciador-frota', type: 'link', name: 'PORTAL.MENU.FROTA.TITLE', icon: 'pfu-car', funcionalidade: 'GERENCIADOR_FROTA',
    children: [
      {
        state: 'gerenciador-frota/frota-ativa', type: 'link', name: 'PORTAL.MENU.FROTA.GERENCIAR_FROTA',
        icon: 'pfu-frota-branco', funcionalidade: 'FROTA_ATIVA'
      },
      {
        state: 'gerenciador-frota/associar-condutor', type: 'link', name: 'PORTAL.MENU.FROTA.ASSOCIAR_CONDUTOR_AO_VEICULO',
        icon: 'pfu-associar-condutor-branco', funcionalidade: 'FROTA_ASSOCIACOES_VEICULO'
      },
      {
        state: 'gerenciador-frota/acompanhar-solicitacao', type: 'link', name: 'PORTAL.MENU.FROTA.SOLICITACAO_DE_VEICULO',
        icon: 'pfu-solicitacao-branco', funcionalidade: 'FROTA_SOLICITCAO_VEICULO'
      },
      {
        state: 'gerenciador-frota/acompanhar-entrega', type: 'link', name: 'PORTAL.MENU.FROTA.ACOMPANHAR_ENTREGA_DE_VEICULO',
        icon: 'pfu-entrega-branco', funcionalidade: 'FROTA_ENTREGA_VEICULO'
      },
      {
        state: 'gerenciador-frota/acompanhar-entrega-devolucao',
        type: 'link',
        name: 'PORTAL.MENU.FROTA.AGENDAR_ENTREGA_DEVOLUCAO',
        icon: 'pfu-entrega-devolucao',
        funcionalidade: 'FROTA_ENTREGA_DEVOLUCAO'
      },
      {
        state: 'gerenciador-frota/gerenciador-crlv',
        type: 'link',
        name: 'PORTAL.MENU.CRLV.GERENCIADOR_CRLV',
        icon: 'pfu-crlv-branco',
        funcionalidade: 'FROTA_GERENCIADOR_CRLV'
      }
    ]
  },
  {
    state: 'gerenciador-infracoes', type: 'link', name: 'PORTAL.MENU.INFRACOES.TITLE', icon: 'pfu-multas', funcionalidade: 'INFRACOES',
    children: [
      {
        state: 'gerenciador-infracoes/indicacoes-eletronicas', type: 'link', name: 'PORTAL.MENU.INFRACOES.INDICACAO_ELETRONICA',
        icon: 'pfu-indicacoes-branco', funcionalidade: 'INFRACOES_INDICACAO'
      }
      // {
      //   state: 'gerenciador-infracoes/recurso', type: 'link', name: 'PORTAL.MENU.INFRACOES.RECURSO', icon: 'pfu-recurso-branco',
      //   funcionalidade: 'INFRACOES_RECURSO'
      // }
    ]
  },
  {
    state: 'financeiro', type: 'link', name: 'PORTAL.MENU.FINANCEIRO.TITLE', icon: 'pfu-financeiro', funcionalidade: 'FINANCEIRO',
    children: [
      {
        state: 'financeiro/faturamento', type: 'link', name: 'PORTAL.MENU.FINANCEIRO.FATURAMENTO', icon: 'pfu-faturamento', funcionalidade: 'FINANCEIRO_PORTAL_CLIENTE_FATURAMENTO'
      }
    ]
  },
  {
    state: 'cadastrar', type: 'link', name: 'PORTAL.MENU.CADASTRO.TITLE', icon: 'pfu-cadastro', funcionalidade: 'CADASTRAR',
    children: [
      {
        state: 'cadastrar/usuario', type: 'link', name: 'PORTAL.MENU.CADASTRO.USUARIO', icon: 'pfu-car-usuario',
        funcionalidade: 'CADASTRO_USUARIO'
      },
      {
        state: 'cadastrar/perfil', type: 'link', name: 'PORTAL.MENU.CADASTRO.PERFIL', icon: 'pfu-perfil',
        funcionalidade: 'CADASTRO_PERFIL',
        show: !!JSON.parse(localStorage.getItem('master'))
      },
      {
        state: 'cadastrar/agrupadores', type: 'link', name: 'PORTAL.MENU.CADASTRO.AGRUPADORES', icon: 'pfu-agrupadores',
        funcionalidade: 'CADASTRO_AGRUPADORES'
      }
    ]
  },
  {
    state: 'https://portalclaro.unidas.com.br/frota/acompanhamento-frota?token=', type: 'blank', name: 'PORTAL.MENU.GERENCIADOR_360.TITLE',
    icon: 'pfu-icon_equipe_relacionamento', funcionalidade: 'UNIDAS360'
  },
  /* {
    state: 'equipe-relacionamento/equipe', type: 'link', name: 'PORTAL.MENU.EQUIPE_RELACIONAMENTO.TITLE', icon: 'pfu-icon_equipe_relacionamento',
    funcionalidade: 'EQUIPE_RELACIONAMENTO'
  }, */
  {
    state: 'ajuda', type: 'link', name: 'PORTAL.MENU.AJUDA.TITLE', icon: 'pfu-ajuda', funcionalidade: 'AJUDA',
    children: [
      {
        state: 'ajuda/manual-condutor', type: 'link', name: 'PORTAL.MENU.AJUDA.MANUAL_CONDUTOR',
        icon: 'pfu-manual-usuario', funcionalidade: 'AJUDA_MANUAL_CONDUTOR'
      },
      {
        state: 'ajuda/manual-portal', type: 'link', name: 'PORTAL.MENU.AJUDA.MANUAL_PORTAL',
        icon: 'pfu-manual-portal', funcionalidade: 'AJUDA_MANUAL_PORTAL'
      },
      {
        state: 'ajuda/reclamacoes-sugestoes', type: 'link', name: 'PORTAL.MENU.AJUDA.RECLAMACOES_SUGESTOES',
        icon: 'pfu-reclamacao', funcionalidade: 'AJUDA_RECLAMACOES_SUGESTOES'
      },
      // {
      //   state: 'ajuda/perguntas-respostas', type: 'link', name: 'PORTAL.MENU.AJUDA.PERGUNTAS_RESPOSTAS',
      //   icon: 'pfu-perguntas', funcionalidade: 'AJUDA_FAQ'
      // }
    ]
  }
];
export const USER_MENU_ITEMS: ItensSidebarMV[] = [
  { state: 'manter-usuario/atualizar-dados', type: 'link', name: 'Atualizar Dados', icon: '', funcionalidade: 'MANTER_USUARIO_ATUALIZAR_DADOS' },
  { state: 'manter-usuario/alterar-senha', type: 'link', name: 'Alterar Senha', icon: '', funcionalidade: 'MANTER_USUARIO_ALTERAR_SENHA' },
  { state: 'efetuar-login-como', type: 'link', name: 'Efetuar Login Como', icon: '', funcionalidade: 'MANTER_USUARIO_EFETUAR_LOGIN' }
];
