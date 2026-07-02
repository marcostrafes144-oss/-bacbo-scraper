const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");

const app = express();
app.use(cors());
app.use(express.json());

let results = [];

/**
 * 🔥 SCRAPER BAC BO (ROBUSTO)
 */
async function scrapeBacBo() {
  try {
    const browser = await
