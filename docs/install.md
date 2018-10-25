# Installing LibreTime

LibreTime should generally be installed on a dedicated host running Ubuntu 16.04 LTS (Xenial Xerus). 

Once you have downloaded and extracted the LibreTime repository, run the instalation script by navigating into the folder containing the LibreTime codebase, and run it's install script from the command line:

    :::bash
    sudo ./install

By default, the installer will install and configure all dependencies.

## Alternative OS installations
Instalation in Debian 9 and other Linux distributions is possible, but multiple outstanding issues have yet to be resolved. Instalation on Ubuntu 14.04.5 LTS (Trusty Tahr) is also working, but deprecated due to the fact that this version will reach its official end of life in April 2019.

Plans are in the works for `.deb` and `.rpm` packages, as well as Docker and AWS images.

Please note that the install script does not take care to ensure that any
packages installed are set up in a secure manner. Please see the chapter on
[preparing the server](manual/preparing-the-server/) for more details on
how to set up a secure installation.
