import { ClientFunction, Selector } from 'testcafe';

const URL = process.env.NODE_ENV === 'ci' ?
	'https://vinylwhere.netlify.com' :
	'http://localhost:8080'

const getWindowLocation = ClientFunction(() => window.location)

fixture `VinylWhere Functional Tests`
    .page `${URL}`;

test('Loading the app shows results', async t => {
	await t.expect(Selector("#results").innerText).contains('2046 OST Vinyl Record')
})

test('Search refines the results', async t => {
	await t
		.typeText('#search', 'U2')
		.expect(Selector('#results').innerText).contains('The Joshua Tree')
})

test('Search updates the URL', async t => {
	const searchTerm = 'CoolArtist'

	await t.typeText('#search', searchTerm)
	await t.wait(500) // search is throttled

	const location = await getWindowLocation()
	await t.expect(location.hash).eql(`#${searchTerm}`)
})

test('Pressing / focuses the search bar', async t => {
	await t
		.click('h1')
		.expect(Selector('#search').focused).notOk()

	await t
		.pressKey('/')
		.expect(Selector('#search').focused).ok()
})

test('Clicking the logo removes the search', async t => {
	await t
		.typeText('#search', 'some search term')
		.wait(500) // search is throttled
		.click('h1')

	const location = await getWindowLocation()
	await t
		.expect(location.hash).eql('')
})

test('Visiting a URL with a search term shows correct results', async t => {
	await t
		.navigateTo('#U2')
		.expect(Selector('#results').innerText).contains('The Joshua Tree')
		.expect(Selector('#search').value).eql('U2')
})
