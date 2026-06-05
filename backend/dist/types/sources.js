"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSource = exports.ItemCategory = void 0;
var ItemCategory;
(function (ItemCategory) {
    ItemCategory["STOCK"] = "STOCK";
    ItemCategory["CRYPTO"] = "CRYPTO";
    ItemCategory["FOREX"] = "FOREX";
    ItemCategory["COMMODITY"] = "COMMODITY";
    ItemCategory["CAR"] = "CAR";
    ItemCategory["CLOTHING"] = "CLOTHING";
    ItemCategory["COLLECTABLE"] = "COLLECTABLE";
    ItemCategory["GENERAL"] = "GENERAL";
})(ItemCategory || (exports.ItemCategory = ItemCategory = {}));
var DataSource;
(function (DataSource) {
    DataSource["ALPHA_VANTAGE"] = "ALPHA_VANTAGE";
    DataSource["COINGECKO"] = "COINGECKO";
    DataSource["FIXER"] = "FIXER";
    DataSource["EBAY_SCRAPE"] = "EBAY_SCRAPE";
    DataSource["STOCKX_SCRAPE"] = "STOCKX_SCRAPE";
    DataSource["NEWS_API"] = "NEWS_API";
    DataSource["NEWS_SCRAPE"] = "NEWS_SCRAPE";
    DataSource["OPENAI"] = "OPENAI";
})(DataSource || (exports.DataSource = DataSource = {}));
