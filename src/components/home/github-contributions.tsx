import Link from "next/link";
import { ContributionSnake } from "@/components/home/contribution-snake";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { siteConfig } from "@/config/meta";
import {
  getGitHubContributions,
  groupContributionsByWeek,
  type ContributionDay,
} from "@/lib/github";
import { cn } from "@/lib/utils";

const CELL = 13;
const GAP = 4;
const WEEK_STEP = CELL + GAP;

const levelColors = [
  "bg-foreground/[0.06] dark:bg-foreground/[0.07]",
  "bg-foreground/[0.22] dark:bg-foreground/[0.25]",
  "bg-foreground/[0.42] dark:bg-foreground/[0.45]",
  "bg-foreground/[0.65] dark:bg-foreground/[0.68]",
  "bg-foreground/[0.9] dark:bg-foreground/[0.92]",
];

function getMonthLabels(weeks: ContributionDay[][]) {
  const labels: { month: string; weekIndex: number }[] = [];
  let lastMonth = "";

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.find((day) => day.date);
    if (!firstDay) return;

    const month = new Date(firstDay.date)
      .toLocaleString("en", { month: "short" })
      .toUpperCase();
    if (month === lastMonth) return;

    const lastIndex = labels[labels.length - 1]?.weekIndex ?? -4;
    if (weekIndex - lastIndex < 3) return;

    labels.push({ month, weekIndex });
    lastMonth = month;
  });

  return labels;
}

function getYearRange(contributions: { date: string }[]) {
  const dates = contributions
    .filter((d) => d.date)
    .map((d) => new Date(d.date));
  if (!dates.length) return "";

  const start = dates[0]!.getFullYear();
  const end = dates[dates.length - 1]!.getFullYear();
  const endShort = String(end).slice(2);

  return start === end ? `${start}` : `${start}–${endShort}`;
}

export async function GitHubContributions() {
  const data = await getGitHubContributions(siteConfig.githubUsername);

  if (!data) return null;

  const weeks = groupContributionsByWeek(data.contributions);
  const monthLabels = getMonthLabels(weeks);
  const total = data.total.lastYear;
  const yearRange = getYearRange(data.contributions);
  const gridWidth = weeks.length * WEEK_STEP;
  const food = weeks.flatMap((week, x) =>
    week.flatMap((day, y) => (day.level > 0 ? [{ x, y, level: day.level }] : [])),
  );

  return (
    <Container>
      <SectionHeading eyebrow="Consistency" title="GitHub activity" />
      <div className="animate-in-up-on-view">
        {/* dir="rtl" makes the scroller start at its right end, so the latest months
            are what you see first; the grid itself is laid out left-to-right. */}
        <div dir="rtl" className="overflow-x-auto pb-1 [scrollbar-width:thin]">
          <div dir="ltr" style={{ minWidth: `${gridWidth}px` }}>
            <div className="relative mb-3 h-4 text-[11px] font-medium tracking-wider text-secondary">
              {monthLabels.map(({ month, weekIndex }) => (
                <span
                  key={`${month}-${weekIndex}`}
                  className="absolute whitespace-nowrap"
                  style={{ left: `${weekIndex * WEEK_STEP}px` }}
                >
                  {month}
                </span>
              ))}
            </div>

            <div className="relative">
              <div
                data-reveal-stagger="12"
                className="flex"
                style={{ gap: `${GAP}px` }}
              >
                {weeks.map((week, weekIndex) => (
                  <div
                    key={weekIndex}
                    className="flex flex-col"
                    style={{ gap: `${GAP}px` }}
                  >
                    {week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        title={
                          day.date
                            ? `${day.count} contributions on ${day.date}`
                            : undefined
                        }
                        className={cn(
                          "rounded-[3px]",
                          day.level < 0
                            ? "bg-transparent"
                            : (levelColors[day.level] ?? levelColors[0]),
                        )}
                        style={{ width: CELL, height: CELL }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <ContributionSnake
                food={food}
                columns={weeks.length}
                cell={CELL}
                gap={GAP}
                emptyClass={levelColors[0]!}
                levelClasses={levelColors}
              />
            </div>
          </div>
        </div>

        <div
          data-reveal
          className="mt-5 flex flex-wrap items-center justify-between gap-4 text-[11px] font-medium tracking-wider text-secondary"
        >
          <p className="uppercase">
            <span className="text-foreground">{total}</span> contributions ·{" "}
            {yearRange}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="uppercase">Less</span>
            {levelColors.map((color, i) => (
              <div
                key={i}
                className={cn("rounded-[3px]", color)}
                style={{ width: CELL, height: CELL }}
              />
            ))}
            <span className="uppercase">More</span>
          </div>
        </div>

        <Link
          href={`https://github.com/${siteConfig.githubUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-[11px] text-secondary transition-colors hover:text-foreground"
        >
          @{siteConfig.githubUsername}
        </Link>
      </div>
    </Container>
  );
}
