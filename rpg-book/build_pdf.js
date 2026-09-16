// Renderiza book.html -> PDF usando o Chromium/Playwright já instalados no ambiente.
const path = require("path");
const { chromium } = require(path.join(process.env.NPM_GLOBAL_ROOT || require("child_process")
  .execSync("npm root -g").toString().trim(), "playwright"));

(async () => {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const page = await browser.newPage();
  const htmlPath = path.join(__dirname, "book.html");
  await page.goto("file://" + htmlPath, { waitUntil: "networkidle" });
  await page.pdf({
    path: path.join(__dirname, "Mushoku_Tensei_RPG_Livro_Basico.pdf"),
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:7px; width:100%; text-align:center; color:#7a6a4d; font-family:Liberation Serif,serif;">Mushoku Tensei RPG — Livro Básico (fan sourcebook não-oficial)</div>`,
    footerTemplate: `<div style="font-size:7px; width:100%; text-align:center; color:#7a6a4d;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    margin: { top: "22mm", bottom: "16mm", left: "18mm", right: "18mm" },
  });
  await browser.close();
  console.log("PDF gerado.");
})();
