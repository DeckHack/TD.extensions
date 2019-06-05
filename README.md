<div align='center'>

  <a href='https://github.com/tdemapp/tdem/releases'>
    <img alt='TweetDeck Extension Manager' src='https://raw.githubusercontent.com/tdemapp/assets/master/branding/Promotional-Marquee.png' />
  </a>

  [![License](https://img.shields.io/badge/license-agpl-blue.svg?longCache=true&style=for-the-badge)](https://github.com/tdemapp/interface/blob/master/LICENSE) 
  [![Travis](https://img.shields.io/travis/tdemapp/interface/master.svg?style=for-the-badge)](https://travis-ci.org/tdemapp/interface) 
  [![Prettier](https://img.shields.io/badge/code--style-%20prettier-c596c7.svg?longCache=true&style=for-the-badge)](https://prettier.io/) 
  [![gitmoji](https://img.shields.io/badge/gitmoji-%20%F0%9F%98%9C%20%F0%9F%98%8D-FFDD67.svg?longCache=true&style=for-the-badge)](https://gitmoji.carloscuesta.me/) 

  <br />
</div>

## ➕ Installation:
```sh
npm install tdemapp/interface --save
```

## ✨ Usage:
```javascript
var tde = require('tde');
console.log(tde.getAll());  // '[]'
```
```typescript
import { getAll } from 'tde';
console.log(getAll()); // '[]'
```

## ❓ What is this about?
`TD.extensions` is a project based on the idea to unite browser extension and userscript developers working with
the TweetDeck web application.

It serves as a unified endpoint to add/depend on/run fragments of code (extensions), and the core supplies features
like sorting the extensions after their dependencies and check if any conflicts with other extensions are given.

This repository contains both the specification (in `docs/SPECIFICATION.md`) and the initial/main implementation of
the core handling service for extensions (in `index.js`)

## 🛠 Contributing:

### Specification
If you want to change something about the specification, please proceed to [open an issue](https://github.com/DeckHack/TD.extensions/issues/new)
explaining your wanted changes and being open for discussion there.

Once a uniform agreement across discussion participants has been made, a change to the specification will be made. If required,
code changes to the core service should also follow up as soon as possible.

### Core Service
If you want to change something about the code of the core service, feel free to open a Pull Request with your proposed changes. 
A project maintainer will look at them and leave feedback. Once everything has been resolved, the changes are most likely to be
merged.

## ❤️ Thank You!
This API is a fork and was orginally developed by ![Andreas N](https://github.com/pixeldesu).  
HUGE thank you to him for his work in making this API to allow TDEM to even exist 🙌🏻.

## License:
`TD.extensions` is licensed under the [GNU Affero General Public License 3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)
