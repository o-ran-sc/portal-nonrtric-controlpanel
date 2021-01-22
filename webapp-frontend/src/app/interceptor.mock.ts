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
import * as policyinstances1 from './mock/policy-instance-1.json';
import * as policyinstancesNoType from './mock/policy-instance-notype.json';
import * as eijobs from './mock/ei-jobs.json';
import * as eiproducers from './mock/ei-producers.json';
import * as nopolicyinstances from './mock/nopolicyinstances.json';
import * as policytypesList from './mock/policy-types.json';
import * as policytypes1 from './mock/policy-type1.json';
import * as policyinstanceedit from './mock/policy-instance-edit.json';
import * as rics from './mock/rics.json';

const urls = [
    {
        url: 'v2/policy-types',
        json: policytypesList
    },
    {
        url: 'v2/policy-types/',
        json: policytypes1
    },
    {
        url: 'v2/policy-types/1',
        json: policytypes1
    },
    {
        url: 'v2/policies?type=1',
        json: policyinstances1
    },
    {
        url: 'v2/policies?type=',
        json: policyinstancesNoType
    },
    {
        url: 'v2/policies?type=2',
        json: nopolicyinstances
    },
    {
        url: 'v2/policies/2000?type=1',
        json: policyinstanceedit
    },
    {
        url: 'v2/policies/3000?type=1',
        json: policyinstanceedit
    },
    {
        url: 'v2/policies/2001?type=',
        json: policyinstanceedit
    },
    {
        url: 'v2/policies/2000?ric=ric1&type=1',
        json: ''
    },
    {
        url: 'api/enrichment/eijobs',
        json: eijobs
    },
    {
        url: 'api/enrichment/eiproducers',
        json: eiproducers
    },
    {
        url: 'api/policy/rics?policyType=1',
        json: rics
    },
    {
        url: 'api/policy/rics?policyType=2',
        json: rics
    }
];

@Injectable()
export class HttpMockRequestInterceptor implements HttpInterceptor {
    constructor(private injector: Injector) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.method === "PUT" && request.url.includes("policies")) {
            console.log('Answered PUT policy ' + request.url);
            return of(new HttpResponse({ status: 200 }));
        }
        for (const element of urls) {
            if (request.url === element.url) {
                console.log('Loaded from stub json : ' + request.url);
                return of(new HttpResponse({ status: 200, body: ((element.json) as any).default }));
            }
        }
        console.log('Loaded from mock http call :' + request.url);
        return next.handle(request);
    }
}