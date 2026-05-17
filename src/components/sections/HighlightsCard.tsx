import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";

type HighlightsCardProps = {
  items: { label: string; value: string }[];
};

export function HighlightsCard({ items }: HighlightsCardProps) {
  return (
    <Card className='p-5'>
      <h2 className='text-sm font-semibold text-on-surface'>Highlights</h2>
      <div className='mt-4 flex flex-col gap-3'>
        {items.map((h, idx) => (
          <div key={`${h.label}-${h.value}`}>
            {idx > 0 ? <Divider className='my-3' /> : null}
            <div className='flex items-baseline justify-between gap-4'>
              <p className='text-xs font-semibold text-on-surface-variant'>
                {h.label}
              </p>
              <p className='text-sm font-semibold text-on-surface'>{h.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
