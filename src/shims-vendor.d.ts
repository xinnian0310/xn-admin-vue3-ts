declare module 'exceljs/dist/exceljs.min.js' {
  import ExcelJS from 'exceljs'
  export default ExcelJS
}

declare module '@wangeditor/editor-for-vue' {
  import type { DefineComponent } from 'vue'
  export const Editor: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export const Toolbar: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
}
