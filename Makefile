test:
	NODE_ENV=test ./node_modules/.bin/mocha --recursive --timeout 5000 --reporter spec

.PHONY: test