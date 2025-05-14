const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");

const manifest = require("./manifest.json");

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async ({ id }) => {
  const name = await getNameFromIMDb(id);
  if (!name) return { streams: [] };

  console.log(`Hľadám na Hellspy: ${name}`);
  const streams = await searchHellspy(name);
  return { streams };
});

async function getNameFromIMDb(imdbId) {
  try {
    const url = `https://www.omdbapi.com/?apikey=demo&i=${imdbId}`; // nahraď vlastným API kľúčom
    const res = await axios.get(url);
    return res.data?.Title || null;
  } catch (e) {
    console.error("Chyba pri získavaní názvu z OMDB:", e.message);
    return null;
  }
}

async function searchHellspy(query) {
  try {
    const searchUrl = `https://www.hellspy.to/vyhledavani/${encodeURIComponent(query)}/`;
    const res = await axios.get(searchUrl);
    const $ = cheerio.load(res.data);

    const streams = [];
    $('.search-files .file').each((i, el) => {
      const title = $(el).find('.title').text().trim();
      const videoLink = $(el).find('a.download').attr('href');

      const match = videoLink?.match(/\/video\/([a-f0-9]+)\/(\d+)/);
      if (match) {
        const [ , hash, id ] = match;
        const directUrl = `https://www.hellspy.to/video/${hash}/${id}`;

        streams.push({
          title: `Hellspy: ${title}`,
          url: directUrl
        });
      }
    });

    return streams;
  } catch (e) {
    console.error("Chyba pri scrapovaní Hellspy:", e.message);
    return [];
  }
}

module.exports = builder.getInterface();
