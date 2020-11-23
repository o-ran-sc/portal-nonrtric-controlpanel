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
package org.oransc.portal.nonrtric.controlpanel.util;

import javax.net.ssl.SSLException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

public class ErrorResponseHandler {

    private ErrorResponseHandler() {
        throw new IllegalStateException("ErrorResponseHandler is a utility class and not meant to be instantiated");
    }

    public static ResponseEntity<String> handleException(Exception throwable) {
        if (throwable instanceof HttpClientErrorException) {
            HttpClientErrorException e = (HttpClientErrorException) throwable;
            return new ResponseEntity<>(e.getMessage(), e.getStatusCode());
        } else if (throwable instanceof HttpServerErrorException) {
            HttpServerErrorException e = (HttpServerErrorException) throwable;
            return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        } else if (throwable instanceof SSLException) {
            SSLException e = (SSLException) throwable;
            return new ResponseEntity<>("Could not create WebClient " + e.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(throwable.getClass().getName() + ": " + throwable.getMessage(),
            HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
