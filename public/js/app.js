const root = document.querySelector('#app')

let query = ''
const SearchBar = {
	view() {
		return m('form', [
			m('input', {
				placeholder: 'artist or album name',
				oninput: m.withAttr('value', value => {
					query = value.toLowerCase()
				})
			}),
			m('button', { type: 'reset' }, 'reset'),
			m('p', `Current search query: ${query}`)
		])
	}
}

const RecentlyAdded = {
	view() {
		return m('div', [
			m('button', { onclick() { data = fetchedData.recent } }, 'Show recently added'),
			m('button', { onclick() { data = fetchedData.all } }, 'Show all'),
		])
	}
}

let data = []
let fetchedData = null
m.request({ method: 'GET', url: '/result.json' })
	.then(response => {
		fetchedData = response
		data = response.all
	})

const SearchResults = {
	view() {
		return m('ul', data
			.filter(({ artist }) => artist.toLowerCase().indexOf(query) !== -1)
			.slice(0, 100)
			.map(({ artist, album, sources }) => m('li', [
				m('p', `${artist} - ${album}`),
				m('ul', sources.map(source => m('li', m('a', { href: source, target: '_blank' }, source)))),
			]))
		)
	}
}

const LastUpdated = {
	view() {
		return m('span', [
			'Last updated at ',
			m('time', new Date().toDateString()),
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
