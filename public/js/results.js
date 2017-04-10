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
