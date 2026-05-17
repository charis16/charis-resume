import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type SkillsCardProps = {
  items: string[];
};

export function SkillsCard({ items }: SkillsCardProps) {
  return (
    <Card className='p-5'>
      <h2 className='text-sm font-semibold text-on-surface'>Skills</h2>
      <div className='mt-4 flex flex-wrap gap-2'>
        {items.map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
      </div>
    </Card>
  );
}
