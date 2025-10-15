import { FileCandidate } from "ipfs-unixfs-importer";
import { BrowserFsItemSourceOptions, IterableFile } from "./interface.js";
import { createIterableFile, pickMtime } from "./util.js";

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
