import { FileCandidate } from "ipfs-unixfs-importer";
import { BrowserFsItemSourceOptions, IterableFile } from "./interface.js";
import { createIterableFile, pickMtime } from "./util.js";

/**
 * Takes a [FileList](https://developer.mozilla.org/docs/Web/API/FileList) and turns it into an
 * [ImportCandidateStream](https://ipfs.github.io/js-ipfs-unixfs/types/ipfs-unixfs-importer.index.ImportCandidateStream.html)
 * for importing into [@helia/unixfs](https://ipfs.github.io/helia/modules/_helia_unixfs.index.html).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#accessing_selected_files
 *
 * @example
 * ```
 * import { fileListSource, BrowserFsItemSourceOptions } from '@cypsela/browser-source'
 * import { createHelia } from 'helia'
 * import { unixfs } from '@helia/unixfs'
 *
 * const helia = await createHelia()
 * const fs = unixfs(helia)
 *
 * const list: FileList = /* Get from <input type="file" /> tag or drag-and-drop events *\/;
 *
 * for await (const { cid } of fs.addAll(fileListSource(list))) {}
 * ```
 *
 * @param list - [FileList](https://developer.mozilla.org/docs/Web/API/FileList)
 * @param options
 */
export function* fileListSource(
  list: FileList,
  options?: BrowserFsItemSourceOptions,
): Generator<FileCandidate<IterableFile>> {
  // may be worth looking at how list order affects unixfs.addAll
  // could sort by webkitRelativePath before yielding
  for (const file of list) {
    yield {
      content: createIterableFile(file),
      // prefer webkitRelative path
      path:
        typeof file.webkitRelativePath === "string" &&
        file.webkitRelativePath !== ""
          ? file.webkitRelativePath
          : file.name,
      mtime: pickMtime(file.lastModified, options),
      mode: options?.mode,
    };
  }
}
