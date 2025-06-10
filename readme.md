# browser-source

> W3C's FileSystemEntry and FileSystemHandle as a sources for @helia/unixfs

## Install

`npm i @cypsela/browser-source`

## Usage

### [FileSystemEntry](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry) Source

```ts
import { fsEntrySource, BrowserFsItemSourceOptions } from '@cypsela/browser-source'
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'

const helia = await createHelia()
const fs = unixfs(helia)

const options: BrowserFsItemSourceOptions = { ... }

for await (const _ of fs.addAll(fsEntrySource(<FileSystemEntry>, options))) {}
```

### [FileSystemHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle) Source

```ts
import { fsHandleSource } from '@cypsela/browser-source'
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'

const helia = await createHelia()
const fs = unixfs(helia)

const options: BrowserFsItemSourceOptions = { ... }

for await (const _ of fs.addAll(fsHandleSource(<FileSystemHandle>, options))) {}
```


