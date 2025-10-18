# browser-source

> W3C's FileList and WICG’s FileSystemEntry and FileSystemHandle as a sources for [@helia/unixfs](https://github.com/ipfs/helia/tree/main/packages/unixfs)

## Install

`npm i @cypsela/browser-source`

## Example

live: https://browser-source.cypsela.eth.limo

source: [./example](https://github.com/cypsela/browser-source/tree/master/example)

## Usage

Api docs: [cypsela.github.io/browser-source](https://cypsela.github.io/browser-source)

Instances of these data types are available from [\<input type="file" />](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file) elements, [drag-and-drop events](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/drop_event), and window methods like [showOpenFilePicker](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker).

### [FileList](https://developer.mozilla.org/docs/Web/API/FileList) Source

```ts
import { fileListSource, BrowserFsItemSourceOptions } from '@cypsela/browser-source'
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'

const helia = await createHelia()
const fs = unixfs(helia)

const list: FileList = /* Get from <input type="file" /> elements */;

for await (const { cid } of fs.addAll(fileListSource(list))) {}
```

### [FileSystemEntry](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry) Source

```ts
import { fsEntrySource, BrowserFsItemSourceOptions } from '@cypsela/browser-source'
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'

const helia = await createHelia()
const fs = unixfs(helia)

const entry: FileSystemEntry = /* Get from drag-and-drop events */;

for await (const _ of fs.addAll(fsEntrySource(entry))) {}
```

### [FileSystemHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle) Source

```ts
import { fsHandleSource, BrowserFsItemSourceOptions } from '@cypsela/browser-source'
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'

const helia = await createHelia()
const fs = unixfs(helia)

const handle: FileSystemHandle = /* Get from drag-and-drop events and window methods */

for await (const _ of fs.addAll(fsHandleSource(handle))) {}
```
