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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

import { EICoordinatorComponent } from './ei-coordinator.component';
import { UiService } from '@services/ui/ui.service';
import { ProducersListComponent } from '@ei-coordinator/producers-list/producers-list.component';
import { JobsListComponent } from '@ei-coordinator/jobs-list/jobs-list.component';
import { MockComponent } from 'ng-mocks';
import { By } from '@angular/platform-browser';

describe('EICoordinatorComponent', () => {
  let component: EICoordinatorComponent;
  let fixture: ComponentFixture<EICoordinatorComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        BrowserAnimationsModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      declarations: [
        EICoordinatorComponent,
        MockComponent(JobsListComponent),
        MockComponent(ProducersListComponent),
      ],
      providers: [
        UiService
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EICoordinatorComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#content', () => {
    it('should contain refresh button with correct icon', async () => {
      let refreshButton = await loader.getHarness(MatButtonHarness.with({ selector: '#refreshButton' }));
      expect(refreshButton).toBeTruthy();
      expect(await refreshButton.getText()).toEqual('refresh');
    });

    it('should contain producers table', async () => {
      const producersTableComponent = fixture.debugElement.nativeElement.querySelector('nrcp-producers-list');
      expect(producersTableComponent).toBeTruthy();
    });

    it('should contain jobs table', async () => {
      const jobsComponent = fixture.debugElement.nativeElement.querySelector('nrcp-jobs-list');
      expect(jobsComponent).toBeTruthy();
    });

    it('should set correct dark mode from UIService', () => {
      const uiService: UiService = TestBed.inject(UiService);
      expect(component.darkMode).toBeTruthy();

      uiService.darkModeState.next(false);
      fixture.detectChanges();
      expect(component.darkMode).toBeFalsy();

    });

    it('should refresh tables', async () => {
      let refreshButton = await loader.getHarness(MatButtonHarness.with({ selector: '#refreshButton' }));

      const jobsComponent: JobsListComponent = fixture.debugElement.query(By.directive(JobsListComponent)).componentInstance;
      spyOn(jobsComponent, 'refreshDataClick');
      spyOn(jobsComponent, 'clearFilter');

      const prodsComponent: ProducersListComponent = fixture.debugElement.query(By.directive(ProducersListComponent)).componentInstance;
      spyOn(prodsComponent, 'loadProducers');
      spyOn(prodsComponent, 'clearFilter');

      await refreshButton.click();

      expect(jobsComponent.refreshDataClick).toHaveBeenCalled();
      expect(jobsComponent.clearFilter).toHaveBeenCalled();
      expect(prodsComponent.loadProducers).toHaveBeenCalled();
      expect(prodsComponent.clearFilter).toHaveBeenCalled();

    });
  });
});
