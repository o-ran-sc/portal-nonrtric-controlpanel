/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2020 Nordix Foundation
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

import { async, ComponentFixture } from "@angular/core/testing";
import { PolicyService } from "@app/services/policy/policy.service";
import { PolicyInstanceComponent } from "./policy-instance.component";

describe("PolicyInstanceComponent", () => {
    let component: PolicyInstanceComponent;
    let fixture: ComponentFixture<PolicyInstanceComponent>;

    // beforeEach(async(() => {
    //   policyDataSourceSpy = jasmine.createSpyObj("PolicyInstanceDataSource", ["getPolicyType"]);
    //   const policyTypeSchema = JSON.parse(
    //     '{"title": "1", "description": "Type 1 policy type"}'
    //   );
    //   const policyType = { policy_schema: policyTypeSchema } as PolicyType;
    //   policyDataSourceSpy.getPolicyType.and.returnValue(of(policyType));

    //   TestBed.configureTestingModule({
    //     declarations: [
    //       PolicyTypeComponent,
    //       MockComponent(PolicyInstanceComponent),
    //     ],
    //     providers: [{ provide: PolicyService, useValue: policyDataSourceSpy }],
    //   }).compileComponents();
    // }));

    // beforeEach(() => {
    //   fixture = TestBed.createComponent(PolicyTypeComponent);
    //   component = fixture.componentInstance;
    //   fixture.detectChanges();
    // });

    // it("should create", () => {
    //   expect(component).toBeTruthy();
    // });
})