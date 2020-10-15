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
package org.oransc.portal.nonrtric.controlpanel.eiproducerapi;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import java.util.Arrays;
import org.junit.jupiter.api.Test;
import org.oransc.portal.nonrtric.controlpanel.util.AsyncRestClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpServerErrorException;
import reactor.core.publisher.Mono;

class EiProducerApiImplTest {
    private static final String URL_EI_TYPES = "/eitypes";
    private static final String EI_TYPE_1 = "eitype1";
    private static final String EI_TYPE_2 = "eitype2";
    private static final String EI_TYPE_1_INFO_VALID =
            "{\"ei_producer_ids\":[\"eiprod1\",\"eiprod2\"],\"ei_job_data_schema\":{\"title\":\"eijob1\"}}";
    private static final String EI_TYPE_1_INFO_INVALID =
            "{\"ei_producer_ids\":[\"eiprod1\",\"eiprod2\"],\"ei_job_data_schema\":\"title\":\"eijob1\"}}";
    private static final String URL_EI_PRODUCERS = "/eiproducers";
    private static final String EI_PRODUCER_1 = "eiprod1";
    private static final String EI_PRODUCER_2 = "eiprod2";
    private static final String EI_PRODUCER_1_INFO_VALID =
            "{\"supported_ei_types\":[{\"ei_type_identity\":\"eitype1\",\"ei_job_data_schema\":{\"title\":\"eijob1\"}}]}";
    private static final String EI_PRODUCER_1_INFO_INVALID =
            "{\"supported_ei_types\":[{\"ei_type_identity\":\"eitype1\",\"ei_job_data_schema\":\"title\":\"eijob1\"}}]}";
    private static final String URL_STATUS = "/status";
    private static final String EI_PRODUCER_1_STATUS_VALID = "{\"operational_state\":\"ENABLED\"}";
    private static final String EI_PRODUCER_1_STATUS_INVALID = "\"operational_state\":\"ENABLED\"}";
    private static final String URL_EI_JOBS = "/eijobs";
    private static final String EI_JOB_1_INFO =
            "{\"ei_job_identity\":\"eijob1\",\"ei_job_data\":{},\"ei_type_identity\":\"eitype1\"}";
    private static final String EI_JOB_2_INFO =
            "{\"ei_job_identity\":\"eijob2\",\"ei_job_data\":{},\"ei_type_identity\":\"eitype2\"}";

    AsyncRestClient restClientMock = mock(AsyncRestClient.class);
    EiProducerApiImpl apiUnderTest = new EiProducerApiImpl(restClientMock);

    private void whenGetReturnOK(String url, HttpStatus status, String body) {
        ResponseEntity<String> ret = new ResponseEntity<>(body, status);
        when(restClientMock.getForEntity(eq(url))).thenReturn(Mono.just(ret));
    }

    private void whenGetReturnFailure(String url, HttpStatus status, String body) {
        HttpServerErrorException e = new HttpServerErrorException(status, body);
        when(restClientMock.getForEntity(eq(url))).thenReturn(Mono.error(e));
    }

    @Test
    void testGetAllEiTypeIdsFailure() {
        whenGetReturnFailure(URL_EI_TYPES, HttpStatus.NOT_FOUND, "");
        ResponseEntity<String> returnedResp = apiUnderTest.getAllEiTypeIds();
        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    void testGetAllEiTypeIdsSuccess() {
        String eiTypeIds = Arrays.asList(EI_TYPE_1, EI_TYPE_2).toString();

        whenGetReturnOK(URL_EI_TYPES, HttpStatus.OK, eiTypeIds);

        ResponseEntity<String> returnedResp = apiUnderTest.getAllEiTypeIds();
        assertEquals("[\"" + EI_TYPE_1 + "\",\"" + EI_TYPE_2 + "\"]", returnedResp.getBody());
        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
    }

    @Test
    void testGetEiTypeValidJson() {
        whenGetReturnOK(URL_EI_TYPES + "/" + EI_TYPE_1, HttpStatus.OK, EI_TYPE_1_INFO_VALID);

        ResponseEntity<String> returnedResp = apiUnderTest.getEiType(EI_TYPE_1);

        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
        assertEquals(EI_TYPE_1_INFO_VALID, returnedResp.getBody());
    }

    @Test
    void testGetEiTypeInvalidJson() {
        whenGetReturnOK(URL_EI_TYPES + "/" + EI_TYPE_1, HttpStatus.OK, EI_TYPE_1_INFO_INVALID);

        ResponseEntity<String> returnedResp = apiUnderTest.getEiType(EI_TYPE_1);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, returnedResp.getStatusCode());
        assertTrue(returnedResp.getBody().contains("JSONException"));
    }

