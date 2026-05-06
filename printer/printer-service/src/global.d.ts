export {};

declare global {
  interface Printer {
    name: string;
    displayName?: string;
    description?: string;
    status?: number;
    isDefault?: boolean;
  }

  interface ServerStatus {
    running: boolean;
    port: number;
    url?: string;
  }

  interface Window {
    printerAPI: {
      getPrinters: () => Promise<Printer[]>;
      savePrinter: (name: string) => void;
      getSavedPrinter: () => Promise<string | null>;
      getServerStatus: () => Promise<ServerStatus>;
      toggleServer: () => Promise<ServerStatus>;
    };
  }
}
