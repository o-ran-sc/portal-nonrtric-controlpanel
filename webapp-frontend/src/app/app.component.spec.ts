/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 AT&T Intellectual Property
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
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie';
import { AppComponent } from './app.component';
import { UiService } from './services/ui/ui.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    const cookieSpy = jasmine.createSpyObj('CookieService', [ 'get' ]);
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: CookieService, useValue: cookieSpy },
        UiService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  describe('#content', () => {
    it('should contain oran logo', async(() => {
      const ele = fixture.debugElement.nativeElement.querySelector('img');
      expect(ele.src).toContain('assets/oran-logo.png');
    }));

    it('should contain heading', async(() => {
      const ele = fixture.debugElement.nativeElement.querySelector('tspan');
      expect(ele.textContent.trim()).toBe('Non-RT RIC Control Panel');
    }));

    it('should contain router-outlet', async(() => {
      const ele = fixture.debugElement.nativeElement.querySelector('router-outlet');
      expect(ele).toBeTruthy();
    }));

    it('should contain nrcp-footer', async(() => {
      const ele = fixture.debugElement.nativeElement.querySelector('nrcp-footer');
      expect(ele).toBeTruthy();
    }));
  });
});
