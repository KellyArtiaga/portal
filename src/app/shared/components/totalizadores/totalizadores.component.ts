import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-totalizadores',
  templateUrl: './totalizadores.component.html',
  styleUrls: ['./totalizadores.component.scss']
})
export class TotalizadoresComponent {
  @Input() title: string;
  @Input() totalizadores: any[];

  constructor() { }
}
