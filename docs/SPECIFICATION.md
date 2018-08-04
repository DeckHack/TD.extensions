# TD.extensions Specification

This specification details the functionality of `TD.extensions` core handling and `TD.extensions` extensions.

## Synopsis

`TD.extensions` is a system that enables userscript and extension developers to have a central and collaborative
point to add code that extends the functionality of TweetDeck.

The front-facing API for developers should be fairly simple and enable easy access and usage.

## Core

The "core" (`window.TD.extensions`) handles addition, deletion, initialization and destruction of extensions.

It will also perform any checks required on extensions to see if they are eligible to get added or enabled, based on several
different factors.

Who supplies the core into TweetDeck is not relevant, in the best scenario, every project supporting the specification
should carry the core and add it if it's not to be found. If it exists beforehand ('exists' in the meaning of the
`window.TD.extensions` object not returning `undefined`), only the required functions to handle extensions should be executed.

### Storages

To determine certain states of extensions, there are a variety of different storages required.

#### Extension List - `TD.extensions._list`

This list contains all extensions added to `TD.extensions`.

#### Initialized Extension List - `TD.extensions._init`

This list contains the names of all extensions that have been initialized (e.g. their `create()` function has been executed)

#### Enabled Extension List - `window.localStorage -> TD.extensions.enabled`

This list contains all extensions that are currently enabled and will be initialized the next time `TD.extensions.init()` is called
and haven't been already initialized (as defined by their name being in `TD.extensions._init`).

It's persisted across sessions using `window.localStorage`, so once an extension has been enabled, it only needs to be present in the
extension list and it will be initialized without having to enable it again.

## Extensions

Extensions are JavaScript objects containing information and code to be injected into TweetDeck.

### Format

The base format of extensions in `TD.extensions` looks like following:

```js
{
    name: 'myExtension',
    author: 'myExtensionAuthor',
    description: 'This is myExtension!',
    website: 'https://example.com/',

    dependencies: [
        'myImportantExtension'
    ],

    conflicts: [
        'veryBadExtension'
    ],

    create: () => {
        console.log('myExtension created!')
    },

    destroy: () => {
        console.log('myExtension destroyed!')
    }
}
```

#### Name

The name of an extension can have any length and format, as long as it stays interpretable by browsers JavaScript engines.

#### Meta Information

Fields like `author`, `description` and `website` are not required and not necessary for the core, but they will allow the author
of the extension to be contacted in cases of problems with the extension.

#### Dependencies

Dependencies define other extensions that are required by your extension. The definition of these extensions works by name.

#### Conflicts

Conflicts define other extensions that disrupt proper execution or functionality of your extension. The definition of these extensions works by name.
If your extension conflicts with an already enabled one, your extension won't be added.

#### `create()`

Function that is executed whenever the extension is initialized. This usually contains the core logic of the extension.

#### `destroy()`

Function that is executed whenever the extension is teared down. This should include some cleanup logic to remove traces of your extension that might
cause issues if left.