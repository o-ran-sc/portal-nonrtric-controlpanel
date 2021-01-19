import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';

import * as eijobs from './mock/ei-jobs.json';
import * as eiproducers from './mock/ei-producers.json';
import * as nopolicyinstances from './mock/nopolicyinstances.json';
import * as policytypes from './mock/policytypes.json';
import * as policyinstanceedit from './mock/policy-instance-edit.json';
import * as policyinstances from './mock/policy-instance.json';
import * as rics from './mock/rics.json';

const urls = [
    {
        url: 'api/policy/policytypes',
        json: policytypes
    },
    {
        url: 'api/policy/policies?type=1',
        json: policyinstances
    },
    {
        url: 'api/policy/policies?type=2',
        json: nopolicyinstances
    },
    {
        url: 'api/policy/policies/2000?type=1',
        json: policyinstanceedit
    },
    {
        url: 'api/policy/policies/2000?ric=ric1&type=1',
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