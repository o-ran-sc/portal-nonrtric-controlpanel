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
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin, of } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { mergeMap, finalize } from 'rxjs/operators';
import { ProducerService } from '@services/ei/producer.service';
import { Producer } from '@interfaces/producer.types';
import { UiService } from '@services/ui/ui.service';

@Component({
  selector: 'nrcp-producers-list',
  templateUrl: './producers-list.component.html',
  styleUrls: ['./producers-list.component.scss']
})
export class ProducersListComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;

  producersDataSource: MatTableDataSource<Producer>;
  producerForm: FormGroup;
  darkMode: boolean;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private producerSubject = new BehaviorSubject<Producer[]>([]);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private producerService: ProducerService,
    private ui: UiService) {

    this.producerForm = new FormGroup({
      producer_id: new FormControl(''),
      producer_types: new FormControl(''),
      status: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.loadProducers();
    this.producerSubject.subscribe((data) => {
      this.producersDataSource = new MatTableDataSource<Producer>(data);

      this.producersDataSource.filterPredicate = ((data, filter) => {
        let searchTerms = JSON.parse(filter);
        return this.isDataIncluding(data.producer_id, searchTerms.producer_id)
          && this.isDataIncluding(data.producer_types.join(','), searchTerms.producer_types)
          && this.isDataIncluding(data.status, searchTerms.status);
      }) as (data: Producer, filter: any) => boolean;
    });

    this.producerForm.valueChanges.subscribe(value => {
      this.producersDataSource.filter = JSON.stringify(value);
    });

    this.ui.darkModeState.subscribe((isDark) => {
      this.darkMode = isDark;
    });
  }

  ngOnDestroy() {
    if (!this.producerSubject) this.producerSubject.unsubscribe();
    if (!this.loadingSubject) this.loadingSubject.unsubscribe();
    if (!this.ui.darkModeState) this.ui.darkModeState.unsubscribe();
  }

  isDataIncluding(data: string, filter: string): boolean {
    const transformedFilter = filter.trim().toLowerCase();
    return data.toLowerCase().includes(transformedFilter);
  }

  clearFilter() {
    this.producerForm.get('producer_id').setValue('');
    this.producerForm.get('producer_types').setValue('');
    this.producerForm.get('status').setValue('');
  }

  sortProducers(sort: Sort) {
    const data = this.producersDataSource.data
    data.sort((a: Producer, b: Producer) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.producer_id, b.producer_id, isAsc);
        case 'types': return this.compare(a.producer_types, b.producer_types, isAsc);
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

  getProducerTypes(producer: Producer): string[] {
    if (producer.producer_types) {
      return producer.producer_types;
    }
    return ['< No types >'];
  }

  getProducerStatus(producer: Producer): string {
    if (producer.status) {
      return producer.status;
    }
    return '< No status >';
  }

  public producers(): Producer[] {
    return this.producerSubject.value;
  }

  loadProducers() {
    this.loadingSubject.next(true);
    let producers = [];

    this.producerService.getProducerIds().pipe(
      mergeMap(prodIds =>
        forkJoin(prodIds.map(id => {
          return forkJoin([
            of(id),
            this.producerService.getProducer(id),
            this.producerService.getProducerStatus(id)
          ])
        })
        )),
      finalize(() => {
        this.loadingSubject.next(false);
        this.producerSubject.next(producers);
      })
    ).subscribe(result => {
      producers = result.map(producer => {
        let producerObj = <Producer>{};
        producerObj.producer_id = producer[0];
        if (producer[1].supported_info_types) {
          producerObj.producer_types = producer[1].supported_info_types;
        }
        if (producer[2].operational_state) {
          producerObj.status = producer[2].operational_state.toString();
        }
        return producerObj;
      });
    }, err => {
      console.error("Subscribe function error:" + err);
    });
  }

  hasProducers(): boolean {
    return this.producersDataSource.data.length > 0;
  }

}
