import os

from setuptools import setup

# Change directory since setuptools uses relative paths
os.chdir(os.path.dirname(os.path.realpath(__file__)))

setup(
    name="libretime-celery",
    version="0.1",
    description="LibreTime Celery",
    author="LibreTime Contributors",
    url="https://github.com/libretime/libretime",
    project_urls={
        "Bug Tracker": "https://github.com/libretime/libretime/issues",
        "Documentation": "https://libretime.org",
        "Source Code": "https://github.com/libretime/libretime",
    },
    license="MIT",
    packages=["airtime-celery"],
    python_requires=">=3.6",
    install_requires=[
        "celery==5.2.2",
        "kombu==4.6.10",
        "configobj",
        "mutagen>=1.31.0",
        "requests>=2.7.0",
    ],
    zip_safe=False,
)
