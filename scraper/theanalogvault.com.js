#!/usr/bin/env node

const dump = require(process.argv[2])

const album = albumWithMeta => albumWithMeta ? albumWithMeta.split('|')[0].trim() : ''

const meta = albumWithMeta => {
	if (!albumWithMeta) return []

	return albumWithMeta.split('|').map(s => s.trim()).slice(1)
}

const output = dump.map(e => {
	const [ artist, albumWithMeta ] = e.text.split('–')
	return {
		href: `https://theanalogvault.com${e.href}`,
		artist: artist.trim(),
		album: album(albumWithMeta),
		meta: meta(albumWithMeta),
	}
})

console.log(JSON.stringify(output))
