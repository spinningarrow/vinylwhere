#!/usr/bin/env node

const dump = require('./dump/roxydischouse.com/all.json')

const album = albumWithMeta => albumWithMeta ? albumWithMeta.split('(')[0].trim() : ''

const meta = albumWithMeta => {
	if (!albumWithMeta) return []

	const matches = albumWithMeta.match(/\((.+)\)/)
	return matches ? ([matches[1]] || []) : []
}

const output = dump.map(e => {
	const [ artist, albumWithMeta ] = e.text.split('–')
	return {
		href: e.href,
		artist: artist.trim(),
		album: album(albumWithMeta),
		meta: meta(albumWithMeta),
	}
})

console.log(JSON.stringify(output))
