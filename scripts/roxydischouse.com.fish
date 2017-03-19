#!/usr/bin/env fish

set_color bryellow
echo roxydischouse.com
set_color normal

mkdir -p dump/roxydischouse.com

set total_pages (curl -s 'https://roxydischouse.com/product-category/vinyl-lp/' | \
	pup '.page-numbers li:nth-last-child(2) a text{}')

for i in (seq $total_pages 1)
	echo -n $i…
	curl -sL "https://roxydischouse.com/product-category/vinyl-lp/page/$i/" > dump/roxydischouse.com/"$i.html"
end

for i in (ls dump/roxydischouse.com/*.html)
	cat $i | pup '.products .item-title a json{}' > $i.json
end

jq 'flatten' -s dump/roxydischouse.com/*.json > dump/roxydischouse.com/all.json

echo done.
