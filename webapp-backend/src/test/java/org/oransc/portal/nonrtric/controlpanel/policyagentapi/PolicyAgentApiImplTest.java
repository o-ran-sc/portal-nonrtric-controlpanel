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
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.oransc.portal.nonrtric.controlpanel.model.ImmutablePolicyInfo;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInfo;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInstances;
import org.oransc.portal.nonrtric.controlpanel.util.AsyncRestClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpServerErrorException;
import reactor.core.publisher.Mono;

public class PolicyAgentApiImplTest {
    private static final String URL_POLICY_SCHEMAS = "/policy_schemas";
    private static final String POLICY_TYPE_1_ID = "type1";
    private static final String POLICY_TYPE_1_VALID = "{\"title\":\"type1\"}";
    private static final String POLICY_TYPE_1_INVALID = "\"title\":\"type1\"}";
    private static final String POLICY_TYPE_2_VALID = "{\"title\":\"type2\"}";
    private static final String POLICY_1_ID = "policy1";
    private static final String POLICY_1_VALID = "{\"policyId\":\"policy1\"}";
    private static final String POLICY_1_INVALID = "\"policyId\":\"policy1\"}";
    private static final String RIC_1_ID = "ric1";
    private static final String RIC_1_INFO_VALID = "{\"ricName\":\"ric1\",\"policyTypes\":[\"type1\"]}";
    private static final String RIC_1_INFO_INVALID = "{\"ricName\":\"ric1\",\"policyTypes\":\"type1\"]}";
    private static final String CLIENT_ERROR_MESSAGE = "XXXXXXX";

    private static com.google.gson.Gson gson = new GsonBuilder() //
        .serializeNulls() //
        .create(); //

    PolicyAgentApiImpl apiUnderTest;

    AsyncRestClient restClient;

