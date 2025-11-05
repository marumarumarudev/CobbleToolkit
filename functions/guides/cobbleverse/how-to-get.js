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
        "Complete guide on how to obtain Mew and Mewtwo in COBBLEVERSE. Learn how to craft the Origin Fossil and obtain Mewtwo through the Rocket Tower.",
    },
    weather_trio: {
      title:
        "How to Get Weather Trio (Groudon, Kyogre, Rayquaza) | CobbleToolkit",
      description:
        "Guide on how to catch Groudon, Kyogre, and Rayquaza in COBBLEVERSE. Learn about their spawn locations, requirements, and methods.",
    },
    ash_pokemons: {
      title: "How to Get Ash's Pokemon (Greninja, Pikachu) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Ash's Greninja and Pikachu in COBBLEVERSE. Find Ash's house and complete the quest.",
    },
    lugia: {
      title: "How to Get Lugia | CobbleToolkit",
      description:
        "Complete guide on how to obtain Lugia in COBBLEVERSE. Learn about the Whirl Island, Silver Wing, and summoning requirements.",
    },
    hooh: {
      title: "How to Get Ho-oh | CobbleToolkit",
      description:
        "Complete guide on how to obtain Ho-oh in COBBLEVERSE. Learn about the Bell Tower, Rainbow Wing, and summoning requirements.",
    },
    celebi: {
      title: "How to Get Celebi | CobbleToolkit",
      description:
        "Complete guide on how to obtain Celebi in COBBLEVERSE. Learn about the Celebi Shrine and summoning requirements.",
    },
    deoxys: {
      title: "How to Get Deoxys | CobbleToolkit",
      description:
        "Complete guide on how to obtain Deoxys in COBBLEVERSE. Learn about Meteorite Island and form changing.",
    },
    calyrex: {
      title: "How to Get Calyrex | CobbleToolkit",
      description:
        "Complete guide on how to obtain Calyrex in COBBLEVERSE. Learn about Glastrier and Spectrier fusion methods.",
    },
    cosplay_pikachu: {
      title: "How to Get Cosplay Pikachu | CobbleToolkit",
      description:
        "Complete guide on how to obtain Cosplay Pikachu forms in COBBLEVERSE. Learn about the different cosplay styles.",
    },
    tao_trio: {
      title: "How to Get Tao Trio (Reshiram, Zekrom, Kyurem) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Reshiram, Zekrom, and Kyurem in COBBLEVERSE. Learn about fusion and separation methods.",
    },
    legendary_birds_trio: {
      title:
        "How to Get Legendary Birds (Articuno, Zapdos, Moltres) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Articuno, Zapdos, and Moltres in COBBLEVERSE. Includes Galarian forms.",
    },
    creation_trio: {
      title:
        "How to Get Creation Trio (Dialga, Palkia, Giratina) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Dialga, Palkia, and Giratina in COBBLEVERSE.",
    },
    river_guardians: {
      title:
        "How to Get River Guardians (Azelf, Uxie, Mesprit) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Azelf, Uxie, and Mesprit in COBBLEVERSE.",
    },
    aura_trio: {
      title: "How to Get Aura Trio (Xerneas, Yveltal, Zygarde) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Xerneas, Yveltal, and Zygarde in COBBLEVERSE. Learn about Zygarde cells and forms.",
    },
    kubfu: {
      title: "How to Get Kubfu & Urshifu | CobbleToolkit",
      description:
        "Complete guide on how to obtain Kubfu and evolve it into Urshifu in COBBLEVERSE.",
    },
    combat_trio: {
      title:
        "How to Get Combat Trio (Cobalion, Terrakion, Virizion) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Cobalion, Terrakion, and Virizion in COBBLEVERSE.",
    },
    legendary_titans: {
      title:
        "How to Get Legendary Titans (Regirock, Regice, Registeel, Regigigas) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Regirock, Regice, Registeel, and Regigigas in COBBLEVERSE. Learn about the Regi temples.",
    },
    eon_duo: {
      title: "How to Get Eon Duo (Latias, Latios) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Latias and Latios in COBBLEVERSE. Learn about the Secret Garden.",
    },
    jirachi: {
      title: "How to Get Jirachi | CobbleToolkit",
      description:
        "Complete guide on how to obtain Jirachi in COBBLEVERSE.",
    },
    lunar_duo: {
      title: "How to Get Lunar Duo (Cresselia, Darkrai) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Cresselia and Darkrai in COBBLEVERSE.",
    },
    sea_guardians: {
      title:
        "How to Get Sea Guardians (Tapu Koko, Tapu Lele, Tapu Bulu, Tapu Fini) | CobbleToolkit",
      description:
        "Complete guide on how to obtain the Alolan Guardian Deities in COBBLEVERSE.",
    },
    heatran: {
      title: "How to Get Heatran | CobbleToolkit",
      description:
        "Complete guide on how to obtain Heatran in COBBLEVERSE.",
    },
    shaymin: {
      title: "How to Get Shaymin | CobbleToolkit",
      description:
        "Complete guide on how to obtain Shaymin in COBBLEVERSE.",
    },
    arceus: {
      title: "How to Get Arceus | CobbleToolkit",
      description:
        "Complete guide on how to obtain Arceus in COBBLEVERSE.",
    },
    victini: {
      title: "How to Get Victini | CobbleToolkit",
      description:
        "Complete guide on how to obtain Victini in COBBLEVERSE.",
    },
    swords_of_justice: {
      title:
        "How to Get Swords of Justice (Cobalion, Terrakion, Virizion, Keldeo) | CobbleToolkit",
      description:
        "Complete guide on how to obtain the Swords of Justice quartet in COBBLEVERSE.",
    },
    forces_of_nature: {
      title:
        "How to Get Forces of Nature (Tornadus, Thundurus, Landorus, Enamorus) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Tornadus, Thundurus, Landorus, and Enamorus in COBBLEVERSE. Learn about the Reveal Glass.",
    },
    meloetta: {
      title: "How to Get Meloetta | CobbleToolkit",
      description:
        "Complete guide on how to obtain Meloetta in COBBLEVERSE. Learn about form changing.",
    },
    genesect: {
      title: "How to Get Genesect | CobbleToolkit",
      description:
        "Complete guide on how to obtain Genesect in COBBLEVERSE. Learn about the Drive items.",
    },
    type_null_silvally: {
      title: "How to Get Type: Null & Silvally | CobbleToolkit",
      description:
        "Complete guide on how to obtain Type: Null and evolve it into Silvally in COBBLEVERSE.",
    },
    diancie: {
      title: "How to Get Diancie | CobbleToolkit",
      description:
        "Complete guide on how to obtain Diancie in COBBLEVERSE.",
    },
    hoopa: {
      title: "How to Get Hoopa | CobbleToolkit",
      description:
        "Complete guide on how to obtain Hoopa in COBBLEVERSE. Learn about the Prison Bottle and Unbound form.",
    },
    volcanion: {
      title: "How to Get Volcanion | CobbleToolkit",
      description:
        "Complete guide on how to obtain Volcanion in COBBLEVERSE.",
    },
    guardian_deities: {
      title:
        "How to Get Guardian Deities (Tapu Koko, Tapu Lele, Tapu Bulu, Tapu Fini) | CobbleToolkit",
      description:
        "Complete guide on how to obtain the Alolan Guardian Deities in COBBLEVERSE.",
    },
    light_trio: {
      title:
        "How to Get Light Trio (Cosmog, Cosmoem, Solgaleo/Lunala) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Cosmog, Cosmoem, Solgaleo, Lunala, and Necrozma in COBBLEVERSE.",
    },
    ultra_beasts: {
      title: "How to Get Ultra Beasts | CobbleToolkit",
      description:
        "Complete guide on how to obtain all Ultra Beasts in COBBLEVERSE.",
    },
    paradox_ancient: {
      title: "How to Get Paradox: Ancient Pokemon | CobbleToolkit",
      description:
        "Complete guide on how to obtain ancient Paradox Pokemon like Great Tusk, Roaring Moon, and Slither Wing in COBBLEVERSE.",
    },
    paradox_future: {
      title: "How to Get Paradox: Future Pokemon | CobbleToolkit",
      description:
        "Complete guide on how to obtain future Paradox Pokemon like Iron Bundle, Iron Valiant, and Iron Hands in COBBLEVERSE.",
    },
    treasures_of_ruin: {
      title:
        "How to Get Treasures of Ruin (Ting-Lu, Chien-Pao, Wo-Chien, Chi-Yu) | CobbleToolkit",
      description:
        "Complete guide on how to obtain the Treasures of Ruin quartet in COBBLEVERSE.",
    },
    ogerpon: {
      title: "How to Get Ogerpon | CobbleToolkit",
      description:
        "Complete guide on how to obtain Ogerpon in COBBLEVERSE. Learn about the different mask forms.",
    },
    loyal_three: {
      title:
        "How to Get Loyal Three (Okidogi, Munkidori, Fezandipiti) | CobbleToolkit",
      description:
        "Complete guide on how to obtain Okidogi, Munkidori, and Fezandipiti in COBBLEVERSE.",
    },
    terapagos: {
      title: "How to Get Terapagos | CobbleToolkit",
      description:
        "Complete guide on how to obtain Terapagos in COBBLEVERSE.",
    },
  };

  // Get metadata for this Pokemon
  const meta = pokemonMetadata[pokemonKey];
  if (!meta) {
    return response;
  }

  // Get the HTML content
  const html = await response.text();

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
