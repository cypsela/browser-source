import { unixfs } from "@helia/unixfs";
import { createHelia } from "helia";
import {
  type BrowserFsItemSourceOptions,
  type BrowserFsItemSourceResult,
  fileListSource,
  fsEntrySource,
  fsHandleSource,
} from "../src/index.js";

declare global {
  interface DataTransferItem {
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/getAsFileSystemHandle
    // not supported in brave, works in chrome
    getAsFileSystemHandle?: () => Promise<FileSystemHandle | null>;
  }
  interface Window {
    helia: any;
    fs: any;
    fileListSource: any;
    fsEntrySource: any;
    fsHandleSource: any;
  }
}

// don't start helia, don't host the files on ipfs
const helia = await createHelia({ start: false });
const fs = unixfs(helia);

window.helia = helia;
window.fs = fs;
window.fileListSource = fileListSource;
window.fsEntrySource = fsEntrySource;
window.fsHandleSource = fsHandleSource;

async function* concatIterables(
  ...iters: (
    | AsyncGenerator<BrowserFsItemSourceResult>
    | Generator<BrowserFsItemSourceResult>
  )[]
): AsyncIterable<BrowserFsItemSourceResult> {
  for (const it of iters) {
    yield* it;
  }
}

const handleUpload = async <T>(
  items: T[],
  sourceFn: (
    item: T,
    options?: BrowserFsItemSourceOptions,
  ) =>
    | AsyncGenerator<BrowserFsItemSourceResult>
    | Generator<BrowserFsItemSourceResult>,
  prefix: string,
  wrapWithDirectory: boolean,
) => {
  for await (const f of fs.addAll(
    concatIterables(...items.map((i) => sourceFn(i))),
    { wrapWithDirectory },
  )) {
    console.log(f);
    const message = {
      cid: f.cid.toString(),
      path: f.path,
      size: Number(f.size),
    };
    log(prefix + JSON.stringify(message));
  }
};

const setDropSupported = <T extends FileSystemEntry | FileSystemHandle>(
  element: HTMLElement,
  sourceFn: (
    item: T,
    options?: BrowserFsItemSourceOptions,
  ) =>
    | AsyncGenerator<BrowserFsItemSourceResult>
    | Generator<BrowserFsItemSourceResult>,
  getItems: (dataTransfer: DataTransfer) => Promise<T[]>,
) => {
  const originalText = element.textContent;

  element.addEventListener("dragover", (e) => {
    e.preventDefault();
    element.classList.add("hover");
    element.textContent = "Drop 'Em";
  });

  const reset = () => {
    element.classList.remove("hover");
    element.textContent = originalText;
  };

  element.addEventListener("dragleave", reset);
  element.addEventListener("drop", async (e) => {
    e.preventDefault();
    reset();

    if (!e.dataTransfer) {
      return;
    }

    const items: T[] = await getItems(e.dataTransfer);

    const prefix =
      sourceFn === fsEntrySource ? "ENTRY SOURCE: " : "HANDLE SOURCE: ";

    handleUpload(items, sourceFn, prefix, items.length > 1);
  });
};

const setClickSupported = (element: HTMLInputElement) => {
  element.addEventListener("change", onInputChange(element.webkitdirectory));
};

const setUnsupported = (element: HTMLElement) => {
  element.textContent = element.textContent + "[NOT SUPPORTED BY THIS BROWSER]";
  element.style.opacity = "0.5";
};

const onInputChange = (isFolderUpload: boolean) => (e: Event) => {
  const target = e.target as HTMLInputElement;

  const files = target.files;

  if (files == null) {
    return;
  }

  handleUpload(
    [files],
    fileListSource,
    "FILE LIST SOURCE: ",
    files.length > 1 && !isFolderUpload,
  );

  target.value = "";
};

const fileInput = document.getElementById("file-list-input")!;
const folderInput = document.getElementById("folder-list-input")!;
if ("files" in HTMLInputElement.prototype) {
  setClickSupported(fileInput as HTMLInputElement);
  setClickSupported(folderInput as HTMLInputElement);
} else {
  setUnsupported(fileInput);
  setUnsupported(folderInput);
}

const getDataTransferItems = async <T>(
  dt: DataTransfer,
  getItem: (dtItem: DataTransferItem) => Promise<T | null>,
): Promise<T[]> => {
  const items: T[] = [];
  for (const i of dt.items) {
    const item = await getItem(i);
    if (item != null) items.push(item);
  }

  return items;
};

const entryDz = document.getElementById("entry-zone")!;
if (!!window.DataTransferItem?.prototype?.webkitGetAsEntry) {
  const getEntry = (item: DataTransferItem): Promise<FileSystemEntry | null> =>
    Promise.resolve(item?.webkitGetAsEntry?.());
  setDropSupported(entryDz, fsEntrySource, (dt) =>
    getDataTransferItems(dt, getEntry),
  );
} else {
  setUnsupported(entryDz);
}

const handleDz = document.getElementById("handle-zone")!;
if (!!window.DataTransferItem?.prototype?.getAsFileSystemHandle) {
  const getHandle = async (
    item: DataTransferItem,
  ): Promise<FileSystemHandle | null> =>
    item?.getAsFileSystemHandle?.() ?? null;
  setDropSupported(handleDz, fsHandleSource, (dt) =>
    getDataTransferItems(dt, getHandle),
  );
} else {
  setUnsupported(handleDz);
}

const logDiv = document.getElementById("log")!;
function log(msg: string) {
  const el = document.createElement("div");
  el.textContent = msg;
  logDiv.appendChild(el);
  logDiv.scrollTop = logDiv.scrollHeight;
}
