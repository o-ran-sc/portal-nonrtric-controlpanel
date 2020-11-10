/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2020 Nordix Foundation
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
package org.oransc.portal.nonrtric.controlpanel.policyagentapi;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.gson.GsonBuilder;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.oransc.portal.nonrtric.controlpanel.util.AsyncRestClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpServerErrorException;
import reactor.core.publisher.Mono;

class PolicyAgentApiImplTest {
    private static final String URL_POLICY_SCHEMAS = "/v2/policy-types";
    private static final String POLICY_TYPE_1_ID = "type1";
    private static final String URL_POLICY_TYPE_SCHEMAS = "/v2/policy-types/" + POLICY_TYPE_1_ID;
    private static final String POLICY_TYPE_1_VALID = "{\"title\":\"type1\"}";
    private static final String POLICY_TYPE_1_INVALID = "\"title\":\"type1\"}";
    private static final String POLICY_TYPE_2_VALID = "{\"title\":\"type2\"}";
    private static final String POLICY_1_ID = "policy1";
    private static final String POLICY_1_VALID = "{\"policyId\":\"policy1\"}";
    private static final String POLICY_INSTANCE_DATA_VALID = "{\n" + //
        "  \"scope\": {\n" + //
        "   \"ueId\": \"ue5100\",\n" + //
        "   \"qosId\": \"qos5100\"\n" + //
        "  },\n" + //
        "  \"qosObjectives\": {\n" + //
        "   \"priorityLevel\": 5100\n" + //
        "  }\n" + //
        " }"; //
    private static final String POLICY_1_INVALID = "\"policyId\":\"policy1\"}";
    private static final String RIC_1_ID = "ric1";
    private static final String RIC_1_INFO_VALID = "{\"ric_id\":\"ric1\",\"policytype_ids\":[\"type1\"]}";
    private static final String RIC_1_INFO_INVALID = "{\"ric_id\":\"ric1\",\"policytype_ids\":\"type1\"]}";
    private static final String CLIENT_ERROR_MESSAGE = "XXXXXXX";
    private static final String POLICY_INSTANCE_VALID = "{\n" + " \"policy_id\": \"policy1\",\n" + //
        " \"policytype_id\": \"type1\",\n" + //
        " \"ric_id\": \"ric1\",\n" + //
        " \"policy_data\": {\n" + //
        "  \"scope\": {\n" + //
        "   \"ueId\": \"ue5100\",\n" + //
        "   \"qosId\": \"qos5100\"\n" + //
        "  },\n" + //
        "  \"qosObjectives\": {\n" + //
        "   \"priorityLevel\": 5100\n" + //
        "  }\n" + //
        " },\n" + //
        " \"service_id\": \"ric-registration\",\n" + //
        " \"status_notification_uri\": \"http://callback-receiver:8090/callbacks/test\",\n" + //
        " \"transient\": true\n" + //
        "}"; //
    private static com.google.gson.Gson gson = new GsonBuilder() //
        .serializeNulls() //
        .create(); //

    PolicyAgentApiImpl apiUnderTest;

    AsyncRestClient restClient;

    @BeforeEach
    void init() {
        restClient = mock(AsyncRestClient.class);
        apiUnderTest = new PolicyAgentApiImpl(restClient);
    }

    private void whenGetReturnOK(String url, HttpStatus status, String body) {
        ResponseEntity<String> ret = new ResponseEntity<>(body, status);
        when(restClient.getForEntity(eq(url))).thenReturn(Mono.just(ret));
    }

    private void whenGetReturnFailure(String url, HttpStatus status, String body) {
        HttpServerErrorException e = new HttpServerErrorException(status, body);
        when(restClient.getForEntity(eq(url))).thenReturn(Mono.error(e));
    }

