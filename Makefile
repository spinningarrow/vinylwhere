DAY_OF_WEEK := $(shell date +%u)

.PHONY: travis

travis:
	if [ "${TRAVIS_EVENT_TYPE}" = "cron" ]; then\
		$(MAKE) --direcotry=scraper start;\
	else\
		npm test;\
	fi
