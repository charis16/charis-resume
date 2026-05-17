import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { type Education } from "@/data/profile";

type EducationCardProps = {
  items: Education[];
};

export function EducationCard({ items }: EducationCardProps) {
  return (
    <Card className='p-6'>
      <h2 className='text-sm font-semibold text-on-surface'>Education</h2>
      <div className='mt-4'>
        {items.map((e, idx) => (
          <div key={`${e.school}-${e.start}-${e.end}`}>
            {idx > 0 ? <Divider className='my-4' /> : null}
            <div className='flex flex-col gap-1'>
              <div className='flex flex-col gap-0.5 md:flex-row md:items-baseline md:justify-between'>
                <div className='min-w-0'>
                  <p className='text-sm font-semibold text-on-surface md:text-base'>
                    {e.school}
                  </p>
                  <p className='text-sm text-on-surface-variant'>{e.major}</p>
                </div>
                <p className='text-xs font-semibold text-on-surface-variant md:text-sm'>
                  {e.start} — {e.end}
                </p>
              </div>
              {e.note ? (
                <p className='text-sm leading-6 text-on-surface'>{e.note}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
