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
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { NotificationService } from '@services/ui/notification.service';
import { PolicyControlComponent } from './policy-control.component';
import { PolicyTypeDataSource } from './policy-type/policy-type.datasource';
import { UiService } from '@services/ui/ui.service';
import { PolicyTypeSchema } from '@interfaces/policy.types';

describe('PolicyControlComponent', () => {
  let component: PolicyControlComponent;
  let fixture: ComponentFixture<PolicyControlComponent>;

  beforeEach(async(() => {
    const policyTypeDataSourceSpy = jasmine.createSpyObj('PolicyTypeDataSource', [ 'connect', 'getPolicyTypes',  'disconnect' ]);
    var policyTypeSchema = {} as PolicyTypeSchema;
    policyTypeSchema.name = '';
    policyTypeSchema.schemaObject = '';
    policyTypeDataSourceSpy.connect.and.returnValue(of([ policyTypeSchema]));
    policyTypeDataSourceSpy.disconnect();

    let matDialogStub: Partial<MatDialog>;
    let notificationServiceStub: Partial<NotificationService>;

    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatTableModule,
        BrowserAnimationsModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      declarations: [
        PolicyControlComponent
       ],
      providers: [
        { provide: PolicyTypeDataSource, useValue: policyTypeDataSourceSpy },
        { provide: MatDialog, useValue: matDialogStub },
        { provide: NotificationService, useValue: notificationServiceStub },
        UiService
       ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
