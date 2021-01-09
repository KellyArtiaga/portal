import { Injectable } from '@angular/core';

import { BarraNavegacaoMV } from '../../../app/shared/interfaces/barra-navegacao.model';
import { ReloadListasService } from './reload-listas.service';
import { UserContextService } from './user-context.service';

@Injectable({
  providedIn: 'root'
})
export class BarraNavegacaoService {
  private condutorCNH: any;

  public curTab: string;
  public editedCNHId: string;

  private data: BarraNavegacaoMV = this.getDefaultData();

  constructor(private userContext: UserContextService) { }

  get(): BarraNavegacaoMV {
    return this.data;
  }

  setCondutorCNH(cnh: any): void {
    this.condutorCNH = cnh;
  }

  getCondutorCNH(): any {
    return this.condutorCNH;
  }

  setTabAtual(tab: string): void {
    this.curTab = tab;
  }

  concatUserData(obj: any): void {
    this.data.dadosUsuario[this.curTab] = obj;
  }

  getDadosUsuario(): any {
    if (this.get().dadosUsuario) {
      return this.get().dadosUsuario;
    }
  }

  setDados(dados: any, tab: string): void {
    this.curTab = tab;
    this.concatUserData(dados);
  }

  reiniciar(): void {
    this.resetForms();
    this.data = this.getDefaultData();
  }

  resetForms(): void {
    ReloadListasService.get('resetDadosPessoais').emit();
    ReloadListasService.get('resetContato').emit();
    ReloadListasService.get('resetDadosAdicionais').emit();
    ReloadListasService.get('resetEndereco').emit();
    ReloadListasService.get('resetHabilitacao').emit();
  }

  navegar(habilitar?: boolean): void {
    this.data.navegar = habilitar;
  }

  habilitar(nome: any, habilitar?: boolean): void {
    if (Array.isArray(nome)) {
      nome.forEach(item => {
        if (item === 'prosseguir' && this.data.edicao) {
          this.data.habilitar[item] = true;
          return;
        }
        this.data.habilitar[item] = typeof habilitar === 'undefined' ? true : habilitar;
      });
      return;
    }
    if (nome === 'prosseguir' && this.data.edicao) {
      this.data.habilitar[nome] = true;
      return;
    }
    this.data.habilitar[nome] = typeof habilitar === 'undefined' ? true : habilitar;
  }

  validar(nome: any, validar?: boolean): void {
    if (Array.isArray(nome)) {
      nome.forEach(item => {
        this.data.validar[item] = typeof validar === 'undefined' ? true : validar;
      });
      return;
    }
    this.data.validar[nome] = typeof validar === 'undefined' ? true : validar;
  }

  mostrar(nome: any, mostrar?: boolean): void {
    if (Array.isArray(nome)) {
      nome.forEach(item => {
        this.data.mostrar[item] = typeof mostrar === 'undefined' ? true : mostrar;
      });
      return;
    }
    this.data.mostrar[nome] = typeof mostrar === 'undefined' ? true : mostrar;
  }

  label(nome: string, valor: string): void {
    this.data.label[nome] = valor;
  }

  icone(nome: string, valor: string): void {
    this.data.icone[nome] = valor;
  }

  proxima() {
    if (this.data.edicao) {
      ReloadListasService.get(`salvarCondutor`).emit('editar');
      return;
    }

    ReloadListasService.get(`${this.curTab}`).emit();

    if (this.data.aba === 4 && this.get().salvar && !this.data.edicao) {
      ReloadListasService.get('salvarCondutor').emit('salvar');
      return;
    }

    if (this.data.aba === 4) {
      this.label('prosseguir', 'Salvar');
      this.icone('prosseguir', 'check');
      return;
    }

    this.data.aba++;
  }

  anterior() {
    if (this.data.aba === 0) {
      return;
    }
    this.data.aba--;

    if (this.data.aba < 4) {
      this.label('prosseguir', 'Avançar');
      this.icone('prosseguir', 'arrow_forward');
    }
  }

  proximaAtendimento(): void {
    if (this.data.aba === 3) {
      return;
    }
    this.data.aba++;
  }

  private getDefaultData() {
    return {
      aba: 0,
      canDeactivate: false,
      habilitar: {}, navegar: false, mostrar: {},
      validar: {},
      label: {
        prosseguir: 'Avançar',
        voltar: 'Voltar'
      },
      icone: {
        prosseguir: 'arrow_forward',
        voltar: 'arrow_back'
      },
      dadosUsuario: {},
      edicao: false
    };
  }

}
