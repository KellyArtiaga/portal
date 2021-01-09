import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { GenericMenuBoxMV } from '../../interfaces/generic-menu-box.model';

@Component({
  selector: 'app-generic-menu-box',
  templateUrl: './generic-menu-box.component.html',
  styleUrls: ['./generic-menu-box.component.scss']
})
export class GenericMenuBoxComponent implements OnInit {

  @ViewChild('message') message: ElementRef;

  @Input() dataMenuBox: GenericMenuBoxMV;
  @Input() pesquisaAutoComplete: boolean;
  @Input() placaUnica: boolean;
  @Input() center?: boolean;
  @Input() isChat?: boolean;

  constructor() { }

  ngOnInit() { }

  verifyAlignmentMenu() {
    if (this.dataMenuBox.menuNoHeader) {
      return 'noHeader';
    } else if (this.dataMenuBox.menuNoHeaderAndFooter) {
      return 'noHeaderAndFooter';
    } else if (this.dataMenuBox.menuNoFooter) {
      return 'noFooter';
    }

    return '';
  }

  displayData(data: any) {
    if (data) {
      return data.display;
    }
  }

}
