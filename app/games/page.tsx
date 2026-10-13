import type { Metadata } from 'next';
import SiteHeader from '../site-header';
import GameCard from './game-card';
import { games } from './games';

// No request-time data: this page is plain files in the static export.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Games — Alberto Ferreira de Melo',
  description:
    'Small games built at home by Alberto Ferreira de Melo Filho, starting with Kattmatte: a learning game for children that runs in the browser and in VR.',
};

export default function Games() {
  return (
    <div className="games-page">
      <a href="#games" className="skip-link">
        Skip to the games
      </a>
      <SiteHeader current="games" />
      <main>
        <section
          className="games section-shell"
          id="games"
          aria-labelledby="games-title"
        >
          <div className="section-label">
            <span>GAMES</span>
            <span>
              {games.length} {games.length === 1 ? 'GAME' : 'GAMES'}
            </span>
          </div>
          <div className="work-heading">
            <h1 id="games-title" className="page-title">
              Learning,
              <br />
              <em>disguised as play.</em>
            </h1>
            <p>
              Small games, built at home.
              <br />
              Each opens in a new tab.
            </p>
          </div>
          <div className="games-list">
            {games.map((game) => (
              <GameCard key={game.title} game={game} />
            ))}
          </div>
        </section>
      </main>
      <footer className="page-footer section-shell">
        <div className="footer-bottom">
          <span>© 2026 Alberto Ferreira de Melo Filho</span>
          <a href="/">Back to the light ↑</a>
        </div>
      </footer>
    </div>
  );
}
