.PHONY: travis

travis:
	$(MAKE) -C scraper

# travis:
# 	if [ "${TRAVIS_EVENT_TYPE}" = "cron" ]; then\
# 		$(MAKE) -C scraper start;\
# 	else\
# 		echo testing this thing;\
# 	fi
