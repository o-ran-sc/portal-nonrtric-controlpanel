.. This work is licensed under a Creative Commons Attribution 4.0 International License.
.. http://creativecommons.org/licenses/by/4.0
.. Copyright (C) 2021 Nordix

.. _api_docs:

========
API-Docs
========

This document describes the API to access the Non-RT RIC Gateway.

The Gateway acts as a mediator for services provided by the Non-RT RIC project. This means that users only need to
know about one address to access the content of the Non-RT Ric.

The default value for the Gateway port is 9090. There are different ways to find out which port that is actually used.

If Kubernetes is used, run the following command:

 .. code-block:: bash

    kubectl get svc -n nonrtric | grep gateway

With the name from the "NAME" column, run the following command:

 .. code-block:: bash

    kubectl describe svc -n nonrtric [name]

If Docker is used, run the following command:

 .. code-block:: bash

    docker ps | grep gateway

Look under the "PORTS" column to see the port used by the Gateway.

The Gateway supports calls to the A1 Policy Management Service and A1 Enrichment Information Coordinator.
See `A1 Policy Management Service API <https://docs.o-ran-sc.org/projects/o-ran-sc-nonrtric/en/latest/api-docs.html#a1-policy-management-service>`__
and `A1 Enrichment Information Coordinator API <https://docs.o-ran-sc.org/projects/o-ran-sc-nonrtric/en/latest/api-docs.html#enrichment-coordinator-service>`__.