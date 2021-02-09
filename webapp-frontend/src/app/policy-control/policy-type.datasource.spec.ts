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

import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { ToastrModule } from 'ngx-toastr';
import { PolicyTypeDataSource } from './policy-type.datasource';
import { PolicyService } from '../services/policy/policy.service';
import { PolicyTypeSchema } from '../interfaces/policy.types';

describe('PolicyTypeDataSource', () => {
  let policyTypeDataSource: PolicyTypeDataSource;
  let policyServiceSpy: any;

  let policySchema = {
    policy_schema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "description": "Type 1 policy type",
      "additionalProperties": false,
      "title": "1",
      "type": "object"
    }
  };

  beforeEach(() => {
    policyServiceSpy = jasmine.createSpyObj('PolicyService', ['getPolicyTypes', 'getPolicyType']);

    policyServiceSpy.getPolicyTypes.and.returnValue(of({ policytype_ids: ['1', '2'] }));
    policyServiceSpy.getPolicyType.and.returnValue(of(policySchema));
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot()],
      providers: [
        { provide: PolicyService, useValue: policyServiceSpy }
      ]
    });
  });

  describe('#getPolicyTypes', () => {
    let expectedPolicyTypeValue: PolicyTypeSchema[];
    beforeEach(() => {
      expectedPolicyTypeValue = [
        {
          'id': '1',
          'name': '1',
          'schemaObject': policySchema.policy_schema
        },
        {
          'id': '2',
          'name': '1',
          'schemaObject': policySchema.policy_schema
        }
      ];
    });

    it('should create', () => {
      policyTypeDataSource = TestBed.get(PolicyTypeDataSource);
      expect(policyTypeDataSource).toBeTruthy();
    });

    it('should return all policy type with Schema', () => {
      policyTypeDataSource.getPolicyTypes();
      const jobsSubject: BehaviorSubject<PolicyTypeSchema[]> = policyTypeDataSource.policyTypeSubject;
      const value = jobsSubject.getValue();
      expect(value).toEqual(expectedPolicyTypeValue);
    });
  });
});