'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Aurora from './aurora';
import { ease } from './aurora-scene';
import SiteHeader from './site-header';

const github = 'https://github.com/albertoferreirademelo';
const subscribeMotion = (notify: () => void) => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
const getMotionPreference = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const serverFalse = () => false;
const subscribeDiagnostics = () => () => {};
const getDiagnostics = () =>
  process.env.NODE_ENV === 'development' &&
  new URLSearchParams(window.location.search).has('qa');

function LightExperiment() {
  const [interrupted, setInterrupted] = useState(false);
  return (
    <div className={`light-experiment ${interrupted ? 'beam-broken' : ''}`}>
      <div className="experiment-top">
        <span>LIGHT → SIGNAL → SOUND</span>
        <span className="experiment-status" aria-live="polite">
          {interrupted ? 'Signal received' : 'Beam connected'}
        </span>
      </div>
      <div className="beam-scene" aria-hidden="true">
        <span className="emitter" />
        <span className="laser-beam" />
        <span className="beam-object" />
        <span className="receiver" />
        <div className="signal-bars">
          {[11, 28, 44, 22, 52, 35, 16, 40, 25].map((n, i) => (
            <i key={i} style={{ height: n }} />
          ))}
        </div>
      </div>
      <button
        className="beam-button"
        type="button"
        aria-pressed={interrupted}
        onClick={() => setInterrupted(!interrupted)}
      >
        {interrupted ? 'Reconnect the beam' : 'Break the beam'}{' '}
        <span aria-hidden="true">{interrupted ? '↺' : '↗'}</span>
      </button>
      <p className="experiment-caption">
        A small, silent illustration of the original experiment.
      </p>
    </div>
  );
}

