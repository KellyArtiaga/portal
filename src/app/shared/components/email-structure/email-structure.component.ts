import { EmailPost } from '../../interfaces/email.model';

export class EmailStructureComponent {

  public static emailAgendamentoAprovado(obj: any) {
    const email: EmailPost = {};
    email.from = `noreply@unidas.com.br`;
    email.to = ['kelly.artiaga@gmail.com', obj.email];
    email.subject = `Agendamento de devolução de veículo ${obj.id} foi aprovado!`;
    email.html = '<html><head> </head><body>';
    // tslint:disable-next-line: max-line-length
    email.html += `<img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/556b3e65-3241-4cc9-a044-aa13cb2d6444' height='auto' width='100%' display='flex'/>`;
    email.html += `<h4>${obj.solicitante},</h4>`;
    email.html += `<span>O agendamento de devolução de veículo ${obj.id} foi aprovado!</span><br />`;
    email.html += `<span><b>Cliente: </b>${obj.cliente}</span><br />`;
    email.html += `<span><b>Código Cliente: </b>${obj.cod}</span><br />`;
    email.html += `<span><b>Cidade: </b>${obj.cidade}</span><br />`;
    email.html += `<span><b>Nome do Solicitante: </b>${obj.solicitante}</span><br />`;
    email.html += `<span><b>Grupo Cliente: </b>${obj.grupo}</span><br />`;
    email.html += `<span><b>Quantidade de Veículos: </b>${obj.quantidade}</span><br />`;
    email.html += `<span><b>Placa do Veículo: </b>${obj.placa}</span><br />`;
    email.html += `<span><b>Modelo do Veículo: </b>${obj.modelo}</span><br />`;
    email.html += `<span><b>Motivo da Solicitação: </b>${obj.motivo}</span><br />`;
    email.html += `<span></span><br />`;
    email.html += `<hr />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<span><b>Clique aqui e acesse o agendamento para deficir em qual fornecedor deseja realizar a devolução do veículo: </b></span><br />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<br><a href="${obj.acesso}" target="_blank"><img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/10f37eb4-d726-4c2b-927d-92fed04dd4ed' height='auto' width='150px' display='flex'/></a>`;
    email.html += '</body></html>';
    return email;
  }

  public static emailAgendamentoRecusado(obj: any) {
    const email: EmailPost = {};
    email.from = `noreply@unidas.com.br`;
    email.to = ['kelly.artiaga@gmail.com', obj.email];
    email.subject = `Agendamento de devolução de veículo ${obj.id} foi Recusado!`;
    email.html = '<html><head> </head><body>';
    // tslint:disable-next-line: max-line-length
    email.html += `<img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/466992c5-0735-4d40-9bae-d7ea903642f6' height='auto' width='100%' display='flex'/>`;
    email.html += `<h3> Oi, ${obj.solicitante},</h3>`;
    email.html += `<span>O agendamento de devolução de veículo ${obj.id} foi recusado!</span><br />`;
    email.html += `<span><b>Cliente: </b>${obj.cliente}</span><br />`;
    email.html += `<span><b>Código Cliente: </b>${obj.cod}</span><br />`;
    email.html += `<span><b>Cidade: </b>${obj.cidade}</span><br />`;
    email.html += `<span><b>Motivo da não aprovação: </b>${obj.motivoReprovacao}</span><br />`;
    email.html += `<span><b>Nome do Solicitante: </b>${obj.solicitante}</span><br />`;
    email.html += `<span><b>Grupo Cliente: </b>${obj.grupo}</span><br />`;
    email.html += `<span><b>Quantidade de Veículos: </b>${obj.quantidade}</span><br />`;
    email.html += `<span><b>Placa do Veículo: </b>${obj.placa}</span><br />`;
    email.html += `<span><b>Modelo do Veículo: </b>${obj.modelo}</span><br />`;
    email.html += `<span><b>Motivo da Solicitação: </b>${obj.motivo}</span><br />`;
    email.html += `<span></span><br />`;
    email.html += `<hr />`;
    email.html += `<span><b>Para acompanhar a solicitação, acesse aqui: </b></span><br />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<br><a href="${obj.acesso}" target="_blank"><img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/10f37eb4-d726-4c2b-927d-92fed04dd4ed' height='auto' width='150px' display='flex'/></a>`;
    email.html += '</body></html>';
    return email;
  }

