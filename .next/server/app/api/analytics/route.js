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
exports.id = "app/api/analytics/route";
exports.ids = ["app/api/analytics/route"];
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fanalytics%2Froute&page=%2Fapi%2Fanalytics%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fanalytics%2Froute.ts&appDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fanalytics%2Froute&page=%2Fapi%2Fanalytics%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fanalytics%2Froute.ts&appDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_hiroy_Documents_ai_affiliate_platform_app_api_analytics_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/analytics/route.ts */ \"(rsc)/./app/api/analytics/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/analytics/route\",\n        pathname: \"/api/analytics\",\n        filename: \"route\",\n        bundlePath: \"app/api/analytics/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\hiroy\\\\Documents\\\\ai-affiliate-platform\\\\app\\\\api\\\\analytics\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_hiroy_Documents_ai_affiliate_platform_app_api_analytics_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/analytics/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhbmFseXRpY3MlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmFuYWx5dGljcyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmFuYWx5dGljcyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNoaXJveSU1Q0RvY3VtZW50cyU1Q2FpLWFmZmlsaWF0ZS1wbGF0Zm9ybSU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDaGlyb3klNUNEb2N1bWVudHMlNUNhaS1hZmZpbGlhdGUtcGxhdGZvcm0maXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ2lDO0FBQzlHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYWktYWZmaWxpYXRlLXBsYXRmb3JtLz8xMjE1Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXGhpcm95XFxcXERvY3VtZW50c1xcXFxhaS1hZmZpbGlhdGUtcGxhdGZvcm1cXFxcYXBwXFxcXGFwaVxcXFxhbmFseXRpY3NcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2FuYWx5dGljcy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2FuYWx5dGljc1wiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYW5hbHl0aWNzL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcaGlyb3lcXFxcRG9jdW1lbnRzXFxcXGFpLWFmZmlsaWF0ZS1wbGF0Zm9ybVxcXFxhcHBcXFxcYXBpXFxcXGFuYWx5dGljc1xcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYW5hbHl0aWNzL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIG9yaWdpbmFsUGF0aG5hbWUsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fanalytics%2Froute&page=%2Fapi%2Fanalytics%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fanalytics%2Froute.ts&appDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/analytics/route.ts":
/*!************************************!*\
  !*** ./app/api/analytics/route.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../lib/auth */ \"(rsc)/./lib/auth.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\n\nasync function GET(req) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Unauthorized\"\n    }, {\n        status: 401\n    });\n    const { searchParams } = new URL(req.url);\n    const siteId = searchParams.get(\"siteId\");\n    const days = parseInt(searchParams.get(\"days\") || \"30\");\n    const device = searchParams.get(\"device\") || \"ALL\";\n    const startDate = new Date();\n    startDate.setDate(startDate.getDate() - days);\n    const where = {\n        date: {\n            gte: startDate\n        }\n    };\n    if (siteId) {\n        // Verify ownership\n        const site = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.site.findFirst({\n            where: {\n                id: siteId,\n                userId: session.user.id\n            }\n        });\n        if (!site) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Not found\"\n        }, {\n            status: 404\n        });\n        where.siteId = siteId;\n    } else {\n        const sites = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.site.findMany({\n            where: {\n                userId: session.user.id\n            },\n            select: {\n                id: true\n            }\n        });\n        where.siteId = {\n            in: sites.map((s)=>s.id)\n        };\n    }\n    if (device !== \"ALL\") where.device = device;\n    const analytics = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.analytics.findMany({\n        where,\n        orderBy: {\n            date: \"asc\"\n        }\n    });\n    // Aggregate totals\n    const totals = analytics.reduce((acc, row)=>({\n            pageViews: acc.pageViews + row.pageViews,\n            visits: acc.visits + row.visits,\n            clicks: acc.clicks + row.clicks,\n            conversions: acc.conversions + row.conversions,\n            revenue: acc.revenue + row.revenue\n        }), {\n        pageViews: 0,\n        visits: 0,\n        clicks: 0,\n        conversions: 0,\n        revenue: 0\n    });\n    const ctr = totals.pageViews > 0 ? totals.clicks / totals.pageViews * 100 : 0;\n    const cvr = totals.clicks > 0 ? totals.conversions / totals.clicks * 100 : 0;\n    // Device breakdown\n    const deviceBreakdown = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__.prisma.analytics.groupBy({\n        by: [\n            \"device\"\n        ],\n        where,\n        _sum: {\n            pageViews: true,\n            clicks: true,\n            conversions: true,\n            revenue: true\n        }\n    });\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        analytics,\n        totals: {\n            ...totals,\n            ctr: ctr.toFixed(2),\n            cvr: cvr.toFixed(2)\n        },\n        deviceBreakdown\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2FuYWx5dGljcy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBdUQ7QUFDWDtBQUNHO0FBQ0g7QUFFckMsZUFBZUksSUFBSUMsR0FBZ0I7SUFDeEMsTUFBTUMsVUFBVSxNQUFNTCwyREFBZ0JBLENBQUNDLGtEQUFXQTtJQUNsRCxJQUFJLENBQUNJLFNBQVMsT0FBT04scURBQVlBLENBQUNPLElBQUksQ0FBQztRQUFFQyxPQUFPO0lBQWUsR0FBRztRQUFFQyxRQUFRO0lBQUk7SUFFaEYsTUFBTSxFQUFFQyxZQUFZLEVBQUUsR0FBRyxJQUFJQyxJQUFJTixJQUFJTyxHQUFHO0lBQ3hDLE1BQU1DLFNBQVNILGFBQWFJLEdBQUcsQ0FBQztJQUNoQyxNQUFNQyxPQUFPQyxTQUFTTixhQUFhSSxHQUFHLENBQUMsV0FBVztJQUNsRCxNQUFNRyxTQUFTUCxhQUFhSSxHQUFHLENBQUMsYUFBYTtJQUU3QyxNQUFNSSxZQUFZLElBQUlDO0lBQ3RCRCxVQUFVRSxPQUFPLENBQUNGLFVBQVVHLE9BQU8sS0FBS047SUFFeEMsTUFBTU8sUUFBYTtRQUNqQkMsTUFBTTtZQUFFQyxLQUFLTjtRQUFVO0lBQ3pCO0lBRUEsSUFBSUwsUUFBUTtRQUNWLG1CQUFtQjtRQUNuQixNQUFNWSxPQUFPLE1BQU10QiwrQ0FBTUEsQ0FBQ3NCLElBQUksQ0FBQ0MsU0FBUyxDQUFDO1lBQ3ZDSixPQUFPO2dCQUFFSyxJQUFJZDtnQkFBUWUsUUFBUSxRQUFTQyxJQUFJLENBQVNGLEVBQUU7WUFBQztRQUN4RDtRQUNBLElBQUksQ0FBQ0YsTUFBTSxPQUFPekIscURBQVlBLENBQUNPLElBQUksQ0FBQztZQUFFQyxPQUFPO1FBQVksR0FBRztZQUFFQyxRQUFRO1FBQUk7UUFDMUVhLE1BQU1ULE1BQU0sR0FBR0E7SUFDakIsT0FBTztRQUNMLE1BQU1pQixRQUFRLE1BQU0zQiwrQ0FBTUEsQ0FBQ3NCLElBQUksQ0FBQ00sUUFBUSxDQUFDO1lBQ3ZDVCxPQUFPO2dCQUFFTSxRQUFRLFFBQVNDLElBQUksQ0FBU0YsRUFBRTtZQUFDO1lBQzFDSyxRQUFRO2dCQUFFTCxJQUFJO1lBQUs7UUFDckI7UUFDQUwsTUFBTVQsTUFBTSxHQUFHO1lBQUVvQixJQUFJSCxNQUFNSSxHQUFHLENBQUMsQ0FBQ0MsSUFBTUEsRUFBRVIsRUFBRTtRQUFFO0lBQzlDO0lBRUEsSUFBSVYsV0FBVyxPQUFPSyxNQUFNTCxNQUFNLEdBQUdBO0lBRXJDLE1BQU1tQixZQUFZLE1BQU1qQywrQ0FBTUEsQ0FBQ2lDLFNBQVMsQ0FBQ0wsUUFBUSxDQUFDO1FBQ2hEVDtRQUNBZSxTQUFTO1lBQUVkLE1BQU07UUFBTTtJQUN6QjtJQUVBLG1CQUFtQjtJQUNuQixNQUFNZSxTQUFTRixVQUFVRyxNQUFNLENBQzdCLENBQUNDLEtBQUtDLE1BQVM7WUFDYkMsV0FBV0YsSUFBSUUsU0FBUyxHQUFHRCxJQUFJQyxTQUFTO1lBQ3hDQyxRQUFRSCxJQUFJRyxNQUFNLEdBQUdGLElBQUlFLE1BQU07WUFDL0JDLFFBQVFKLElBQUlJLE1BQU0sR0FBR0gsSUFBSUcsTUFBTTtZQUMvQkMsYUFBYUwsSUFBSUssV0FBVyxHQUFHSixJQUFJSSxXQUFXO1lBQzlDQyxTQUFTTixJQUFJTSxPQUFPLEdBQUdMLElBQUlLLE9BQU87UUFDcEMsSUFDQTtRQUFFSixXQUFXO1FBQUdDLFFBQVE7UUFBR0MsUUFBUTtRQUFHQyxhQUFhO1FBQUdDLFNBQVM7SUFBRTtJQUduRSxNQUFNQyxNQUFNVCxPQUFPSSxTQUFTLEdBQUcsSUFBSSxPQUFRRSxNQUFNLEdBQUdOLE9BQU9JLFNBQVMsR0FBSSxNQUFNO0lBQzlFLE1BQU1NLE1BQU1WLE9BQU9NLE1BQU0sR0FBRyxJQUFJLE9BQVFDLFdBQVcsR0FBR1AsT0FBT00sTUFBTSxHQUFJLE1BQU07SUFFN0UsbUJBQW1CO0lBQ25CLE1BQU1LLGtCQUFrQixNQUFNOUMsK0NBQU1BLENBQUNpQyxTQUFTLENBQUNjLE9BQU8sQ0FBQztRQUNyREMsSUFBSTtZQUFDO1NBQVM7UUFDZDdCO1FBQ0E4QixNQUFNO1lBQUVWLFdBQVc7WUFBTUUsUUFBUTtZQUFNQyxhQUFhO1lBQU1DLFNBQVM7UUFBSztJQUMxRTtJQUVBLE9BQU85QyxxREFBWUEsQ0FBQ08sSUFBSSxDQUFDO1FBQ3ZCNkI7UUFDQUUsUUFBUTtZQUFFLEdBQUdBLE1BQU07WUFBRVMsS0FBS0EsSUFBSU0sT0FBTyxDQUFDO1lBQUlMLEtBQUtBLElBQUlLLE9BQU8sQ0FBQztRQUFHO1FBQzlESjtJQUNGO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9haS1hZmZpbGlhdGUtcGxhdGZvcm0vLi9hcHAvYXBpL2FuYWx5dGljcy9yb3V0ZS50cz84OWFjIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcclxuaW1wb3J0IHsgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gJ25leHQtYXV0aCdcclxuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9saWIvYXV0aCdcclxuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSAnLi4vLi4vLi4vbGliL3ByaXNtYSdcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxOiBOZXh0UmVxdWVzdCkge1xyXG4gIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBnZXRTZXJ2ZXJTZXNzaW9uKGF1dGhPcHRpb25zKVxyXG4gIGlmICghc2Vzc2lvbikgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH0sIHsgc3RhdHVzOiA0MDEgfSlcclxuXHJcbiAgY29uc3QgeyBzZWFyY2hQYXJhbXMgfSA9IG5ldyBVUkwocmVxLnVybClcclxuICBjb25zdCBzaXRlSWQgPSBzZWFyY2hQYXJhbXMuZ2V0KCdzaXRlSWQnKVxyXG4gIGNvbnN0IGRheXMgPSBwYXJzZUludChzZWFyY2hQYXJhbXMuZ2V0KCdkYXlzJykgfHwgJzMwJylcclxuICBjb25zdCBkZXZpY2UgPSBzZWFyY2hQYXJhbXMuZ2V0KCdkZXZpY2UnKSB8fCAnQUxMJ1xyXG5cclxuICBjb25zdCBzdGFydERhdGUgPSBuZXcgRGF0ZSgpXHJcbiAgc3RhcnREYXRlLnNldERhdGUoc3RhcnREYXRlLmdldERhdGUoKSAtIGRheXMpXHJcblxyXG4gIGNvbnN0IHdoZXJlOiBhbnkgPSB7XHJcbiAgICBkYXRlOiB7IGd0ZTogc3RhcnREYXRlIH0sXHJcbiAgfVxyXG5cclxuICBpZiAoc2l0ZUlkKSB7XHJcbiAgICAvLyBWZXJpZnkgb3duZXJzaGlwXHJcbiAgICBjb25zdCBzaXRlID0gYXdhaXQgcHJpc21hLnNpdGUuZmluZEZpcnN0KHtcclxuICAgICAgd2hlcmU6IHsgaWQ6IHNpdGVJZCwgdXNlcklkOiAoc2Vzc2lvbi51c2VyIGFzIGFueSkuaWQgfSxcclxuICAgIH0pXHJcbiAgICBpZiAoIXNpdGUpIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTm90IGZvdW5kJyB9LCB7IHN0YXR1czogNDA0IH0pXHJcbiAgICB3aGVyZS5zaXRlSWQgPSBzaXRlSWRcclxuICB9IGVsc2Uge1xyXG4gICAgY29uc3Qgc2l0ZXMgPSBhd2FpdCBwcmlzbWEuc2l0ZS5maW5kTWFueSh7XHJcbiAgICAgIHdoZXJlOiB7IHVzZXJJZDogKHNlc3Npb24udXNlciBhcyBhbnkpLmlkIH0sXHJcbiAgICAgIHNlbGVjdDogeyBpZDogdHJ1ZSB9LFxyXG4gICAgfSlcclxuICAgIHdoZXJlLnNpdGVJZCA9IHsgaW46IHNpdGVzLm1hcCgocykgPT4gcy5pZCkgfVxyXG4gIH1cclxuXHJcbiAgaWYgKGRldmljZSAhPT0gJ0FMTCcpIHdoZXJlLmRldmljZSA9IGRldmljZVxyXG5cclxuICBjb25zdCBhbmFseXRpY3MgPSBhd2FpdCBwcmlzbWEuYW5hbHl0aWNzLmZpbmRNYW55KHtcclxuICAgIHdoZXJlLFxyXG4gICAgb3JkZXJCeTogeyBkYXRlOiAnYXNjJyB9LFxyXG4gIH0pXHJcblxyXG4gIC8vIEFnZ3JlZ2F0ZSB0b3RhbHNcclxuICBjb25zdCB0b3RhbHMgPSBhbmFseXRpY3MucmVkdWNlKFxyXG4gICAgKGFjYywgcm93KSA9PiAoe1xyXG4gICAgICBwYWdlVmlld3M6IGFjYy5wYWdlVmlld3MgKyByb3cucGFnZVZpZXdzLFxyXG4gICAgICB2aXNpdHM6IGFjYy52aXNpdHMgKyByb3cudmlzaXRzLFxyXG4gICAgICBjbGlja3M6IGFjYy5jbGlja3MgKyByb3cuY2xpY2tzLFxyXG4gICAgICBjb252ZXJzaW9uczogYWNjLmNvbnZlcnNpb25zICsgcm93LmNvbnZlcnNpb25zLFxyXG4gICAgICByZXZlbnVlOiBhY2MucmV2ZW51ZSArIHJvdy5yZXZlbnVlLFxyXG4gICAgfSksXHJcbiAgICB7IHBhZ2VWaWV3czogMCwgdmlzaXRzOiAwLCBjbGlja3M6IDAsIGNvbnZlcnNpb25zOiAwLCByZXZlbnVlOiAwIH1cclxuICApXHJcblxyXG4gIGNvbnN0IGN0ciA9IHRvdGFscy5wYWdlVmlld3MgPiAwID8gKHRvdGFscy5jbGlja3MgLyB0b3RhbHMucGFnZVZpZXdzKSAqIDEwMCA6IDBcclxuICBjb25zdCBjdnIgPSB0b3RhbHMuY2xpY2tzID4gMCA/ICh0b3RhbHMuY29udmVyc2lvbnMgLyB0b3RhbHMuY2xpY2tzKSAqIDEwMCA6IDBcclxuXHJcbiAgLy8gRGV2aWNlIGJyZWFrZG93blxyXG4gIGNvbnN0IGRldmljZUJyZWFrZG93biA9IGF3YWl0IHByaXNtYS5hbmFseXRpY3MuZ3JvdXBCeSh7XHJcbiAgICBieTogWydkZXZpY2UnXSxcclxuICAgIHdoZXJlLFxyXG4gICAgX3N1bTogeyBwYWdlVmlld3M6IHRydWUsIGNsaWNrczogdHJ1ZSwgY29udmVyc2lvbnM6IHRydWUsIHJldmVudWU6IHRydWUgfSxcclxuICB9KVxyXG5cclxuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xyXG4gICAgYW5hbHl0aWNzLFxyXG4gICAgdG90YWxzOiB7IC4uLnRvdGFscywgY3RyOiBjdHIudG9GaXhlZCgyKSwgY3ZyOiBjdnIudG9GaXhlZCgyKSB9LFxyXG4gICAgZGV2aWNlQnJlYWtkb3duLFxyXG4gIH0pXHJcbn1cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImdldFNlcnZlclNlc3Npb24iLCJhdXRoT3B0aW9ucyIsInByaXNtYSIsIkdFVCIsInJlcSIsInNlc3Npb24iLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJzZWFyY2hQYXJhbXMiLCJVUkwiLCJ1cmwiLCJzaXRlSWQiLCJnZXQiLCJkYXlzIiwicGFyc2VJbnQiLCJkZXZpY2UiLCJzdGFydERhdGUiLCJEYXRlIiwic2V0RGF0ZSIsImdldERhdGUiLCJ3aGVyZSIsImRhdGUiLCJndGUiLCJzaXRlIiwiZmluZEZpcnN0IiwiaWQiLCJ1c2VySWQiLCJ1c2VyIiwic2l0ZXMiLCJmaW5kTWFueSIsInNlbGVjdCIsImluIiwibWFwIiwicyIsImFuYWx5dGljcyIsIm9yZGVyQnkiLCJ0b3RhbHMiLCJyZWR1Y2UiLCJhY2MiLCJyb3ciLCJwYWdlVmlld3MiLCJ2aXNpdHMiLCJjbGlja3MiLCJjb252ZXJzaW9ucyIsInJldmVudWUiLCJjdHIiLCJjdnIiLCJkZXZpY2VCcmVha2Rvd24iLCJncm91cEJ5IiwiYnkiLCJfc3VtIiwidG9GaXhlZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/analytics/route.ts\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fanalytics%2Froute&page=%2Fapi%2Fanalytics%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fanalytics%2Froute.ts&appDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chiroy%5CDocuments%5Cai-affiliate-platform&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();