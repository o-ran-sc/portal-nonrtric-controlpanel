import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpRequestInterceptor } from './interceptor';
import { NotificationService } from './services/ui/notification.service';
import { EIService } from './services/ei/ei.service';
import { not } from 'rxjs/internal/util/not';
import { of } from 'rxjs/observable/of';

describe(`HttpRequestInterceptor`, () => {
    let service: EIService;
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
                EIService
            ]
        });

        httpMock = TestBed.get(HttpTestingController);
        service = TestBed.get(EIService);
    });

    it('should create', () => {
        const interceptors = TestBed.get(HTTP_INTERCEPTORS);
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
    httpMock.expectOne(`/ei-producer/v1/eiproducers`).flush(data, mockErrorResponse);

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

