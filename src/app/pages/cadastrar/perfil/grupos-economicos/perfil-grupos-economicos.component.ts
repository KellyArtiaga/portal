import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { PerfilGrupoEconomicoService } from '../../../../core/services/perfil-grupoeconomico.service';
import * as _ from 'lodash';
import { PerfilService } from 'src/app/core/services/perfil.service';
import { TipoPerfil } from 'src/assets/data/enums/tipo-perfil.enum';
import { SelectionModel, SelectionChange } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-perfil-grupos-economicos',
  templateUrl: './perfil-grupos-economicos.component.html',
  styleUrls: ['./perfil-grupos-economicos.component.scss'],
})
export class PerfilGruposEconomicosComponent implements OnInit, OnDestroy {

  @ViewChild('search') search: any;
  idPerfil: number;
  perfil: any;
  idsGruposEconomicos: number[];
  totalGruposEconomicos = new BehaviorSubject<number>(0);
  cols: any[] = [
    {
      title: 'Nome do Grupo Econômico',
      prop: 'nome',
      sort: false
    }
  ];

  constructor(
    private perfilGrupoEconomicoService: PerfilGrupoEconomicoService,
    private perfilService: PerfilService,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private snackBar: SnackBarService
  ) { }

  ngOnInit() {
    this.idPerfil = this.activatedRoute.snapshot.params['id'];
    this.search.subject.subscribe(() => {
      this.search.selectAllById(this.idsGruposEconomicos);
    });

    this.perfilService.get(this.idPerfil)
      .subscribe((result) => {
        this.perfil = result.data;
        if (this.perfil.tipoPerfil) {
          this.perfil.descricaoTipoPerfil = TipoPerfil[this.perfil.tipoPerfil];
        }
      });
    this.perfilGrupoEconomicoService.getGruposEconomicosIds(this.idPerfil)
      .subscribe((result) => {
        this.idsGruposEconomicos = result.data;
        this.search.selectAllById(this.idsGruposEconomicos);
        this.totalGruposEconomicos.next(this.idsGruposEconomicos.length);
      });


    (this.search.selection as SelectionModel<any>).onChange.subscribe((changes: SelectionChange<any>) => {
      if (!_.isEmpty(changes.removed)) {
        const removedIds = _(changes.removed).map('id').values();
        this.idsGruposEconomicos = this.idsGruposEconomicos.filter((id) => !removedIds.includes(id));
      }

      if (!_.isEmpty(changes.added)) {
        changes.added
          .filter((addedItem) => !this.idsGruposEconomicos.includes(addedItem.id))
          .forEach((addedItem) => this.idsGruposEconomicos.push(addedItem.id));
      }
      this.idsGruposEconomicos = _(this.idsGruposEconomicos).uniq().value();
      this.totalGruposEconomicos.next(this.idsGruposEconomicos.length);
    });
  }

  ngOnDestroy(): void { }

  salvarGruposEconomicos() {
    this.idsGruposEconomicos = _(this.idsGruposEconomicos).uniq().value();
    this.totalGruposEconomicos.next(this.idsGruposEconomicos.length);
    this.perfilGrupoEconomicoService.postGruposEconomicosIds(
      this.idPerfil,
      this.idsGruposEconomicos
    ).subscribe(() => {
      this.snackBar.success(
        this.translateService.instant('PORTAL.PERFIL.MENSAGENS.MSG_GRUPOS_ECONOMICOS_SALVOS'),
        7000
      );
    });
  }

  reset() {
    this.search.selectAllById(this.idsGruposEconomicos);
  }

}
