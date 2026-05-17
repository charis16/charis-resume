import { Card } from "@/components/ui/Card";

type LeftRailProfileProps = {
  name: string;
  headline: string;
  location: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase()).join("");
  return letters || "U";
}

export function LeftRailProfile({
  name,
  headline,
  location,
}: LeftRailProfileProps) {
  return (
    <Card className='p-5'>
      <div className='flex items-start gap-4'>
        <div
          className='grid h-14 w-14 place-items-center rounded-full border border-outline-variant bg-surface-container text-sm font-bold text-on-surface'
          style={{
            background:
              "linear-gradient(135deg, rgba(0,119,181,0.18), rgba(0,93,143,0.08))",
          }}
          aria-hidden>
          {initials(name)}
        </div>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold text-on-surface'>
            {name}
          </p>
          <p className='mt-0.5 text-xs leading-5 text-on-surface-variant'>
            {headline}
          </p>
          <p className='mt-1 text-xs text-on-surface-variant'>{location}</p>
        </div>
      </div>
    </Card>
  );
}
