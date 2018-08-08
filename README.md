# TD.extensions

**Status:** _Initial Release_

## What is this about?

`TD.extensions` is a project based on the idea to unite browser extension and userscript developers working with
the TweetDeck web application.

It serves as a unified endpoint to add/depend on/run fragments of code (extensions), and the core supplies features
like sorting the extensions after their dependencies and check if any conflicts with other extensions are given.

This repository contains both the specification (in `docs/SPECIFICATION.md`) and the initial/main implementation of
the core handling service for extensions (in `index.js`)

## Contributing

### Specification

If you want to change something about the specification, please proceed to [open an issue](https://github.com/DeckHack/TD.extensions/issues/new)
explaining your wanted changes and being open for discussion there.

Once a uniform agreement across discussion participants has been made, a change to the specification will be made. If required,
code changes to the core service should also follow up as soon as possible.

### Core Service

If you want to change something about the code of the core service, feel free to open a Pull Request with your proposed changes. 
A project maintainer will look at them and leave feedback. Once everything has been resolved, the changes are most likely to be
merged.

### Discussion

If you want to partake in the discussion around `TD.extensions` and the TweetDeck userscript/extension ecosystem in general, feel
free to join our [Discord server](https://discord.gg/s6Fujxh)!

## License

`TD.extensions` is licensed under the [GNU Affero General Public License 3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)