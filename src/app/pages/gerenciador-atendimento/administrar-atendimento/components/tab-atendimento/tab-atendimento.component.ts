import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-tab-atendimento',
  templateUrl: './tab-atendimento.component.html',
  styleUrls: ['./tab-atendimento.component.scss']
})
export class TabAtendimentoComponent implements OnInit {
  formAtendimento: FormGroup;

  descricaoServico: string;
  mask: string;

  constructor(
    private atendimentoService: AtendimentoClienteService,
    private snackBar: SnackBarService
  ) { }

  ngOnInit() {
    this.criaForm();

    this.getAtendimento();
  }

  getAtendimento(): void {
    this.atendimentoService.get(this.atendimentoService.getStored().atendimentoId).subscribe(res => {
      this.criaForm(res.data);
      this.descricaoServico = res.data.descricaoServicos;
    }, res => {
      this.snackBar.error(res.error.message, 7000);
    });
  }

  criaForm(atendimento?: any): void {
    this.formAtendimento = new FormGroup({
      'situacaoAtendimento': new FormControl(atendimento ? atendimento.situacao : ''),
      'codigoAtendimento': new FormControl(atendimento ? atendimento.atendimentoId : ''),
      'placa': new FormControl(atendimento ? atendimento.placa : ''),
      'statusPlaca': new FormControl(atendimento ? atendimento.statusVeiculoReserva : ''),
      'municipio': new FormControl(atendimento ? atendimento.municipio : ''),
      'uf': new FormControl(atendimento ? atendimento.uf : ''),
      'dataInicio': new FormControl(atendimento && atendimento.dataHoraAtendimento ? new Date(atendimento.dataHoraAtendimento) : null),
      'dataFim': new FormControl(atendimento && atendimento.dataHoraFechamento ? new Date(atendimento.dataHoraFechamento) : null),
      'motorista': new FormControl(atendimento ? atendimento.motorista : ''),
      'email': new FormControl(atendimento ? atendimento.email : ''),
      'telefone': new FormControl(atendimento ? atendimento.telefone : ''),
      'km': new FormControl(atendimento ? atendimento.odometroAtual : ''),
      'manutencaoPreventiva': new FormControl(atendimento ? atendimento.preventiva : false),
      'manutencaoCorretiva': new FormControl(atendimento ? atendimento.corretiva : false),
      'sinistro': new FormControl(atendimento ? atendimento.sinistro : false)
    });
  }
}
