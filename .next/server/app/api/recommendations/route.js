"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/recommendations/route";
exports.ids = ["app/api/recommendations/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("node:fs");

/***/ }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:stream");

/***/ }),

/***/ "node:stream/web":
/*!**********************************!*\
  !*** external "node:stream/web" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("node:stream/web");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("worker_threads");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Frecommendations%2Froute&page=%2Fapi%2Frecommendations%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Frecommendations%2Froute.ts&appDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Frecommendations%2Froute&page=%2Fapi%2Frecommendations%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Frecommendations%2Froute.ts&appDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_hiroy_Documents_ai_affiliate_platform_app_api_recommendations_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/recommendations/route.ts */ \"(rsc)/./app/api/recommendations/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/recommendations/route\",\n        pathname: \"/api/recommendations\",\n        filename: \"route\",\n        bundlePath: \"app/api/recommendations/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\hiroy\\\\Documents\\\\ai-affiliate-platform\\\\app\\\\api\\\\recommendations\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_hiroy_Documents_ai_affiliate_platform_app_api_recommendations_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/recommendations/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZyZWNvbW1lbmRhdGlvbnMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnJlY29tbWVuZGF0aW9ucyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnJlY29tbWVuZGF0aW9ucyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNoaXJveSU1Q0RvY3VtZW50cyU1Q2FpLWFmZmlsaWF0ZS1wbGF0Zm9ybSU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDaGlyb3klNUNEb2N1bWVudHMlNUNhaS1hZmZpbGlhdGUtcGxhdGZvcm0maXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ3VDO0FBQ3BIO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWktYWZmaWxpYXRlLXBsYXRmb3JtLz83MmJhIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXGhpcm95XFxcXERvY3VtZW50c1xcXFxhaS1hZmZpbGlhdGUtcGxhdGZvcm1cXFxcYXBwXFxcXGFwaVxcXFxyZWNvbW1lbmRhdGlvbnNcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3JlY29tbWVuZGF0aW9ucy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3JlY29tbWVuZGF0aW9uc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvcmVjb21tZW5kYXRpb25zL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcaGlyb3lcXFxcRG9jdW1lbnRzXFxcXGFpLWFmZmlsaWF0ZS1wbGF0Zm9ybVxcXFxhcHBcXFxcYXBpXFxcXHJlY29tbWVuZGF0aW9uc1xcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvcmVjb21tZW5kYXRpb25zL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Frecommendations%2Froute&page=%2Fapi%2Frecommendations%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Frecommendations%2Froute.ts&appDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/recommendations/route.ts":
