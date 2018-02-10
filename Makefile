DAY_OF_WEEK := $(shell date +%u)

.PHONY: travis

travis:
	if [ "${TRAVIS_EVENT_TYPE}" = "cron" ]; then\
		$(MAKE) --directory=scraper all upload;\
	else\
		$(MAKE) --directory=scraper test && npm test;\
	fi
