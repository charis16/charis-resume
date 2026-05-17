import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { type ProfileLink } from "@/data/profile";

type LinksCardProps = {
  items: ProfileLink[];
  id?: string;
};

export function LinksCard({ items, id }: LinksCardProps) {
  return (
    <Card
      className='p-5'
      as='section'>
      <div
        id={id}
        className='scroll-mt-24'
      />
      <h2 className='text-sm font-semibold text-on-surface'>Contact</h2>
      <div className='mt-4'>
        {items.map((l, idx) => (
          <div key={`${l.label}-${l.href}`}>
            {idx > 0 ? <Divider className='my-3' /> : null}
            <a
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noreferrer" : undefined}
              className='flex items-baseline justify-between gap-4 text-sm text-on-surface hover:bg-surface-container-low rounded-[var(--radius-sm)] px-2 py-1 transition-colors'>
              <span className='font-semibold text-on-surface-variant'>
                {l.label}
              </span>
              <span className='truncate text-primary-container'>{l.href}</span>
            </a>
          </div>
        ))}
      </div>
    </Card>
  );
}