  public static emailAgendamentoDevolucao(obj: any) {
    const email: EmailPost = {};
    email.from = `noreply@unidas.com.br`;
    email.to = ['kelly.artiaga@gmail.com', obj.email];
    email.subject = `Agendamento de devolução de veículo`;
    email.html = '<html><head> </head><body>';
    // tslint:disable-next-line: max-line-length
    email.html += `<img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/54176a22-4f35-4e19-8f94-c843986e1f5e' height='auto' width='100%' display='flex'/>`;
    email.html += `<h4> Prezado, ${obj.solicitante},</h4>`;
    email.html += `<span>Seguem os dados do veículo para agendamento de devolução</span><br />`;
    email.html += `<span><b>Placa do Veículo: </b>${obj.placa}</span><br />`;
    email.html += `<span><b>Modelo do Veículo: </b>${obj.modelo}</span><br />`;
    email.html += `<span><b>Ano: </b>${obj.ano}</span><br />`;
    email.html += `<span><b>Agendamento: </b>${obj.dataAgendamento}</span><br />`;
    email.html += `<span><b>Preferência de Horário: </b>${obj.horario}</span><br />`;
    email.html += `<span></span><br />`;
    email.html += `<hr />`;
    email.html += `<span><b>Para acompanhar a solicitação, acesse aqui: </b></span><br />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<br><a href="${obj.acesso}" target="_blank"><img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/10f37eb4-d726-4c2b-927d-92fed04dd4ed' height='auto' width='150px' display='flex'/></a>`;
    email.html += '</body></html>';
    return email;
  }

  public static emailSolicitacaoDevolucao(obj: any) {
    const email: EmailPost = {};
    email.from = `noreply@unidas.com.br`;
    email.to = ['kelly.artiaga@gmail.com', obj.email];
    email.subject = `Solicitação de devolução`;
    email.html = '<html><head> </head><body>';
    // tslint:disable-next-line: max-line-length
    email.html += `<img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/eabd63b0-57f5-4e9c-9db2-d5dc45c50cd8' height='auto' width='100%' display='flex'/>`;
    email.html += `<h4> Oi, ${obj.solicitante}!</h4>`;
    email.html += `<span>Foi aberto um novo agendamento de "Devolução de veículo" nº${obj.id}. </span><br />`;
    email.html += `<span><b>Cliente: </b>${obj.cliente}</span><br />`;
    email.html += `<span><b>Código Cliente: </b>${obj.cod}</span><br />`;
    email.html += `<span><b>Cidade: </b>${obj.cidade}</span><br />`;
    email.html += `<span><b>Grupo Cliente: </b>${obj.grupo}</span><br />`;
    email.html += `<span><b>Motivo Devolução: </b>${obj.motivo}</span><br />`;
    email.html += `<span><b>Placa do Veículo: </b>${obj.placa} - ${obj.mensagemDevolucaoAntecipada}</span><br />`;
    email.html += `<span><b>Fornecedor: </b>${obj.fornecedor}</span><br />`;
    email.html += `<span><b>Data de Agendamento: </b>${obj.dataAgendamento}</span><br />`;
    email.html += `<span></span><br />`;
    email.html += `<hr />`;
    email.html += `<span><b>Para acompanhar a solicitação, acesse aqui: </b></span><br />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<br><a href="${obj.acesso}" target="_blank"><img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/10f37eb4-d726-4c2b-927d-92fed04dd4ed' height='auto' width='150px' display='flex'/></a>`;
    email.html += '</body></html>';
    return email;
  }

