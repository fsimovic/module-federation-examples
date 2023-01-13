const resolveRequire = () => {

}


const resolveEntry = () => {

}


const setUpkgModule = (packageName, version) => {
    return {
      eager: false,
      from: "@deletages/app3",
      get: () => {
        return import(/* webpackIgnore: true */ `https://esm.sh/${packageName}@${version}`).then((m) => {
          return ()=> m
        });
      },
      loaded: 0,
    }
}



module.exports = new Promise((resolve, reject) => {
  const currentRequest = new URL(__resourceQuery, __webpack_base_uri__).searchParams.get("remote");
  const [global, url] = currentRequest.split('@');
  const __webpack_error__ = new Error()
  __webpack_require__.l(
    url,
    function (event) {
      if (typeof window[global] !== 'undefined') return resolve(window[global]);
      var realSrc = event && event.target && event.target.src;
      __webpack_error__.message = 'Loading script failed.\\n(' + event.message + ': ' + realSrc + ')';
      __webpack_error__.name = 'ScriptExternalLoadError';
      __webpack_error__.stack = event.stack;
      reject(__webpack_error__);
    },
    global,
  );
}).then((container) => {
  return {
    get: (key) => {
      return container.get(key);
    },
    init: (shareScope) => {
      const handler = {
        get(target, prop) {
          return target[prop]
        },
        set(target, property, value) {
          target[property] = new Proxy(value, {
            get(target, prop) {
              const unpkgObject = setUpkgModule(property, prop)
              return unpkgObject
            },
            set(target, prop, value) {
              target[prop] = value;
              return true
            }
          });
          return true
        }
      }
      return container.init(new Proxy(shareScope, handler));
    }
  }
})
