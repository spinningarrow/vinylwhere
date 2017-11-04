const root = document.querySelector('#app')

const SearchBar = {
	view({ attrs: { update } }) {
		return m('form', [
			m('input', {
				autofocus: true,
				placeholder: 'artist or album name',
				oninput: m.withAttr('value', value => {
					update(value.toLowerCase())
				})
			}),
			m('button', { type: 'reset' }, 'reset'),
		])
	}
}

const RecentlyAdded = {
	view({ attrs: { update, fetchedData: { recent, all } } }) {
		return m('div', [
			m('button', { onclick() { update(recent) } }, 'Show recently added'),
			m('button', {
				onclick() {
					const allDataLength = all.length
					const randomIndices = Array(100).fill().map(() =>
						Math.floor(Math.random() * allDataLength))

					update(randomIndices.map(index => all[index]))
				}
			}, 'Random 100'),
			m('button', {
				onclick() {
					update(all.filter(({ sources }) => sources.filter(source => source.name === 'theanalogvault' && source.url).length ))
				}
			}, 'theanalogvault only'),
			m('button', { onclick() { update(all) } }, 'Show all'),
		])
	}
}

const SearchResults = {
	view({ attrs: { data, query }}) {
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
	view({ attrs: { lastUpdated }}) {
		return m('span', [
			'Last updated at ',
			m('time', lastUpdated && lastUpdated.toDateString()),
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

const App = {
	query: '',
	data: [],
	fetchedData: { recent: [], all: [] },
	lastModified: null,

	oninit({ state }) {
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
			state.fetchedData = response.bodyJson
			state.lastModified = response.lastModified
			state.data = state.fetchedData.all
		})
	},

	view({ state }) {
		return m('div', [
			m(LastUpdated, { lastUpdated: state.lastModified }),
			m(SearchBar, { update: value => state.query = value }),
			m(RecentlyAdded, { update: value => state.data = value, fetchedData: state.fetchedData }),
			m(SearchResults, { data: state.data, query: state.query }),
		])
	}
}

m.route(root, '/', {
	'/': App,
	'/about': About,
})
