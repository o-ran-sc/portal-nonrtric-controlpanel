/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 Nordix Foundation
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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { EICoordinatorComponent } from './ei-coordinator.component';
import { EIJobDataSource } from './ei-job.datasource';
import { EIProducerDataSource } from './ei-producer.datasource';
import { UiService } from '../services/ui/ui.service';

describe('EICoordinatorComponent', () => {
  let component: EICoordinatorComponent;
  let fixture: ComponentFixture<EICoordinatorComponent>;

  beforeEach(async(() => {
    const jobDataSourceSpy = jasmine.createSpyObj('EIJobDataSource', [ 'loadJobs', 'eiJobs' ]);
    const producerDataSourceSpy = jasmine.createSpyObj('EIProducerDataSource', [ 'loadProducers', 'eiProducers' ]);

    jobDataSourceSpy.eiJobs.and.returnValue([]);

    producerDataSourceSpy.eiProducers.and.returnValue([]);

    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatTableModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      declarations: [
        EICoordinatorComponent
      ],
      providers: [
        { provide: EIJobDataSource, useValue: jobDataSourceSpy },
        { provide: EIProducerDataSource, useValue: producerDataSourceSpy },
        UiService,
        FormBuilder,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EICoordinatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
