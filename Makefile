.PHONY: setup

SHELL = bash

all: setup

setup:
	command -v pre-commit > /dev/null && pre-commit install

# https://google.github.io/styleguide/shellguide.html
shell-format:
	shfmt -f . | xargs shfmt -i 2 -ci -sr -kp -w

shell-check:
	shfmt -f . | xargs shfmt -i 2 -ci -sr -kp -d
	shfmt -f . | xargs shellcheck --color=always --severity=$${SEVERITY:-style}

VERSION:
	tools/version.sh

bump-python-version: VERSION
	tools/bump-python-version.sh

.PHONY: tarball
tarball: VERSION bump-python-version
	$(MAKE) -C legacy build
	cd .. && tar -czf libretime-$(shell cat VERSION | tr -d [:blank:]).tar.gz \
		--owner=root --group=root \
		--exclude-vcs \
		--exclude .codespellignore \
		--exclude .git* \
		--exclude .pre-commit-config.yaml \
		--exclude dev_tools \
		--exclude jekyll.sh \
		--exclude legacy/vendor/phing \
		--exclude legacy/vendor/simplepie/simplepie/tests \
		libretime
	mv ../libretime-*.tar.gz .

# Only clean subdirs
clean:
	git clean -xdf */

docs-lint:
	$(MAKE) -C .github/vale/styles
	vale docs website/src/pages
