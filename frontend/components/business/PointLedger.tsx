import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { formatPoints } from "@/lib/format";
import type { PointTransaction } from "@/types/billing";

export function PointLedger({ rows }: { rows: PointTransaction[] }) {
  return (
    <Table
      data={rows}
      columns={[
        { key: "title", header: "类型", render: (row) => <div className="font-black">{row.title}</div> },
        { key: "ref", header: "关联对象", render: (row) => <span className="text-sm text-muted">{row.refType}:{row.refId}</span> },
        { key: "balance", header: "余额变动", render: (row) => <Badge tone={row.balanceDelta >= 0 ? "green" : "amber"}>{formatPoints(row.balanceDelta)}</Badge> },
        { key: "frozen", header: "冻结变动", render: (row) => <Badge tone={row.frozenDelta >= 0 ? "amber" : "green"}>{formatPoints(row.frozenDelta)}</Badge> },
        { key: "remark", header: "说明", render: (row) => <span className="text-sm text-slate-600">{row.remark}</span> },
        { key: "time", header: "时间", render: (row) => <span className="text-sm text-muted">{row.createdAt}</span> }
      ]}
    />
  );
}