  public static emailAgendamentoEntrega(obj: any) {
    const email: EmailPost = {};
    email.from = `noreply@unidas.com.br`;
    email.to = ['kelly.artiaga@gmail.com', obj.email];
    email.subject = `Agendamento de entrega`;
    email.html = '<html><head> </head><body>';
    // tslint:disable-next-line: max-line-length
    email.html += `<img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/4fbeef45-ba64-4b43-a2d4-ad623c607243' height='auto' width='100%' display='flex'/>`;
    email.html += `<h4> Prezado, ${obj.solicitante}!</h4>`;
    email.html += `<span>Seguem os dados do veículo para agendamento de entrega</span><br />`;
    email.html += `<span><b>Placa do Veículo: </b>${obj.placa}</span><br />`;
    email.html += `<span><b>Modelo do Veículo: </b>${obj.modelo}</span><br />`;
    email.html += `<span><b>Ano: </b>${obj.ano}</span><br />`;
    email.html += `<span><b>Agendamento: </b>${obj.dataAgendamento}</span><br />`;
    email.html += `<span><b>Preferência de Horário: </b>${obj.horario}</span><br />`;
    email.html += `<span></span><br />`;
    email.html += `<hr />`;
    email.html += `<span><b>Para acompanhar a solicitação, acesse aqui: </b></span><br />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<br><a href="${obj.acesso}" target="_blank"><img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/10f37eb4-d726-4c2b-927d-92fed04dd4ed' height='auto' width='150px' display='flex'/></a>`;
    email.html += '</body></html>';
    return email;
  }

  public static emailSolicitacaoEntrega(obj: any) {
    const email: EmailPost = {};
    email.from = `noreply@unidas.com.br`;
    email.to = ['michelribeiro@frwk.com.br, kelly.artiaga@gmail.com, cesar.frameworksys@unidas.com.br', obj.email];
    email.subject = `Solicitação de entrega`;
    email.html = '<html><head> </head><body>';
    // tslint:disable-next-line: max-line-length
    email.html += `<img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/8617c660-93f6-4701-959a-3e923103b0b2' height='auto' width='100%' display='flex'/>`;
    email.html += `<h4> Oi, ${obj.solicitante}!</h4>`;
    email.html += `<span>Foi aberto um novo agendamento de "Entrega de veículo" nº${obj.id}. </span><br />`;
    email.html += `<span><b>Cliente: </b>${obj.cliente}</span><br />`;
    email.html += `<span><b>Código Cliente: </b>${obj.cod}</span><br />`;
    email.html += `<span><b>Cidade: </b>${obj.cidade}</span><br />`;
    email.html += `<span><b>Grupo Cliente: </b>${obj.grupo}</span><br />`;
    email.html += `<span><b>Quantidade de Veículos: </b>${obj.quantidade}</span><br />`;
    email.html += `<span><b>Placa do Veículo: </b>${obj.placa}</span><br />`;
    email.html += `<span><b>Fornecedor: </b>${obj.fornecedor}</span><br />`;
    email.html += `<span><b>Data de Agendamento: </b>${obj.dataAgendamento}</span><br />`;
    email.html += `<span></span><br />`;
    email.html += `<hr />`;
    email.html += `<span><b>Para acompanhar a solicitação, acesse aqui: </b></span><br />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<br><a href="${obj.acesso}" target="_blank"><img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/10f37eb4-d726-4c2b-927d-92fed04dd4ed' height='auto' width='150px' display='flex'/></a>`;
    email.html += '</body></html>';
    return email;
  }

