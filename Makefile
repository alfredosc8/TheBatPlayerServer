REPORTER = dot

test:
	@NODE_ENV=test /usr/local/bin/mocha --timeout 5000 --reporter nyan

test-w:
	@NODE_ENV=test /usr/local/bin/mocha --timeout 5000 \
		--reporter $(REPORTER) \
		--ui tdd \
		--growl \
		--watch

dev:
	@NODE_ENV=development node bin/www

restart:
	@NODE_ENV=production forever restartall
	forever logs -f 0

start:
	@NODE_ENV=production forever start bin/www
	forever logs -f 0

stop:
	 forever stopall

log:
	forever logs -f 0

.PHONY: test test-w dev restart start stop
