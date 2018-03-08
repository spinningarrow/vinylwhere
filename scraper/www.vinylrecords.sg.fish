#!/usr/bin/env fish

set_color bryellow
echo www.vinylrecords.sg
set_color normal

set HOSTNAME 'http://www.vinylrecords.sg/'
test "$SCRAPER_ENV" = "test"; and set HOSTNAME 'http://localhost:9003'

mkdir -p dump/www.vinylrecords.sg

set total_pages (curl -s "$HOSTNAME/" | \
	pup '[title=»] json{}' | jq -r .[0].href | grep -oE [[:digit:]]+)

for i in (seq $total_pages -1 1)
	echo -n $i…
	curl -sL "$HOSTNAME/page/$i/" > dump/www.vinylrecords.sg/"$i.html"
end

for i in (ls dump/www.vinylrecords.sg/*.html)
	cat $i | pup '.product-title a json{}' > $i.json
end

jq 'flatten' -s dump/www.vinylrecords.sg/*.json > dump/www.vinylrecords.sg/all.json

echo done.
