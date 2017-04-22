# vinylwhere

Superfast search engine for vinyl records in Singapore.

## Scraper

### Dependencies

- make
- fish
- jq 1.5+
- node
- aws-cli

### Update data JSON

    make archive
    make clean

    make
    
### Upload to S3

    make upload
