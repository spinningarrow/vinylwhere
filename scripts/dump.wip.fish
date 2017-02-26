#!/usr/bin/env fish

# Check if pup/node/etc installed

# Create directories
set date (date +%Y-%m-%d)
mkdir -p dump/$date/{roxydischouse.com,theanalogvault.com,www.vinylrecords.sg}

# Download pages
# Parse pages
# Combine JSON per site
# Combine into one JSON
set_color bryellow
echo -n roxydischouse.com: ''
set_color normal

for i in (seq 48 1)
	echo -n $i…
	curl -sL "https://roxydischouse.com/product-category/vinyl-lp/page/$i/" > dump/$date/roxydischouse.com/"$i.html"
end

for i in (ls dump/$date/roxydischouse.com/*.html)
	cat $i | pup '.products .item-title a json{}' > $i.json
end

jq 'flatten' -s dump/$date/roxydischouse.com/*.json > dump/$date/roxydischouse.com/all.json

echo done.


set_color bryellow
echo -n theanalogvault.com: ''
set_color normal

for i in (seq 20 1)
	echo -n $i…
	curl -sL "https://theanalogvault.com/collections/all?page=$i" > dump/$date/theanalogvault.com/"$i.html"
end

for i in (ls dump/$date/theanalogvault.com/*.html)
	cat $i | pup '.product-list h2.title a json{}' > $i.json
end

jq 'flatten' -s dump/$date/theanalogvault.com/*.json > dump/$date/theanalogvault.com/all.json

echo done.


set_color bryellow
echo -n www.vinylrecords.sg: ''
set_color normal
for i in (seq 76 1)
	echo -n $i…
	curl -sL "http://www.vinylrecords.sg/page/$i/" > dump/$date/www.vinylrecords.sg/"$i.html"
end

for i in (ls dump/$date/www.vinylrecords.sg/*.html)
	cat $i | pup '.product-title a json{}' > $i.json
end

jq 'flatten' -s dump/$date/www.vinylrecords.sg/*.json > dump/$date/www.vinylrecords.sg/all.json

echo done.

jq 'flatten' -s (./theanalogvault.com.js ../dump/2017-02-25/theanalogvault.com/all.json |psub) (./roxydischouse.com.js ../dump/2017-02-25/roxydischouse.com/all.json | psub) (./www.vinylrecords.sg.js ../dump/2017-02-25/www.vinylrecords.sg/all.json | psub) > ../dump/2017-02-25/all.json
./group.js ../dump/2017-02-25/all.json | jq 'sort_by(.artist)'
