.. This work is licensed under a Creative Commons Attribution 4.0 International License.
.. http://creativecommons.org/licenses/by/4.0
.. Copyright (C) 2020 Nordix

Installation Guide
==================

Abstract
--------

This document describes how to install the Non-RT RIC Control Panel, its dependencies and required system resources.


The Non-RT RIC Control Panel is a graphical user interface that enables the user to view and manage the A1 policies in
the RAN and also view producers and jobs for the Enrichement Information coordinator service. 

Preface
-------

Since the control Panel depends on the A1 Policy Management Service and A1 Enrichment Information Coordinator, they
must be installed to make it work. See `Non-RT RIC <https://docs.o-ran-sc.org/projects/o-ran-sc-nonrtric/en/latest/index.html>`__
for how to install and set them up.

Software Installation and Deployment
------------------------------------

.. note::
   It is important to note that all the route configurations are provided in the application.yaml file of the gateway.
   So in case domain name and port for Policy Management Service and Enrichment Information Coordinator Service
   are not the default ones, the application.yaml file must be modified.

Install with Docker
+++++++++++++++++++

Docker compose files are provided, in the "docker-compose" folder, to install the frontend and gateway. Run the following
command to start the Control Panel:

      .. code-block:: bash

         docker-compose -f docker-compose.yaml
                        -f control-panel/docker-compose.yaml
                        -f nonrtric-gateway/docker-compose.yaml

Install with Helm
+++++++++++++++++

Helm charts and an example recipe are provided in the `it/dep repo <https://gerrit.o-ran-sc.org/r/admin/repos/it/dep>`__,
under "nonrtric". By modifying the variables named "installXXX" in the beginning of the example recipe file, which
components that will be installed can be controlled. Then the components can be installed and started by running the
following comand:

      .. code-block:: bash

        bin/deploy-nonrtric -f nonrtric/RECIPE_EXAMPLE/example_recipe.yaml
