import { MarkWinged } from './mark';

// Shared by every page. On the home page the section links are in-page
// anchors; elsewhere they lead back to the home page's sections. Page-to-page
// links are plain anchors: the site ships as static files, where a full page
// load is the dependable way to move between pages.
export default function SiteHeader({
  current,
}: {
  current: 'home' | 'games' | 'other';
}) {
  const home = current === 'home';
  const section = (id: string) => (home ? `#${id}` : `/#${id}`);
  const brand = (
    <>
      <MarkWinged />
      <span>
        Alberto<span className="brand-sub">Ferreira de Melo Filho</span>
      </span>
    </>
  );
  const label = 'Alberto Ferreira de Melo Filho, home';
  return (
    <header className="site-header">
      <a className="brand" href={home ? '#home' : '/'} aria-label={label}>
        {brand}
      </a>
      <nav aria-label="Main navigation">
        <a href={section('about')}>About</a>
        <a href={section('explorations')}>Experiments</a>
        <a
          href="/games"
          aria-current={current === 'games' ? 'page' : undefined}
        >
          Games
        </a>
        <a className="nav-contact" href={section('footer')}>
          Say hello <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}
