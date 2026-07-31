import { h } from 'vue'
import { ElButton, ElNotification } from 'element-plus'

const COOLDOWN_MS = 60_000
let lastShownAt = 0
let open = false

/** 后端不可用时的对话式提示（节流，避免刷屏） */
export function showBackendUnavailableTip(reason?: string) {
  const now = Date.now()
  if (open || now - lastShownAt < COOLDOWN_MS) return
  lastShownAt = now
  open = true

  const detail =
    reason ||
    '接口返回异常或无法连接，可能是后端未启动、端口未就绪，或路由不存在（404）。'

  const startCmd = 'cd /d "%~dp0" 或进入项目根目录后执行：启动.bat'
  const copyText = '启动.bat'

  const notification = ElNotification({
    title: '后端似乎不可用',
    duration: 0,
    type: 'warning',
    position: 'bottom-right',
    message: h('div', { class: 'backend-down-tip' }, [
      h('p', { style: 'margin:0 0 8px;line-height:1.5;font-size:13px;' }, detail),
      h(
        'p',
        { style: 'margin:0 0 12px;line-height:1.5;font-size:12px;color:var(--el-text-color-secondary);' },
        '本机开发可在项目根目录双击 启动.bat 启动全部服务；后端完全宕机时无法通过网页远程拉起。',
      ),
      h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;' }, [
        h(
          ElButton,
          {
            type: 'primary',
            size: 'small',
            onClick: async () => {
              try {
                await navigator.clipboard.writeText(copyText)
                ElNotification({
                  title: '已复制',
                  message: `已复制「${copyText}」。请在项目根目录打开终端执行，或直接双击该文件。`,
                  type: 'success',
                  duration: 3000,
                })
              } catch {
                ElNotification({
                  title: '复制失败',
                  message: startCmd,
                  type: 'info',
                  duration: 5000,
                })
              }
            },
          },
          () => '复制 启动.bat',
        ),
        h(
          ElButton,
          {
            size: 'small',
            onClick: () => {
              notification.close()
              open = false
            },
          },
          () => '知道了',
        ),
      ]),
    ]),
    onClose: () => {
      open = false
    },
  })
}
