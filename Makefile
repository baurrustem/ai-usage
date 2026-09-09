.PHONY: test preview build check-public dist

test:
	python3 -m unittest discover -s tests -v
	node --test tests/test_widget.js

preview:
	node tools/build_preview.js --demo
	node tools/build_native_preview.js --demo

build:
	python3 tools/build_widget.py

check-public:
	python3 tools/check_public.py

dist: test check-public
	python3 tools/build_release.py
