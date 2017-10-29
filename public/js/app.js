const root = document.querySelector('#app')

let query = ''
const SearchBar = {
	view() {
		return m('form', [
			m('input', {
				autofocus: true,
				placeholder: 'artist or album name',
				oninput: m.withAttr('value', value => {
					query = value.toLowerCase()
				})
			}),
			m('button', { type: 'reset' }, 'reset'),
		])
	}
}

const RecentlyAdded = {
	view() {
		return m('div', [
			m('button', { onclick() { data = fetchedData.recent } }, 'Show recently added'),
			m('button', {
				onclick() {
					const allDataLength = fetchedData.all.length
					const randomIndices = Array(100).fill().map(() =>
						Math.floor(Math.random() * allDataLength))

					data = randomIndices.map(index => fetchedData.all[index])
				}
			}, 'Random 100'),
			m('button', {
				onclick() {
					data = fetchedData.all.filter(({ sources }) => sources.filter(source => source.name === 'theanalogvault' && source.url).length )
				}
			}, 'theanalogvault only'),
			m('button', { onclick() { data = fetchedData.all } }, 'Show all'),
		])
	}
}

let data = []
let fetchedData = null
let lastModified = null
m.request({
	method: 'GET',
	// url: '/result-rich.json',
	url: 'https://vinylwhere.s3-ap-southeast-1.amazonaws.com/dev/result-rich.json',
	extract(xhr) {
		return {
			lastModified: new Date(xhr.getResponseHeader('last-modified')),
			bodyJson: JSON.parse(xhr.responseText),
		}
	}
})
.then(response => {
	fetchedData = response.bodyJson
	lastModified = response.lastModified
	data = fetchedData.all
})

const SearchResults = {
	view() {
		return m('ul', data
			.filter(({ artist }) => artist.toLowerCase().indexOf(query) !== -1)
			.slice(0, 100)
			.map(({ artist, album, sources }) => m('li', {key: artist + album }, [
				m('p', `${artist} - ${album}`),
				m('ul', sources.map(source => m('li', m('a', { href: source.url, target: '_blank' }, source.name)))),
			]))
		)
	}
}

const LastUpdated = {
	view() {
		return m('span', [
			'Last updated at ',
			m('time', lastModified && lastModified.toDateString()),
		])
	}
}

const About = {
	view() {
		return m('div', [
			m('h2', 'About'),
			m('p', `VinylWhere is a ridiculously fast search engine for vinyl
				records in Singapore`),
		])
	}
}

m.route(root, '/', {
	'/': {
		render() {
			return m('div', [
				m(LastUpdated),
				m(SearchBar),
				m(RecentlyAdded),
				m(SearchResults),
			])
		}
	},
	'/about': About,
})