    @BeforeEach
    public void init() {
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
    public void testGetAllPolicyTypesFailure() {
        whenGetReturnFailure(URL_POLICY_SCHEMAS, HttpStatus.NOT_FOUND, "");
        ResponseEntity<String> returnedResp = apiUnderTest.getAllPolicyTypes();
        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    public void testGetAllPolicyTypesSuccessValidJson() {
        String policyTypes = Arrays.asList(POLICY_TYPE_1_VALID, POLICY_TYPE_2_VALID).toString();

        whenGetReturnOK(URL_POLICY_SCHEMAS, HttpStatus.OK, policyTypes);

        ResponseEntity<String> resp = apiUnderTest.getAllPolicyTypes();
        assertTrue(resp.getBody().contains("\"name\":\"type1\""));
        assertEquals(HttpStatus.OK, resp.getStatusCode());
    }

    @Test
    public void testGetAllPolicyTypesSuccessInvalidJson() {
        String policyTypes = Arrays.asList(POLICY_TYPE_1_INVALID, POLICY_TYPE_2_VALID).toString();
        whenGetReturnOK(URL_POLICY_SCHEMAS, HttpStatus.OK, policyTypes);

        ResponseEntity<String> returnedResp = apiUnderTest.getAllPolicyTypes();

        assertTrue(returnedResp.getBody().contains("Exception"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, returnedResp.getStatusCode());
    }

    private String urlPolicyInstances(String type) {
        return "/policies?type=" + type;
    }

    @Test
    public void testGetPolicyInstancesForTypeFailure() {
        whenGetReturnFailure(urlPolicyInstances(POLICY_TYPE_1_ID), HttpStatus.NOT_FOUND, "");

        ResponseEntity<String> returnedResp = apiUnderTest.getPolicyInstancesForType(POLICY_TYPE_1_ID);

        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    public void testGetPolicyInstancesForTypeSuccessValidJson() {
        String policyInstances = Arrays.asList(POLICY_1_VALID).toString();
        String policyInstancesJson = parsePolicyInstancesJson(policyInstances);

        whenGetReturnOK(urlPolicyInstances(POLICY_TYPE_1_ID), HttpStatus.OK, policyInstances);

        ResponseEntity<String> returnedResp = apiUnderTest.getPolicyInstancesForType(POLICY_TYPE_1_ID);

        assertEquals(returnedResp.getBody(), policyInstancesJson);
        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
    }

    @Test
    public void testGetPolicyInstancesForTypeSuccessInvalidJson() {
        String policyInstances = Arrays.asList(POLICY_1_INVALID).toString();

        whenGetReturnOK(urlPolicyInstances(POLICY_TYPE_1_ID), HttpStatus.OK, policyInstances);

        ResponseEntity<String> returnedResp = apiUnderTest.getPolicyInstancesForType(POLICY_TYPE_1_ID);

        assertTrue(returnedResp.getBody().contains("Exception"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, returnedResp.getStatusCode());
    }

    private String urlPolicyInstance(String id) {
        return "/policy?id=" + id;
    }

    @Test
    public void testGetPolicyInstance() {
        whenGetReturnOK(urlPolicyInstance(POLICY_1_ID), HttpStatus.OK, POLICY_1_VALID);

        ResponseEntity<Object> returnedResp = apiUnderTest.getPolicyInstance(POLICY_1_ID);

        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
        assertEquals(POLICY_1_VALID, returnedResp.getBody());

    }

    private String urlPutPolicy(String type, String id, String ric) {
        return "/policy?type=" + type + "&id=" + id + "&ric=" + ric + "&service=controlpanel";
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
    public void testPutPolicyFailure() {
        String url = urlPutPolicy(POLICY_TYPE_1_ID, POLICY_1_ID, RIC_1_ID);
        whenPutReturnFailure(url, POLICY_1_VALID, HttpStatus.NOT_FOUND, CLIENT_ERROR_MESSAGE);

        ResponseEntity<String> returnedResp =
            apiUnderTest.putPolicy(POLICY_TYPE_1_ID, POLICY_1_ID, POLICY_1_VALID, RIC_1_ID);

        assertTrue(returnedResp.getBody().contains(CLIENT_ERROR_MESSAGE));
        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    public void testPutPolicySuccess() {
        String url = urlPutPolicy(POLICY_TYPE_1_ID, POLICY_1_ID, RIC_1_ID);
        whenPutReturnOK(url, POLICY_1_VALID, HttpStatus.OK, POLICY_1_VALID);

        ResponseEntity<String> returnedResp =
            apiUnderTest.putPolicy(POLICY_TYPE_1_ID, POLICY_1_ID, POLICY_1_VALID, RIC_1_ID);

        assertNull(returnedResp.getBody());
        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
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
        return "/policy?id=" + id;
    }

    @Test
    public void testDeletePolicyFailure() {
        whenDeleteReturnFailure(deletePolicyUrl(POLICY_1_ID), HttpStatus.NOT_FOUND, CLIENT_ERROR_MESSAGE);

        ResponseEntity<String> returnedResp = apiUnderTest.deletePolicy(POLICY_1_ID);

        assertTrue(returnedResp.getBody().contains(CLIENT_ERROR_MESSAGE));
        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    public void testDeletePolicySuccess() {
        whenDeleteReturnOK(deletePolicyUrl(POLICY_1_ID), HttpStatus.OK);
        ResponseEntity<String> returnedResp = apiUnderTest.deletePolicy(POLICY_1_ID);

        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
    }

    private String urlRicInfo(String typeName) {
        return "/rics?policyType=" + typeName;
    }

    @Test
    public void testGetRicsSupportingTypeValidJson() {
        String rics = Arrays.asList(RIC_1_INFO_VALID).toString();

        this.whenGetReturnOK(urlRicInfo(POLICY_TYPE_1_ID), HttpStatus.OK, rics);

        ResponseEntity<String> resp = apiUnderTest.getRicsSupportingType(POLICY_TYPE_1_ID);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("[\"ric1\"]", resp.getBody());
    }

    @Test
    public void testGetRicsSupportingTypeInvalidJson() {
        String rics = Arrays.asList(RIC_1_INFO_INVALID).toString();

        this.whenGetReturnOK(urlRicInfo(POLICY_TYPE_1_ID), HttpStatus.OK, rics);

        ResponseEntity<String> returnedResp = apiUnderTest.getRicsSupportingType(POLICY_TYPE_1_ID);

        assertTrue(returnedResp.getBody().contains("Exception"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, returnedResp.getStatusCode());
    }

    private String parsePolicyInstancesJson(String inputString) {
        Type listType = new TypeToken<List<ImmutablePolicyInfo>>() {}.getType();
        List<PolicyInfo> rspParsed = gson.fromJson(inputString, listType);
        PolicyInstances policyInstances = new PolicyInstances();
        for (PolicyInfo policy : rspParsed) {
            policyInstances.add(policy);
        }
        return gson.toJson(policyInstances);
    }
}