  public static emailSolicitacaoSubstituicaoRecebida(obj: any) {
    const email: EmailPost = {};
    let href = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
    href = href.substring(0, href.lastIndexOf('/'));
    href = href.substring(0, href.lastIndexOf('/'));

    email.subject = `Solicitação de Veículo RECEBIDA`;
    email.html = '<html><head></head><body>';
    // tslint:disable-next-line: max-line-length
    email.html += `<img src='https://qasunidas.unidas.com.br:8005/api/v1/attachments/5C69DEC2-C3BA-4D98-8391-E39BDB1B27ED' height='auto' width='100%' display='flex'/>`;
    // tslint:disable-next-line: max-line-length
    email.html += `<h4>Oi, ${obj.solicitante || '-'}!</h4> Foi aberta uma nova Solicitação de Veículo Nº ${obj.solicitacaoId || '-'}.<br /><br />`;

    email.html += `<span><b>Cliente: </b>${obj.cliente || '-'}</span><br />`;
    email.html += `<span><b>Código Cliente: </b>${obj.clienteId || '-'}</span><br />`;
    email.html += `<span><b>Cidade: </b>${obj.cidade || '-'}</span><br />`;
    email.html += `<span><b>Categoria: </b>${obj.modelo || '-'}</span><br />`;
    email.html += `<span><b>Valor Locação: </b>${obj.valorLocacao || '-'}</span><br />`;
    email.html += `<span><b>Grupo Cliente: </b>${obj.grupoCliente || '-'}</span><br />`;
    email.html += `<span><b>Cidade Entrega: </b>${obj.cidadeEntrega || '-'}</span><br />`;
    email.html += `<span><b>Quantidade de Veículos: </b>${obj.quantidade || '-'}</span><br />`;
    email.html += `<span><b>Cor do Veículo: </b>${obj.cor || '-'}</span><br />`;
    email.html += `<span><b>Combustível do Veículo: </b>${obj.combustivel || '-'}</span><br />`;
    email.html += `<span><b>Placa do Veículo: </b>${obj.placa || '-'}</span><br />`;
    email.html += `<span><b>Modelo: </b>${obj.modelo || '-'}</span><br />`;
    email.html += `<span><b>Motivo Solicitação: </b>${obj.motivoSolicitacao || '-'}</span><br />`;
    email.html += `<span><b>Escolha da Placa: </b>${obj.escolhaPlaca || '-'}</span><br />`;
    email.html += `<span><b>Opcionais: </b>${obj.opcionais && obj.opcionais.length > 0 ? obj.opcionais : '-'}</span><br />`;

    email.html += `<span></span><br />`;
    email.html += `<hr />`;
    email.html += `<span><b>Para acompanhar a solicitação, acesse aqui: </b></span><br />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<br><a href="${href}" target="_blank"><img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/10f37eb4-d726-4c2b-927d-92fed04dd4ed' height='auto' width='150px' display='flex'/></a>`;
    email.html += '</body></html>';

    return email;
  }

