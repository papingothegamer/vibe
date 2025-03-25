declare module 'html2canvas' {
  interface RenderOptions {
    x?: number
    y?: number
    width?: number
    height?: number
  }

  interface WindowOptions {
    scrollX?: number
    scrollY?: number
    windowWidth?: number
    windowHeight?: number
  }

  interface Options extends RenderOptions, WindowOptions {
    scale?: number
    useCORS?: boolean
    allowTaint?: boolean
    backgroundColor?: string | null
    foreignObjectRendering?: boolean
    imageTimeout?: number
    logging?: boolean
    proxy?: string
    removeContainer?: boolean
  }

  function html2canvas(element: HTMLElement, options?: Options): Promise<HTMLCanvasElement>
  export default html2canvas
  export type { Options }
}