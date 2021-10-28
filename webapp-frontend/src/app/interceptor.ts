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

import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from '@services/ui/notification.service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
    constructor(private notificationService: NotificationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log('Interceptor Invoked' + request.url);
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error("Error from error interceptor", error);

                if (!request.url.includes("info-jobs") || error.status != 404) {
                    // show dialog for error message
                    this.notificationService.error(error.message);
                }
                return throwError(error);
            })
        ) as Observable<HttpEvent<any>>;
    }
}
