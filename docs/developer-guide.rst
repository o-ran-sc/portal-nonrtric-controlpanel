.. This work is licensed under a Creative Commons Attribution 4.0 International License.
.. SPDX-License-Identifier: CC-BY-4.0
.. Copyright (C) 2020 Nordix

Developer Guide
===============

This document provides a quickstart for developers of the Non-RT RIC Control Panel.

The Non-RT RIC Control Panel is an interface that allows human users to create, edit and delete policy instances, for
each existing policy type. The policy types and their definitions are retrieved from each Near-RT RIC.

Aditionally, producers and jobs for the Enrichment coordinator service can be viewed and manage.

See the README.md file in the nonrtric-controlpanel repo for information about how to use it.

Start the Control Panel for development
---------------------------------------

To run the Control Panel locally for development with simulated services, follow these steps:

- Fetch the latest code from `gerrit`_

.. _gerrit: https://gerrit.o-ran-sc.org/r/admin/repos/portal/nonrtric-controlpanel

- Start the frontend:

    +------------------------------+
    | cd webapp-frontend           |
    +------------------------------+

    - To start the frontend with Mock data:

        +------------------------------+
        | npm run start:mock           |
        +------------------------------+

    - To start the UI:

        - You need to start the ControlPanel API Gateway, Policy Management Service & EI Service for the UI to list policy & EI information

        +---------------------------------------------------+
        | ./ng serve --proxy-config proxy.conf.json         |
        +---------------------------------------------------+

        OR

        +---------------------+
        | npm start           |
        +---------------------+

    - Now you can open URL:  `localhost:4200`_ in a browser to access the Control Panel.

    .. _localhost:4200: http://localhost:4200

From the main page, click on the "Policy Control" card. From here, it is possible to create or list instances for each
existing policy type.

When the instances are listed, it is possible to edit or delete each instance from the expanded view.

.. image:: ./images/non-RT_RIC_controlpanel_Policy.PNG

In order to view producers and jobs from the EI service, from the main page, click on the "Enrichment information coordinator" card or use the menu on the left hand side of the page. 

.. image:: ./images/non-RT_RIC_controlpanel_EI.PNG

End-to-end call
---------------

In order to make a complete end-to-end call, follow the instructions given in this `guide`_.

.. _guide: https://wiki.o-ran-sc.org/pages/viewpage.action?pageId=12157166