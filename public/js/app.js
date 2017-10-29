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

let data = []
m.request({ method: 'GET', url: '/result.json' })
	.then(response => {
		data = response.all
	})

const SearchResults = {
	view() {
		return m('ul', data
			.filter(({ artist }) => artist.toLowerCase().indexOf(query) !== -1)
			// .slice(0, 100)
			.map(({ artist, album }) => m('li', `${artist} - ${album}`)))
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
				m(SearchBar),
				m(SearchResults),
			])
		}
	},
	'/updated': LastUpdated,
	'/about': About,
})
