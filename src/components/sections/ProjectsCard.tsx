import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { type Project } from "@/data/profile";

type ProjectsCardProps = {
  items: Project[];
};

export function ProjectsCard({ items }: ProjectsCardProps) {
  return (
    <Card className='p-6'>
      <h2 className='text-sm font-semibold text-on-surface'>Projects</h2>
      <div className='mt-4'>
        {items.map((p, idx) => (
          <div key={p.title}>
            {idx > 0 ? <Divider className='my-4' /> : null}
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between'>
                {p.href ? (
                  <a
                    href={p.href}
                    target='_blank'
                    rel='noreferrer'
                    className='text-sm font-semibold text-primary-container hover:underline'>
                    {p.title}
                  </a>
                ) : (
                  <p className='text-sm font-semibold text-on-surface'>
                    {p.title}
                  </p>
                )}
              </div>
              <p className='text-sm leading-6 text-on-surface'>
                {p.description}
              </p>
              <div className='flex flex-wrap gap-2'>
                {p.stack.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