  public static emailSolicitacaoSubstituicaoAprovada(obj: any) {
    const email: EmailPost = {};
    let href = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
    href = href.substring(0, href.lastIndexOf('/'));
    href = href.substring(0, href.lastIndexOf('/'));

    email.subject = `Solicitação de Veículo APROVADA`;
    email.html = '<html><head></head><body>';
    // tslint:disable-next-line: max-line-length
    email.html += `<img src='https://qasunidas.unidas.com.br:8005/api/v1/attachments/D59B5A91-4D56-4D15-8B83-D142C619F4B4' height='auto' width='100%' display='flex'/>`;
    // tslint:disable-next-line: max-line-length
    email.html += `<h4>Oi, ${obj.solicitante || '-'}!</h4> A Solicitação de Veículo Nº ${obj.solicitacaoId || '-'} foi <b>APROVADA</b>.<br /><br />`;

    email.html += `<span><b>Cliente: </b>${obj.cliente || '-'}</span><br />`;
    email.html += `<span><b>Código Cliente: </b>${obj.clienteId || '-'}</span><br />`;
    email.html += `<span><b>Cidade: </b>${obj.cidade || '-'}</span><br />`;
    email.html += `<span><b>Categoria: </b>${obj.modelo || '-'}</span><br />`;
    email.html += `<span><b>Valor Locação: </b>${obj.valorLocacao || '-'}</span><br />`;
    email.html += `<span><b>Grupo Cliente: </b>${obj.grupoCliente || '-'}</span><br />`;
    email.html += `<span><b>Cidade Entrega: </b>${obj.cidadeEntrega || '-'}</span><br />`;
    email.html += `<span><b>Quantidade de Veículos: </b>${obj.quantidade || '-'}</span><br />`;
    email.html += `<span><b>Cor do Veículo: </b>${obj.cor || '-'}</span><br />`;
    email.html += `<span><b>Combustível do Veículo: </b>${obj.combustivel || '-'}</span><br />`;
    email.html += `<span><b>Placa do Veículo: </b>${obj.placa || '-'}</span><br />`;
    email.html += `<span><b>Modelo: </b>${obj.modelo || '-'}</span><br />`;
    email.html += `<span><b>Motivo Solicitação: </b>${obj.motivoSolicitacao || '-'}</span><br />`;
    email.html += `<span><b>Escolha da Placa: </b>${obj.escolhaPlaca || '-'}</span><br />`;
    email.html += `<span><b>Opcionais: </b>${obj.opcionais && obj.opcionais.length > 0 ? obj.opcionais : '-'}</span><br />`;

    email.html += `<span></span><br />`;
    email.html += `<hr />`;
    email.html += `<span><b>Para acompanhar a solicitação, acesse aqui: </b></span><br />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<br><a href="${href}" target="_blank"><img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/10f37eb4-d726-4c2b-927d-92fed04dd4ed' height='auto' width='150px' display='flex'/></a>`;
    email.html += '</body></html>';

    return email;
  }

  public static emailSolicitacaoSubstituicaoReprovada(obj: any) {
    const email: EmailPost = {};
    let href = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
    href = href.substring(0, href.lastIndexOf('/'));
    href = href.substring(0, href.lastIndexOf('/'));

    email.subject = `Solicitação de Veículo REPROVADA`;
    email.html = '<html><head></head><body>';
    // tslint:disable-next-line: max-line-length
    email.html += `<img src='https://qasunidas.unidas.com.br:8005/api/v1/attachments/4FAC3033-9F44-49A7-A4D9-E406186EFBAD' height='auto' width='100%' display='flex'/>`;

    // tslint:disable-next-line: max-line-length
    email.html += `<h4>Oi, ${obj.solicitante || '-'}!</h4> Infelizmente a Solicitação de Veículo Nº ${obj.solicitacaoId || '-'} foi <b>REPROVADA</b>.<br /><br />`;

    email.html += `<span><b>Cliente: </b>${obj.cliente || '-'}</span><br />`;
    email.html += `<span><b>Código Cliente: </b>${obj.clienteId || '-'}</span><br />`;
    email.html += `<span><b>Cidade: </b>${obj.cidade || '-'}</span><br />`;
    email.html += `<span><b>Motivo da não Aprovação: </b>${obj.motivoReprovacao || '-'}</span><br />`;
    email.html += `<span><b>Nome Solicitante: </b>${obj.solicitante || '-'}</span><br />`;
    email.html += `<span><b>Valor Locação: </b>${obj.valorLocacao || '-'}</span><br />`;
    email.html += `<span><b>Grupo Cliente: </b>${obj.grupoCliente || '-'}</span><br />`;
    email.html += `<span><b>Cidade Entrega: </b>${obj.cidadeEntrega || '-'}</span><br />`;
    email.html += `<span><b>Quantidade de Veículos: </b>${obj.quantidade || '-'}</span><br />`;
    email.html += `<span><b>Cor do Veículo: </b>${obj.cor || '-'}</span><br />`;
    email.html += `<span><b>Combustível do Veículo: </b>${obj.combustivel || '-'}</span><br />`;
    email.html += `<span><b>Placa do Veículo: </b>${obj.placa || '-'}</span><br />`;
    email.html += `<span><b>Modelo: </b>${obj.modelo || '-'}</span><br />`;
    email.html += `<span><b>Motivo Solicitação: </b>${obj.motivoSolicitacao || '-'}</span><br />`;
    email.html += `<span><b>Escolha da Placa: </b>${obj.escolhaPlaca || '-'}</span><br />`;
    email.html += `<span><b>Opcionais: </b>${obj.opcionais && obj.opcionais.length > 0 ? obj.opcionais : '-'}</span><br />`;

    email.html += `<span></span><br />`;
    email.html += `<hr />`;
    email.html += `<span><b>Para acompanhar a solicitação, acesse aqui: </b></span><br />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<br><a href="${href}" target="_blank"><img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/10f37eb4-d726-4c2b-927d-92fed04dd4ed' height='auto' width='150px' display='flex'/></a>`;
    email.html += '</body></html>';

    return email;
  }

