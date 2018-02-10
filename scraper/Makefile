SHELL:=/usr/bin/env fish

.PHONY: upload

upload: records.grouped.json.gz
	aws s3 cp s3://vinylwhere/records.grouped.json.gz \
		s3://vinylwhere/records.grouped.json.gz.(date "+%Y%m%d%H%M%S")
	aws s3 cp \
		--acl=public-read \
		--content-type=application/json \
		--content-encoding=gzip \
		records.grouped.json.gz \
		s3://vinylwhere/

records.grouped.json.gz: records.grouped.json
	gzip -c -9 records.grouped.json > records.grouped.json.gz

records.grouped.json: dump/all.json
	group.js dump/all.json | jq 'sort_by(.artist)' > records.grouped.json

dump/all.json: dump/theanalogvault.com/all.json dump/roxydischouse.com/all.json dump/www.vinylrecords.sg/all.json
	ls -al
	jq 'flatten' -s \
		(./theanalogvault.com.js dump/theanalogvault.com/all.json | psub) \
		(./roxydischouse.com.js dump/roxydischouse.com/all.json | psub) \
		(./www.vinylrecords.sg.js dump/www.vinylrecords.sg/all.json | psub) \
		> dump/all.json

dump/theanalogvault.com/all.json:
	./theanalogvault.com.fish

dump/roxydischouse.com/all.json:
	./roxydischouse.com.fish

dump/www.vinylrecords.sg/all.json:
	./www.vinylrecords.sg.fish

archive:
	cp -r dump dump.(date).archive

clean:
	if test -e records.grouped.json; rm records.grouped.json; end
	if test -e records.grouped.json.gz; rm records.grouped.json.gz; end
	if test -e dump; rm -rf dump; end
