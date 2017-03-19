#!/usr/bin/env fish

set_color bryellow
echo www.vinylrecords.sg
set_color normal

mkdir -p dump/www.vinylrecords.sg

set total_pages (curl -s 'http://www.vinylrecords.sg/' | \
	pup '[title=»] json{}' | jq -r .[0].href | grep -oE \\d+)

for i in (seq $total_pages 1)
	echo -n $i…
	curl -sL "http://www.vinylrecords.sg/page/$i/" > dump/www.vinylrecords.sg/"$i.html"
end

for i in (ls dump/www.vinylrecords.sg/*.html)
	cat $i | pup '.product-title a json{}' > $i.json
end

jq 'flatten' -s dump/www.vinylrecords.sg/*.json > dump/www.vinylrecords.sg/all.json

echo done.
