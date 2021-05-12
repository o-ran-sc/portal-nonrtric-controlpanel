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
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpRequestInterceptor } from './interceptor';
import { NotificationService } from '@services/ui/notification.service';
import { ProducerService } from '@services/ei/producer.service';
import { of } from 'rxjs/observable/of';

describe(`HttpRequestInterceptor`, () => {
    let service: ProducerService;
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [ 'error' ]);
    let httpMock: HttpTestingController;

    beforeEach(() => {

      TestBed.configureTestingModule({
          imports: [HttpClientTestingModule],
          providers: [
              {
                  provide: NotificationService, useValue: notificationServiceSpy
                },
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: HttpRequestInterceptor,
                    multi: true,
                },
                ProducerService
            ]
        });

        httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(ProducerService);
    });

    it('should create', () => {
        const interceptors = TestBed.inject(HTTP_INTERCEPTORS);
        let found = false;
        interceptors.forEach(interceptor => {
            if (interceptor instanceof HttpRequestInterceptor) {
                found = true;
            };
        });
        expect(found).toBeTruthy();
    })

    it('should pass through when ok', () => {
    let response: [ 'roducer1' ];

    spyOn(service, 'getProducerIds').and.returnValue(of(response));
    service.getProducerIds().subscribe(() => {
        ids => expect(ids).toEqual(response);
    });

    httpMock.verify();
  });

    it('should notify when error', () => {
    let response: any;
    let errResponse: any;

    service.getProducerIds().subscribe(res => response = res, err => errResponse = err);

    const data = 'Invalid request parameters';
    const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
    httpMock.expectOne(`/data-producer/v1/info-producers`).flush(data, mockErrorResponse);

    httpMock.verify();

    expect(notificationServiceSpy.error).toHaveBeenCalledWith(containsString('Bad Request'));
  });

  function containsString(msg: string) {
    return {
      asymmetricMatch: function(compareTo: string) {
        return compareTo.includes(msg);
      },

      jasmineToString: function() {
        return '<containsString: ' + msg + '>';
      }
    };
  }
});

