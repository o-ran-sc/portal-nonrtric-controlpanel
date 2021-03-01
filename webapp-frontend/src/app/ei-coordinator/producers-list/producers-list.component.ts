/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2021 Nordix Foundation
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================LICENSE_END===================================
 */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EIProducer } from '../../interfaces/ei.types';
import { UiService } from '../../services/ui/ui.service';
import { EIProducerDataSource } from '../ei-producer.datasource';

@Component({
  selector: 'nrcp-producers-list',
  templateUrl: './producers-list.component.html',
  styleUrls: ['./producers-list.component.scss']
})
export class ProducersListComponent implements OnInit {
  darkMode: boolean;
  producersDataSource: MatTableDataSource<EIProducer> = new MatTableDataSource<EIProducer>();
  producerForm: FormGroup;

  constructor(
    private eiProducersDataSource: EIProducerDataSource,
    private ui: UiService) {

    this.producerForm = new FormGroup({
      ei_producer_id: new FormControl(''),
      ei_producer_types: new FormControl(''),
      status: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.refresh();

    this.producerForm.valueChanges.subscribe(value => {
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
    this.eiProducersDataSource.loadProducers();
    this.eiProducersDataSource.eiProducersSubject().subscribe((data) => {
      this.producersDataSource.data = data;
    });
  }
}
