import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BarraNavegacaoService } from 'src/app/core/services/barra-navegacao.service';
import { BarraNavegacaoMV } from 'src/app/shared/interfaces/barra-navegacao.model';

@Component({
  selector: 'app-barra-navegacao',
  templateUrl: './barra-navegacao.component.html',
  styleUrls: ['./barra-navegacao.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ transform: 'translateY(100%)', opacity: 0 }),
          animate('250ms', style({ transform: 'translateY(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateY(0)', opacity: 1 }),
          animate('250ms', style({ transform: 'translateY(100%)', opacity: 0 }))
        ])
      ]
    )
  ]
})
export class BarraNavegacaoComponent implements OnInit {
  @Output() cancelar = new EventEmitter<any>();

  constructor(
    private barraNavegacao: BarraNavegacaoService
  ) { }

  get(): BarraNavegacaoMV {
    return this.barraNavegacao.get();
  }

  getNav(): any {
    return this.barraNavegacao;
  }

  eventoCancelar(): void {
    this.getNav().reiniciar();
    this.cancelar.emit();
  }

  ngOnInit() { }
}
