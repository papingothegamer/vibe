"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/page",{

/***/ "(app-pages-browser)/./lib/supabase-server.ts":
/*!********************************!*\
  !*** ./lib/supabase-server.ts ***!
  \********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createServerSupabaseClient: () => (/* binding */ createServerSupabaseClient)\n/* harmony export */ });\n/* harmony import */ var private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! private-next-rsc-action-client-wrapper */ \"(app-pages-browser)/./node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js\");\n/* harmony import */ var private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__);\n/* __next_internal_action_entry_do_not_use__ {\"008c163e794c1e2b0afe0c53af0a43a2fcdc654ebb\":\"createServerSupabaseClient\"} */ \nvar createServerSupabaseClient = /*#__PURE__*/ (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__.createServerReference)(\"008c163e794c1e2b0afe0c53af0a43a2fcdc654ebb\", private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__.callServer, void 0, private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__.findSourceMapURL, \"createServerSupabaseClient\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2xpYi9zdXBhYmFzZS1zZXJ2ZXIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztJQU1zQkEsMkNBQUFBLDZGQUFBQSwrQ0FBQUEsOEVBQUFBLFVBQUFBLG9GQUFBQSIsInNvdXJjZXMiOlsiL1VzZXJzL3RvbHV3YW5pbWlkYXJhbW9sYS9Eb2N1bWVudHMvUHJvamVjdHMvdmliZS9saWIvc3VwYWJhc2Utc2VydmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHNlcnZlclwiXG5cbmltcG9ydCB7IGNyZWF0ZVNlcnZlckNvbXBvbmVudENsaWVudCB9IGZyb20gXCJAc3VwYWJhc2UvYXV0aC1oZWxwZXJzLW5leHRqc1wiXG5pbXBvcnQgeyBjb29raWVzIH0gZnJvbSBcIm5leHQvaGVhZGVyc1wiXG5pbXBvcnQgdHlwZSB7IERhdGFiYXNlIH0gZnJvbSBcIi4vZGF0YWJhc2UudHlwZXNcIlxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2VydmVyU3VwYWJhc2VDbGllbnQoKSB7XG5cbiAgXG4gIGNvbnN0IGNvb2tpZVN0b3JlID0gY29va2llcygpXG4gIHJldHVybiBjcmVhdGVTZXJ2ZXJDb21wb25lbnRDbGllbnQ8RGF0YWJhc2U+KHtcbiAgICBjb29raWVzOiAoKSA9PiBjb29raWVTdG9yZSxcbiAgfSlcbn1cblxuIl0sIm5hbWVzIjpbImNyZWF0ZVNlcnZlclN1cGFiYXNlQ2xpZW50Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./lib/supabase-server.ts\n"));

/***/ })

});