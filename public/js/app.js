// vim: foldmethod=marker:foldenable

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
		router.route(event.target.value)
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
		render() {
			lastModified.then(lastModifiedDate => {
				lastUpdatedElement.querySelector('time').innerText = timeago(lastModifiedDate)
				lastUpdatedElement.classList.remove('hidden')
			})
		}
	}
}
// }}}

// ---- results ----
// {{{
const Results = (resultsElement, templateElement) => {
	const handleLoadMore = throttle(_ => {
		if (window.innerHeight + window.scrollY <
			document.body.scrollHeight - 500) {
			return
		}

		render()
	}, 50)

	const render = (function () {
		let allData
		let offset

		const COUNT = 100
		const hasMore = _ => offset < allData.length
		const template = templateElement.innerHTML
		Mustache.parse(template)

		function render(isAppend) {
			const fragment = document.createDocumentFragment()
			const ul = document.createElement('ul')

			ul.innerHTML = Mustache.render(template, {
				results: allData.slice(offset, offset + COUNT)
			})

			while (ul.hasChildNodes()) {
				fragment.appendChild(ul.firstChild)
			}

			if (!isAppend) {
				resultsElement.innerHTML = ''
			}

			resultsElement.appendChild(fragment)
		}

		return data => {
			const isAppend = !data
			if (!isAppend) [offset, allData] = [0, data]

			if (isAppend && !hasMore()) return false

			render(isAppend)
			offset += COUNT

			return hasMore()
		}
	}())

	return {
		addHandlers() {
			document.addEventListener('scroll', handleLoadMore)
		},

		render
	}
}
// }}}

// ---- app ----
// {{{
const fetchedData = fetch('//vinylwhere.s3-ap-southeast-1.amazonaws.com/records.grouped.json.gz')
const records = fetchedData.then(response => response.json())
const lastModified = fetchedData.then(response => new Date(response.headers.get('Last-Modified')))
const blankRecords = Promise.resolve(Array(100).fill(''))

const searchRecords = (records, query) => {
	const queryRegexp = new RegExp(query, 'i')
	return records.filter(r =>
		r.artist.match(queryRegexp) || r.album.match(queryRegexp))
}

const handleRouteChange = function () {
	let lastQuery = ''

	return () => {
		const query = router.currentRoute()
		if (query === lastQuery) return

		document.querySelector('#search').value =
			document.querySelector('#search').value || query

		lastQuery = query

		if (!query) return records.then(r => vinylwhere.displayedRecords = r)

		records
			.then(records => searchRecords(records, query))
			.then(r => vinylwhere.displayedRecords = r)
	}
}()

const showInitialRecords = records => {
	if (window.location.hash) {
		const query = router.currentRoute()
		document.querySelector('#search').value = query
		vinylwhere.displayedRecords = searchRecords(records, query)
	} else {
		vinylwhere.displayedRecords = records
	}
}

function init() {
	router.onRouteChange(handleRouteChange)
	document.body.classList.add('loading')
	blankRecords.then(blankRecords => vinylwhere.displayedRecords = blankRecords)
	records.then(allRecords => vinylwhere.allRecords = allRecords)
	lastModified.then(lastModifiedDate => vinylwhere.lastModified = lastModifiedDate)
}
// }}}

const state = {
	allRecords: [],
	displayedRecords: [],
	lastModified: '',
}

const handlers = {
	set(target, prop, value, receiver) {
		target[prop] = value

		if (prop === 'displayedRecords') {
			resultsComponent.render(value)
		}

		if (prop === 'allRecords') {
			document.body.classList.remove('loading')
			showInitialRecords(value)
			searchComponent.addHandlers().enable().focus()
			resultsComponent.addHandlers()
		}

		if (prop === 'lastModified') {
			lastUpdatedComponent.render()
		}
	}
}

window.vinylwhere = new Proxy(state, handlers)
