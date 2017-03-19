SHELL:=/usr/local/bin/fish

records.grouped.json.gz: records.grouped.json
	gzip -c -9 records.grouped.json > records.grouped.json.gz

records.grouped.json: dump/all.json
	scripts/group.js ../dump/all.json | jq 'sort_by(.artist)' > records.grouped.json

dump/all.json: dump/theanalogvault.com/all.json dump/roxydischouse.com/all.json dump/www.vinylrecords.sg/all.json
	jq 'flatten' -s \
		(scripts/theanalogvault.com.js ../dump/theanalogvault.com/all.json | psub) \
		(scripts/roxydischouse.com.js ../dump/roxydischouse.com/all.json | psub) \
		(scripts/www.vinylrecords.sg.js ../dump/www.vinylrecords.sg/all.json | psub) \
		> dump/all.json

dump/theanalogvault.com/all.json:
	scripts/theanalogvault.com.fish

dump/roxydischouse.com/all.json:
	scripts/roxydischouse.com.fish

dump/www.vinylrecords.sg/all.json:
	scripts/www.vinylrecords.sg.fish

upload: records.grouped.json.gz
	aws s3 cp s3://vinylwhere/records.grouped.json.gz \
		s3://vinylwhere/records.grouped.json.gz.(date "+%Y%m%d%H%M%S")
	aws s3 cp \
		--acl=public-read \
		--content-type=application/json \
		--content-encoding=gzip \
		records.grouped.json.gz \
		s3://vinylwhere/

archive:
	cp -r dump dump.(date).archive

clean:
	rm records.grouped.json records.grouped.json.gz
	rm -rf dump