  public static emailSolicitacaoSubstituicaoCancelada(obj: any) {
    const email: EmailPost = {};
    let href = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
    href = href.substring(0, href.lastIndexOf('/'));
    href = href.substring(0, href.lastIndexOf('/'));

    email.subject = `Solicitação de Veículo CANCELADA`;
    email.html = '<html><head></head><body>';
    // tslint:disable-next-line: max-line-length
    email.html += `<img src='https://qasunidas.unidas.com.br:8005/api/v1/attachments/716311AF-A0D3-48D0-BA9A-C802B0034B0A' height='auto' width='100%' display='flex'/>`;
    // tslint:disable-next-line: max-line-length
    email.html += `<h4>Oi, ${obj.solicitante || '-'}!</h4> Infelizmente a Solicitação de Veículo Nº ${obj.solicitacaoId || '-'} foi <b>CANCELADA</b>.<br /><br />`;

    email.html += `<span><b>Cliente: </b>${obj.cliente || '-'}</span><br />`;
    email.html += `<span><b>Código Cliente: </b>${obj.clienteId || '-'}</span><br />`;
    email.html += `<span><b>Cidade: </b>${obj.cidade || '-'}</span><br />`;
    email.html += `<span><b>Motivo da não Aprovação: </b>${obj.motivoReprovacao || '-'}</span><br />`;
    email.html += `<span><b>Nome Solicitante: </b>${obj.solicitante || '-'}</span><br />`;
    email.html += `<span><b>Valor Locação: </b>${obj.valorLocacao || '-'}</span><br />`;
    email.html += `<span><b>Grupo Cliente: </b>${obj.grupoCliente || '-'}</span><br />`;
    email.html += `<span><b>Cidade Entrega: </b>${obj.cidadeEntrega || '-'}</span><br />`;
    email.html += `<span><b>Quantidade de Veículos: </b>${obj.quantidade || '-'}</span><br />`;
    email.html += `<span><b>Cor do Veículo: </b>${obj.cor || '-'}</span><br />`;
    email.html += `<span><b>Combustível do Veículo: </b>${obj.combustivel || '-'}</span><br />`;
    email.html += `<span><b>Placa do Veículo: </b>${obj.placa || '-'}</span><br />`;
    email.html += `<span><b>Modelo: </b>${obj.modelo || '-'}</span><br />`;
    email.html += `<span><b>Motivo Solicitação: </b>${obj.motivoSolicitacao || '-'}</span><br />`;
    email.html += `<span><b>Escolha da Placa: </b>${obj.escolhaPlaca || '-'}</span><br />`;
    email.html += `<span><b>Opcionais: </b>${obj.opcionais && obj.opcionais.length > 0 ? obj.opcionais : '-'}</span><br />`;

    email.html += `<span></span><br />`;
    email.html += `<hr />`;
    email.html += `<span><b>Para acompanhar a solicitação, acesse aqui: </b></span><br />`;
    // tslint:disable-next-line: max-line-length
    email.html += `<br><a href="${href}" target="_blank"><img src='https://dev-api.unidas.com.br/arquivos/v1/attachments/10f37eb4-d726-4c2b-927d-92fed04dd4ed' height='auto' width='150px' display='flex'/></a>`;
    email.html += '</body></html>';

    return email;
  }

}
