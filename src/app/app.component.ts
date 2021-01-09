import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivationStart, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { IBreadcrumb, McBreadcrumbsConfig } from 'ngx-breadcrumbs';
import { filter } from 'rxjs/operators';
import { icons } from 'src/app/shared/app.icons';
import { environment } from '../environments/environment';
import { AppSmallHeaderComponent } from './core/layout/full/small-header/small-header.component';
import { StoreTitleService } from './core/services/store-title.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild(AppSmallHeaderComponent) smallHeader: AppSmallHeaderComponent;
  breadcrumbs: [];
  title = 'portal-clientes';
  path = [] as IBreadcrumb[];

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private _translate: TranslateService,
    private _httpClient: HttpClient,
    private _router: Router,
    private storeTitle: StoreTitleService,
    private router: Router,
    private route: ActivatedRoute,
    private breadcrumbsConfig: McBreadcrumbsConfig
  ) {
    this.registerIcons();
    this.configurarLanguage();
  }

  ngOnInit(): void {
    this.breadCrumb(this.router.events);
    this.breadcrumbsConfig.postProcess = (x) => {
      let y = x;
      if (x.length && x[0].text !== 'Home') {
        y = [
          {
            text: 'Home',
            path: ''
          }
        ].concat(x);
      }
      return y;
    };
  }

  ngAfterViewInit() {
    this._router.events.pipe(filter(event => event instanceof ActivationStart)).subscribe(event => {
      if (event['snapshot'].data.routerTitle) {
        this.storeTitle.setTitle(event['snapshot'].data.routerTitle);
        this.storeTitle.setIcon(event['snapshot'].data.routerIcon);

        if (this.smallHeader) {
          this.smallHeader.getTitle();
          this.smallHeader.getIcon();
        }
        return;
      }
    });
  }

  breadCrumb(event): void {
    // console.log(event);
    // tslint:disable-next-line: no-shadowed-variable
    /*   this.breadcrumbsConfig.postProcess = (x) => {
        let y = x;
        if (x.length && x[0].text !== 'Home') {
          y = [
            {
              text: 'Home',
              path: ''
            }
          ].concat(x);
        }
        return y;
      }; */
    // tslint:disable-next-line: no-shadowed-variable
    event.filter((event: any) => event instanceof NavigationEnd).subscribe(() => {
      this.path = [];


      let currentRoute = this.route.root,
        // tslint:disable-next-line: prefer-const
        url = '';
      const _this = this;
      _this.breadcrumbsConfig.postProcess = (x) => {
        return _this.path.filter(Boolean);
      };
      this.path.push({ text: 'Home', path: '/home' });
      do {
        const childrenRoutes = currentRoute.children;
        currentRoute = null;
        if (childrenRoutes) {
          childrenRoutes.forEach(route => {
            if (route.outlet === 'primary') {
              const routeSnapshot = route.snapshot;
              // url += '/' + routeSnapshot.url.map(segment => segment.path).join(' >> ');
              if (routeSnapshot.data && routeSnapshot.data.routerTitle) {
                this.path.push({
                  text: this._translate.instant(routeSnapshot.data.routerTitle.toString()),
                  path: url
                });
              }
              currentRoute = route;
            }
          });
        }
      } while (currentRoute);
    });
  }
  registerIcons(): void {
    icons.forEach(element => {
      this.matIconRegistry.addSvgIcon(
        element.iconName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(element.url)
      );
    });
  }

  configurarLanguage() {
    this._httpClient.get('/assets/data/language-list.json')
      .subscribe((languages: Array<string>) => {
        this._translate.addLangs(languages);
      });
    const linguagem = sessionStorage.getItem('language');
    if (linguagem) {
      this._translate.use(linguagem);
    } else {
      this._translate.setDefaultLang(environment.defaultLanguage);
      sessionStorage.setItem('language', environment.defaultLanguage);
    }
  }
}
