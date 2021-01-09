import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'selectionListSearch' })
export class SelectionListFilterPipe implements PipeTransform {
  public transform(list: any[], searchText: any): any {
    if (!searchText || !list) {
      return list;
    }
    return list.filter(item => {
      const filter = item.descricaoQuestionario || item.descricao;
      return filter.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
    });
  }
}