export default function Home() {
  const [paused, setPaused] = useState(false);
  const systemReduced = useSyncExternalStore(
    subscribeMotion,
    getMotionPreference,
    serverFalse,
  );
  const [testReduced, setTestReduced] = useState(false);
  const reduced = systemReduced || testReduced;
  const diagnostics = useSyncExternalStore(
    subscribeDiagnostics,
    getDiagnostics,
    serverFalse,
  );
  const progress = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reduced);
  }, [reduced]);
  useEffect(() => {
    const scroll = () => {
      const viewport = window.innerHeight;
      if (progress.current)
        progress.current.style.transform = `scaleX(${window.scrollY / Math.max(1, document.documentElement.scrollHeight - viewport)})`;
      if (!hero.current || !stage.current) return;
      // Progress through the pinned opening: the two halves of the name part
      // and fade as the curtain turns, then the statement takes their place.
      const pinned =
        window.scrollY / Math.max(1, hero.current.offsetHeight - viewport);
      const statement = ease((pinned - 0.74) / 0.22);
      const style = stage.current.style;
      style.setProperty('--name-fade', String(1 - ease(pinned / 0.3)));
      style.setProperty('--name-drift', `${ease(pinned / 0.4) * 80}px`);
      style.setProperty('--invite-fade', String(1 - ease(pinned / 0.1)));
      style.setProperty('--statement-fade', String(statement));
      style.setProperty('--statement-rise', `${(1 - statement) * 26}px`);
    };
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll);
    scroll();
    return () => {
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', scroll);
    };
  }, []);
  return (
    <>
      <a href="#about" className="skip-link">
        Skip to introduction
      </a>
      <Aurora
        paused={paused || reduced}
        reduced={reduced}
        diagnostics={diagnostics}
      />
      <div className="reading-progress" ref={progress} />
      <SiteHeader current="home" />
      <main>
        <section
          className="hero-scroll"
          id="home"
          aria-labelledby="hero-title"
          ref={hero}
        >
          <div className="hero-stage" ref={stage}>
            <h1 id="hero-title" className="hero-name">
              <span>Alberto</span> <span>Ferreira de Melo</span>
            </h1>
            <p className="hero-statement">
              It starts with <em>a question.</em>
            </p>
            <span className="scroll-invite" aria-hidden="true">
              Scroll
              <span className="scroll-line" />
            </span>
          </div>
        </section>

        <section className="intro section-shell" id="about" aria-label="About">
          <p className="lede">
            I like finding out how things work. The surest way I know is to
            build, test, learn, <em>and build again.</em>
          </p>
          <p className="intro-body">
            I’m Alberto. My path runs through bioinformatics, economics, and
            machine learning; these days it brings together data, design, and
            public service. The subjects keep changing. The habit stays.
          </p>
        </section>

        <section
          className="explorations section-shell"
          id="explorations"
          aria-labelledby="explorations-title"
        >
          <div className="section-label">
            <span>FROM THE WORKBENCH</span>
            <a href={github} target="_blank" rel="noopener noreferrer">
              The full archive <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="work-heading">
            <h2 id="explorations-title">
              A question.
              <br />
              Then, <em>an experiment.</em>
            </h2>
            <p>
              Two early experiments.
              <br />
              Each began as a what-if.
            </p>
          </div>
          <div className="projects-grid">
            <article className="project project-light">
              <LightExperiment />
              <div className="project-meta">
                <span>01 / PHYSICAL COMPUTING</span>
                <span>ARDUINO + PYTHON</span>
              </div>
              <h3>
                What if light
                <br />
                <em>could start a song?</em>
              </h3>
              <p>
                A laser, a light sensor, and a connection between Arduino and
                Python. Walk through the beam, and the computer starts playing
                music. A university experiment that brought code into the room.
              </p>
              <details className="circuit-details">
                <summary>
                  Inside the circuit <span aria-hidden="true">+</span>
                </summary>
                <figure>
                  <img
                    src="/assets/arduino.png"
                    alt="Original breadboard layout showing the Arduino Uno, light sensor, LEDs, resistors, and connecting wires"
                    width="1094"
                    height="725"
                    loading="lazy"
                  />
                  <figcaption>
                    The original project’s breadboard layout.
                  </figcaption>
                </figure>
              </details>
              <a
                className="text-link"
                href={`${github}/12-Playing-arduino-with-Python`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore the experiment <span aria-hidden="true">↗</span>
              </a>
            </article>
            <article className="project project-data">
              <div className="research-sheet">
                <div className="sheet-top">
                  <span>RESEARCH NOTE / 02</span>
                  <span>OMXS30</span>
                </div>
                <p className="sheet-question">
                  Learning the pattern.
                  <br />
                  <em>Questioning the prediction.</em>
                </p>
                <figure>
                  <img
                    src="/assets/market-study.png"
                    alt="Archived OMX Stockholm 30 adjusted closing-price chart from the thesis repository"
                    width="1000"
                    height="400"
                    loading="lazy"
                  />
                  <figcaption>
                    Source material from the thesis archive
                  </figcaption>
                </figure>
                <div className="sheet-bottom">
                  <span>LSTM / TIME SERIES</span>
                  <span>↗</span>
                </div>
              </div>
              <div className="project-meta">
                <span>02 / MACHINE LEARNING</span>
                <span>BACHELOR’S THESIS</span>
              </div>
              <h3>
                Can a model
                <br />
                <em>read the market?</em>
              </h3>
              <p>
                A study of the Swedish stock market using neural networks. The
                useful lesson lives beyond the prediction: preparing the data,
                testing assumptions, and recognising when a model may be
                overfitting.
              </p>
              <a
                className="text-link"
                href={`${github}/19-DNN-LSTM-SwedishStockMarket`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the study & its limitations{' '}
                <span aria-hidden="true">↗</span>
              </a>
            </article>
          </div>
          <div className="offscreen">
            <span className="eyebrow">ALSO, OFF SCREEN</span>
            <p>
              A camera. A 3D print.
              <br />
              <em>One more coffee.</em>
            </p>
            <span className="offscreen-symbol" aria-hidden="true">
              ✳
            </span>
          </div>
        </section>

        <footer id="footer" className="site-footer section-shell">
          <div className="footer-call">
            <p className="eyebrow">
              THE NEXT THREAD STARTS WITH A CONVERSATION
            </p>
            <h2>
              Something on
              <br />
              <em>your mind?</em>
            </h2>
            <div className="footer-links">
              <a
                className="text-link"
                href="https://www.linkedin.com/in/albertomelo/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Say hello on LinkedIn <span aria-hidden="true">↗</span>
              </a>
              <a
                className="footer-github"
                href={github}
                target="_blank"
                rel="noopener noreferrer"
              >
                Find me on GitHub ↗
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Alberto Ferreira de Melo Filho</span>
            <a href="#home">Back to the light ↑</a>
          </div>
        </footer>
      </main>
      <button
        className="motion-control"
        type="button"
        onClick={() => setPaused(!paused)}
        aria-label={
          reduced
            ? 'Motion reduced by your system preference'
            : paused
              ? 'Play aurora animation'
              : 'Pause aurora animation'
        }
        aria-pressed={paused || reduced}
        disabled={reduced}
      >
        <span aria-hidden="true">{paused || reduced ? '▷' : 'Ⅱ'}</span>
        <span>
          {reduced
            ? 'Reduced motion'
            : paused
              ? 'Motion paused'
              : 'Aurora in motion'}
        </span>
      </button>
      {process.env.NODE_ENV === 'development' && diagnostics && (
        <button
          className="qa-motion"
          type="button"
          onClick={() => {
            setTestReduced(!testReduced);
          }}
        >
          Toggle reduced motion check
        </button>
      )}
    </>
  );
}
