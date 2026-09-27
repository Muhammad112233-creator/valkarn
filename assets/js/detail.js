/* Fills the volume / article detail templates from the query string.
   Keeps the site static while still giving every card a destination. */
(function () {
  var VOLS = {
    "the-gate-that-remembers": {
      t: "The Gate That Remembers",
      s: "Valkarn",
      n: 42,
    },
    "vengeance-of-the-frost-goddess": {
      t: "Vengeance of the Frost Goddess",
      s: "Valkarn",
      n: 41,
    },
    "the-shepherd-of-storms": {
      t: "The Shepherd of Storms",
      s: "Valkarn",
      n: 40,
    },
    "where-the-old-roads-end": {
      t: "Where the Old Roads End",
      s: "Valkarn",
      n: 39,
    },
    "the-woman-of-green-fire": {
      t: "The Woman of Green Fire",
      s: "Valkarn",
      n: 38,
    },
    "chains-of-the-sea-king": {
      t: "Chains of the Sea King",
      s: "Valkarn",
      n: 37,
    },
    "the-sky-burial": { t: "The Sky Burial", s: "Valkarn", n: 36 },
    "a-wolf-in-the-rafters": {
      t: "A Wolf in the Rafters",
      s: "Valkarn",
      n: 35,
    },
    "the-oath-of-thin-ice": { t: "The Oath of Thin Ice", s: "Valkarn", n: 34 },
    "the-cold-forge": { t: "The Cold Forge", s: "Valkarn", n: 33 },
    "ravens-over-stormhold": {
      t: "Ravens Over Stormhold",
      s: "Valkarn",
      n: 32,
    },
    "the-tin-crown": { t: "The Tin Crown", s: "Valkarn", n: 31 },
    "blood-on-the-mead-bench": {
      t: "Blood on the Mead Bench",
      s: "Valkarn",
      n: 30,
    },
    "the-herons-vow": { t: "The Heron's Vow", s: "Valkarn", n: 29 },
    "shards-of-the-morning-star": {
      t: "Shards of the Morning Star",
      s: "Valkarn",
      n: 28,
    },
    "the-silent-fleet": { t: "The Silent Fleet", s: "Valkarn", n: 27 },
    "beneath-the-ninth-gate": {
      t: "Beneath the Ninth Gate",
      s: "Valkarn",
      n: 26,
    },
    "the-last-ferryman": { t: "The Last Ferryman", s: "Valkarn", n: 25 },
    "a-kingdom-made-of-smoke": {
      t: "A Kingdom Made of Smoke",
      s: "Valkarn",
      n: 24,
    },
    "the-red-solstice": { t: "The Red Solstice", s: "Valkarn", n: 23 },
    "thieves-of-the-sun": { t: "Thieves of the Sun", s: "Valkarn", n: 22 },
    "the-long-dark-crossing": {
      t: "The Long Dark Crossing",
      s: "Valkarn",
      n: 21,
    },
    "the-mask-of-haldis": { t: "The Mask of Haldis", s: "Valkarn", n: 20 },
    "daughters-of-the-storm": {
      t: "Daughters of the Storm",
      s: "Valkarn",
      n: 19,
    },
    "the-house-of-broken-oars": {
      t: "The House of Broken Oars",
      s: "Valkarn",
      n: 18,
    },
    "the-weeping-stones": { t: "The Weeping Stones", s: "Valkarn", n: 17 },
    "winters-arrow": { t: "Winter's Arrow", s: "Valkarn", n: 16 },
    "the-serpent-under-grey-water": {
      t: "The Serpent Under Grey Water",
      s: "Valkarn",
      n: 15,
    },
    "bones-of-the-north-wind": {
      t: "Bones of the North Wind",
      s: "Valkarn",
      n: 14,
    },
    "the-pale-rider-of-haldstad": {
      t: "The Pale Rider of Haldstad",
      s: "Valkarn",
      n: 13,
    },
    "a-lantern-for-the-drowned": {
      t: "A Lantern for the Drowned",
      s: "Valkarn",
      n: 12,
    },
    "the-sleeping-giants-mouth": {
      t: "The Sleeping Giant's Mouth",
      s: "Valkarn",
      n: 11,
    },
    "nine-nails-of-iron": { t: "Nine Nails of Iron", s: "Valkarn", n: 10 },
    "the-glass-tide": { t: "The Glass Tide", s: "Valkarn", n: 9 },
    "songs-for-a-dead-jarl": { t: "Songs for a Dead Jarl", s: "Valkarn", n: 8 },
    "the-amber-hour": { t: "The Amber Hour", s: "Valkarn", n: 7 },
    "where-the-wolves-wait": { t: "Where the Wolves Wait", s: "Valkarn", n: 6 },
    "the-hollow-fjord": { t: "The Hollow Fjord", s: "Valkarn", n: 5 },
    "crown-of-ash": { t: "Crown of Ash", s: "Valkarn", n: 4 },
    "the-salt-road": { t: "The Salt Road", s: "Valkarn", n: 3 },
    "the-drowned-constellation": {
      t: "The Drowned Constellation",
      s: "Valkarn",
      n: 2,
    },
    "a-debt-owed-to-winter": { t: "A Debt Owed to Winter", s: "Valkarn", n: 1 },
    "a-crown-of-drowned-light": {
      t: "A Crown of Drowned Light",
      s: "Valkarn Saga",
      n: 6,
    },
    "the-salt-queen": { t: "The Salt Queen", s: "Valkarn Saga", n: 5 },
    "the-ember-pact": { t: "The Ember Pact", s: "Valkarn Saga", n: 4 },
    shadowborn: { t: "Shadowborn", s: "Valkarn Saga", n: 3 },
    "the-hunger-winter": { t: "The Hunger Winter", s: "Valkarn Saga", n: 2 },
    "farewell-to-the-shieldmaiden": {
      t: "Farewell to the Shieldmaiden",
      s: "Valkarn Saga",
      n: 1,
    },
    "grimnirs-toll": { t: "Grimnir's Toll", s: "Young Valkarn", n: 11 },
    sundrift: { t: "Sundrift", s: "Young Valkarn", n: 10 },
    "tears-of-the-grey-queen": {
      t: "Tears of the Grey Queen",
      s: "Young Valkarn",
      n: 9,
    },
    "brothers-of-the-bastard-shore": {
      t: "Brothers of the Bastard Shore",
      s: "Young Valkarn",
      n: 8,
    },
    "the-wolf-tooth": { t: "The Wolf Tooth", s: "Young Valkarn", n: 7 },
    "the-ice-longship": { t: "The Ice Longship", s: "Young Valkarn", n: 6 },
    silt: { t: "Silt", s: "Young Valkarn", n: 5 },
    "the-bear-shirt-season": {
      t: "The Bear-Shirt Season",
      s: "Young Valkarn",
      n: 4,
    },
    runecast: { t: "Runecast", s: "Young Valkarn", n: 3 },
    "the-eye-of-the-storm-father": {
      t: "The Eye of the Storm-Father",
      s: "Young Valkarn",
      n: 2,
    },
    "the-three-sisters-of-mirrowfen": {
      t: "The Three Sisters of Mirrowfen",
      s: "Young Valkarn",
      n: 1,
    },
    nidrhavn: { t: "Nidrhavn", s: "Vela", n: 7 },
    "the-queen-of-hollow-elves": {
      t: "The Queen of Hollow Elves",
      s: "Vela",
      n: 6,
    },
    "the-skald": { t: "The Skald", s: "Vela", n: 5 },
    corvid: { t: "Corvid", s: "Vela", n: 4 },
    "the-kingdom-of-quiet-ruin": {
      t: "The Kingdom of Quiet Ruin",
      s: "Vela",
      n: 3,
    },
    "the-severed-hand-of-the-oath-god": {
      t: "The Severed Hand of the Oath-God",
      s: "Vela",
      n: 2,
    },
    rasska: { t: "Rasska", s: "Vela", n: 1 },
    "blades-for-the-winter-king": {
      t: "Blades for the Winter King",
      s: "Sigrun of Stormhold",
      n: 8,
    },
    "the-master-of-judgments": {
      t: "The Master of Judgments",
      s: "Sigrun of Stormhold",
      n: 7,
    },
    "the-mountain-of-hours": {
      t: "The Mountain of Hours",
      s: "Sigrun of Stormhold",
      n: 6,
    },
    "the-isle-of-unnamed-children": {
      t: "The Isle of Unnamed Children",
      s: "Sigrun of Stormhold",
      n: 5,
    },
    "red-as-raudkelda": {
      t: "Red as Raudkelda",
      s: "Sigrun of Stormhold",
      n: 4,
    },
    "the-hanging-court": {
      t: "The Hanging Court",
      s: "Sigrun of Stormhold",
      n: 3,
    },
    "iron-widow": { t: "Iron Widow", s: "Sigrun of Stormhold", n: 2 },
    "the-wolfs-bargain": {
      t: "The Wolf's Bargain",
      s: "Sigrun of Stormhold",
      n: 1,
    },
  };
  var ARTS = {
    "new-writer": {
      t: "Iona Brecht signs for five more volumes",
      d: "12 September 2026",
      c: "Makers",
      l: "The main series has its writer locked in until at least volume forty-seven.",
      i: "news-01.jpg",
      b: [
        "Volume forty-three is drawn, lettered and at the printer. Volume forty-four is written. Beyond that, we can now say that Iona Brecht has signed for five further volumes of the main series \u2014 which takes Valkarn comfortably past its fiftieth book.",
        "Brecht came to the saga through Young Valkarn in 2017 and has been writing the household ever since. Tom\u00e1s Ferreira continues on art, with Lise Marchand on colour.",
        "The next volume, The Gate That Remembers, is scheduled for 14 November 2026.",
      ],
    },
    "site-award": {
      t: "Valkarn.com wins Site of the Day",
      d: "2 June 2026",
      c: "Site",
      l: "Our new gate-driven navigation picked up an international award in May.",
      i: "news-02.jpg",
      b: [
        "The site you are reading was chosen as Site of the Day by an international jury of developers on 19 May 2026, with particularly high marks for design and creativity.",
        "The nine-gate structure was the idea of the original art team: you do not arrive at a homepage, you arrive at a threshold, and you choose which one to walk through.",
        "Thank you to everyone who voted, and to the fellowship for putting up with three months of broken staging links.",
      ],
    },
    "saga-six": {
      t: "A Crown of Drowned Light closes the Saga arc",
      d: "6 February 2026",
      c: "Chronicles",
      l: "The sixth Valkarn Saga volume is in shops, and it is the strangest of the set.",
      i: "news-03.jpg",
      b: [
        "Noor Amrani writes, Christoph Bauer draws, Lise Marchand colours. The book returns to the isolated island of the early volumes and does something quietly cruel with it.",
        "A black-and-white edition follows on 20 February, limited to two thousand numbered copies.",
        "Signing dates are posted in the forum as they are confirmed.",
      ],
    },
    "stone-circle": {
      t: "The Stone Circle contest returns in December",
      d: "1 December 2025",
      c: "Fellowship",
      l: "Every four days through December, a new stone is raised and a new prize goes out.",
      i: "news-04.jpg",
      b: [
        "The annual contest is back, run jointly by this site and Northwind Editions.",
        "Each stone stays open for four days. Every entry improves your odds in the end-of-month draw, so there is no reason to stop at one.",
        "The first stone is up now. The rest will be revealed as we go.",
      ],
    },
    "ferreira-signing": {
      t: "Tom\u00e1s Ferreira on tour in the north",
      d: "21 November 2025",
      c: "Makers",
      l: "Nine dates, six cities, and a very large stack of title pages.",
      i: "news-05.jpg",
      b: [
        "Ferreira spent two days at the Northwind offices signing copies for long-standing members of the site before the tour proper begins.",
        "Full dates and venues are pinned in the forum. Bring your volume one if you have it; he has started drawing ravens in them.",
      ],
    },
    "volume-42": {
      t: "Volume forty-two is out in three editions",
      d: "7 November 2025",
      c: "Chronicles",
      l: "Standard, oversized and a collector's printing of two thousand.",
      i: "news-06.jpg",
      b: [
        "The Gate That Remembers is available now in the standard edition, in a large-format special with a thirty-two page sketch section, and in a slipcased collector's edition.",
        "The first eight pages are readable on the volume's page, as always.",
      ],
    },
  };
  var q = new URLSearchParams(location.search);
  function setText(sel, value) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.textContent = value;
    });
  }
  var v = VOLS[q.get("v")];
  if (v) {
    var h1 = document.querySelector(".hero__title .tr");
    if (h1) h1.textContent = v.t;
    setText("[data-vol-meta]", v.s + " — Volume " + v.n);
    setText("[data-vol-serie]", v.s);
    setText("[data-vol-num]", v.n);
    var cov = document.querySelector("[data-vol-cover]");
    if (cov) {
      cov.src = "assets/img/covers/" + q.get("v") + ".jpg";
      cov.alt = "Cover of " + v.t;
    }
    document.title = v.t + " | Valkarn";
  }
  var a = ARTS[q.get("a")];
  if (a) {
    var t = document.querySelector(".hero__title .tr");
    if (t) t.textContent = a.t;
    var meta = document.querySelector(".hero__intro .lede");
    if (meta) meta.textContent = a.d + " \u00b7 " + a.c;
    var badge = document.querySelector(".hero__badge .badge");
    if (badge) badge.textContent = a.c;
    var lede = document.querySelector(".sect .lede");
    if (lede) lede.textContent = a.l;
    var body = document.querySelector(".wysiwyg.drop-cap");
    if (body)
      body.innerHTML = a.b
        .map(function (p) {
          return "<p>" + p + "</p>";
        })
        .join("");
    var img = document.querySelector(".hero__bg img");
    if (img) img.src = "assets/img/" + a.i;
    document.title = a.t + " | Valkarn";
  }
})();
