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

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as policyinstance1 from './mock/policy-instance-1.json';
import * as noTypePolicies from './mock/no-type-policies.json';
import * as typedPolicies from './mock/policies.json';
import * as policyinstance2 from './mock/policy-instance-2.json';
import * as noTypePolicyinstance from './mock/policy-instance-notype.json';
import * as policyinstance1Status from './mock/policy-instance-1-status.json';
import * as policyinstance2Status from './mock/policy-instance-2-status.json';
import * as eijobsProd1 from './mock/ei-jobs-producer1.json';
import * as eijobsProd2 from './mock/ei-jobs-producer2.json';
import * as eiProducerIds from './mock/ei-producerids.json';
import * as eiproducer1 from './mock/ei-producer1.json';
import * as eiproducer2 from './mock/ei-producer2.json';
import * as eiproducerstatus1 from './mock/ei-producer-status1.json';
import * as eiproducerstatus2 from './mock/ei-producer-status2.json';
import * as policytypesList from './mock/policy-types.json';
import * as policytypes1 from './mock/policy-type1.json';
import * as policyinstanceedit from './mock/policy-instance-edit.json';
import * as ric1 from './mock/ric1.json';
import * as ric2 from './mock/ric2.json';

const urls = [
    {
        url: '/a1-policy/v2/policy-types',
        json: policytypesList
    },
    {
        url: '/a1-policy/v2/policy-types/',
        json: policytypes1
    },
    {
        url: '/a1-policy/v2/policy-types/1',
        json: policytypes1
    },
    {
        url: '/a1-policy/v2/policies?policytype_id=',
        json: noTypePolicies
    },
    {
        url: '/a1-policy/v2/policies?policytype_id=1',
        json: typedPolicies
    },
    {
        url: '/a1-policy/v2/policies/2001',
        json: noTypePolicyinstance
    },
    {
        url: '/a1-policy/v2/policies/2000',
        json: policyinstance1
    },
    {
        url: '/a1-policy/v2/policies/2100',
        json: policyinstance2
    },
    {
        url: '/a1-policy/v2/policies/2001/status',
        json: policyinstance1Status
    },
    {
        url: '/a1-policy/v2/policies/2000/status',
        json: policyinstance1Status
    },
    {
        url: '/a1-policy/v2/policies/2100/status',
        json: policyinstance2Status
    },
    {
        url: '/a1-policy/v2/policies/2000?type=',
        json: policyinstanceedit
    },
    {
        url: '/a1-policy/v2/policies/2100?type=',
        json: policyinstanceedit
    },
    {
        url: '/a1-policy/v2/policies/2000?type=1',
        json: policyinstanceedit
    },
    {
        url: '/a1-policy/v2/policies/2100?type=1',
        json: policyinstanceedit
    },
    {
        url: '/a1-policy/v2/policies/2000?ric=ric1&type=1',
        json: ''
    },
    {
        url: '/a1-policy/v2/rics?policytype_id=1',
        json: ric1
    },
    {
        url: '/a1-policy/v2/rics?policytype_id=',
        json: ric2
    },
    {
        url: '/ei-producer/v1/eiproducers',
        json: eiProducerIds
    },
    {
        url: '/ei-producer/v1/eiproducers/producer1',
        json: eiproducer1
    },
    {
        url: '/ei-producer/v1/eiproducers/producer2',
        json: eiproducer2
    },
    {
        url: '/ei-producer/v1/eiproducers/producer1/status',
        json: eiproducerstatus1
    },
    {
        url: '/ei-producer/v1/eiproducers/producer2/status',
        json: eiproducerstatus2
    },
    {
        url: '/ei-producer/v1/eiproducers/producer1/eijobs',
        json: eijobsProd1
    },
    {
        url: '/ei-producer/v1/eiproducers/producer2/eijobs',
        json: eijobsProd2
    }
];

@Injectable()
export class HttpMockRequestInterceptor implements HttpInterceptor {
    constructor(private injector: Injector) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.method === "PUT" && request.url.includes("policies")) {
            console.log('Answered PUT policy ', request.url, request.body);
            return of(new HttpResponse({ status: 200 }));
        }
        for (const element of urls) {
            if (request.url === element.url) {
                console.log('Loaded from stub json : ' + request.url);
                if (request.method === 'DELETE') {
                    return of(new HttpResponse({ status: 204 }));
                }
                return of(new HttpResponse({ status: 200, body: ((element.json) as any).default }));
            }
        }
        console.log('Loaded from mock http call :' + request.url);
        return next.handle(request);
    }
}