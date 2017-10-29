const root = document.querySelector('#app')

let count = 0
const App = {
	view() {
		return m('main', [
			m('h1', { class: 'title' }, 'my first app'),
			m('button', { onclick() { count++ } }, `${count} clicks`),
		])
	}
}

const Splash = {
	view() {
		return m('a', { href: '#!/hello' }, 'open sesame!')
	}
}

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

m.route(root, '/', {
	'/splash': Splash,
	'/hello': App,
	'/search': SearchBar,
	'/': {
		render() {
			return m('div', [
				m(SearchBar),
				m(SearchResults),
			])
		}
	},
	'/updated': LastUpdated,
})
