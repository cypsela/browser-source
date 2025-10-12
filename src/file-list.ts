import { FileCandidate } from "ipfs-unixfs-importer";
import { BrowserFsItemSourceOptions, IterableFile } from "./interface.js";
import { createIterableFile, msToMtime } from "./util.js";

export function* fileListSource(
  list: FileList,
  options?: BrowserFsItemSourceOptions,
): Generator<FileCandidate<IterableFile>> {
  // may be worth looking at how list order affects unixfs.addAll
  // could sort by webkitRelativePath before yielding
  for (const file of list) {
    yield {
      content: createIterableFile(file),
      path:
        file.webkitRelativePath !== "" ? file.webkitRelativePath : undefined,
      mtime: options?.mtime ?? msToMtime(file.lastModified),
      mode: options?.mode,
    };
  }
}
