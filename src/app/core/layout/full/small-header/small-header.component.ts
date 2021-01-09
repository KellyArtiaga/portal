import { Component, OnInit } from '@angular/core';
import { StoreTitleService } from 'src/app/core/services/store-title.service';
import { Util } from 'src/app/shared/util/utils';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-small-header',
  templateUrl: './small-header.component.html',
  styleUrls: ['./small-header.component.scss']
})
export class AppSmallHeaderComponent implements OnInit {
  title: string;

  constructor(
    private storeTitle: StoreTitleService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void { }

  getTitle(): string {
    if (this.storeTitle.getTitle()) {
      return this.translate.instant(this.storeTitle.getTitle());
    }
    return '';
  }

  getIcon(): string {
    return this.storeTitle.getIcon();
  }

  wordCapitalize(str: string): string {
    return Util.wordCapitalize(str);
  }
}
