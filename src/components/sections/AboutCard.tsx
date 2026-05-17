import { Card } from "@/components/ui/Card";

type AboutCardProps = {
  about: string;
};

export function AboutCard({ about }: AboutCardProps) {
  return (
    <Card className='p-6'>
      <h2 className='text-sm font-semibold text-on-surface'>About</h2>
      <p className='mt-3 text-sm leading-6 text-on-surface md:text-base'>
        {about}
      </p>
    </Card>
  );
}
