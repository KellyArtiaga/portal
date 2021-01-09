import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { formatCnpj, formatCpf } from 'ng2-brpipes/src/utils';
import { ItensSidebarMV } from '../interfaces/sidebar-itens.model';
import { UserContextService } from 'src/app/core/services/user-context.service';

export class Util {
  public static translateService: TranslateService;

  constructor() {
    moment.locale('pt-br');
  }

  public static distinctArray(array) {
    const flags = [], output = [], l = array.length;
    for (let i = 0; i < l; i++) {
      if (flags[array[i].id]) {
        continue;
      }
      flags[array[i].id] = true;
      output.push(array[i]);
    }

    return output;
  }

  public static criarGrupoAutoComplete(nomeGrupo: string, itens: any[]): any {
    const grupo = {
      nomeGrupo: nomeGrupo,
      itens: itens
    };

    return grupo;
  }

  public static formataDocumento(documento: string): string {
    if (!documento) {
      return;
    }
    const valor = documento.replace(/\.|-|\//g, '');
    if (valor.length === 11) {
      return formatCpf(valor);
    }
    if (valor.length === 14) {
      return formatCnpj(valor);
    }
  }

  public static isEmpty(str: any): boolean {
    if (str == null || str === undefined || str === 0 || str === '') {
      return true;
    }
    return false;
  }

  public static formataData(timestamp: string | number, formato?: string): string {
    formato = formato || 'DD/MM/YYYY';
    if (!timestamp || !moment(timestamp).isValid()) {
      return '';
    }
    return moment(timestamp).locale('pt-BR').format(formato);
  }

  public static formataPlaca(placa: string): string {
    if (placa) {
      return placa.substr(0, 3) + '-' + placa.substr(3, 4);
    }
    return '';
  }

  public static getDataAtual(formato: string): string {
    if (formato === 'pt') {
      return moment().format('DD/MM/YYYY');
    }
    return moment().format('MM/DD/YYYY');
  }

  public static numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  public static numberAndHyphen(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    const charStr = String.fromCharCode(charCode);
    if ((charCode > 31 && (charCode < 48 || charCode > 57)) && (charStr !== '-')) {
      return false;
    }
    return true;
  }

  public static validarCEP(cep: string): boolean {
    if (cep.length !== 8
      || cep === '00000000'
      || cep === '11111111'
      || cep === '22222222'
      || cep === '33333333'
      || cep === '44444444'
      || cep === '55555555'
      || cep === '66666666'
      || cep === '77777777'
      || cep === '88888888'
      || cep === '99999999') {
      return false;
    }
    return true;
  }

  public static validarCPF(cpf: string): boolean {
    if (cpf) {
      cpf = cpf.replace(/\.|-/g, '');
    }
    if (!cpf || cpf.length !== 11
      || cpf === '00000000000'
      || cpf === '11111111111'
      || cpf === '22222222222'
      || cpf === '33333333333'
      || cpf === '44444444444'
      || cpf === '55555555555'
      || cpf === '66666666666'
      || cpf === '77777777777'
      || cpf === '88888888888'
      || cpf === '99999999999') {
      return false;
    }
    let soma = 0;
    let resto: number;
    for (let i = 1; i <= 9; i++) {
      soma = soma + Number(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) {
      resto = 0;
    }
    if (resto !== Number(cpf.substring(9, 10))) {
      return false;
    }
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma = soma + Number(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) {
      resto = 0;
    }
    if (resto !== Number(cpf.substring(10, 11))) {
      return false;
    }
    return true;
  }

  public static validarTelefone(telefone: string): boolean {
    if (telefone) {
      telefone = telefone.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    }
    if (!telefone
      || telefone.length < 11
      || telefone.length > 12
      || telefone === '000000000000'
      || telefone === '00000000000'
      || telefone === '111111111111'
      || telefone === '11111111111'
      || telefone === '222222222222'
      || telefone === '22222222222'
      || telefone === '333333333333'
      || telefone === '33333333333'
      || telefone === '444444444444'
      || telefone === '44444444444'
      || telefone === '555555555555'
      || telefone === '55555555555'
      || telefone === '666666666666'
      || telefone === '66666666666'
      || telefone === '777777777777'
      || telefone === '77777777777'
      || telefone === '888888888888'
      || telefone === '88888888888'
      || telefone === '999999999999'
      || telefone === '99999999999'
    ) {
      return false;
    }

    return true;
  }

  public static validarCNPJ(cnpj: string): boolean {
    if (cnpj) {
      cnpj = cnpj.replace(/\.|-|\//g, '');
    }
    if (!cnpj || cnpj.length !== 14
      || cnpj === '00000000000000'
      || cnpj === '11111111111111'
      || cnpj === '22222222222222'
      || cnpj === '33333333333333'
      || cnpj === '44444444444444'
      || cnpj === '55555555555555'
      || cnpj === '66666666666666'
      || cnpj === '77777777777777'
      || cnpj === '88888888888888'
      || cnpj === '99999999999999') {
      return false;
    }
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += Number(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== Number(digitos.charAt(0))) {
      return false;
    }
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += Number(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== Number(digitos.charAt(1))) {
      return false;
    }
    return true;
  }

  public static PascalCaseString(content?: string) {
    if (content != null) {
      content = content.replace('_', ' ');
      return content.replace(/(\w)(\w*)/g,
        function (g0, g1, g2) {
          return g1.toUpperCase() + g2.toLowerCase();
        });
    }
  }

  public static validators(form: FormGroup, data: any[]): void {
    if (!form || !data) {
      return;
    }
    const doIt = (name: string, validators: any[]) => {
      if (!form.controls[name]) {
        return;
      }
      form.controls[name].validator = Validators.compose([]);
      if (form.controls[name].validator) {
        const value = form.controls[name].validator(form.controls[name]);
        if (value && value.required) {
          validators.unshift(Validators.required);
        }
      }
      form.controls[name].validator = Validators.compose(validators);
      form.controls[name].updateValueAndValidity();
    };
    data.forEach((item: any) => {
      if (Array.isArray(item.name)) {
        item.name.forEach(name => {
          doIt(name, item.validators);
        });
        return;
      }
      doIt(item.name, item.validators);
    });
  }

  public static validFields(form: FormGroup, data: string[]): boolean {
    if (!form || !data) {
      return false;
    }
    let valid = true;
    data.forEach((item: any) => {
      if (!form.get(item).valid) {
        valid = false;
      }
    });
    return valid;
  }

  public static recuperarDiadoMes(milliseconds: number): number {
    let resultado: string;

    resultado = Util.formataData(milliseconds, 'DD-MM-YYYY');

    const date = moment(resultado, 'DD-MM-YYYY');
    const day = date.date();

    return day;
  }

  public static recuperarMes(milliseconds: number): string {
    let resultado: string;

    resultado = Util.formataData(milliseconds, 'DD-MM-YYYY');

    const date = moment(resultado, 'DD-MM-YYYY');
    const month = date.month();

    return this.getMes(month.toString()) + '/2019';
  }

  public static numberToMoney(str: any, moeda = true): string {
    const truncate = (str).toFixed(2).replace('.', ',');
    return `${moeda ? 'R$' : ''}${truncate.replace(/(\d(?=(\d{3})+\,))/g, '$&.')}`;
  }

  public static getMes(numeroMes: string): any {
    const meses = {
      '0': { descricaoMes: 'Janeiro', abr: 'jan' },
      '1': { descricaoMes: 'Fevereiro', abr: 'fev' },
      '2': { descricaoMes: 'Março', abr: 'mar' },
      '3': { descricaoMes: 'Abril', abr: 'abr' },
      '4': { descricaoMes: 'Maio', abr: 'mai' },
      '5': { descricaoMes: 'Junho', abr: 'jun' },
      '6': { descricaoMes: 'Julho', abr: 'jul' },
      '7': { descricaoMes: 'Agosto', abr: 'ago' },
      '8': { descricaoMes: 'Setembro', abr: 'set' },
      '9': { descricaoMes: 'Outubro', abr: 'out' },
      '10': { descricaoMes: 'Novembro', abr: 'nov' },
      '11': { descricaoMes: 'Dezembro', abr: 'dez' },
    };

    return meses[numeroMes];
  }

  public static getCurrentYear(): any {
    return moment(new Date()).format('YYYY');
  }

  public static convertMilliSecondsToHour(milliseconds: number): number {
    const horaEmMillisegundos = 3600000;
    const qtddHoras = milliseconds / horaEmMillisegundos;
    return parseFloat(qtddHoras.toFixed(0));
  }

  public static getMillisegundos(): number {
    const today = new Date();
    return today.getTime();
  }

  public static convertMilliSecondsToDays(milliseconds: number): number {
    const diasEmMillisegundos = 86400000;
    const qtddDias = milliseconds / diasEmMillisegundos;
    return parseFloat(qtddDias.toFixed(0));
  }

  public static validarDataSource(dataSource): boolean {
    if (dataSource.length === 0) {
      return true;
    }
    return false;
  }

  public static formataTelefone(telefone: string): string {
    if (telefone.length === 8) {
      return telefone.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    telefone = telefone.replace(/\D/g, '');
    telefone = telefone.replace(/^(\d{2})(\d)/g, '($1)$2');
    telefone = telefone.replace(/(\d)(\d{4})$/, '$1-$2');

    return telefone;
  }

  public static formataDataManual(data: string): string {
    const date = data.replace(/\D/g, '').slice(0, 10);
    if (date.length >= 5) {
      return `${date.slice(0, 2)}/${date.slice(2, 4)}/${date.slice(4)}`;
    } else if (date.length >= 3) {
      return `${date.slice(0, 2)}/${date.slice(2)}`;
    }
    return date;
  }

  public static compare(a: string | number, b: string | number, isAsc: boolean, colName) {
    const a1: any = a ? a : (typeof b === 'string' ? '' : 0);
    const b1: any = b ? b : (typeof a === 'string' ? '' : 0);

    if (a1 === b1) {
      return 0;
    }

    return (a1 > b1 ? 1 : -1) * (isAsc ? 1 : -1);
  }

  public static sortTable(event: any, dataSource) {
    const column: any = event.active;
    const isAsc = event.direction === 'asc';
    dataSource.filteredData.sort(function (a, b) {
      return Util.compare(a[column], b[column], isAsc, column);
    });

    return dataSource.filteredData;
  }

  public static wordCapitalize(text: string) {
    return text.charAt(0).toUpperCase() + (text.length > 1 ? text.slice(1).toLowerCase() : '');
  }

  public static filterArray(value: string, array: any[]): any[] {
    if (value) {
      const filterValue = value.toLowerCase();

      return array.filter(valor => valor.toLowerCase().indexOf(filterValue) === 0);
    }
  }

  public static hasValue(value: any): string {
    if (!value || value === undefined || value == null || typeof value === 'undefined') {
      return '';
    }
    return value;
  }

  public static formataStatus(status: string): string {
    if (status === 'D') {
      return 'DISPONIVEL';
    }
    if (status === 'R') {
      return 'RODANDO';
    }
    if (status === 'S') {
      return 'SUSPENSO';
    }
  }

  public static validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  public static getTipoArquivos(): any[] {
    return [{
      id: 'A',
      descricao: 'AVS'
    }, {
      id: 'B',
      descricao: 'BO'
    }, {
      id: 'C',
      descricao: 'CNH'
    }, {
      id: 'M',
      descricao: 'Cliente Autoriza Manutenção'
    }, {
      id: 'R',
      descricao: 'Cliente Autoriza Dispensa Reserva'
    }, {
      id: 'D',
      descricao: 'DUT'
    }, {
      id: 'F',
      descricao: 'Foto Padrão'
    }, {
      id: 'O',
      descricao: 'Outros'
    }, {
      id: 'L',
      descricao: 'Laudo'
    }];
  }

  public static combineObj(oldObject, newObject): any {
    if (oldObject && newObject) {
      // tslint:disable-next-line: forin
      for (const attr in newObject) {
        oldObject[attr] = newObject[attr];
      }
    }

    return oldObject;
  }

  public static desabilitarValidacoes(form: FormGroup, campos: any): void {
    if (Array.isArray(campos)) {
      campos.forEach(campo => {
        form.get(campo).clearValidators();
        form.get(campo).updateValueAndValidity();
      });
    } else {
      form.get(campos).clearValidators();
      form.get(campos).updateValueAndValidity();
    }
  }

  public static habilitarValidacoes(form: FormGroup, campos: any) {
    if (Array.isArray(campos)) {
      campos.forEach(campo => {
        form.get(campo).setValidators([Validators.required]);
        form.get(campo).updateValueAndValidity();
      });
    } else {
      form.get(campos).setValidators([Validators.required]);
      form.get(campos).updateValueAndValidity();
    }
  }

  public static montarMensagem(template: string, parameterObject: any): string {
    const mensagem = this.translateService.instant(template, parameterObject);
    return mensagem;
  }

  public static removeSpecialCharacters(value: string): string {
    return value.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, '');
  }

  public static getFiltroStatus(): any[] {
    return [
      { id: 'TODOS', descricao: 'Todos' },
      { id: 'ABERTO', descricao: 'Aberto' },
      { id: 'FECHADO', descricao: 'Fechado' }
    ];
  }

  public static getFormValue(form: FormGroup, key?: string): any {
    let value = null;

    if (key) {
      value = form.get(key).value;
    } else {
      value = form.value;
    }

    return value;
  }

  public static disableFieldForm(form: FormGroup, key: any): void {
    if (Array.isArray(key)) {
      key.forEach((value: string) => {
        form.get(value).disable();
      });
    } else {
      form.get(key).disable();
    }
  }

  public static enableFieldForm(form: FormGroup, key: any): void {
    if (Array.isArray(key)) {
      key.forEach((value: string) => {
        form.get(value).enable();
      });
    } else {
      form.get(key).enable();
    }
  }

  public static getMesBySigla(sigla: string): string {
    return this.getMeses().find(item => item.sigla === sigla);
  }

  public static getMeses(): any[] {
    return [
      {
        id: 1,
        descricao: 'Janeiro',
        sigla: 'jan'
      },
      {
        id: 2,
        descricao: 'Fevereiro',
        sigla: 'fev'
      },
      {
        id: 3,
        descricao: 'Março',
        sigla: 'mar'
      },
      {
        id: 4,
        descricao: 'Abril',
        sigla: 'abr'
      },
      {
        id: 5,
        descricao: 'Maio',
        sigla: 'mai'
      },
      {
        id: 6,
        descricao: 'Junho',
        sigla: 'jun'
      },
      {
        id: 7,
        descricao: 'Julho',
        sigla: 'jul'
      },
      {
        id: 8,
        descricao: 'Agosto',
        sigla: 'ago'
      },
      {
        id: 9,
        descricao: 'Setembro',
        sigla: 'set'
      },
      {
        id: 10,
        descricao: 'Outubro',
        sigla: 'out'
      },
      {
        id: 11,
        descricao: 'Novembro',
        sigla: 'nov'
      },
      {
        id: 12,
        descricao: 'Dezembro',
        sigla: 'dez'
      }
    ];
  }

  public static getUfs(): any {
    return {
      'AC': {
        descricao: 'Acre',
        sigla: 'AC',
        value: 0
      },
      'AL': {
        descricao: 'Alagoas',
        sigla: 'AL',
        value: 0
      },
      'AP': {
        descricao: 'Amapá',
        sigla: 'AP',
        value: 0
      },
      'AM': {
        descricao: 'Amazonas',
        sigla: 'AM',
        value: 0
      },
      'BA': {
        descricao: 'Bahia',
        sigla: 'BA',
        value: 0
      },
      'CE': {
        descricao: 'Ceará',
        sigla: 'CE',
        value: 0
      },
      'DF': {
        descricao: 'Distrito Federal',
        sigla: 'DF',
        value: 0
      },
      'ES': {
        descricao: 'Espírito Santo',
        sigla: 'ES',
        value: 0
      },
      'GO': {
        descricao: 'Goiás',
        sigla: 'GO',
        value: 0
      },
      'MA': {
        descricao: 'Maranhão',
        sigla: 'MA',
        value: 0
      },
      'MT': {
        descricao: 'Mato Grosso',
        sigla: 'MT',
        value: 0
      },
      'MS': {
        descricao: 'Mato Grosso do Sul',
        sigla: 'MS',
        value: 0
      },
      'MG': {
        descricao: 'Minas Gerais',
        sigla: 'MG',
        value: 0
      },
      'PA': {
        descricao: 'Pará',
        sigla: 'PA',
        value: 0
      },
      'PB': {
        descricao: 'Paraíba',
        sigla: 'PB',
        value: 0
      },
      'PR': {
        descricao: 'Paraná',
        sigla: 'PR',
        value: 0
      },
      'PE': {
        descricao: 'Pernambuco',
        sigla: 'PE',
        value: 0
      },
      'PI': {
        descricao: 'Piauí',
        sigla: 'PI',
        value: 0
      },
      'RJ': {
        descricao: 'Rio de Janeiro',
        sigla: 'RJ',
        value: 0
      },
      'RN': {
        descricao: 'Rio Grande do Norte',
        sigla: 'RN',
        value: 0
      },
      'RS': {
        descricao: 'Rio Grande do Sul',
        sigla: 'RS',
        value: 0
      },
      'RO': {
        descricao: 'Rondônia',
        sigla: 'RD',
        value: 0
      },
      'RR': {
        descricao: 'Roraima',
        sigla: 'RR',
        value: 0
      },
      'SC': {
        descricao: 'Santa Catarina',
        sigla: 'SC',
        value: 0
      },
      'SP': {
        descricao: 'São Paulo',
        sigla: 'SP',
        value: 0
      },
      'SE': {
        descricao: 'Sergipe',
        sigla: 'SE',
        value: 0
      },
      'TO': {
        descricao: 'Tocantins',
        sigla: 'TO',
        value: 0
      }
    };
  }

  public static getRandomNumber(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  public static addDaysInDate(days: number, date?: Date): any {
    if (!date) {
      date = new Date();
    }

    return new Date(date.setDate(date.getDate() + days));
  }

  public static removerDate(data: Date | string): string {

    if (typeof data === 'string') {
      return data ? data.substring(data.indexOf('T') + 1, data.lastIndexOf(':')) : null;
    }

    return data ? data.toTimeString().substring(0, data.toTimeString().lastIndexOf(':')) : null;
  }

  public static removerTime(data: Date | string): string {

    if (typeof data === 'string') {
      return data ? data.substring(0, data.indexOf('T')) : null;
    }

    return data ? data.toISOString().substring(0, data.toISOString().indexOf('T')) : null;
  }

  public static removerTimezone(date: string): string {
    return date.replace('T', ' ').substring(0, date.lastIndexOf('.'));
  }

  public static formatarHora(hora: string) {
    if (hora) {
      if (hora.length === 4) {
        hora = hora.substring(0, 2) + ':' + hora.substring(2, 4) + ':' + '00';
      } else if (hora.length === 5) {
        hora = hora + ':' + '00';
      } else if (hora.length === 6) {
        hora = hora.substring(0, 2) + ':' + hora.substring(2, 4) + ':' + hora.substring(4, 6);
      }
    }
    return hora;
  }

  public static habilitarCampos(form: FormGroup, campos: any[]) {
    // tslint:disable-next-line: forin
    for (const campo in campos) {
      form.get(campos[campo]).enable();
    }
  }

  public static desabilitarCampos(form: FormGroup, campos: any[]) {
    // tslint:disable-next-line: forin
    for (const campo in campos) {
      form.get(campos[campo]).disable();
    }
  }

  public static getClientesId(form: FormGroup, fieldName?: string): any[] {

    fieldName = fieldName || 'clientes';

    if (!form.value[fieldName] || form.value[fieldName].length === 0) {
      return [];
    }
    return form.value[fieldName].map(value => {
      return value.id || value.clienteId;
    });
  }

  public static getClientesCpfCnpj(form: FormGroup): any[] {
    if (!form.value.clientes || form.value.clientes.length === 0) {
      return [];
    }
    return form.value.clientes.map(value => {
      return value.cnpjCpf;
    });
  }

  public static getRegionaisId(form: FormGroup, fieldName?: string): any[] {
    fieldName = fieldName || 'regionais';

    if (!form.value[fieldName] || form.value[fieldName].length === 0) {
      return [];
    }
    return form.value[fieldName].map(value => {
      return value.id;
    });
  }

  public static getCentrosCustosId(form: FormGroup, fieldName?: string): any[] {
    fieldName = fieldName || 'centrosCusto';

    if (!form.value[fieldName] || form.value[fieldName].length === 0) {
      return [];
    }
    return form.value[fieldName].map(value => {
      return value.id;
    });
  }

  public static getPlacaForm(form: FormGroup): string {
    if (typeof form.value.placa === 'string') {
      return form.value.placa.replace(/[.-]/g, '');
    }
    if (form.value.placa && form.value.placa.placa) {
      return form.value.placa.placa.replace(/[.-]/g, '');
    }
    return null;
  }

  public static stringToDate(date: string, characterToSplit: string) {
    const dateInput: any[] = date.split(characterToSplit);
    return new Date(dateInput[2], dateInput[1] - 1, dateInput[0]);
  }

  public static dateIsValid(date: string, format: string) {
    const timestamp = this.stringToDate(date, '/').getTime() - new Date().getTimezoneOffset() * 60 * 1000;
    return moment(date, format, true).isValid() && timestamp > 0;
  }

  public static birthdateIsValid(date: string, format: string) {
    return moment(date, format, true).isValid() && moment(date, format, true).year() > 1900;
  }

  public static firstLiscenceIsValidDate(date1: string, date2: string, format) {
    return moment(date2, format, true).diff(moment(date1, format, true), 'years') >= 18;
  }

  public static habilitarCampoSomenteLeitura(form: FormGroup, campos?: any[]) {
    if (campos) {
      // tslint:disable-next-line: forin
      for (const campo in campos) {
        document.getElementById(campo) ? document.getElementById(campo).setAttribute('readonly', 'true') : (() => { })();
      }
    } else {
      Object.keys(form.controls).forEach(field => {
        document.getElementById(field) ? document.getElementById(field).setAttribute('readonly', 'true') : (() => { })();
      });
    }
  }

  public static desabilitarCampoSomenteLeitura(form: FormGroup, campos?: any[]) {
    if (campos) {
      // tslint:disable-next-line: forin
      for (const campo in campos) {
        document.getElementById(campo) ? document.getElementById(campo).removeAttribute('readonly') : (() => { })();
      }
    } else {
      Object.keys(form.controls).forEach(field => {
        document.getElementById(field) ? document.getElementById(field).removeAttribute('readonly') : (() => { })();
      });
    }
  }

  public static validateEmail(email: string) {
    // tslint:disable-next-line: max-line-length
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  public static hasPermission(role: string): boolean {
    if (JSON.parse(localStorage.getItem('master'))) {
      return true;
    } else {
      return JSON.parse(localStorage.getItem('dados'))['userPermissions'].some(item => item.chaveFuncionalidade === role);
    }
  }

  public static hasPermissaoMenu(userContext: UserContextService, funcionalidade: string, children?: Array<ItensSidebarMV>): boolean {
    const roles = children || userContext.getRoles() || [];
    return userContext.getIsMaster() || !!roles.find(item => {
      return (item.funcionalidade === funcionalidade
        && (item.show || (item.permissoes && Object.values(item.permissoes).some(permissao => permissao === true))))
        || (item.children && item.children.length > 0 && Util.hasPermissaoMenu(userContext, funcionalidade, item.children));
    });
  }

  public static validarAgrupadores(values: any): boolean {
    return (_.isNil(values.clientesId) || values.clientesId.length === 0) &&
      (_.isNil(values.regionaisId) || values.regionaisId.length === 0) &&
      (_.isNil(values.centrosCustoId) || values.centrosCustoId.length === 0);
  }

}
