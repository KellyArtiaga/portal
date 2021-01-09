import { Component, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { AtendimentoClienteService } from '../../../../../core/services/atendimentos-clientes.service';
import { SnackBarService } from '../../../../../core/services/snack-bar.service';
import { ColunasTabelaMV } from '../../../../../shared/interfaces/colunas-tabela.model';

@Component({
  selector: 'app-tab-ordem-servicos',
  templateUrl: './tab-ordem-servicos.component.html',
  styleUrls: ['./tab-ordem-servicos.component.scss']
})
export class TabOrdemServicosComponent implements OnInit {
  inputDataSubject = new ReplaySubject<any>(1);

  ordemServicos: any[];

  showTable: boolean;

  constructor(
    private atendimentoService: AtendimentoClienteService,
    private snackBar: SnackBarService
  ) { }

  ngOnInit() {
    this.getOS();
  }

  getOS(): void {
    this.showTable = false;
    this.atendimentoService.getOrdemServico(this.atendimentoService.getStored().atendimentoId).subscribe(res => {
      this.ordemServicos = res.data.results;
      this.showTable = true;
    }, err => {
      this.snackBar.error(err.message, 7000);
    });
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas = [
      { description: 'OS', columnDef: 'oSId' },
      { description: 'Nº Item', columnDef: 'numeroItem' },
      { description: 'Quantidade', columnDef: 'quantidade' },
      { description: 'Material', columnDef: 'material' },
      { description: 'TIpo', columnDef: 'descricaoGrupoSubGrupo' }
    ];

    return colunas;
  }
}
