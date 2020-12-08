import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import * as policytypes from './mock/policytypes.json';
import * as policyinstances from './mock/policy-instance.json';
import * as policyinstanceedit from './mock/policy-instance-edit.json';

const urls = [
    {
        policyurl: 'api/policy/policytypes',
        json: policytypes
    },
    {
        policyurl: 'api/policy/policies?type=1',
        json: policyinstances
    },
    {
        policyurl: 'api/policy/policies/2000?type=1',
        json: policyinstanceedit
    },
    {
        policyurl: 'api/policy/policies/2000?ric=ric1&type=1',
        json: ''
    }
];

@Injectable()
export class HttpMockRequestInterceptor implements HttpInterceptor {
    constructor(private injector: Injector) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        for (const element of urls) {
            if (request.url === element.policyurl) {
                console.log('Loaded from stub json : ' + request.url);
                return of(new HttpResponse({ status: 200, body: ((element.json) as any).default }));
            }
        }
        console.log('Loaded from mock http call :' + request.url);
        return next.handle(request);
    }
}