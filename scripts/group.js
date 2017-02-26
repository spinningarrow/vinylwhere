#!/usr/bin/env node

const data = require(process.argv[2])

var store = []

const find = e => store.find(s => s.artist == e.artist && s.album == e.album)

data.forEach(e => {
	if (!find(e)) {
		e.sources = [e.href]
		store.push(e)
	} else {
		find(e).sources.push(e.href)
		// e.meta.forEach(m => find(e).meta.push(m))
	}
})

console.log(JSON.stringify(store))
