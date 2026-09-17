import { describe, expect, it } from 'vitest';
import { decodeEntities, extractPage, maxPageCharacters } from './html-text';

const page = `<!doctype html>
<html>
  <head>
    <title>Acme &amp; Co: Q3 report</title>
    <meta content="Revenue grew 18 percent." property="og:description">
    <style>body { color: red }</style>
    <script>window.track = true;</script>
  </head>
  <body>
    <nav><a href="/">Home</a> <a href="/pricing">Pricing</a></nav>
    <main>
      <h1>Quarter three</h1>
      <p>We shipped <strong>two</strong> products&nbsp;and hired 4 engineers.</p>
      <!-- hidden note -->
      <ul><li>Churn fell to 2%</li><li>NPS rose to 61</li></ul>
    </main>
    <footer>Copyright Acme</footer>
  </body>
</html>`;

describe('extractPage', () => {
  it('keeps the title, description, and readable body lines', () => {
    expect(extractPage(page)).toEqual({
      title: 'Acme & Co: Q3 report',
      text: [
        'Revenue grew 18 percent.',
        'Quarter three',
        'We shipped two products and hired 4 engineers.',
        'Churn fell to 2%',
        'NPS rose to 61',
      ].join('\n'),
    });
  });

  it('drops scripts, navigation, footers, and comments', () => {
    const { text } = extractPage(page);
    expect(text).not.toMatch(/track|Pricing|Copyright|hidden note|color: red/);
  });

  it('prefers the article over menus, language lists, and sidebars', () => {
    const html = `<body>
      <header><a href="/">Menu</a><ul><li>English</li><li>Deutsch</li></ul></header>
      <main>
        <header><h1>Public speaking</h1><button>49 languages</button></header>
        <article><p>The real <a href="/text">text</a> ( <em>see notes</em> ).</p></article>
      </main>
      <aside>Related pages</aside>
    </body>`;
    expect(extractPage(html).text).toBe('The real text (see notes).');
  });

  it('caps very long pages', () => {
    const long = `<body><p>${'word '.repeat(10_000)}</p></body>`;
    expect(extractPage(long).text.length).toBe(maxPageCharacters);
  });
});

describe('decodeEntities', () => {
  it('decodes named and numeric entities and leaves unknown ones', () => {
    expect(decodeEntities('&quot;hi&quot; &#39;there&#39; &#x41; &copy;')).toBe(`"hi" 'there' A &copy;`);
  });
});
