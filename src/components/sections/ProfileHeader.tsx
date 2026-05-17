import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";

type ProfileHeaderProps = {
  name: string;
  headline: string;
  location: string;
  summary: string;
};

export function ProfileHeader({
  name,
  headline,
  location,
  summary,
}: ProfileHeaderProps) {
  return (
    <Card
      as='header'
      className='p-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-[20px] font-bold leading-7 tracking-[-0.01em] text-on-surface md:text-[32px] md:leading-10 md:tracking-[-0.02em]'>
            {name}
          </h1>
          <p className='mt-1 text-sm font-semibold text-on-surface md:text-base'>
            {headline}
          </p>
          <p className='mt-1 text-sm text-on-surface-variant'>{location}</p>
          <p className='mt-3 max-w-2xl text-sm leading-6 text-on-surface md:text-base'>
            {summary}
          </p>
        </div>

        <div className='flex shrink-0 flex-wrap gap-2'>
          <ButtonLink href='/print'>Print / PDF</ButtonLink>
          <ButtonLink
            href='#contact'
            variant='secondary'>
            Contact
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}
