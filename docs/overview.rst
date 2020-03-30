.. This work is licensed under a Creative Commons Attribution 4.0 International License.
.. SPDX-License-Identifier: CC-BY-4.0


Control Panel Overview
======================

The NonRT RIC Control Panel is a graphical user  user interface that enables the user to manage the Policies in the
network. The Control Panel interacts with the Policy agent via a REST API.
The Control Panel generates its GUI from JSON schemas in a model driven fashion.

The Control Panel consists of a back end implemented as a Java Springboot application and a fronted developed using the
Angular framework.

Control Panel architecture
--------------------------

The architecture of the Control Panel is as shown on the following picture:

.. image:: ./images/architecture.png
   :scale: 50 %

The Control Panel itself is split into the backend and the frontend, and can be deployed following the instructions in
the README.md file in the repo.