/*!******************************************!*\
  !*** ./app/api/recommendations/route.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../lib/auth */ \"(rsc)/./lib/auth.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n/* harmony import */ var openai__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! openai */ \"(rsc)/./node_modules/openai/index.mjs\");\n\n\n\n\n\n// -----------------------------\n// OLLAMA 版 AI 推奨生成関数\n// -----------------------------\nasync function generateAiRecommendations(data, site) {\n    // OpenAI APIキーは不要\n    const client = new openai__WEBPACK_IMPORTED_MODULE_4__[\"default\"]({\n        apiKey: \"ollama\",\n        baseURL: \"http://localhost:12000/v1\"\n    });\n    const response = await client.chat.completions.create({\n        model: \"llama3.1:8b\",\n        messages: [\n            {\n                role: \"system\",\n                content: \"Generate actionable recommendations for an affiliate site. Return a JSON object with a recommendations array. Each item must include type, title, description, reasoning, dataUsed, uncertainty, and priority.\"\n            },\n            {\n                role: \"user\",\n                content: JSON.stringify({\n                    site,\n                    analytics: data.analytics\n                })\n            }\n        ]\n    });\n    const content = response.choices[0].message.content;\n    if (!content) throw new Error(\"No recommendations returned\");\n    const parsed = JSON.parse(content);\n    if (!Array.isArray(parsed.recommendations)) {\n        throw new Error(\"Invalid recommendation response\");\n    }\n    return parsed.recommendations;\n}\n// -----------------------------\n// GET\n// -----------------------------\nasync function GET(req) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Unauthorized\"\n    }, {\n        status: 401\n    });\n    const { searchParams } = new URL(req.url);\n    const siteId = searchParams.get(\"siteId\");\n    const status = searchParams.get(\"status\");\n    const type = searchParams.get(\"type\");\n    const where = {};\n    if (siteId) where.siteId = siteId;\n    if (status) where.status = status;\n    if (type) where.type = type;\n    const recs = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.aiRecommendation.findMany({\n        where,\n        orderBy: [\n            {\n                priority: \"asc\"\n            },\n            {\n                createdAt: \"desc\"\n            }\n        ],\n        include: {\n            site: {\n                select: {\n                    name: true\n                }\n            }\n        }\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        recommendations: recs\n    });\n}\n// -----------------------------\n// POST\n// -----------------------------\nasync function POST(req) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Unauthorized\"\n    }, {\n        status: 401\n    });\n    const { siteId } = await req.json();\n    const site = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.site.findFirst({\n        where: {\n            id: siteId,\n            userId: session.user.id\n        }\n    });\n    if (!site) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Not found\"\n    }, {\n        status: 404\n    });\n    const startDate = new Date();\n    startDate.setDate(startDate.getDate() - 30);\n    const analyticsData = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.analytics.findMany({\n        where: {\n            siteId,\n            date: {\n                gte: startDate\n            }\n        },\n        orderBy: {\n            date: \"asc\"\n        }\n    });\n    try {\n        const recs = await generateAiRecommendations({\n            analytics: analyticsData\n        }, {\n            siteName: site.name,\n            affiliateTitle: site.affiliateTitle,\n            status: site.status\n        });\n        const created = await Promise.all(recs.map((rec)=>_lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.aiRecommendation.create({\n                data: {\n                    siteId,\n                    type: rec.type,\n                    title: rec.title,\n                    description: rec.description,\n                    reasoning: rec.reasoning,\n                    dataUsed: JSON.stringify(rec.dataUsed),\n                    uncertainty: rec.uncertainty,\n                    priority: rec.priority,\n                    status: \"PENDING\"\n                }\n            })));\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            recommendations: created\n        }, {\n            status: 201\n        });\n    } catch (e) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: e.message || \"Generation failed\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RztZQUFFL0IsUUFBUTtRQUFJO0lBQ3ZFLEVBQUUsT0FBT3lDLEdBQVE7UUFDZixPQUFPNUUscURBQVlBLENBQUNpQyxJQUFJLENBQUM7WUFBRUMsT0FBTzBDLEVBQUVyRCxPQUFPLElBQUk7UUFBb0IsR0FBRztZQUFFWSxRQUFRO1FBQUk7SUFDdEY7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2FpLWFmZmlsaWF0ZS1wbGF0Zm9ybS8uL2FwcC9hcGkvcmVjb21tZW5kYXRpb25zL3JvdXRlLnRzPzQ0YWMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xyXG5pbXBvcnQgeyBnZXRTZXJ2ZXJTZXNzaW9uIH0gZnJvbSAnbmV4dC1hdXRoJ1xyXG5pbXBvcnQgeyBhdXRoT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL2xpYi9hdXRoJ1xyXG5pbXBvcnQgeyBwcmlzbWEgfSBmcm9tICcuLi8uLi8uLi9saWIvcHJpc21hJ1xyXG5pbXBvcnQgT3BlbkFJIGZyb20gXCJvcGVuYWlcIlxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gT0xMQU1BIOeJiCBBSSDmjqjlpajnlJ/miJDplqLmlbBcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVBaVJlY29tbWVuZGF0aW9ucyhcclxuICBkYXRhOiB7IGFuYWx5dGljczogYW55W10gfSxcclxuICBzaXRlOiB7IHNpdGVOYW1lOiBzdHJpbmc7IGFmZmlsaWF0ZVRpdGxlOiBzdHJpbmcgfCBudWxsOyBzdGF0dXM6IHN0cmluZyB9XHJcbikge1xyXG4gIC8vIE9wZW5BSSBBUEnjgq3jg7zjga/kuI3opoFcclxuICBjb25zdCBjbGllbnQgPSBuZXcgT3BlbkFJKHtcclxuICAgIGFwaUtleTogXCJvbGxhbWFcIixcclxuICAgIGJhc2VVUkw6IFwiaHR0cDovL2xvY2FsaG9zdDoxMjAwMC92MVwiLFxyXG4gIH0pXHJcblxyXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LmNoYXQuY29tcGxldGlvbnMuY3JlYXRlKHtcclxuICAgIG1vZGVsOiBcImxsYW1hMy4xOjhiXCIsICAgLy8g4oaQ44GC44Gq44Gf44GuIE9sbGFtYSDjg6Ljg4fjg6vlkI3jgavlkIjjgo/jgZvjgotcclxuICAgIG1lc3NhZ2VzOiBbXHJcbiAgICAgIHtcclxuICAgICAgICByb2xlOiBcInN5c3RlbVwiLFxyXG4gICAgICAgIGNvbnRlbnQ6XHJcbiAgICAgICAgICBcIkdlbmVyYXRlIGFjdGlvbmFibGUgcmVjb21tZW5kYXRpb25zIGZvciBhbiBhZmZpbGlhdGUgc2l0ZS4gUmV0dXJuIGEgSlNPTiBvYmplY3Qgd2l0aCBhIHJlY29tbWVuZGF0aW9ucyBhcnJheS4gRWFjaCBpdGVtIG11c3QgaW5jbHVkZSB0eXBlLCB0aXRsZSwgZGVzY3JpcHRpb24sIHJlYXNvbmluZywgZGF0YVVzZWQsIHVuY2VydGFpbnR5LCBhbmQgcHJpb3JpdHkuXCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICByb2xlOiBcInVzZXJcIixcclxuICAgICAgICBjb250ZW50OiBKU09OLnN0cmluZ2lmeSh7IHNpdGUsIGFuYWx5dGljczogZGF0YS5hbmFseXRpY3MgfSksXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIH0pXHJcblxyXG4gIGNvbnN0IGNvbnRlbnQgPSByZXNwb25zZS5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudFxyXG4gIGlmICghY29udGVudCkgdGhyb3cgbmV3IEVycm9yKFwiTm8gcmVjb21tZW5kYXRpb25zIHJldHVybmVkXCIpXHJcblxyXG4gIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoY29udGVudClcclxuXHJcbiAgaWYgKCFBcnJheS5pc0FycmF5KHBhcnNlZC5yZWNvbW1lbmRhdGlvbnMpKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHJlY29tbWVuZGF0aW9uIHJlc3BvbnNlXCIpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gcGFyc2VkLnJlY29tbWVuZGF0aW9uc1xyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBHRVRcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChyZXE6IE5leHRSZXF1ZXN0KSB7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpXHJcbiAgaWYgKCFzZXNzaW9uKSByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfSwgeyBzdGF0dXM6IDQwMSB9KVxyXG5cclxuICBjb25zdCB7IHNlYXJjaFBhcmFtcyB9ID0gbmV3IFVSTChyZXEudXJsKVxyXG4gIGNvbnN0IHNpdGVJZCA9IHNlYXJjaFBhcmFtcy5nZXQoJ3NpdGVJZCcpXHJcbiAgY29uc3Qgc3RhdHVzID0gc2VhcmNoUGFyYW1zLmdldCgnc3RhdHVzJylcclxuICBjb25zdCB0eXBlID0gc2VhcmNoUGFyYW1zLmdldCgndHlwZScpXHJcblxyXG4gIGNvbnN0IHdoZXJlOiBhbnkgPSB7fVxyXG4gIGlmIChzaXRlSWQpIHdoZXJlLnNpdGVJZCA9IHNpdGVJZFxyXG4gIGlmIChzdGF0dXMpIHdoZXJlLnN0YXR1cyA9IHN0YXR1c1xyXG4gIGlmICh0eXBlKSB3aGVyZS50eXBlID0gdHlwZVxyXG5cclxuICBjb25zdCByZWNzID0gYXdhaXQgcHJpc21hLmFpUmVjb21tZW5kYXRpb24uZmluZE1hbnkoe1xyXG4gICAgd2hlcmUsXHJcbiAgICBvcmRlckJ5OiBbeyBwcmlvcml0eTogJ2FzYycgfSwgeyBjcmVhdGVkQXQ6ICdkZXNjJyB9XSxcclxuICAgIGluY2x1ZGU6IHsgc2l0ZTogeyBzZWxlY3Q6IHsgbmFtZTogdHJ1ZSB9IH0gfSxcclxuICB9KVxyXG5cclxuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyByZWNvbW1lbmRhdGlvbnM6IHJlY3MgfSlcclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gUE9TVFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXE6IE5leHRSZXF1ZXN0KSB7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpXHJcbiAgaWYgKCFzZXNzaW9uKSByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfSwgeyBzdGF0dXM6IDQwMSB9KVxyXG5cclxuICBjb25zdCB7IHNpdGVJZCB9ID0gYXdhaXQgcmVxLmpzb24oKVxyXG5cclxuICBjb25zdCBzaXRlID0gYXdhaXQgcHJpc21hLnNpdGUuZmluZEZpcnN0KHtcclxuICAgIHdoZXJlOiB7IGlkOiBzaXRlSWQsIHVzZXJJZDogKHNlc3Npb24udXNlciBhcyBhbnkpLmlkIH0sXHJcbiAgfSlcclxuICBpZiAoIXNpdGUpIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTm90IGZvdW5kJyB9LCB7IHN0YXR1czogNDA0IH0pXHJcblxyXG4gIGNvbnN0IHN0YXJ0RGF0ZSA9IG5ldyBEYXRlKClcclxuICBzdGFydERhdGUuc2V0RGF0ZShzdGFydERhdGUuZ2V0RGF0ZSgpIC0gMzApXHJcblxyXG4gIGNvbnN0IGFuYWx5dGljc0RhdGEgPSBhd2FpdCBwcmlzbWEuYW5hbHl0aWNzLmZpbmRNYW55KHtcclxuICAgIHdoZXJlOiB7IHNpdGVJZCwgZGF0ZTogeyBndGU6IHN0YXJ0RGF0ZSB9IH0sXHJcbiAgICBvcmRlckJ5OiB7IGRhdGU6ICdhc2MnIH0sXHJcbiAgfSlcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlY3MgPSBhd2FpdCBnZW5lcmF0ZUFpUmVjb21tZW5kYXRpb25zKFxyXG4gICAgICB7IGFuYWx5dGljczogYW5hbHl0aWNzRGF0YSB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgc2l0ZU5hbWU6IHNpdGUubmFtZSxcclxuICAgICAgICBhZmZpbGlhdGVUaXRsZTogc2l0ZS5hZmZpbGlhdGVUaXRsZSxcclxuICAgICAgICBzdGF0dXM6IHNpdGUuc3RhdHVzLFxyXG4gICAgICB9XHJcbiAgICApXHJcblxyXG4gICAgY29uc3QgY3JlYXRlZCA9IGF3YWl0IFByb21pc2UuYWxsKFxyXG4gICAgICByZWNzLm1hcCgocmVjKSA9PlxyXG4gICAgICAgIHByaXNtYS5haVJlY29tbWVuZGF0aW9uLmNyZWF0ZSh7XHJcbiAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIHNpdGVJZCxcclxuICAgICAgICAgICAgdHlwZTogcmVjLnR5cGUsXHJcbiAgICAgICAgICAgIHRpdGxlOiByZWMudGl0bGUsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiByZWMuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgIHJlYXNvbmluZzogcmVjLnJlYXNvbmluZyxcclxuICAgICAgICAgICAgZGF0YVVzZWQ6IEpTT04uc3RyaW5naWZ5KHJlYy5kYXRhVXNlZCksXHJcbiAgICAgICAgICAgIHVuY2VydGFpbnR5OiByZWMudW5jZXJ0YWludHksXHJcbiAgICAgICAgICAgIHByaW9yaXR5OiByZWMucHJpb3JpdHksXHJcbiAgICAgICAgICAgIHN0YXR1czogJ1BFTkRJTkcnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICApXHJcbiAgICApXHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgcmVjb21tZW5kYXRpb25zOiBjcmVhdGVkIH0sIHsgc3RhdHVzOiAyMDEgfSlcclxuICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBlLm1lc3NhZ2UgfHwgJ0dlbmVyYXRpb24gZmFpbGVkJyB9LCB7IHN0YXR1czogNTAwIH0pXHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJnZXRTZXJ2ZXJTZXNzaW9uIiwiYXV0aE9wdGlvbnMiLCJwcmlzbWEiLCJPcGVuQUkiLCJnZW5lcmF0ZUFpUmVjb21tZW5kYXRpb25zIiwiZGF0YSIsInNpdGUiLCJjbGllbnQiLCJhcGlLZXkiLCJiYXNlVVJMIiwicmVzcG9uc2UiLCJjaGF0IiwiY29tcGxldGlvbnMiLCJjcmVhdGUiLCJtb2RlbCIsIm1lc3NhZ2VzIiwicm9sZSIsImNvbnRlbnQiLCJKU09OIiwic3RyaW5naWZ5IiwiYW5hbHl0aWNzIiwiY2hvaWNlcyIsIm1lc3NhZ2UiLCJFcnJvciIsInBhcnNlZCIsInBhcnNlIiwiQXJyYXkiLCJpc0FycmF5IiwicmVjb21tZW5kYXRpb25zIiwiR0VUIiwicmVxIiwic2Vzc2lvbiIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsInNlYXJjaFBhcmFtcyIsIlVSTCIsInVybCIsInNpdGVJZCIsImdldCIsInR5cGUiLCJ3aGVyZSIsInJlY3MiLCJhaVJlY29tbWVuZGF0aW9uIiwiZmluZE1hbnkiLCJvcmRlckJ5IiwicHJpb3JpdHkiLCJjcmVhdGVkQXQiLCJpbmNsdWRlIiwic2VsZWN0IiwibmFtZSIsIlBPU1QiLCJmaW5kRmlyc3QiLCJpZCIsInVzZXJJZCIsInVzZXIiLCJzdGFydERhdGUiLCJEYXRlIiwic2V0RGF0ZSIsImdldERhdGUiLCJhbmFseXRpY3NEYXRhIiwiZGF0ZSIsImd0ZSIsInNpdGVOYW1lIiwiYWZmaWxpYXRlVGl0bGUiLCJjcmVhdGVkIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsInJlYyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJyZWFzb25pbmciLCJkYXRhVXNlZCIsInVuY2VydGFpbnR5IiwiZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/recommendations/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcryptjs */ \"bcryptjs\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _prisma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) return null;\n                const user = await _prisma__WEBPACK_IMPORTED_MODULE_2__.prisma.user.findUnique({\n                    where: {\n                        email: credentials.email\n                    }\n                });\n                if (!user) return null;\n                const valid = await bcryptjs__WEBPACK_IMPORTED_MODULE_1___default().compare(credentials.password, user.password);\n                if (!valid) return null;\n                return {\n                    id: user.id,\n                    email: user.email,\n                    name: user.name,\n                    role: user.role\n                };\n            }\n        })\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    pages: {\n        signIn: \"/login\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.role = user.role;\n                token.id = user.id;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.role = token.role;\n                session.user.id = token.id;\n            }\n            return session;\n        }\n    },\n    secret: process.env.NEXTAUTH_SECRET\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNpRTtBQUNwQztBQUNJO0FBRTFCLE1BQU1HLGNBQStCO0lBQzFDQyxXQUFXO1FBQ1RKLDJFQUFtQkEsQ0FBQztZQUNsQkssTUFBTTtZQUNOQyxhQUFhO2dCQUNYQyxPQUFPO29CQUFFQyxPQUFPO29CQUFTQyxNQUFNO2dCQUFRO2dCQUN2Q0MsVUFBVTtvQkFBRUYsT0FBTztvQkFBWUMsTUFBTTtnQkFBVztZQUNsRDtZQUNBLE1BQU1FLFdBQVVMLFdBQVc7Z0JBQ3pCLElBQUksQ0FBQ0EsYUFBYUMsU0FBUyxDQUFDRCxhQUFhSSxVQUFVLE9BQU87Z0JBQzFELE1BQU1FLE9BQU8sTUFBTVYsMkNBQU1BLENBQUNVLElBQUksQ0FBQ0MsVUFBVSxDQUFDO29CQUFFQyxPQUFPO3dCQUFFUCxPQUFPRCxZQUFZQyxLQUFLO29CQUFDO2dCQUFFO2dCQUNoRixJQUFJLENBQUNLLE1BQU0sT0FBTztnQkFDbEIsTUFBTUcsUUFBUSxNQUFNZCx1REFBYyxDQUFDSyxZQUFZSSxRQUFRLEVBQUVFLEtBQUtGLFFBQVE7Z0JBQ3RFLElBQUksQ0FBQ0ssT0FBTyxPQUFPO2dCQUNuQixPQUFPO29CQUFFRSxJQUFJTCxLQUFLSyxFQUFFO29CQUFFVixPQUFPSyxLQUFLTCxLQUFLO29CQUFFRixNQUFNTyxLQUFLUCxJQUFJO29CQUFFYSxNQUFNTixLQUFLTSxJQUFJO2dCQUFDO1lBQzVFO1FBQ0Y7S0FDRDtJQUNEQyxTQUFTO1FBQUVDLFVBQVU7SUFBTTtJQUMzQkMsT0FBTztRQUFFQyxRQUFRO0lBQVM7SUFDMUJDLFdBQVc7UUFDVCxNQUFNQyxLQUFJLEVBQUVDLEtBQUssRUFBRWIsSUFBSSxFQUFFO1lBQ3ZCLElBQUlBLE1BQU07Z0JBQ1JhLE1BQU1QLElBQUksR0FBRyxLQUFjQSxJQUFJO2dCQUMvQk8sTUFBTVIsRUFBRSxHQUFHTCxLQUFLSyxFQUFFO1lBQ3BCO1lBQ0EsT0FBT1E7UUFDVDtRQUNBLE1BQU1OLFNBQVEsRUFBRUEsT0FBTyxFQUFFTSxLQUFLLEVBQUU7WUFDOUIsSUFBSU4sUUFBUVAsSUFBSSxFQUFFO2dCQUNmTyxRQUFRUCxJQUFJLENBQVNNLElBQUksR0FBR08sTUFBTVAsSUFBSTtnQkFDckNDLFFBQVFQLElBQUksQ0FBU0ssRUFBRSxHQUFHUSxNQUFNUixFQUFFO1lBQ3RDO1lBQ0EsT0FBT0U7UUFDVDtJQUNGO0lBQ0FPLFFBQVFDLFFBQVFDLEdBQUcsQ0FBQ0MsZUFBZTtBQUNyQyxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWktYWZmaWxpYXRlLXBsYXRmb3JtLy4vbGliL2F1dGgudHM/YmY3ZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0QXV0aE9wdGlvbnMgfSBmcm9tICduZXh0LWF1dGgnXHJcbmltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gJ25leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHMnXHJcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnXHJcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJy4vcHJpc21hJ1xyXG5cclxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zOiBOZXh0QXV0aE9wdGlvbnMgPSB7XHJcbiAgcHJvdmlkZXJzOiBbXHJcbiAgICBDcmVkZW50aWFsc1Byb3ZpZGVyKHtcclxuICAgICAgbmFtZTogJ2NyZWRlbnRpYWxzJyxcclxuICAgICAgY3JlZGVudGlhbHM6IHtcclxuICAgICAgICBlbWFpbDogeyBsYWJlbDogJ0VtYWlsJywgdHlwZTogJ2VtYWlsJyB9LFxyXG4gICAgICAgIHBhc3N3b3JkOiB7IGxhYmVsOiAnUGFzc3dvcmQnLCB0eXBlOiAncGFzc3dvcmQnIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xyXG4gICAgICAgIGlmICghY3JlZGVudGlhbHM/LmVtYWlsIHx8ICFjcmVkZW50aWFscz8ucGFzc3dvcmQpIHJldHVybiBudWxsXHJcbiAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoeyB3aGVyZTogeyBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwgfSB9KVxyXG4gICAgICAgIGlmICghdXNlcikgcmV0dXJuIG51bGxcclxuICAgICAgICBjb25zdCB2YWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKGNyZWRlbnRpYWxzLnBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkKVxyXG4gICAgICAgIGlmICghdmFsaWQpIHJldHVybiBudWxsXHJcbiAgICAgICAgcmV0dXJuIHsgaWQ6IHVzZXIuaWQsIGVtYWlsOiB1c2VyLmVtYWlsLCBuYW1lOiB1c2VyLm5hbWUsIHJvbGU6IHVzZXIucm9sZSB9XHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIHNlc3Npb246IHsgc3RyYXRlZ3k6ICdqd3QnIH0sXHJcbiAgcGFnZXM6IHsgc2lnbkluOiAnL2xvZ2luJyB9LFxyXG4gIGNhbGxiYWNrczoge1xyXG4gICAgYXN5bmMgand0KHsgdG9rZW4sIHVzZXIgfSkge1xyXG4gICAgICBpZiAodXNlcikge1xyXG4gICAgICAgIHRva2VuLnJvbGUgPSAodXNlciBhcyBhbnkpLnJvbGVcclxuICAgICAgICB0b2tlbi5pZCA9IHVzZXIuaWRcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdG9rZW5cclxuICAgIH0sXHJcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xyXG4gICAgICBpZiAoc2Vzc2lvbi51c2VyKSB7XHJcbiAgICAgICAgKHNlc3Npb24udXNlciBhcyBhbnkpLnJvbGUgPSB0b2tlbi5yb2xlXHJcbiAgICAgICAgOyhzZXNzaW9uLnVzZXIgYXMgYW55KS5pZCA9IHRva2VuLmlkXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHNlc3Npb25cclxuICAgIH0sXHJcbiAgfSxcclxuICBzZWNyZXQ6IHByb2Nlc3MuZW52Lk5FWFRBVVRIX1NFQ1JFVCxcclxufVxyXG4iXSwibmFtZXMiOlsiQ3JlZGVudGlhbHNQcm92aWRlciIsImJjcnlwdCIsInByaXNtYSIsImF1dGhPcHRpb25zIiwicHJvdmlkZXJzIiwibmFtZSIsImNyZWRlbnRpYWxzIiwiZW1haWwiLCJsYWJlbCIsInR5cGUiLCJwYXNzd29yZCIsImF1dGhvcml6ZSIsInVzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJ2YWxpZCIsImNvbXBhcmUiLCJpZCIsInJvbGUiLCJzZXNzaW9uIiwic3RyYXRlZ3kiLCJwYWdlcyIsInNpZ25JbiIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwic2VjcmV0IiwicHJvY2VzcyIsImVudiIsIk5FWFRBVVRIX1NFQ1JFVCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient({\n    log:  true ? [\n        \"error\",\n        \"warn\"\n    ] : 0\n});\nif (true) globalForPrisma.prisma = prisma;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE2QztBQUU3QyxNQUFNQyxrQkFBa0JDO0FBSWpCLE1BQU1DLFNBQ1hGLGdCQUFnQkUsTUFBTSxJQUN0QixJQUFJSCx3REFBWUEsQ0FBQztJQUNmSSxLQUFLQyxLQUF5QixHQUFnQjtRQUFDO1FBQVM7S0FBTyxHQUFHLENBQVM7QUFDN0UsR0FBRTtBQUVKLElBQUlBLElBQXlCLEVBQWNKLGdCQUFnQkUsTUFBTSxHQUFHQSIsInNvdXJjZXMiOlsid2VicGFjazovL2FpLWFmZmlsaWF0ZS1wbGF0Zm9ybS8uL2xpYi9wcmlzbWEudHM/OTgyMiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICdAcHJpc21hL2NsaWVudCdcclxuXHJcbmNvbnN0IGdsb2JhbEZvclByaXNtYSA9IGdsb2JhbFRoaXMgYXMgdW5rbm93biBhcyB7XHJcbiAgcHJpc21hOiBQcmlzbWFDbGllbnQgfCB1bmRlZmluZWRcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHByaXNtYSA9XHJcbiAgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA/P1xyXG4gIG5ldyBQcmlzbWFDbGllbnQoe1xyXG4gICAgbG9nOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyA/IFsnZXJyb3InLCAnd2FybiddIDogWydlcnJvciddLFxyXG4gIH0pXHJcblxyXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA9IHByaXNtYVxyXG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsVGhpcyIsInByaXNtYSIsImxvZyIsInByb2Nlc3MiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva","vendor-chunks/formdata-node","vendor-chunks/openai","vendor-chunks/form-data-encoder","vendor-chunks/whatwg-url","vendor-chunks/agentkeepalive","vendor-chunks/tr46","vendor-chunks/web-streams-polyfill","vendor-chunks/node-fetch","vendor-chunks/webidl-conversions","vendor-chunks/ms","vendor-chunks/humanize-ms","vendor-chunks/event-target-shim","vendor-chunks/abort-controller"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Frecommendations%2Froute&page=%2Fapi%2Frecommendations%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Frecommendations%2Froute.ts&appDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();