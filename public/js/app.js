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

// Damn you, Safari ;_;
function get(url, method) {
	return new Promise((resolve, reject) => {
		const httpRequest = new XMLHttpRequest()
		httpRequest.onreadystatechange = _ => {
			if (httpRequest.readyState === XMLHttpRequest.DONE) {
				if (httpRequest.status === 200) {
					resolve(httpRequest.responseText)
				} else {
					reject(httpRequest)
				}
			}
		}
		httpRequest.open(method || 'GET', url)
		httpRequest.send()
	})
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
	}, 200),

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
const records = get('http://vinylwhere.s3-ap-southeast-1.amazonaws.com/records.grouped.json.gz')
	.then(JSON.parse)
const blankRecords = Promise.resolve(Array(100).fill(''))

function init() {
	document.body.classList.add('loading')
	blankRecords.then(resultsComponent.render)
	records.then(_ => document.body.classList.remove('loading'))

	records.then(records => {
		if (window.location.hash) {
			const query = router.currentRoute()
			document.querySelector('#search').value = query
			const queryRegexp = new RegExp(query, 'i')
			const filteredResult = records.filter(r =>
				r.artist.match(queryRegexp) || r.album.match(queryRegexp))

			resultsComponent.render(filteredResult)
		} else {
			resultsComponent.render(records)
		}
	})

	records.then(_ => {
		let lastQuery = ''

		router.onRouteChange(_ => {
			const query = router.currentRoute()
			if (query === lastQuery) return

			document.querySelector('#search').value =
				document.querySelector('#search').value || query

			lastQuery = query

			if (!query) return records.then(resultsComponent.render)

			const queryRegexp = new RegExp(query, 'i')

			records
				.then(records =>
					records.filter(r =>
						r.artist.match(queryRegexp) || r.album.match(queryRegexp)))
				.then(resultsComponent.render)
		})
	})

	records.then(_ => searchComponent.addHandlers().enable().focus())

	records.then(_=> resultsComponent.addHandlers())
}
// }}}
