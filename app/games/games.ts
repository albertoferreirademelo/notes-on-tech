export type GameImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};
export type Game = {
  title: string;
  tagline: string;
  description: string[];
  details: string;
  thumbnail: GameImage;
  screenshots: Array<GameImage & { caption: string }>;
  play: string;
  source?: string;
  tags: string[];
};

// Add a game by adding one entry here; the Games section renders the list.
export const games: Game[] = [
  {
    title: 'Kattmatte',
    tagline: 'Sums, letters, and a kitten.',
    description: [
      'A learning game I made for my own children: a cartoon kitten, balloons, and a wardrobe of hats to earn. It is two games in one. In Matte, you pop the balloon with the right answer to a sum (addition, subtraction, and multiplication tables), and the balloons speed up or slow down to suit the player. In Bokstäver, a voice says a Swedish letter and the child finds it. No time limit.',
      'Each child has a profile with their own kitten colour, stars, and progress. Right answers bring confetti and a dancing kitten, streaks bring rainbows, and a round ends in a fireworks party.',
    ],
    details:
      'Runs in the browser with nothing to install: phone, tablet, or computer, and in VR or passthrough on a Meta Quest 3. Built with three.js and WebXR. No accounts and no server; progress stays in the browser of the device. The game itself is in Swedish.',
    thumbnail: {
      src: '/assets/kattmatte-party.jpg',
      alt: 'Kattmatte’s end-of-round party: a purple cartoon kitten with a pink bow cheers on a cloud under a rainbow while confetti falls, beside a score card reading “Fantastiskt! 10 av 10 rätt!”',
      width: 1206,
      height: 678,
    },
    screenshots: [
      {
        src: '/assets/kattmatte-garderob.jpg',
        alt: 'The Kattmatte menu: the kitten stands beside a panel with its wardrobe of colours and hats, some still locked, above a grid of maths exercises to choose from',
        caption: 'The menu, with the kitten’s wardrobe',
        width: 1206,
        height: 678,
      },
      {
        src: '/assets/kattmatte-bokstaver-fraga.jpg',
        alt: 'The letters game: an orange kitten looks up at three balloons labelled Ll, Ss, and Aa, next to a button that plays the letter’s sound',
        caption: 'Bokstäver: find the letter you hear',
        width: 1206,
        height: 678,
      },
      {
        src: '/assets/kattmatte-bokstaver-lyssna.jpg',
        alt: 'The listening page: a grid of the Swedish alphabet from Aa to Öö under the instruction “Tryck på en bokstav för att höra den”',
        caption: 'Tap any letter to hear it',
        width: 1206,
        height: 678,
      },
    ],
    play: 'https://albertoferreirademelo.github.io/VR-cat-matte-och-bokst-ver/',
    source:
      'https://github.com/albertoferreirademelo/VR-cat-matte-och-bokst-ver',
    tags: ['Kids', 'Learning', 'Swedish', 'VR', 'WebXR', 'three.js'],
  },
];
