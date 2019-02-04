The **LibreTime Vagrant install** is the fastet way to get LibreTime up and running in a way
to hack on its source code or to test it locally. There are two supported providers: libvirt
and VirtualBox.

## Prerequisites

* [Git](https://git-scm.com/)
* [Vagrant](https://vagrantup.com)

### Virtual Box

You will need to install [VirtualBox](https://www.virtualbox.org) and may want to consider
installing [vagrant-vbguest](https://github.com/dotless-de/vagrant-vbguest) to update the
guest extensions to match your host system on vagrant up.

```bash
vagrant plugin install vagrant-vbguest
```

### Libvirt

Setting the libvirt provider up on (Ubuntu and Debian)[#Ubuntu and Debian] is straight
forward, using the distribution provided packages. While on
(Other Distributions)[#Other Distributions] it can be built from within vagrant.

If you try run a libvirt provided box after using a VirtualBox one, you will receive an
error:

```
Error while activating network:
Call to virNetworkCreate failed: internal error: Network is already in use by interface vboxnet0.
```

This is fixed by stopping virtualbox and re-creating the vagrant box:

```
sudo systemctl stop virtualbox
vagrant destroy ubuntu-xenial
vagrant up ubuntu-xenial --provider=libvirt
```

#### Debian and Ubuntu

```bash
sudo apt install vagrant vagrant-libvirt libvirt-daemon-system vagrant-mutate libvirt-dev
sudo usermod -a -G libvirt $USER

# Reboot

vagrant box add bento/ubuntu-16.04 --provider=virtualbox
vagrant mutate bento/ubuntu-16.04 libvirt
vagrant up ubuntu-xenial --provider=libvirt
```

#### Other Distributions

You will need to install [libvirt](https://libvirt.org/) and `vagrant-mutate` and then run

```bash
vagrant plugin install vagrant-libvirt
sudo usermod -a -G libvirt $USER

# Reboot

vagrant plugin install vagrant-mutate
vagrant box fetch bento/ubuntu-16.04
vagrant mutate bento/ubuntu-16.04 libvirt
vagrant up ubuntu-xenial --provider=libvirt
```

## Starting LibreTime Vagrant

To get started you clone the repo and run `vagrant up`. The command accepts a parameter to
change the default provider if you have multiple installed. This can be done by appending
`--provider=virtualbox` or `--provider=libvirt` as applicable.

```bash
git clone https://github.com/libretime/libretime.git
cd libretime
vagrant up ubuntu-xenial
```

If everything works out, you will find LibreTime on [port 8080](http://localhost:8080),
icecast on [port 8000](http://localhost:8000) and the docs on
[port 8888](http://localhost:8888).

Once you reach the web setup GUI you can click through it using the default values. To
connect to the vagrant machine you can run `vagrant ssh ubuntu-xenial` in the libretime
directory.

## Alternative OS installations

With the above instructions LibreTime is installed on Ubuntu Xenial Xerus. The Vagrant setup
offers the option to choose a different operation system according to you needs.

| OS     | Command             | Comment |
| ------ | ------------------- | ------- |
| Debian 9.6   | `vagrant up debian-stretch` | Install on current Debian Stretch. |
| Debian 8.7   | `vagrant up debian-jessie`  | Install on Debian Jessie. |
| Ubuntu 18.04 | `vagrant up ubuntu-bionic`  | Experimental install on current Ubuntu Bionic Beaver. |
| Ubuntu 16.04 | `vagrant up ubuntu-xenial`  | Install on Ubuntu Xenial Xerus. |
| Ubuntu 14.04 | `vagrant up ubuntu-trusty`  | Deprecated install on Ubuntu Trusty Tahir. Recommended by legacy upstream. |
| CentOS | `vagrant up centos` | Extremely experimental install on 7.3 with native systemd support and activated SELinux. Needs manual intervention due to Liquidsoap 1.3.3. |

## Troubleshooting

If anything fails during the initial provisioning step you can try running `vagrant provision`
to rerun the installer.

If you only want to re-run parts of the installer, use `--provision-with install`. The
supported steps are `prepare`, `install`, `install-mkdocs` and `start-mkdocs`.
