#!/usr/bin/env node

const dump = require(process.argv[2])

const album = albumWithMeta => albumWithMeta && albumWithMeta.split('(')[0].trim()

const meta = albumWithMeta => {
	if (!albumWithMeta) return []

	const matches = albumWithMeta.match(/\((.+)\)/)
	return matches ? (matches[1] || []) : []
}

const output = dump.map(e => {
	const [ artist, album ] = e.text.split('–')
	return {
		href: e.href,
		artist: artist.replace('\u200e', '').trim(),
		album: album ? album.replace('\u200e', '').trim() : '',
		meta: [],
	}
})

console.log(JSON.stringify(output))
