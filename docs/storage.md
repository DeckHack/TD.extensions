# Storage

> To determine certain states of extensions, there are a variety of different storages required.

## Extension List

```javascript
TD.extensions._list
```

> This list contains all extensions added to `TD.extensions`.

## Initialized Extension List

```javascript
TD.extensions._init
```

> This list contains the names of all extensions that have been initialized (e.g. their `create()` function has been executed)

## Enabled Extension List

```javascript
window.localStorage -> TD.extensions.enabled
```

> This list contains all extensions that are currently enabled and will be initialized the next time `TD.extensions.init()` is called
and haven't been already initialized (as defined by their name being in `TD.extensions._init`).

> It's persisted across sessions using `window.localStorage`, so once an extension has been enabled, it only needs to be present in the
extension list and it will be initialized without having to enable it again.
