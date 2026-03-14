"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { StaggerContainer } from "@/shared/ui/animations";
import { PageContainer, PageHeader, SectionHeading } from "@/shared/ui/layout";
import { StatCard, QuickActionCard } from "@/shared/ui/cards";
import { ActivityRow } from "@/shared/ui/data";
import { useDashboard } from "@/features/dashboard/hooks";

export default function DashboardPage() {
  const { stats, recentActivity, quickActions } = useDashboard();

  const handlePulse = () => {
    console.log("Quick Pulse clicked");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        subtitle="CORE PERFORMANCE & RESOURCE METRICS"
        action={{ icon: "bolt", label: "Quick Pulse", onClick: handlePulse }}
        meta={{ label: "Current Status", value: "3 videos rendering" }}
      />

      <div className="space-y-16">
        <section>
          <SectionHeading
            title="Platform Overview"
            description="Real-time growth and engagement data"
          />
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                change={stat.change}
              />
            ))}
          </StaggerContainer>
        </section>

        <section>
          <SectionHeading
            title="Quick Actions"
            description="Accelerated creation workflows"
          />
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.label}
                icon={action.icon}
                label={action.label}
                href={action.href}
              />
            ))}
          </StaggerContainer>
        </section>

        <section>
          <SectionHeading
            title="Recent Activity"
            description="audit trail of latest operations"
          />
          <Card className="border-none shadow-md overflow-hidden rounded-[24px] bg-white">
            <CardContent className="p-0">
              <StaggerContainer className="divide-y divide-border/30">
                {recentActivity.map((item, index) => (
                  <ActivityRow
                    key={index}
                    icon={item.type}
                    title={item.name}
                    subtitle={`${item.avatar} · ${item.time}`}
                    status={item.status as "ready" | "rendering" | "completed" | "draft"}
                  />
                ))}
              </StaggerContainer>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageContainer>
  );
}
