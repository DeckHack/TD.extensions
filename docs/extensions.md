# Extensions

> Extensions are JavaScript objects containing information and code to be injected into TweetDeck.

## Format

> The base format of extensions in `TD.extensions` looks like following:

```javascript
{
    name: 'ExtensionName',
    author: 'Extension Author',
    description: 'Extension Description',
    version: '1.1.1',
    website: 'https://tdem.app/',
    enabled: true,
    init: true,
    dependencies: ['SomeImportantExtension'],
    conflicts: ['SomeBadExtension'],
    create: '(console.log("myExtension created!"))',
    destroy: '(console.log("myExtension destroyed!"))',
}
```

## Meta
> These fields are not required and not necessary for the core, but they will allow the author
of the extension to be contacted in cases of problems with the extension.
 - `name` Name of an extension (Can have any length & format, as long as it stays interpretable by browsers JavaScript engines)
 - `author` Name of the extensions author
 - `description` A brief description of the extension and its purpose
 - `version` Extension release version
 - `website` URL to extension homepage or source code

## Enabled
> Whether the extension should be enabled when first installed/run. This value can for the most part be ignored as it will be set by the manager.

## Init
> Whether to initialise the extension. This value can for the most part be ignored as it will be set by the manager.

## Dependencies
> Dependencies define other extensions that are required by your extension. The definition of these extensions works by name.

## Conflicts
> Conflicts define other extensions that disrupt proper execution or functionality of your extension. The definition of these extensions works by name.
If your extension conflicts with an already enabled one, your extension won't be added.

## Create
> Function that is executed whenever the extension is initialized. This usually contains the core logic of the extension.

## Destroy
> Function that is executed whenever the extension is teared down. This should include some cleanup logic to remove traces of your extension that might
cause issues if left.
