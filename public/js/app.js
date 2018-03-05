// vim: foldmethod=marker:foldenable
const DATA_URI = '//vinylwhere.s3-ap-southeast-1.amazonaws.com/records.grouped.json.gz'

// ---- helpers ----
// {{{
function throttle(fn, minTime) {
	let currentTimer
	let callCount = 0

	return function () {
		if (callCount === 0) {
			fn.apply(null, arguments)
		}

		if (currentTimer) {
			clearTimeout(currentTimer)
		}

		callCount++

		currentTimer = window.setTimeout(_ => {
			if (callCount > 1) {
				fn.apply(null, arguments)
			}
			currentTimer = null
			callCount = 0
		}, minTime)
	}
}

function timeago(date) {
	const now = new Date()
	const seconds = (now - date) / 1000
	if (seconds < 60) return pluralise(seconds, 'second')

	const minutes = seconds / 60
	if (minutes < 60) return pluralise(minutes, 'minute')

	const hours = minutes / 60
	if (hours < 24) return pluralise(hours, 'hour')

	const days = hours / 24
	return pluralise(days, 'day')
}

function pluralise(count, word) {
	count = Math.floor(count)
	if (count === 1) return `${count} ${word}`
	return `${count} ${word}s`
}
// }}}

// ---- router ----
// {{{
const router = {
	currentRoute() {
		return window.location.hash.substring(1)
	},

	route(newRoute) {
		window.location.hash = newRoute
	},

	onRouteChange(fn) {
		window.addEventListener('hashchange', fn)
	}
}
// }}}

// ---- search ----
// {{{
const Search = searchElement => ({
	handleSearch: throttle(event => {
		vinylwhere.query = event.target.value
	}, 50),

	handleActivation(event) {
		if (String.fromCharCode(event.keyCode) === '/' &&
			event.target.tagName !== 'INPUT') {

			this.focus()
			event.preventDefault()
		}
	},

	addHandlers() {
		searchElement.addEventListener('keyup', this.handleSearch)
		document.body.addEventListener('keypress', this.handleActivation.bind(this))

		return this
	},

	enable() {
		searchElement.disabled = false
		return this
	},

	focus() {
		searchElement.focus()
		return this
	}
})
// }}}

// ---- lastUpdated ----
// {{{
const LastUpdated = lastUpdatedElement => {
	return {
		render(lastModifiedDate) {
			lastUpdatedElement.querySelector('time').innerText = timeago(lastModifiedDate)
			lastUpdatedElement.classList.remove('hidden')
		}
	}
}
// }}}

// ---- results ----
// {{{
const Results = (resultsElement, templateElement) => {
	const PAGE_SIZE = 100
	const template = templateElement.innerHTML
	Mustache.parse(template)

	const handleLoadMore = throttle(_ => {
		if (window.innerHeight + window.scrollY <
			document.body.scrollHeight - 500) {
			return
		}

		vinylwhere.pageNumber++
	}, 50)

	const render = (data, pageNumber, isAppend) => {
		const fragment = document.createDocumentFragment()
		const ul = document.createElement('ul')

		ul.innerHTML = Mustache.render(template, {
			results: data.slice(
				(pageNumber - 1) * PAGE_SIZE,
				pageNumber * PAGE_SIZE
			)
		})

		while (ul.hasChildNodes()) {
			fragment.appendChild(ul.firstChild)
		}

		if (!isAppend) {
			resultsElement.innerHTML = ''
		}

		resultsElement.appendChild(fragment)
	}

	return {
		addHandlers() {
			document.addEventListener('scroll', handleLoadMore)
		},

		render,
	}
}
// }}}

// ---- app ----
// {{{
const searchRecords = (records, query) => {
	const queryRegexp = new RegExp(query, 'i')
	return records.filter(r =>
		r.artist.match(queryRegexp) || r.album.match(queryRegexp))
}

const showInitialRecords = records => {
	const query = router.currentRoute()
	document.querySelector('#search').value = query
	vinylwhere.query = query
}

async function init() {
	const blankRecords = Array(100).fill('')
	vinylwhere.displayedRecords = blankRecords
	document.body.classList.add('loading')

	const response = await fetch(DATA_URI)
	vinylwhere.lastModified = new Date(response.headers.get('Last-Modified'))
	vinylwhere.allRecords = await response.json()
}
// }}}

const state = {
	allRecords: [],
	displayedRecords: [],
	lastModified: '',
	query: '',
	pageNumber: 1,
}

const handlers = {
	set(target, prop, value, receiver) {
		target[prop] = value

		if (prop === 'displayedRecords') {
			resultsComponent.render(value, target.pageNumber)
		}

		if (prop === 'allRecords') {
			document.body.classList.remove('loading')
			showInitialRecords(value)
			searchComponent.addHandlers().enable().focus()
			resultsComponent.addHandlers()
		}

		if (prop === 'lastModified') {
			lastUpdatedComponent.render(value)
		}

		if (prop === 'query') {
			router.route(value)
			vinylwhere.pageNumber = 1
			vinylwhere.displayedRecords = searchRecords(target.allRecords, value)
		}

		if (prop === 'pageNumber') {
			value > 1 && resultsComponent.render(target.displayedRecords, value, true)
		}
	}
}

window.vinylwhere = new Proxy(state, handlers)
