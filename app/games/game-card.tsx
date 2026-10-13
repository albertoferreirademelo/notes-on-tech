import type { Game, GameImage } from './games';

// Plain images: they ship exactly as stored, with their size reserved.
const Shot = ({ src, alt, width, height }: GameImage) => (
  <img src={src} alt={alt} width={width} height={height} loading="lazy" />
);

// The whole card opens the game: the Play link is stretched over it, and the
// Source link and screenshots sit above that layer. Games open in a new tab
// rather than an iframe because they may enter VR.
export default function GameCard({ game }: { game: Game }) {
  return (
    <article className="game">
      <div className="game-thumb">
        <Shot {...game.thumbnail} />
      </div>
      <div className="game-body">
        <ul className="game-tags" aria-label="Tags">
          {game.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <h2>
          {game.title}
          <br />
          <em>{game.tagline}</em>
        </h2>
        {game.description.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p className="game-details">{game.details}</p>
        <div className="game-actions">
          <a
            className="game-play"
            href={game.play}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Play ${game.title} (opens in a new tab)`}
          >
            Play <span aria-hidden="true">↗</span>
          </a>
          {game.source && (
            <a
              className="game-source"
              href={game.source}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Source code for ${game.title} (opens in a new tab)`}
            >
              Source ↗
            </a>
          )}
        </div>
      </div>
      {game.screenshots.length > 0 && (
        <details className="circuit-details game-shots">
          <summary>
            More screenshots <span aria-hidden="true">+</span>
          </summary>
          <div className="game-shots-grid">
            {game.screenshots.map(({ caption, ...image }) => (
              <figure key={image.src}>
                <Shot {...image} />
                <figcaption>{caption}</figcaption>
              </figure>
            ))}
          </div>
        </details>
      )}
    </article>
  );
}
