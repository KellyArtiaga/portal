import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';

@Component({
  selector: 'app-tab-fornecedores',
  templateUrl: './tab-fornecedores.component.html',
  styleUrls: ['./tab-fornecedores.component.scss']
})
export class TabFornecedoresComponent implements OnInit {
  formFornecedor: FormGroup;

  fornecedores: Array<any> = [];

  showMessage: boolean;

  constructor(
    private atendimentoService: AtendimentoClienteService,
    private snackBar: SnackBarService
  ) { }

  ngOnInit() {
    this.showMessage = false;

    this.criaForm();
    this.getFornecedores();
  }

  getFornecedores(): void {
    this.atendimentoService.getFornecedor(this.atendimentoService.getStored().atendimentoId).subscribe(res => {
      if (res.data.results.length === 0) {
        this.showMessage = true;
        return;
      }

      this.fornecedores = res.data.results;
      this.criaForm(res.data.results);
    }, res => {
      this.snackBar.error(res.error.message, 7000);
    });
  }

  criaForm(fornecedores?: any): void {
    this.formFornecedor = new FormGroup({
      fornecedor1: new FormControl(fornecedores && fornecedores[0] ? fornecedores[0].nomeFantasia : null),
      fornecedor2: new FormControl(fornecedores && fornecedores[1] ? fornecedores[1].nomeFantasia : null),
      fornecedor3: new FormControl(fornecedores && fornecedores[2] ? fornecedores[2].nomeFantasia : null),
      enderecoFornecedor1: new FormControl(fornecedores && fornecedores[0] ? this.getMontarEndereco(fornecedores[0]) : null),
      enderecoFornecedor2: new FormControl(fornecedores && fornecedores[1] ? this.getMontarEndereco(fornecedores[1]) : null),
      enderecoFornecedor3: new FormControl(fornecedores && fornecedores[2] ? this.getMontarEndereco(fornecedores[2]) : null),
      dataParada1: new FormControl(fornecedores && fornecedores[0] && fornecedores[0].dataParada != null ? new Date(fornecedores[0].dataParada) : null),
      dataParada2: new FormControl(fornecedores && fornecedores[1] && fornecedores[1].dataParada != null ? new Date(fornecedores[1].dataParada) : null),
      dataParada3: new FormControl(fornecedores && fornecedores[2] && fornecedores[2].dataParada != null ? new Date(fornecedores[2].dataParada) : null),
      dataPrevisaoParada1: new FormControl(fornecedores && fornecedores[0] && fornecedores[0].dataPrevisaoParada ? new Date(fornecedores[0].dataPrevisaoParada) : null),
      dataPrevisaoParada2: new FormControl(fornecedores && fornecedores[1] && fornecedores[1].dataPrevisaoParada ? new Date(fornecedores[1].dataPrevisaoParada) : null),
      dataPrevisaoParada3: new FormControl(fornecedores && fornecedores[2] && fornecedores[2].dataPrevisaoParada ? new Date(fornecedores[2].dataPrevisaoParada) : null),
      dataPrevisaoFechamento1: new FormControl(fornecedores && fornecedores[0] && fornecedores[0].dataPrevisaoEntrega ? new Date(fornecedores[0].dataPrevisaoEntrega) : null),
      dataPrevisaoFechamento2: new FormControl(fornecedores && fornecedores[1] && fornecedores[1].dataPrevisaoEntrega ? new Date(fornecedores[1].dataPrevisaoEntrega) : null),
      dataPrevisaoFechamento3: new FormControl(fornecedores && fornecedores[2] && fornecedores[2].dataPrevisaoEntrega ? new Date(fornecedores[2].dataPrevisaoEntrega) : null)
    });
  }

  getMontarEndereco(fornecedor: any): string {
    if (!fornecedor) {
      return '';
    }
    return `${fornecedor.logradouro} ${fornecedor.numero}, ${fornecedor.bairro}, ${fornecedor.cidade}, ${fornecedor.estado}`;
  }
}
