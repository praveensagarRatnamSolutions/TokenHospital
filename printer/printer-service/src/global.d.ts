export {}

declare global {
  interface Window {
    printerAPI: {
      getPrinters: () => Promise<any[]>
      savePrinter: (name: string) => void
      getSavedPrinter: () => Promise<string | null>
    }
  }
}