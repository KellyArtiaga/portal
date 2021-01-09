import { Injectable } from '@angular/core';
import { findIndex } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class FiltroIndicadoresStorage {
  private financeiro: any[] = [];
  private frotas: any[] = [];
  private infracoes: any[] = [];
  private manutencoes: any[] = [];
  private avarias: any[] = [];
  private poolPneus: any[] = [];
  private poolReservaPneus: any[] = [];
  private atendimentos: any[] = [];
  private indicadoresGerais: any[] = [];
  private filtroIndicadores: any;

  private htmlIndicadores: any;

  private _clientes: any[];
  private _service: any;

  private _modalCloseFunction: Function;
  private _filtroPlacaFunction: Function;
  private _filtroPeriodoFunction: Function;

  public exportMethod: Function;
  public methodService: string;

  get currentService() {
    return this._service;
  }

  set currentService(service: any) {
    this._service = service;
  }

  set clientes(clientes: any[]) {
    this._clientes = clientes;
  }

  get clientes() {
    return this._clientes;
  }

  set modalClose(func: Function) {
    this._modalCloseFunction = func;
  }

  get modalClose(): Function {
    return this._modalCloseFunction;
  }

  set filtroIndicadorAtendimento(filtro: any) {
    if (this.atendimentos.length > 0 && findIndex(this.atendimentos, ['id', filtro.id]) !== -1) {
      const idx = findIndex(this.atendimentos, ['id', filtro.id]);

      this.atendimentos[idx] = filtro;
      return;
    }
    this.atendimentos.push(filtro);
  }

  get filtroIndicadorAtendimento() {
    return this.atendimentos;
  }

  set filtroIndicadorPoolPneus(filtro: any) {
    if (this.poolPneus.length > 0 && findIndex(this.poolPneus, ['id', filtro.id]) !== -1) {
      const idx = findIndex(this.poolPneus, ['id', filtro.id]);

      this.poolPneus[idx] = filtro;
      return;
    }
    this.poolPneus.push(filtro);
  }

  get filtroIndicadorPoolPneus() {
    return this.poolPneus;
  }

  set filtroIndicadorPoolReserva(filtro: any) {
    if (this.poolReservaPneus.length > 0 && findIndex(this.poolReservaPneus, ['id', filtro.id]) !== -1) {
      const idx = findIndex(this.poolReservaPneus, ['id', filtro.id]);

      this.poolReservaPneus[idx] = filtro;
      return;
    }
    this.poolReservaPneus.push(filtro);
  }

  get filtroIndicadorPoolReserva() {
    return this.poolReservaPneus;
  }

  set filtroIndicadorManutencoes(filtro: any) {
    if (this.manutencoes.length > 0 && findIndex(this.manutencoes, ['id', filtro.id]) !== -1) {
      const idx = findIndex(this.manutencoes, ['id', filtro.id]);

      this.manutencoes[idx] = filtro;
      return;
    }
    this.manutencoes.push(filtro);
  }

  get filtroIndicadorManutencoes() {
    return this.manutencoes;
  }

  set filtroIndicadorAvarias(filtro: any) {
    if (this.infracoes.length > 0 && findIndex(this.infracoes, ['id', filtro.id]) !== -1) {
      const idx = findIndex(this.infracoes, ['id', filtro.id]);

      this.infracoes[idx] = filtro;
      return;
    }
    this.avarias.push(filtro);
  }

  get filtroIndicadorAvarias() {
    return this.avarias;
  }

  set filtroIndicadorFinanceiro(filtro: any) {
    if (this.financeiro.length > 0 && findIndex(this.financeiro, ['id', filtro.id]) !== -1) {
      const idx = findIndex(this.financeiro, ['id', filtro.id]);

      this.financeiro[idx] = filtro;
      return;
    }
    this.financeiro.push(filtro);
  }

  get filtroIndicadorFinanceiro() {
    return this.financeiro;
  }

  set filtroIndicadorInfracoes(filtro: any) {
    if (this.infracoes.length > 0 && findIndex(this.infracoes, ['id', filtro.id]) !== -1) {
      const idx = findIndex(this.infracoes, ['id', filtro.id]);

      this.infracoes[idx] = filtro;
      return;
    }
    this.infracoes.push(filtro);
  }

  get filtroIndicadorInfracoes() {
    return this.infracoes;
  }

  set filtroIndicadorFrota(filtro: any) {
    if (this.frotas.length > 0 && findIndex(this.frotas, ['id', filtro.id]) !== -1) {
      const idx = findIndex(this.frotas, ['id', filtro.id]);

      this.frotas[idx] = filtro;
      return;
    }
    this.frotas.push(filtro);
  }

  get filtroIndicadorFrota() {
    return this.frotas;
  }

  set filtroPlaca(setPlacaFunction: Function) {
    this._filtroPlacaFunction = setPlacaFunction;
  }

  get filtroPlaca(): Function {
    return this._filtroPlacaFunction;
  }

  set filtroIndicadoresGerais(filtro: any) {
    if (this.indicadoresGerais.length > 0 && findIndex(this.indicadoresGerais, ['id', filtro.id]) !== -1) {
      const idx = findIndex(this.indicadoresGerais, ['id', filtro.id]);

      this.indicadoresGerais[idx] = filtro;
      return;
    }
    this.indicadoresGerais.push(filtro);
  }

  get filtroIndicadoresGerais() {
    return this.indicadoresGerais;
  }

  set filtroPeriodo(setPeriodoFunction: Function) {
    this._filtroPeriodoFunction = setPeriodoFunction;
  }

  get filtroPeriodo(): Function {
    return this._filtroPeriodoFunction;
  }

  get filtroPesquisa(): any {
    return this.filtroIndicadores;
  }

  set filtroPesquisa(filtro: any) {
    this.filtroIndicadores = filtro;
  }

  get graficosHtml() {
    return this.htmlIndicadores;
  }

  set graficosHtml(html) {
    this.htmlIndicadores = html;
  }

  removerFiltro(i: number, indicador: string, todos?: boolean): void {
    if (todos) {
      this[indicador] = [];
      return;
    }
    this[indicador].splice(i, 1);
  }
}
