import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EIProducer } from 'src/app/interfaces/ei.types';
import { UiService } from 'src/app/services/ui/ui.service';
import { EIProducerDataSource } from '../ei-producer.datasource';

@Component({
  selector: 'nrcp-producers-list',
  templateUrl: './producers-list.component.html',
  styleUrls: ['./producers-list.component.scss']
})
export class ProducersListComponent implements OnInit {
  darkMode: boolean;
  producersDataSource: MatTableDataSource<EIProducer>;

  readonly producersFormControl: AbstractControl;

  constructor(
    private eiProducersDataSource: EIProducerDataSource,
    private ui: UiService,
    private formBuilder: FormBuilder) {
    this.producersFormControl = formBuilder.group({
      ei_producer_id: '',
      ei_producer_types: '',
      status: ''
    });
  }

  ngOnInit(): void {
    this.eiProducersDataSource.loadProducers();
    const prods = this.eiProducersDataSource.eiProducers();
    this.producersDataSource = new MatTableDataSource(prods);

    this.producersFormControl.valueChanges.subscribe(value => {
      const filter = { ...value, ei_producer_id: value.ei_producer_id.trim().toLowerCase() } as string;
      this.producersDataSource.filter = filter;
    });

    this.producersDataSource.filterPredicate = ((data, filter) => {
      return this.isDataIncluding(data.ei_producer_id, filter.ei_producer_id)
        && this.isDataIncluding(data.ei_producer_types.join(','), filter.ei_producer_types)
        && this.isDataIncluding(data.status, filter.status);
    }) as (data: EIProducer, filter: any) => boolean;

    this.ui.darkModeState.subscribe((isDark) => {
      this.darkMode = isDark;
    });
  }

  isDataIncluding(data: string, filter: string): boolean {
    return !filter || data.toLowerCase().includes(filter);
  }

  sortProducers(sort: Sort) {
    const data = this.producersDataSource.data
    data.sort((a: EIProducer, b: EIProducer) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.ei_producer_id, b.ei_producer_id, isAsc);
        case 'types': return this.compare(a.ei_producer_types, b.ei_producer_types, isAsc);
        case 'status': return this.compare(a.status, b.status, isAsc);
        default: return 0;
      }
    });
    this.producersDataSource.data = data;
  }

  compare(a: any, b: any, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  stopSort(event: any) {
    event.stopPropagation();
  }

  getProducerTypes(eiProducer: EIProducer): string[] {
    if (eiProducer.ei_producer_types) {
      return eiProducer.ei_producer_types;
    }
    return ['< No types >'];
  }

  getProducerStatus(eiProducer: EIProducer): string {
    if (eiProducer.status) {
      return eiProducer.status;
    }
    return '< No status >';
  }

  refresh() {
    this.eiProducersDataSource.loadProducers;
    this.producersDataSource.data = this.eiProducersDataSource.eiProducers();
}
}
