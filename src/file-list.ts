import blobToIt from "blob-to-it";
import { FileCandidate } from "ipfs-unixfs-importer";
import { BrowserFsItemSourceOptions } from "./interface.js";
import { msToMtime } from "./util.js";

export function* fileListSource(
  list: FileList,
  options?: BrowserFsItemSourceOptions,
): Generator<FileCandidate> {
  // may be worth looking at how list order affects unixfs.addAll
  // could sort by webkitRelativePath before yielding
  for (const file of list) {
    yield {
      content: blobToIt(file),
      path:
        file.webkitRelativePath !== "" ? file.webkitRelativePath : undefined,
      mtime: options?.mtime ?? msToMtime(file.lastModified),
      mode: options?.mode,
    };
  }
}
