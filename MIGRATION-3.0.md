# MIGRATING

Notificare 3.x brings a highly modular system with a functional approach that supports tree-shaking.

Using a module bundler like [webpack](https://webpack.js.org/) or [Rollup](https://rollupjs.org/) in your development environment is strongly recommended. Otherwise, you won't be able to take advantage of the modular API's main benefits , i.e., reducing your app's bundle size.

## Configuration file

The new library reads from a different configuration file. The old `config.json` was replaced by the `notificare-services.json` file.

Review the [implementation guide](https://docs.notifica.re/sdk/v3/html5/implementation/#configuration-file) for more information.

It's possible to configure Notificare through Javascript. 
However, the recommended configuration approach remains to be the remote `notificare-services.json`.

## Packages

The new API breaks the monolithic approach into several modules, available through the [Notificare](https://www.npmjs.com/package/notificare-web/) package. You can interact with the SDK like the following.

```javascript
import { launch } from 'notificare-web/core';
import { enableRemoteNotifications } from 'notificare-web/push';

await launch();
await enableRemoteNotifications();
```

Refer to the [documentation](https://docs.notifica.re/sdk/v3/html5/implementation/) for a complete list of packages. 

## Moving forward

Given the foundational changes and large differences in the Public API in the new libraries, we found the best way to cover every detail is to go through the [documentation](https://docs.notifica.re/sdk/v3/html5/implementation) for each of the modules you want to include and adjust accordingly.

As always, if you have anything to add or require further assistance, we are available via our [Support Channel](mailto:support@notifica.re).