    @Test
    void testGetAllEiProducerIdsFailure() {
        whenGetReturnFailure(URL_EI_PRODUCERS, HttpStatus.NOT_FOUND, "");
        ResponseEntity<String> returnedResp = apiUnderTest.getAllEiProducerIds();
        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    void testGetAllEiProducerIdsSuccess() {
        String eiProducerIds = Arrays.asList(EI_PRODUCER_1, EI_PRODUCER_2).toString();

        whenGetReturnOK(URL_EI_PRODUCERS, HttpStatus.OK, eiProducerIds);

        ResponseEntity<String> returnedResp = apiUnderTest.getAllEiProducerIds();
        assertEquals("[\"" + EI_PRODUCER_1 + "\",\"" + EI_PRODUCER_2 + "\"]", returnedResp.getBody());
        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
    }

    @Test
    void testGetEiProducerValidJson() {
        whenGetReturnOK(URL_EI_PRODUCERS + "/" + EI_PRODUCER_1, HttpStatus.OK, EI_PRODUCER_1_INFO_VALID);

        ResponseEntity<String> returnedResp = apiUnderTest.getEiProducer(EI_PRODUCER_1);

        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
        assertEquals(EI_PRODUCER_1_INFO_VALID, returnedResp.getBody());
    }

    @Test
    void testGetEiProducerInvalidJson() {
        whenGetReturnOK(URL_EI_PRODUCERS + "/" + EI_PRODUCER_1, HttpStatus.OK, EI_PRODUCER_1_INFO_INVALID);

        ResponseEntity<String> returnedResp = apiUnderTest.getEiProducer(EI_PRODUCER_1);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, returnedResp.getStatusCode());
        assertTrue(returnedResp.getBody().contains("JSONException"));
    }

    @Test
    void testGetEiJobsForOneEiProducerFailure() {
        whenGetReturnFailure(URL_EI_PRODUCERS + "/" + EI_PRODUCER_1 + URL_EI_JOBS, HttpStatus.NOT_FOUND, "");
        ResponseEntity<String> returnedResp = apiUnderTest.getEiJobsForOneEiProducer(EI_PRODUCER_1);
        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    void testGetEiJobsForOneEiProducerSuccess() {
        String eiJobs = Arrays.asList(EI_JOB_1_INFO, EI_JOB_2_INFO).toString();

        whenGetReturnOK(URL_EI_PRODUCERS + "/" + EI_PRODUCER_1 + URL_EI_JOBS, HttpStatus.OK, eiJobs);

        ResponseEntity<String> returnedResp = apiUnderTest.getEiJobsForOneEiProducer(EI_PRODUCER_1);
        assertTrue(returnedResp.getBody().contains("\"ei_job_identity\":\"eijob1\""));
        assertTrue(returnedResp.getBody().contains("\"ei_job_identity\":\"eijob2\""));
        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
    }

    @Test
    void testGetEiProducerStatusValidJson() {
        whenGetReturnOK(URL_EI_PRODUCERS + "/" + EI_PRODUCER_1 + URL_STATUS, HttpStatus.OK, EI_PRODUCER_1_STATUS_VALID);

        ResponseEntity<String> returnedResp = apiUnderTest.getEiProducerStatus(EI_PRODUCER_1);

        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
        assertEquals(EI_PRODUCER_1_STATUS_VALID, returnedResp.getBody());
    }

    @Test
    void testGetEiProducerStatusInvalidJson() {
        whenGetReturnOK(URL_EI_PRODUCERS + "/" + EI_PRODUCER_1 + URL_STATUS, HttpStatus.OK, EI_PRODUCER_1_STATUS_INVALID);

        ResponseEntity<String> returnedResp = apiUnderTest.getEiProducerStatus(EI_PRODUCER_1);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, returnedResp.getStatusCode());
        assertTrue(returnedResp.getBody().contains("JSONException"));
    }
}
