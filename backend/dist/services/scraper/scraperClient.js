"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPage = getPage;
exports.closePage = closePage;
const puppeteer_1 = __importDefault(require("puppeteer"));
let browser = null;
async function getBrowser() {
    if (browser && browser.isConnected()) {
        return browser;
    }
    browser = await puppeteer_1.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    browser.on('disconnected', () => {
        browser = null;
    });
    return browser;
}
async function getPage() {
    const activeBrowser = await getBrowser();
    const page = await activeBrowser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });
    return page;
}
async function closePage(page) {
    try {
        if (!page.isClosed()) {
            await page.close();
        }
    }
    catch (error) {
        console.error('Error closing Puppeteer page', error);
    }
}
