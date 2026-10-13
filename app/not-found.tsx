import type { Metadata } from 'next';
import SiteHeader from './site-header';

export const metadata: Metadata = {
  title: 'Not found — Alberto Ferreira de Melo',
};

// Also what older addresses from the previous site (/about, /notes) now reach.
export default function NotFound() {
  return (
    <div className="games-page">
      <SiteHeader current="other" />
      <main>
        <section className="games section-shell" aria-labelledby="missing">
          <div className="section-label">
            <span>404</span>
            <span>NOT FOUND</span>
          </div>
          <div className="work-heading">
            <h1 id="missing" className="page-title">
              Nothing here
              <br />
              <em>any more.</em>
            </h1>
            <p>
              This address isn’t part
              <br />
              of the site.
            </p>
          </div>
          <a className="text-link" href="/">
            Back to the start <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>
    </div>
  );
}
