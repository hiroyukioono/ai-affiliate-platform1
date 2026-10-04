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
exports.id = "app/api/sites/[id]/route";
exports.ids = ["app/api/sites/[id]/route"];
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

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

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

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsites%2F%5Bid%5D%2Froute&page=%2Fapi%2Fsites%2F%5Bid%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsites%2F%5Bid%5D%2Froute.ts&appDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsites%2F%5Bid%5D%2Froute&page=%2Fapi%2Fsites%2F%5Bid%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsites%2F%5Bid%5D%2Froute.ts&appDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_hiroy_Documents_ai_affiliate_platform_app_api_sites_id_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/sites/[id]/route.ts */ \"(rsc)/./app/api/sites/[id]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/sites/[id]/route\",\n        pathname: \"/api/sites/[id]\",\n        filename: \"route\",\n        bundlePath: \"app/api/sites/[id]/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\hiroy\\\\Documents\\\\ai-affiliate-platform\\\\app\\\\api\\\\sites\\\\[id]\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_hiroy_Documents_ai_affiliate_platform_app_api_sites_id_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/sites/[id]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzaXRlcyUyRiU1QmlkJTVEJTJGcm91dGUmcGFnZT0lMkZhcGklMkZzaXRlcyUyRiU1QmlkJTVEJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGc2l0ZXMlMkYlNUJpZCU1RCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNoaXJveSU1Q0RvY3VtZW50cyU1Q2FpLWFmZmlsaWF0ZS1wbGF0Zm9ybSU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDaGlyb3klNUNEb2N1bWVudHMlNUNhaS1hZmZpbGlhdGUtcGxhdGZvcm0maXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ21DO0FBQ2hIO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWktYWZmaWxpYXRlLXBsYXRmb3JtLz84ZjU2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXGhpcm95XFxcXERvY3VtZW50c1xcXFxhaS1hZmZpbGlhdGUtcGxhdGZvcm1cXFxcYXBwXFxcXGFwaVxcXFxzaXRlc1xcXFxbaWRdXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9zaXRlcy9baWRdL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvc2l0ZXMvW2lkXVwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvc2l0ZXMvW2lkXS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXGhpcm95XFxcXERvY3VtZW50c1xcXFxhaS1hZmZpbGlhdGUtcGxhdGZvcm1cXFxcYXBwXFxcXGFwaVxcXFxzaXRlc1xcXFxbaWRdXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9zaXRlcy9baWRdL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsites%2F%5Bid%5D%2Froute&page=%2Fapi%2Fsites%2F%5Bid%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsites%2F%5Bid%5D%2Froute.ts&appDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/sites/[id]/route.ts":
/*!*************************************!*\
  !*** ./app/api/sites/[id]/route.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   DELETE: () => (/* binding */ DELETE),\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   PUT: () => (/* binding */ PUT)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../lib/auth */ \"(rsc)/./lib/auth.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\nasync function GET({ params }) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Unauthorized\"\n    }, {\n        status: 401\n    });\n    const site = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.site.findFirst({\n        where: {\n            id: params.id,\n            userId: session.user.id\n        },\n        include: {\n            theme: true,\n            mobilePrompt: true,\n            pages: {\n                orderBy: {\n                    sortOrder: \"asc\"\n                }\n            },\n            affiliateLinks: {\n                include: {\n                    program: true\n                }\n            },\n            mobileSettings: true,\n            versions: {\n                orderBy: {\n                    version: \"desc\"\n                },\n                take: 10\n            }\n        }\n    });\n    if (!site) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Not found\"\n    }, {\n        status: 404\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        site\n    });\n}\nasync function PUT(req, { params }) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Unauthorized\"\n    }, {\n        status: 401\n    });\n    const site = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.site.findFirst({\n        where: {\n            id: params.id,\n            userId: session.user.id\n        }\n    });\n    if (!site) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Not found\"\n    }, {\n        status: 404\n    });\n    const body = await req.json();\n    const { name, description, affiliateTitle, affiliateUrl, themeId, mobilePromptId, metaTitle, metaDescription, metaKeywords, status } = body;\n    const updatedSite = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.site.update({\n        where: {\n            id: params.id\n        },\n        data: {\n            ...name && {\n                name\n            },\n            ...description !== undefined && {\n                description\n            },\n            ...affiliateTitle && {\n                affiliateTitle\n            },\n            ...affiliateUrl !== undefined && {\n                affiliateUrl\n            },\n            ...themeId !== undefined && {\n                themeId\n            },\n            ...mobilePromptId !== undefined && {\n                mobilePromptId\n            },\n            ...metaTitle !== undefined && {\n                metaTitle\n            },\n            ...metaDescription !== undefined && {\n                metaDescription\n            },\n            ...metaKeywords !== undefined && {\n                metaKeywords\n            },\n            ...status && {\n                status,\n                publishedAt: status === \"PUBLISHED\" ? new Date() : undefined\n            }\n        }\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        site: updatedSite\n    });\n}\nasync function DELETE(req, { params }) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Unauthorized\"\n    }, {\n        status: 401\n    });\n    const site = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.site.findFirst({\n        where: {\n            id: params.id,\n            userId: session.user.id\n        }\n    });\n    if (!site) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Not found\"\n    }, {\n        status: 404\n    });\n    await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.site.delete({\n        where: {\n            id: params.id\n        }\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        success: true\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q2xELEdBQUk5QixVQUFVO2dCQUFFQTtnQkFBUW1DLGFBQWFuQyxXQUFXLGNBQWMsSUFBSW9DLFNBQVNGO1lBQVUsQ0FBQztRQUN4RjtJQUNGO0lBRUEsT0FBTzNDLHFEQUFZQSxDQUFDTyxJQUFJLENBQUM7UUFBRUcsTUFBTThCO0lBQVk7QUFDL0M7QUFFTyxlQUFlTSxPQUFPakIsR0FBZ0IsRUFBRSxFQUFFeEIsTUFBTSxFQUE4QjtJQUNuRixNQUFNQyxVQUFVLE1BQU1MLDJEQUFnQkEsQ0FBQ0Msa0RBQVdBO0lBQ2xELElBQUksQ0FBQ0ksU0FBUyxPQUFPTixxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO1FBQUVDLE9BQU87SUFBZSxHQUFHO1FBQUVDLFFBQVE7SUFBSTtJQUVoRixNQUFNQyxPQUFPLE1BQU1QLCtDQUFNQSxDQUFDTyxJQUFJLENBQUNDLFNBQVMsQ0FBQztRQUN2Q0MsT0FBTztZQUFFQyxJQUFJUixPQUFPUSxFQUFFO1lBQUVDLFFBQVEsUUFBU0MsSUFBSSxDQUFTRixFQUFFO1FBQUM7SUFDM0Q7SUFDQSxJQUFJLENBQUNILE1BQU0sT0FBT1YscURBQVlBLENBQUNPLElBQUksQ0FBQztRQUFFQyxPQUFPO0lBQVksR0FBRztRQUFFQyxRQUFRO0lBQUk7SUFFMUUsTUFBTU4sK0NBQU1BLENBQUNPLElBQUksQ0FBQ3FDLE1BQU0sQ0FBQztRQUFFbkMsT0FBTztZQUFFQyxJQUFJUixPQUFPUSxFQUFFO1FBQUM7SUFBRTtJQUVwRCxPQUFPYixxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO1FBQUV5QyxTQUFTO0lBQUs7QUFDM0MiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9haS1hZmZpbGlhdGUtcGxhdGZvcm0vLi9hcHAvYXBpL3NpdGVzL1tpZF0vcm91dGUudHM/ODc0NyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXHJcbmltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgnXHJcbmltcG9ydCB7IGF1dGhPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vbGliL2F1dGgnXHJcbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJy4uLy4uLy4uLy4uL2xpYi9wcmlzbWEnXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHsgcGFyYW1zIH06IHsgcGFyYW1zOiB7IGlkOiBzdHJpbmcgfSB9KSB7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpXHJcbiAgaWYgKCFzZXNzaW9uKSByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfSwgeyBzdGF0dXM6IDQwMSB9KVxyXG5cclxuICBjb25zdCBzaXRlID0gYXdhaXQgcHJpc21hLnNpdGUuZmluZEZpcnN0KHtcclxuICAgIHdoZXJlOiB7IGlkOiBwYXJhbXMuaWQsIHVzZXJJZDogKHNlc3Npb24udXNlciBhcyBhbnkpLmlkIH0sXHJcbiAgICBpbmNsdWRlOiB7XHJcbiAgICAgIHRoZW1lOiB0cnVlLFxyXG4gICAgICBtb2JpbGVQcm9tcHQ6IHRydWUsXHJcbiAgICAgIHBhZ2VzOiB7IG9yZGVyQnk6IHsgc29ydE9yZGVyOiAnYXNjJyB9IH0sXHJcbiAgICAgIGFmZmlsaWF0ZUxpbmtzOiB7IGluY2x1ZGU6IHsgcHJvZ3JhbTogdHJ1ZSB9IH0sXHJcbiAgICAgIG1vYmlsZVNldHRpbmdzOiB0cnVlLFxyXG4gICAgICB2ZXJzaW9uczogeyBvcmRlckJ5OiB7IHZlcnNpb246ICdkZXNjJyB9LCB0YWtlOiAxMCB9LFxyXG4gICAgfSxcclxuICB9KVxyXG5cclxuICBpZiAoIXNpdGUpIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTm90IGZvdW5kJyB9LCB7IHN0YXR1czogNDA0IH0pXHJcbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc2l0ZSB9KVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUFVUKHJlcTogTmV4dFJlcXVlc3QsIHsgcGFyYW1zIH06IHsgcGFyYW1zOiB7IGlkOiBzdHJpbmcgfSB9KSB7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpXHJcbiAgaWYgKCFzZXNzaW9uKSByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1VuYXV0aG9yaXplZCcgfSwgeyBzdGF0dXM6IDQwMSB9KVxyXG5cclxuICBjb25zdCBzaXRlID0gYXdhaXQgcHJpc21hLnNpdGUuZmluZEZpcnN0KHtcclxuICAgIHdoZXJlOiB7IGlkOiBwYXJhbXMuaWQsIHVzZXJJZDogKHNlc3Npb24udXNlciBhcyBhbnkpLmlkIH0sXHJcbiAgfSlcclxuICBpZiAoIXNpdGUpIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTm90IGZvdW5kJyB9LCB7IHN0YXR1czogNDA0IH0pXHJcblxyXG4gIGNvbnN0IGJvZHkgPSBhd2FpdCByZXEuanNvbigpXHJcbiAgY29uc3QgeyBuYW1lLCBkZXNjcmlwdGlvbiwgYWZmaWxpYXRlVGl0bGUsIGFmZmlsaWF0ZVVybCwgdGhlbWVJZCwgbW9iaWxlUHJvbXB0SWQsXHJcbiAgICAgICAgICBtZXRhVGl0bGUsIG1ldGFEZXNjcmlwdGlvbiwgbWV0YUtleXdvcmRzLCBzdGF0dXMgfSA9IGJvZHlcclxuXHJcbiAgY29uc3QgdXBkYXRlZFNpdGUgPSBhd2FpdCBwcmlzbWEuc2l0ZS51cGRhdGUoe1xyXG4gICAgd2hlcmU6IHsgaWQ6IHBhcmFtcy5pZCB9LFxyXG4gICAgZGF0YToge1xyXG4gICAgICAuLi4obmFtZSAmJiB7IG5hbWUgfSksXHJcbiAgICAgIC4uLihkZXNjcmlwdGlvbiAhPT0gdW5kZWZpbmVkICYmIHsgZGVzY3JpcHRpb24gfSksXHJcbiAgICAgIC4uLihhZmZpbGlhdGVUaXRsZSAmJiB7IGFmZmlsaWF0ZVRpdGxlIH0pLFxyXG4gICAgICAuLi4oYWZmaWxpYXRlVXJsICE9PSB1bmRlZmluZWQgJiYgeyBhZmZpbGlhdGVVcmwgfSksXHJcbiAgICAgIC4uLih0aGVtZUlkICE9PSB1bmRlZmluZWQgJiYgeyB0aGVtZUlkIH0pLFxyXG4gICAgICAuLi4obW9iaWxlUHJvbXB0SWQgIT09IHVuZGVmaW5lZCAmJiB7IG1vYmlsZVByb21wdElkIH0pLFxyXG4gICAgICAuLi4obWV0YVRpdGxlICE9PSB1bmRlZmluZWQgJiYgeyBtZXRhVGl0bGUgfSksXHJcbiAgICAgIC4uLihtZXRhRGVzY3JpcHRpb24gIT09IHVuZGVmaW5lZCAmJiB7IG1ldGFEZXNjcmlwdGlvbiB9KSxcclxuICAgICAgLi4uKG1ldGFLZXl3b3JkcyAhPT0gdW5kZWZpbmVkICYmIHsgbWV0YUtleXdvcmRzIH0pLFxyXG4gICAgICAuLi4oc3RhdHVzICYmIHsgc3RhdHVzLCBwdWJsaXNoZWRBdDogc3RhdHVzID09PSAnUFVCTElTSEVEJyA/IG5ldyBEYXRlKCkgOiB1bmRlZmluZWQgfSksXHJcbiAgICB9LFxyXG4gIH0pXHJcblxyXG4gIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHNpdGU6IHVwZGF0ZWRTaXRlIH0pXHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBERUxFVEUocmVxOiBOZXh0UmVxdWVzdCwgeyBwYXJhbXMgfTogeyBwYXJhbXM6IHsgaWQ6IHN0cmluZyB9IH0pIHtcclxuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucylcclxuICBpZiAoIXNlc3Npb24pIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9LCB7IHN0YXR1czogNDAxIH0pXHJcblxyXG4gIGNvbnN0IHNpdGUgPSBhd2FpdCBwcmlzbWEuc2l0ZS5maW5kRmlyc3Qoe1xyXG4gICAgd2hlcmU6IHsgaWQ6IHBhcmFtcy5pZCwgdXNlcklkOiAoc2Vzc2lvbi51c2VyIGFzIGFueSkuaWQgfSxcclxuICB9KVxyXG4gIGlmICghc2l0ZSkgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdOb3QgZm91bmQnIH0sIHsgc3RhdHVzOiA0MDQgfSlcclxuXHJcbiAgYXdhaXQgcHJpc21hLnNpdGUuZGVsZXRlKHsgd2hlcmU6IHsgaWQ6IHBhcmFtcy5pZCB9IH0pXHJcblxyXG4gIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IHRydWUgfSlcclxufVxyXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZ2V0U2VydmVyU2Vzc2lvbiIsImF1dGhPcHRpb25zIiwicHJpc21hIiwiR0VUIiwicGFyYW1zIiwic2Vzc2lvbiIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsInNpdGUiLCJmaW5kRmlyc3QiLCJ3aGVyZSIsImlkIiwidXNlcklkIiwidXNlciIsImluY2x1ZGUiLCJ0aGVtZSIsIm1vYmlsZVByb21wdCIsInBhZ2VzIiwib3JkZXJCeSIsInNvcnRPcmRlciIsImFmZmlsaWF0ZUxpbmtzIiwicHJvZ3JhbSIsIm1vYmlsZVNldHRpbmdzIiwidmVyc2lvbnMiLCJ2ZXJzaW9uIiwidGFrZSIsIlBVVCIsInJlcSIsImJvZHkiLCJuYW1lIiwiZGVzY3JpcHRpb24iLCJhZmZpbGlhdGVUaXRsZSIsImFmZmlsaWF0ZVVybCIsInRoZW1lSWQiLCJtb2JpbGVQcm9tcHRJZCIsIm1ldGFUaXRsZSIsIm1ldGFEZXNjcmlwdGlvbiIsIm1ldGFLZXl3b3JkcyIsInVwZGF0ZWRTaXRlIiwidXBkYXRlIiwiZGF0YSIsInVuZGVmaW5lZCIsInB1Ymxpc2hlZEF0IiwiRGF0ZSIsIkRFTEVURSIsImRlbGV0ZSIsInN1Y2Nlc3MiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/sites/[id]/route.ts\n");

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
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/@babel","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fsites%2F%5Bid%5D%2Froute&page=%2Fapi%2Fsites%2F%5Bid%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fsites%2F%5Bid%5D%2Froute.ts&appDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();