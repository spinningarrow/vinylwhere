for i in (seq 1 48)
      set_color bryellow; echo Processing $i; set_color normal
      curl -L "https://roxydischouse.com/product-category/vinyl-lp/page/$i/" | pup '.products .item-title a json{}' > dump/"$i.json"
end

jq 'flatten' -s dump/roxydischouse.com/*.json > dump/roxydischouse.com/all.json

for i in (seq 1 20)
      set_color bryellow; echo Processing $i; set_color normal
      curl -L "https://theanalogvault.com/collections/all?page=$i" | pup '.product-list h2.title a jso n{}' > dump/"$i.json"
end

jq 'flatten' -s dump/theanalogvault.com/*.json > dump/theanalogvault.com/all.json

for i in (seq 1 74)
      set_color bryellow; echo Processing $i; set_color normal
      curl -L "http://www.vinylrecords.sg/page/$i/?sort=title" | pup '.product-title a json{}' > dump/"$i.json"
end

jq 'flatten' -s dump/www.vinylrecords.sg/*.json > dump/www.vinylrecords.sg/all.json
