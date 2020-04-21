/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 AT&T Intellectual Property
 * Modifications Copyright (C) 2020 Nordix Foundation
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
package org.oransc.portal.nonrtric.controlpanel.controller;

import static org.junit.jupiter.api.Assertions.assertThrows;

import java.lang.invoke.MethodHandles;
import java.net.URI;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.onap.portalsdk.core.onboarding.util.PortalApiConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.reactive.function.client.WebClientResponseException;

public class PortalRestCentralServiceTest extends AbstractControllerTest {

    private static final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    @Test
    public void getAnalyticsTest() {
        // paths are hardcoded here exactly like the EPSDK-FW library :(
        URI uri = buildUri(null, PortalApiConstants.API_PREFIX, "/analytics");
        logger.info("Invoking {}", uri);
        WebClientResponseException e = assertThrows(WebClientResponseException.class, () -> {
            webClient.getForEntity(uri.toString()).block();
        });
        // No Portal is available so this always fails
        Assertions.assertTrue(e.getStatusCode().is4xxClientError());
    }

    @Test
    public void getErrorPageTest() {
        // Send unauthorized request

        URI uri = buildUri(null, "/favicon.ico");
        logger.info("Invoking {}", uri);
        WebClientResponseException e = assertThrows(WebClientResponseException.class, () -> {
            webClient.getForEntity(uri.toString()).block();
        });
        Assertions.assertTrue(e.getStatusCode().is4xxClientError());
        Assertions.assertTrue(e.getResponseBodyAsString().contains("Static error page"));
    }
}