    @Test
    void testGetAllPolicyTypesFailure() {
        whenGetReturnFailure(URL_POLICY_SCHEMAS, HttpStatus.NOT_FOUND, "");
        ResponseEntity<String> returnedResp = apiUnderTest.getAllPolicyTypes();
        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    void testGetAllPolicyTypesSuccessValidJson() {
        String policyTypes = Arrays.asList(POLICY_TYPE_1_ID).toString();
        String policyTypeIds = "{\"policytype_ids\":" + policyTypes + "}";
        String policyTypeSchema =
            "{\"policy_schema\":{\"$schema\":\"http://json-schema.org/draft-07/schema#\",\"description\":\"Type 1 policy type\",\"additionalProperties\":false,\"title\":\"1\",\"type\":\"object\",\"properties\":{\"qosObjectives\":{\"additionalProperties\":false,\"type\":\"object\",\"properties\":{\"priorityLevel\":{\"type\":\"number\"}},\"required\":[\"priorityLevel\"]},\"scope\":{\"additionalProperties\":false,\"type\":\"object\",\"properties\":{\"qosId\":{\"type\":\"string\"},\"ueId\":{\"type\":\"string\"}},\"required\":[\"ueId\",\"qosId\"]}},\"required\":[\"scope\",\"qosObjectives\"]}}";
        whenGetReturnOK(URL_POLICY_SCHEMAS, HttpStatus.OK, policyTypeIds);
        whenGetReturnOK(URL_POLICY_TYPE_SCHEMAS, HttpStatus.OK, policyTypeSchema);

        ResponseEntity<String> resp = apiUnderTest.getAllPolicyTypes();
        assertEquals(HttpStatus.OK, resp.getStatusCode());
    }

    @Test
    void testGetAllPolicyTypesSuccessInvalidJson() {
        String policyTypes = Arrays.asList(POLICY_TYPE_1_INVALID, POLICY_TYPE_2_VALID).toString();
        whenGetReturnOK(URL_POLICY_SCHEMAS, HttpStatus.OK, policyTypes);

        ResponseEntity<String> returnedResp = apiUnderTest.getAllPolicyTypes();

        assertTrue(returnedResp.getBody().contains("Exception"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, returnedResp.getStatusCode());
    }

    private String urlPolicyInstances(String type) {
        return "/v2/policies?policytype_id=" + type;
    }

    @Test
    void testGetPolicyInstancesForTypeFailure() {
        whenGetReturnFailure(urlPolicyInstances(POLICY_TYPE_1_ID), HttpStatus.NOT_FOUND, "");

        ResponseEntity<String> returnedResp = apiUnderTest.getPolicyInstancesForType(POLICY_TYPE_1_ID);

        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    void testGetPolicyInstancesForTypeSuccessValidJson() {
        String policyInstances = Arrays.asList(POLICY_1_ID).toString();
        String res = "{\"policy_ids\":" + policyInstances + "}";
        whenGetReturnOK(urlPolicyInstances(POLICY_TYPE_1_ID), HttpStatus.OK, res);
        whenGetReturnOK("/v2/policies/policy1", HttpStatus.OK, POLICY_INSTANCE_VALID);

        ResponseEntity<String> returnedResp = apiUnderTest.getPolicyInstancesForType(POLICY_TYPE_1_ID);
        assertTrue(returnedResp.getBody().contains("policy1"));
        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
    }

    @Test
    void testGetPolicyInstancesForTypeSuccessInvalidJson() {
        String policyInstances = Arrays.asList(POLICY_1_INVALID).toString();

        whenGetReturnOK(urlPolicyInstances(POLICY_TYPE_1_ID), HttpStatus.OK, policyInstances);

        ResponseEntity<String> returnedResp = apiUnderTest.getPolicyInstancesForType(POLICY_TYPE_1_ID);

        assertTrue(returnedResp.getBody().contains("Exception"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, returnedResp.getStatusCode());
    }

    private String urlPolicyInstance(String id) {
        return "/v2/policies/" + id;
    }

    @Test
    void testGetPolicyInstance() {
        whenGetReturnOK(urlPolicyInstance(POLICY_1_ID), HttpStatus.OK, POLICY_1_VALID);

        ResponseEntity<Object> returnedResp = apiUnderTest.getPolicyInstance(POLICY_1_ID);

        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
        assertEquals(POLICY_1_VALID, returnedResp.getBody());

    }

    private String urlPutPolicy() {
        return "/v2/policies/";
    }

    private void whenPutReturnOK(String url, String putBody, HttpStatus status, String body) {
        ResponseEntity<String> ret = new ResponseEntity<>(body, status);
        when(restClient.putForEntity(eq(url), eq(putBody))).thenReturn(Mono.just(ret));
    }

    private void whenPutReturnFailure(String url, String putBody, HttpStatus status, String body) {
        HttpServerErrorException e =
            new HttpServerErrorException(status, body, body.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
        when(restClient.putForEntity(eq(url), eq(putBody))).thenReturn(Mono.error(e));
    }

    @Test
    void testPutPolicySuccess() {
        String url = urlPutPolicy();
        whenPutReturnOK(url, POLICY_INSTANCE_VALID, HttpStatus.OK, POLICY_INSTANCE_VALID);

        ResponseEntity<String> returnedResp =
            apiUnderTest.putPolicy(POLICY_TYPE_1_ID, POLICY_1_ID, POLICY_INSTANCE_DATA_VALID, RIC_1_ID);

        assertNull(returnedResp.getBody());
        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
    }

    @Test
    void testPutPolicyFailure() {
        String url = urlPutPolicy();
        whenPutReturnFailure(url, POLICY_INSTANCE_VALID, HttpStatus.NOT_FOUND, CLIENT_ERROR_MESSAGE);

        ResponseEntity<String> returnedResp =
            apiUnderTest.putPolicy(POLICY_TYPE_1_ID, POLICY_1_ID, POLICY_INSTANCE_DATA_VALID, RIC_1_ID);

        assertTrue(returnedResp.getBody().contains(CLIENT_ERROR_MESSAGE));
        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    private void whenDeleteReturnOK(String url, HttpStatus status) {
        ResponseEntity<String> ret = new ResponseEntity<>(status);
        when(restClient.deleteForEntity(eq(url))).thenReturn(Mono.just(ret));
    }

    private void whenDeleteReturnFailure(String url, HttpStatus status, String body) {
        HttpServerErrorException e =
            new HttpServerErrorException(status, body, body.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
        when(restClient.deleteForEntity(eq(url))).thenReturn(Mono.error(e));
    }

    private String deletePolicyUrl(String id) {
        return "/v2/policies/" + id;
    }

    @Test
    void testDeletePolicyFailure() {
        whenDeleteReturnFailure(deletePolicyUrl(POLICY_1_ID), HttpStatus.NOT_FOUND, CLIENT_ERROR_MESSAGE);

        ResponseEntity<String> returnedResp = apiUnderTest.deletePolicy(POLICY_1_ID);

        assertTrue(returnedResp.getBody().contains(CLIENT_ERROR_MESSAGE));
        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    void testDeletePolicySuccess() {
        whenDeleteReturnOK(deletePolicyUrl(POLICY_1_ID), HttpStatus.OK);
        ResponseEntity<String> returnedResp = apiUnderTest.deletePolicy(POLICY_1_ID);

        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
    }

    private String urlRicInfo(String typeName) {
        return "/v2/rics?policytype_id=" + typeName;
    }

    @Test
    void testGetRicsSupportingTypeValidJson() {
        String rics = Arrays.asList(RIC_1_INFO_VALID).toString();
        String res = "{\"rics\":" + rics + "}";

        this.whenGetReturnOK(urlRicInfo(POLICY_TYPE_1_ID), HttpStatus.OK, res);

        ResponseEntity<String> resp = apiUnderTest.getRicsSupportingType(POLICY_TYPE_1_ID);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("[\"ric1\"]", resp.getBody());
    }

    @Test
    void testGetRicsSupportingTypeInvalidJson() {
        String rics = Arrays.asList(RIC_1_INFO_INVALID).toString();

        this.whenGetReturnOK(urlRicInfo(POLICY_TYPE_1_ID), HttpStatus.OK, rics);

        ResponseEntity<String> returnedResp = apiUnderTest.getRicsSupportingType(POLICY_TYPE_1_ID);

        assertTrue(returnedResp.getBody().contains("Exception"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, returnedResp.getStatusCode());
    }
}
