#!/usr/bin/env fish

set_color bryellow
echo theanalogvault.com
set_color normal

set HOSTNAME 'https://theanalogvault.com'
test "$SCRAPER_ENV" = "test"; and set HOSTNAME 'http://localhost:9001'

mkdir -p dump/theanalogvault.com

set total_pages (curl -s "$HOSTNAME/collections/all" | \
	pup '.pagination .position text{}' | head -1 | cut -d' ' -f4)

for i in (seq $total_pages -1 1)
	echo -n $i…
	curl -sL "$HOSTNAME/collections/all?page=$i" > dump/theanalogvault.com/"$i.html"
end

for i in (ls dump/theanalogvault.com/*.html)
	cat $i | pup '.product-list h2.title a json{}' > $i.json
end

jq 'flatten' -s dump/theanalogvault.com/*.json > dump/theanalogvault.com/all.json

echo done.
