import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-acompanhar-entrega-veiculo-mapa',
  templateUrl: './acompanhar-entrega-veiculo-mapa.component.html',
  styleUrls: ['./acompanhar-entrega-veiculo-mapa.component.scss']
})
export class AcompanharEntregaVeiculoMapaComponent implements OnInit {

  lat: number;
  lng: number;
  zoom: number = 17;
  address: string;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.lat = this.data.lat;
    this.lng = this.data.lng;
    this.address = this.data.address;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  onMouseOver(infoWindow, $event: MouseEvent) {
    infoWindow.open();
  }

  onMouseOut(infoWindow, $event: MouseEvent) {
    infoWindow.close();
  }

}
