export type Photo = {
  src: string;
  alt: string;
  /** Where it was taken, shown small under the quote. */
  caption: string;
  /** A short line for the photo, shown under it. */
  quote: string;
  width: number;
  height: number;
};

/**
 * The "Elsewhere" photo strip on the home page.
 * Images live in public/assets/photos. Keep width and height equal to the
 * file's real pixel size so each photo keeps its shape in the strip.
 */
export const photosConfig = {
  title: "Beyond the screen",
  description: "Mountains, monuments and city lights: the places that recharge me between builds.",
  photos: [
    {
      src: "/assets/photos/mountain-road.jpg",
      alt: "A motorbike parked on an empty mountain highway under a bright blue sky, snow peaks in the distance.",
      caption: "Riding north",
      quote: "The road was the destination.",
      width: 1050,
      height: 1400,
    },
    {
      src: "/assets/photos/golden-temple.jpg",
      alt: "The Golden Temple in Amritsar lit up at night, reflected in the pool around it.",
      caption: "Amritsar",
      quote: "Gold on water, peace within.",
      width: 787,
      height: 1400,
    },
    {
      src: "/assets/photos/snow-peaks.jpg",
      alt: "Snow-capped Himalayan peaks above a deep valley with a river running through it.",
      caption: "Snow and stone",
      quote: "Mountains don't rush. Neither should I.",
      width: 1050,
      height: 1400,
    },
    {
      src: "/assets/photos/campus-from-below.jpg",
      alt: "Looking straight up between red-brick campus buildings covered in ivy, blue sky above.",
      caption: "Looking up",
      quote: "Some days, just look up.",
      width: 886,
      height: 1400,
    },
    {
      src: "/assets/photos/city-dusk.jpg",
      alt: "A city flyover at dusk, car headlights on a wet road between glass office towers.",
      caption: "City at dusk",
      quote: "Cities glow brightest at dusk.",
      width: 810,
      height: 1400,
    },
    {
      src: "/assets/photos/charminar.jpg",
      alt: "Looking up at the carved minarets of the Charminar against a cloudy sky.",
      caption: "Charminar",
      quote: "Four centuries, still standing.",
      width: 787,
      height: 1400,
    },
    {
      src: "/assets/photos/hill-village.jpg",
      alt: "A small village of white houses on a steep mountainside, autumn trees below.",
      caption: "Hill village",
      quote: "Small homes, endless skies.",
      width: 790,
      height: 1400,
    },
    {
      src: "/assets/photos/campus-night.jpg",
      alt: "A giant yellow robot sculpture on a university campus at night, people walking under street lights.",
      caption: "Campus nights",
      quote: "Late nights built more than code.",
      width: 1400,
      height: 804,
    },
    {
      src: "/assets/photos/qutb-shahi-tombs.jpg",
      alt: "A domed Qutb Shahi tomb under a cloudy sky, green grass in front.",
      caption: "Qutb Shahi",
      quote: "History, quietly keeping time.",
      width: 790,
      height: 1400,
    },
    {
      src: "/assets/photos/palm-sunset.jpg",
      alt: "The sun setting behind a line of palm trees under a soft grey and orange sky.",
      caption: "Last light",
      quote: "Every day ends in colour.",
      width: 876,
      height: 1400,
    },
  ] satisfies Photo[],
};
