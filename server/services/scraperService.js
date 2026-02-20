import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeWebsite(url) {
  try {
    const { data } = await axios.get(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
  },
});

    const $ = cheerio.load(data);

    const title = $("title").text();

    const headings = [];
    $("h1, h2, h3").each((i, el) => {
      headings.push($(el).text().trim());
    });

    const buttons = [];
    $("button").each((i, el) => {
      buttons.push($(el).text().trim());
    });

    const forms = [];
    $("form").each((i, el) => {
      forms.push("Form detected");
    });

    const paragraphs = [];
    $("p").each((i, el) => {
      paragraphs.push($(el).text().trim());
    });

    return {
      title,
      headings,
      buttons,
      forms,
      paragraphs: paragraphs.slice(0, 10),
    };
  } catch (error) {
    throw new Error("Failed to scrape website");
  }
}