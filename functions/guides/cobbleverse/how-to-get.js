export async function onRequest({ request, next }) {
  // Only process HTML requests
  const accept = request.headers.get("accept") || "";
  if (!accept.includes("text/html")) {
    return next();
  }

  // Get the response
  const response = await next();

  // Only process HTML responses
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // Parse the URL to get query parameters
  const url = new URL(request.url);
  const pokemonKey = url.searchParams.get("p");

  // If no Pokemon parameter, return response as-is
  if (!pokemonKey) {
    return response;
  }

  // Pokemon metadata mapping
  const pokemonMetadata = {
    mew_duo: {
      title: "How to Get Mew & Mewtwo | CobbleToolkit",
      description:
        "Complete guide on how to obtain Mew and Mewtwo in Cobblemon. Learn how to craft the Origin Fossil and obtain Mewtwo through the Rocket Tower.",
      image: "/guides/origin-fossil.jpg",
    },
    weather_trio: {
      title:
        "How to Get Weather Trio (Groudon, Kyogre, Rayquaza) | CobbleToolkit",
      description:
        "Guide on how to catch Groudon, Kyogre, and Rayquaza in Cobblemon. Learn about their spawn locations, requirements, and methods.",
      image: "/guides/map-crafting.jpg",
    },
    ash_pokemons: {
      title: "How to Get Ash's Pokemon (Greninja, Pikachu) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Ash's Greninja and Pikachu in Cobblemon. Find Ash's house and complete the quest.",
      image: "/guides/ash.png",
    },
    lugia: {
      title: "How to Get Lugia | CobbleToolkit",
      description:
        "Complete guide on how to obtain Lugia in Cobblemon. Learn about the Whirl Islands, Silver Wing, and summoning requirements.",
      image: "/guides/whirl-island.png",
    },
    hooh: {
      title: "How to Get Ho-oh | CobbleToolkit",
      description:
        "Complete guide on how to obtain Ho-oh in Cobblemon. Learn about the Bell Tower, Rainbow Wing, and summoning requirements.",
      image: "/guides/bell-tower.png",
    },
    celebi: {
      title: "How to Get Celebi | CobbleToolkit",
      description:
        "Complete guide on how to obtain Celebi in Cobblemon. Learn about the Celebi Shrine and summoning requirements.",
      image: "/guides/celebi-shrine.png",
    },
    deoxys: {
      title: "How to Get Deoxys | CobbleToolkit",
      description:
        "Complete guide on how to obtain Deoxys in Cobblemon. Learn about Meteorite Island and form changing.",
      image: "/guides/deoxys-island.png",
    },
    calyrex: {
      title: "How to Get Calyrex | CobbleToolkit",
      description:
        "Complete guide on how to obtain Calyrex in Cobblemon. Learn about Glastrier and Spectrier fusion methods.",
      image: "/guides/glastrier.png",
    },
    cosplay_pikachu: {
      title: "How to Get Cosplay Pikachu | CobbleToolkit",
      description:
        "Complete guide on how to obtain Cosplay Pikachu forms in Cobblemon. Learn about the different cosplay styles.",
      image: "/guides/cosplay-popstar.png",
    },
    tao_trio: {
      title: "How to Get Tao Trio (Reshiram, Zekrom, Kyurem) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Reshiram, Zekrom, and Kyurem in Cobblemon. Learn about fusion and separation methods.",
      image: "/guides/tao-1.png",
    },
    legendary_birds_trio: {
      title:
        "How to Get Legendary Birds (Articuno, Zapdos, Moltres) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Articuno, Zapdos, and Moltres in Cobblemon. Includes Galarian forms.",
      image: "/guides/galar-zapdos.png",
    },
    creation_trio: {
      title:
        "How to Get Creation Trio (Dialga, Palkia, Giratina) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Dialga, Palkia, and Giratina in Cobblemon. Learn about Spear Pillar and Distortion World.",
      image: "/guides/dialga.png",
    },
    river_guardians: {
      title:
        "How to Get River Guardians (Azelf, Uxie, Mesprit) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Azelf, Uxie, and Mesprit in Cobblemon. Learn about the lake locations.",
      image: "/guides/river-guardians.png",
    },
    aura_trio: {
      title: "How to Get Aura Trio (Xerneas, Yveltal, Zygarde) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Xerneas, Yveltal, and Zygarde in Cobblemon. Learn about Zygarde cells and forms.",
      image: "/guides/zygarde.png",
    },
    kubfu: {
      title: "How to Get Kubfu & Urshifu | CobbleToolkit",
      description:
        "Complete guide on how to obtain Kubfu and evolve it into Urshifu in Cobblemon. Learn about the Tower of Darkness and Waters.",
      image: "/guides/kubfu.png",
    },
    combat_trio: {
      title:
        "How to Get Combat Trio (Cobalion, Terrakion, Virizion) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Cobalion, Terrakion, and Virizion in Cobblemon.",
      image: "/guides/cobalion.png",
    },
    legendary_titans: {
      title:
        "How to Get Legendary Titans (Regirock, Regice, Registeel, Regigigas) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Regirock, Regice, Registeel, and Regigigas in Cobblemon. Learn about the Regi temples.",
      image: "/guides/regirock.png",
    },
    eon_duo: {
      title: "How to Get Eon Duo (Latias, Latios) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Latias and Latios in Cobblemon. Learn about the Eon Shrines.",
      image: "/guides/latios-shrine.png",
    },
    jirachi: {
      title: "How to Get Jirachi | CobbleToolkit",
      description:
        "Complete guide on how to obtain Jirachi in Cobblemon. Learn about the wishing requirements.",
      image: "/guides/jirachi.png",
    },
    lunar_duo: {
      title: "How to Get Lunar Duo (Solgaleo, Lunala) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Solgaleo and Lunala in Cobblemon. Learn about Cosmog evolution.",
      image: "/guides/lunala.png",
    },
    sea_guardians: {
      title:
        "How to Get Sea Guardians (Tapu Koko, Tapu Lele, Tapu Bulu, Tapu Fini) | CobbleToolkit",
      description:
        "Complete guide on how to obtain the Alolan Guardian Deities in Cobblemon.",
      image: "/guides/tapu-koko.png",
    },
    heatran: {
      title: "How to Get Heatran | CobbleToolkit",
      description:
        "Complete guide on how to obtain Heatran in Cobblemon. Learn about the volcano location.",
      image: "/guides/heatran.png",
    },
    shaymin: {
      title: "How to Get Shaymin | CobbleToolkit",
      description:
        "Complete guide on how to obtain Shaymin in Cobblemon. Learn about the Gracidea Flower.",
      image: "/guides/shaymin.png",
    },
    arceus: {
      title: "How to Get Arceus | CobbleToolkit",
      description:
        "Complete guide on how to obtain Arceus in Cobblemon. Learn about the Azure Flute and Hall of Origin.",
      image: "/guides/arceus.png",
    },
    victini: {
      title: "How to Get Victini | CobbleToolkit",
      description:
        "Complete guide on how to obtain Victini in Cobblemon. Learn about the Liberty Garden.",
      image: "/guides/victini.png",
    },
    swords_of_justice: {
      title:
        "How to Get Swords of Justice (Cobalion, Terrakion, Virizion, Keldeo) | CobbleToolkit",
      description:
        "Complete guide on how to obtain the Swords of Justice quartet in Cobblemon.",
      image: "/guides/keldeo.png",
    },
    forces_of_nature: {
      title:
        "How to Get Forces of Nature (Tornadus, Thundurus, Landorus, Enamorus) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Tornadus, Thundurus, Landorus, and Enamorus in Cobblemon. Learn about the Reveal Glass.",
      image: "/guides/tornadus.png",
    },
    meloetta: {
      title: "How to Get Meloetta | CobbleToolkit",
      description:
        "Complete guide on how to obtain Meloetta in Cobblemon. Learn about form changing.",
      image: "/guides/meloetta.png",
    },
    genesect: {
      title: "How to Get Genesect | CobbleToolkit",
      description:
        "Complete guide on how to obtain Genesect in Cobblemon. Learn about the Drive items.",
      image: "/guides/genesect.png",
    },
    type_null_silvally: {
      title: "How to Get Type: Null & Silvally | CobbleToolkit",
      description:
        "Complete guide on how to obtain Type: Null and evolve it into Silvally in Cobblemon.",
      image: "/guides/typenull.png",
    },
    diancie: {
      title: "How to Get Diancie | CobbleToolkit",
      description:
        "Complete guide on how to obtain Diancie in Cobblemon. Learn about the Diamond Ore.",
      image: "/guides/diancie.png",
    },
    hoopa: {
      title: "How to Get Hoopa | CobbleToolkit",
      description:
        "Complete guide on how to obtain Hoopa in Cobblemon. Learn about the Prison Bottle and Unbound form.",
      image: "/guides/hoopa.png",
    },
    volcanion: {
      title: "How to Get Volcanion | CobbleToolkit",
      description:
        "Complete guide on how to obtain Volcanion in Cobblemon. Learn about the volcano location.",
      image: "/guides/volcanion.png",
    },
    guardian_deities: {
      title:
        "How to Get Guardian Deities (Tapu Koko, Tapu Lele, Tapu Bulu, Tapu Fini) | CobbleToolkit",
      description:
        "Complete guide on how to obtain the Alolan Guardian Deities in Cobblemon.",
      image: "/guides/tapu-lele.png",
    },
    light_trio: {
      title:
        "How to Get Light Trio (Cosmog, Cosmoem, Solgaleo/Lunala) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Cosmog, Cosmoem, Solgaleo, and Lunala in Cobblemon.",
      image: "/guides/cosmog.png",
    },
    ultra_beasts: {
      title: "How to Get Ultra Beasts | CobbleToolkit",
      description:
        "Complete guide on how to obtain all Ultra Beasts in Cobblemon. Includes Nihilego, Buzzwole, and more.",
      image: "/guides/buzzwole.png",
    },
    paradox_ancient: {
      title: "How to Get Paradox: Ancient Pokemon | CobbleToolkit",
      description:
        "Complete guide on how to obtain ancient Paradox Pokemon like Great Tusk, Roaring Moon, and Slither Wing in Cobblemon.",
      image: "/guides/great-tusk.png",
    },
    paradox_future: {
      title: "How to Get Paradox: Future Pokemon | CobbleToolkit",
      description:
        "Complete guide on how to obtain future Paradox Pokemon like Iron Bundle, Iron Valiant, and Iron Hands in Cobblemon.",
      image: "/guides/iron-bundle.png",
    },
    treasures_of_ruin: {
      title:
        "How to Get Treasures of Ruin (Ting-Lu, Chien-Pao, Wo-Chien, Chi-Yu) | CobbleToolkit",
      description:
        "Complete guide on how to obtain the Treasures of Ruin quartet in Cobblemon.",
      image: "/guides/ting-lu.png",
    },
    ogerpon: {
      title: "How to Get Ogerpon | CobbleToolkit",
      description:
        "Complete guide on how to obtain Ogerpon in Cobblemon. Learn about the different mask forms.",
      image: "/guides/ogerpon.png",
    },
    loyal_three: {
      title:
        "How to Get Loyal Three (Okidogi, Munkidori, Fezandipiti) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Okidogi, Munkidori, and Fezandipiti in Cobblemon.",
      image: "/guides/okidogi.png",
    },
    terapagos: {
      title: "How to Get Terapagos | CobbleToolkit",
      description:
        "Complete guide on how to obtain Terapagos in Cobblemon. Learn about the Terastal phenomenon.",
      image: "/guides/terapagos.png",
    },
  };

  // Get metadata for this Pokemon
  const meta = pokemonMetadata[pokemonKey];
  if (!meta) {
    return response;
  }

  // Get the HTML content
  const html = await response.text();

  // Get the base URL from the request
  const baseUrl = `${url.protocol}//${url.host}`;
  const imageUrl = `${baseUrl}${meta.image}`;

  // Helper function to escape HTML
  function escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  // Inject meta tags into the HTML
  // Open Graph tags are used by Discord, Facebook Messenger, LinkedIn, and most platforms
  const metaTags = `
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="CobbleToolkit" />
  `;

  // Replace or inject meta tags
  let modifiedHtml = html;

  // Replace existing title if found
  modifiedHtml = modifiedHtml.replace(
    /<title>.*?<\/title>/i,
    `<title>${escapeHtml(meta.title)}</title>`
  );

  // Replace existing description meta if found
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  );

  // Remove existing Open Graph meta tags
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+property=["']og:.*?["']\s*\/?>/gi,
    ""
  );

  // Inject new meta tags before </head>
  if (modifiedHtml.includes("</head>")) {
    modifiedHtml = modifiedHtml.replace("</head>", `${metaTags}</head>`);
  } else if (modifiedHtml.includes("<head>")) {
    // If no </head> tag, add after <head>
    modifiedHtml = modifiedHtml.replace("<head>", `<head>${metaTags}`);
  }

  // Create a new response with the modified HTML
  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
