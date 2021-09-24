#!/usr/bin/env bash

set -u

error() {
  echo >&2 "error: $*"
  exit 1
}

command -v git > /dev/null || error "git command not found!"
command -v tee > /dev/null || error "tee command not found!"

typeset -r version_file="VERSION"

if [[ "$(git rev-parse --is-inside-work-tree 2> /dev/null)" == "true" ]]; then
  tag=$(git tag --points-at HEAD | tee "$version_file" || error "could not extract tag")
  if [[ -z "$tag" ]]; then
    git rev-parse --short HEAD > "$version_file" || error "could not extract commit sha"
  fi
else
  if [[ ! -f "$version_file" ]]; then
    echo "could not detect version" > VERSION
  fi
fi
