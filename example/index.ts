import { unixfs } from "@helia/unixfs";
import { createHelia } from "helia";
import {
  type BrowserFsItemSourceOptions,
  type BrowserFsItemSourceResult,
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
    fsEntrySource: any;
    fsHandleSource: any;
  }
}

const helia = await createHelia();
const fs = unixfs(helia);

window.helia = helia;
window.fs = helia;
window.fsEntrySource = fsEntrySource;
window.fsHandleSource = fsHandleSource;

const setSupported = <T extends FileSystemEntry | FileSystemHandle>(
  element: HTMLElement,
  sourceFn: (
    item: T,
    options?: BrowserFsItemSourceOptions,
  ) => AsyncGenerator<BrowserFsItemSourceResult>,
  getItem: (item: DataTransferItem) => Promise<T | null>,
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

    const items: T[] = [];
    for (const i of e.dataTransfer.items) {
      const item = await getItem(i);
      if (item != null) items.push(item);
    }

    const prefix =
      sourceFn === fsEntrySource ? "ENTRY SOURCE: " : "HANDLE SOURCE: ";
    for (const i of items) {
      for await (const f of fs.addAll(sourceFn(i))) {
        console.log(f);
        const message = {
          cid: f.cid.toString(),
          path: f.path,
          size: Number(f.size),
        };
        log(prefix + JSON.stringify(message));
      }
    }
  });
};

const setUnsupported = (element: HTMLElement) => {
  element.textContent = element.textContent + "[NOT SUPPORTED BY THIS BROWSER]";
  element.style.opacity = "0.5";
};

const entryDz = document.getElementById("entry-zone")!;
if (!!window.DataTransferItem?.prototype?.webkitGetAsEntry) {
  const getEntry = (item: DataTransferItem): Promise<FileSystemEntry | null> =>
    Promise.resolve(item?.webkitGetAsEntry?.());
  setSupported(entryDz, fsEntrySource, getEntry);
} else {
  setUnsupported(entryDz);
}

const handleDz = document.getElementById("handle-zone")!;
if (!!window.DataTransferItem?.prototype?.getAsFileSystemHandle) {
  const getHandle = async (
    item: DataTransferItem,
  ): Promise<FileSystemHandle | null> =>
    item?.getAsFileSystemHandle?.() ?? null;
  setSupported(handleDz, fsHandleSource, getHandle);
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
