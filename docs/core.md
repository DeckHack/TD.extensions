# Core

> The "core" (`window.TD.extensions`) handles addition, deletion, initialization and destruction of extensions.

> It will also perform any checks required on extensions to see if they are eligible to get added or enabled, based on several
different factors.

> Who supplies the core into TweetDeck is not relevant, in the best scenario, every project supporting the specification
should carry the core and add it if it's not to be found. If it exists beforehand ('exists' in the meaning of the
`window.TD.extensions` object not returning `undefined`), only the required functions to handle extensions should be executed.
