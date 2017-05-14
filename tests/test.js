import { ClientFunction, Selector } from 'testcafe';

const getWindowLocation = ClientFunction(() => window.location)

fixture `VinylWhere Functional Tests`
    .page `http://localhost:8080`;

test('First load contains results', async t => {
	await t.expect(Selector("#results").innerText).contains('2046 OST Vinyl Record')
})

test('Search refines the results', async t => {
	await t
		.typeText('#search', 'U 2')
		.expect(Selector('#results').innerText).contains('The Joshua Tree')
})

test('/ focuses the search bar', async t => {
	await t
		.click('h1')
		.expect(Selector('#search').focused).notOk()

	await t
		.pressKey('/')
		.expect(Selector('#search').focused).ok()
})

test('Clicking the logo clears the search bar', async t => {
	await t
		.typeText('#search', 'some search term')
		.click('h1')

	const location = await getWindowLocation()
	await t.expect(location.hash).eql('')
})
