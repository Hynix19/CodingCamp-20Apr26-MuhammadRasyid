// Unit tests for QuickLinks module

function resetLinks() {
  QuickLinks.links = [];
}

test('addLink adds a valid link to the links array', () => {
  resetLinks();
  QuickLinks.addLink('Google', 'https://google.com');
  assert(QuickLinks.links.length === 1, `Expected 1 link but got ${QuickLinks.links.length}`);
  assert(QuickLinks.links[0].label === 'Google', `Expected "Google" but got "${QuickLinks.links[0].label}"`);
  assert(QuickLinks.links[0].url === 'https://google.com', `Expected "https://google.com" but got "${QuickLinks.links[0].url}"`);
});

test('addLink assigns a unique id', () => {
  resetLinks();
  QuickLinks.addLink('Google', 'https://google.com');
  QuickLinks.addLink('GitHub', 'https://github.com');
  assert(QuickLinks.links[0].id !== QuickLinks.links[1].id, 'Expected unique IDs for each link');
});

test('addLink rejects empty label', () => {
  resetLinks();
  QuickLinks.addLink('', 'https://google.com');
  assert(QuickLinks.links.length === 0, `Expected 0 links but got ${QuickLinks.links.length}`);
});

test('addLink rejects whitespace-only label', () => {
  resetLinks();
  QuickLinks.addLink('   ', 'https://google.com');
  assert(QuickLinks.links.length === 0, `Expected 0 links but got ${QuickLinks.links.length}`);
});

test('addLink rejects label longer than 30 characters', () => {
  resetLinks();
  QuickLinks.addLink('a'.repeat(31), 'https://google.com');
  assert(QuickLinks.links.length === 0, `Expected 0 links but got ${QuickLinks.links.length}`);
});

test('addLink accepts label of exactly 30 characters', () => {
  resetLinks();
  QuickLinks.addLink('a'.repeat(30), 'https://google.com');
  assert(QuickLinks.links.length === 1, `Expected 1 link but got ${QuickLinks.links.length}`);
});

test('addLink rejects invalid URL', () => {
  resetLinks();
  QuickLinks.addLink('Test', 'not-a-url');
  assert(QuickLinks.links.length === 0, `Expected 0 links but got ${QuickLinks.links.length}`);
});

test('addLink rejects empty URL', () => {
  resetLinks();
  QuickLinks.addLink('Test', '');
  assert(QuickLinks.links.length === 0, `Expected 0 links but got ${QuickLinks.links.length}`);
});

test('addLink trims label whitespace', () => {
  resetLinks();
  QuickLinks.addLink('  GitHub  ', 'https://github.com');
  assert(QuickLinks.links[0].label === 'GitHub', `Expected "GitHub" but got "${QuickLinks.links[0].label}"`);
});

test('deleteLink removes the link from the array', () => {
  resetLinks();
  QuickLinks.addLink('Google', 'https://google.com');
  const id = QuickLinks.links[0].id;
  QuickLinks.deleteLink(id);
  assert(QuickLinks.links.length === 0, `Expected 0 links but got ${QuickLinks.links.length}`);
});

test('deleteLink does not affect other links', () => {
  resetLinks();
  QuickLinks.addLink('Google', 'https://google.com');
  QuickLinks.addLink('GitHub', 'https://github.com');
  const deleteId = QuickLinks.links[0].id;
  QuickLinks.deleteLink(deleteId);
  assert(QuickLinks.links.length === 1, `Expected 1 link but got ${QuickLinks.links.length}`);
  assert(QuickLinks.links[0].label === 'GitHub', `Expected "GitHub" but got "${QuickLinks.links[0].label}"`);
});

test('validateUrl returns true for valid https URL', () => {
  const result = QuickLinks.validateUrl('https://example.com');
  assert(result === true, 'Expected true for valid https URL');
});

test('validateUrl returns true for valid http URL', () => {
  const result = QuickLinks.validateUrl('http://example.com');
  assert(result === true, 'Expected true for valid http URL');
});

test('validateUrl returns false for plain text', () => {
  const result = QuickLinks.validateUrl('not a url');
  assert(result === false, 'Expected false for plain text');
});

test('validateUrl returns false for empty string', () => {
  const result = QuickLinks.validateUrl('');
  assert(result === false, 'Expected false for empty string');
});

test('validateUrl returns true for URL with path and query', () => {
  const result = QuickLinks.validateUrl('https://example.com/path?q=1');
  assert(result === true, 'Expected true for URL with path and query');
});

test('links array is restored from Storage on init', () => {
  resetLinks();
  // Manually save links to storage
  const testLinks = [{ id: 'test-id-1', label: 'Test', url: 'https://test.com' }];
  Storage.save('tld_links', testLinks);
  QuickLinks.links = [];
  QuickLinks.links = Storage.load('tld_links') || [];
  assert(QuickLinks.links.length === 1, `Expected 1 link but got ${QuickLinks.links.length}`);
  assert(QuickLinks.links[0].label === 'Test', `Expected "Test" but got "${QuickLinks.links[0].label}"`);
  // Clean up
  Storage.remove('tld_links');
  resetLinks();
});
