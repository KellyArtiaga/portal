import { environment } from 'src/environments/environment';

export class AppConfig {
  static API_SERVER: string = environment.APIEndpoint;
  static API_EMAIL_SERVER: string = environment.APIEmail;
  static ARQUIVO_API_SERVER: string = environment.APIArquivos;
  static MAPS_API_SERVER: string = environment.APIMaps;
  static API_CEP: string = environment.APICep;
  static APP_VERSION: string = environment.AppVersion;
  static APP_URL: string = environment.appURL;
  static LOGIN_APP_URL: string = environment.loginAppURL;
  static CLIENT_ID: string = environment.clientId;
  static SYSTEM_CODE: string = environment.systemCode;
  static API_ALTERAR_SENHA: string = environment.APIAlterarSenha;
  static EMAIL_PADRAO: string = environment.emailPadrao;
  static API_AUTENTICACAO: string = environment.APIAutenticacao;
  static API_FERIADOS: string = environment.APIFeriados;
  static API_COMMON: string = environment.APICommon;
  static SECRET_RAC: string = environment.SECRET_RAC;
  static API_MULTAS_SERVER = environment.APIMultas;
  static API_UNIRENT = environment.API_UNIRENT;
  static URL_CAPERE: string = environment.URL_CAPERE;
  static KEY_MAPS = environment.KEY_MAPS;

  public static readonly PAGINATOR_PAGE_LENGHT = 1;
  public static readonly PAGINATOR_PAGE_SIZE = 10;
  public static readonly PAGINATOR_PAGE_ATUAL = 1;
}
