from __future__ import print_function

import os
import sys
from subprocess import call

from setuptools import setup

script_path = os.path.dirname(os.path.realpath(__file__))
print(script_path)
os.chdir(script_path)

setup(
    name="api_clients",
    version="2.0.0",
    description="LibreTime API Client",
    url="http://github.com/LibreTime/Libretime",
    author="LibreTime Contributors",
    license="AGPLv3",
    packages=["api_clients"],
    scripts=[],
    install_requires=[
        "configobj",
        "python-dateutil",
    ],
    zip_safe=False,
    data_files=[],
)
