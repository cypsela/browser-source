import type { Mtime } from "ipfs-unixfs";

export type BrowserFsEntry = FileSystemEntry;
export type BrowserFsHandle = FileSystemHandle;

export type BrowserFsItem = BrowserFsEntry | BrowserFsHandle

export type BrowserFsDir<T extends BrowserFsItem> =
  T extends BrowserFsEntry ? FileSystemDirectoryEntry :
  T extends BrowserFsHandle ? FileSystemDirectoryHandle :
  never;

export type BrowserFsFile<T extends BrowserFsItem> =
  T extends FileSystemEntry ? FileSystemFileEntry :
  T extends FileSystemHandle ? FileSystemFileHandle :
  never;

export interface GetEntries<T extends BrowserFsItem> {
  (dir: BrowserFsDir<T>): AsyncGenerator<T>;
}

export interface GetFile<T extends BrowserFsItem> {
  (file: BrowserFsFile<T>): Promise<File>;
}

export interface GetKind<T extends BrowserFsItem> {
  (item: T): FileSystemHandleKind
}

export interface BrowserFsItemSourceResult {
  path: string;
  content: AsyncIterable<Uint8Array> | undefined;
  mtime: Mtime | undefined;
  mode: number | undefined;
}

export interface BrowserFsItemSourceOptions {
  /**
   * Include .dot files in matched paths.
   */
  hidden?: boolean;

  /**
   * Include only output files
   */
  onlyFiles?: boolean;

  /**
   * Path prefix, must end with '/'
   */
  prefix?: string;

  /**
   * Preserve mtime
   */
  preserveMtime?: boolean;

  /**
   * mode to use
   */
  mode?: number;

  /**
   * mtime to use - if preserveMtime is true this will be ignored
   */
  mtime?: Mtime;
}

export interface BrowserFsItemSource<T extends BrowserFsItem> {
  (
    source: T,
    getEntries: GetEntries<T>,
    getFile: GetFile<T>,
    options: BrowserFsItemSourceOptions
  ): AsyncGenerator<BrowserFsItemSourceResult>;
}

export interface FileSystemEntrySource {
  (source: FileSystemEntry, options: BrowserFsItemSourceOptions): AsyncGenerator<BrowserFsItemSourceResult>
}

export interface FileSystemHandleSource {
  (source: FileSystemHandle, options: BrowserFsItemSourceOptions): AsyncGenerator<BrowserFsItemSourceResult>
}
