.. This work is licensed under a Creative Commons Attribution 4.0 International License.
.. http://creativecommons.org/licenses/by/4.0
.. Copyright (C) 2020 Nordix

Installation Guide
==================

Abstract
--------

This document describes how to install the Non-RT RIC Control Panel, its dependencies and required system resources.

This work is in progress. For now, it is possible to use the Non-RT RIC Control Panel.

Version history
---------------

+--------------------+--------------------+--------------------+--------------------+
| **Date**           | **Ver.**           | **Author**         | **Comment**        |
|                    |                    |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| 2020-03-27         | 0.1.0              | Henrik Andersson   | First draft        |
|                    |                    |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| 2021-04-27         | 2.2.0              | Yennifer Chacon    | Update             |
|                    |                    |                    | documentation      |
+--------------------+--------------------+--------------------+--------------------+
|                    |                    |                    |                    |
|                    |                    |                    |                    |
|                    |                    |                    |                    |
+--------------------+--------------------+--------------------+--------------------+



The Non-RT RIC Control Panel is a graphical user interface that enables the user to view and manage the A1 policies in the RAN and also view producers and jobs for the Enrichement coordinator service.

- To create docker image for the control panel:

   .. code-block:: bash

      cd nonrtric-controlpanel/webapp-frontend
      docker build -t o-ran-sc/nonrtric-controlpanel .

- Nonrtric gateway is also needed because all the request from the gui are passed through this API gateway.

   .. code-block:: bash

      cd nonrtric-controlpanel/nonrtric-gateway
      docker build -t o-ran-sc/nonrtric-gateway .

.. note::
   It is important to note that all the route configurations are provided in application.yaml, 
   so in case domain name and port for Policy Management Service & Enrichment Coordinator Service 
   are not the default one, application.yaml file must be modified.

Docker images for Policy Management and Enrichment Coordinator are needed as well in order to view information and data on the interface. These images can be found in the nexus repository or can be built manually as well.

   - nexus3.o-ran-sc.org:10004/o-ran-sc/nonrtric-enrichment-coordinator-service
   - nexus3.o-ran-sc.org:10004/o-ran-sc/nonrtric-policy-agent

`Wiki page <https://wiki.o-ran-sc.org/pages/viewpage.action?pageId=20878049>`_ contain detail information about how to build this images and add some sample data.


- Using docker compose:

   Another alternative is to use docker compose. In the `nonrtric project <https://gerrit.o-ran-sc.org/r/admin/repos/nonrtric>`_ under the folder docker-compose, instructions can be found in the README file.

   It will start all necessary services and provided sample data that can be viewed in the interface using docker compose command: 

      .. code-block:: bash

         docker-compose -f docker-compose.yaml 
                        -f control-panel/docker-compose.yaml  
                        -f nonrtric-gateway/docker-compose.yaml 
                        -f policy-service/docker-compose.yaml 
                        -f ecs/docker-compose.yaml 
                        -f a1-sim/docker-compose.yaml up
   

