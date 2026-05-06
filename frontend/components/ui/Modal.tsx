export function Modal({
  title,
  children,
  footer,
  onClose,
  placement = "center",
  fullscreen = false,
  onFullscreenToggle
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  placement?: "center" | "drawer";
  fullscreen?: boolean;
  onFullscreenToggle?: () => void;
}) {
  const panelClass = fullscreen
    ? "h-full w-full rounded-none bg-white p-5 shadow-panel"
    : placement === "drawer"
      ? "ml-auto min-h-full w-[min(1120px,100vw)] rounded-none border-l border-borderSoft bg-white p-5 shadow-panel"
      : "mx-auto mt-[6vh] w-[min(760px,calc(100vw-28px))] rounded-panel border border-borderSoft bg-white p-5 shadow-panel";

  const contentClass = fullscreen
    ? "max-h-[calc(100vh-128px)] overflow-y-auto pr-1"
    : placement === "drawer"
      ? "max-h-[calc(100vh-128px)] overflow-y-auto pr-1"
      : "max-h-[70vh] overflow-y-auto pr-1";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/22 backdrop-blur-sm">
      <div className={panelClass}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="m-0 text-lg font-black text-ink">{title}</h3>
          <div className="flex items-center gap-2">
            {onFullscreenToggle ? (
              <button
                className="inline-flex h-9 items-center justify-center rounded-control border border-borderSoft bg-white px-3 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-primary"
                type="button"
                onClick={onFullscreenToggle}
              >
                {fullscreen ? "退出全屏" : "全屏编辑"}
              </button>
            ) : null}
            {onClose ? (
              <button className="grid h-9 w-9 place-items-center rounded-control border border-borderSoft bg-white text-lg font-black text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-primary" type="button" onClick={onClose}>
                ×
              </button>
            ) : null}
          </div>
        </div>
        <div className={contentClass}>{children}</div>
        {footer ? <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-borderSoft pt-4">{footer}</div> : null}
      </div>
    </div>
  );
}
