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
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EICardComponent} from './ei-card.component';
import { MatIconModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import {UiService} from '../../services/ui/ui.service';

describe('EICardComponent', () => {
  const routes: Routes = [
    { path: 'ei-coordinator', redirectTo: '../../ei-coordinator', pathMatch: 'full'}
  ];
  let component: EICardComponent;
  let fixture: ComponentFixture<EICardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EICardComponent],
      imports: [ MatIconModule,
        RouterModule.forRoot(routes)
      ],
      providers: [UiService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EICardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
