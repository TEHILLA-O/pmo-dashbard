export type ProjectRow = {
  project_id: string;
  project_name: string;
  project_manager?: string;
  sponsor?: string;
  business_unit?: string;
  start_date?: string;
  end_date?: string;
  planned_progress: number;
  actual_progress: number;
  status: string;
  budget: number;
  actual_cost: number;
  priority?: string;
  open_risks_count: number;
  overdue_milestones: number;
  resource_utilization_percent: number;
  health_score: number;
  schedule_variance?: number;
  [key: string]: unknown;
};

export type MilestoneRow = {
  overdue_flag?: number;
  [key: string]: unknown;
};

export type ResourceRow = {
  resource_name?: string;
  allocation_percent?: number;
  [key: string]: unknown;
};

export type WeeklyUpdateRow = {
  update_id: string;
  project_id: string;
  reporting_week: string;
  key_achievement: string;
  blocker: string;
  next_step: string;
  status_note?: string;
  [key: string]: unknown;
};

export type DataBundle = {
  projects: ProjectRow[];
  milestones: MilestoneRow[];
  resources: ResourceRow[];
  weekly_updates: WeeklyUpdateRow[];
};

export type ExecutiveKpis = {
  n_projects: number;
  on_track: number;
  at_risk: number;
  delayed: number;
  avg_pct_complete: number;
  budget_weighted_pct_complete: number;
  avg_schedule_variance_pp: number;
  spi: number;
  on_schedule_rate_pct: number;
  total_budget_gbp: number;
  total_spend_gbp: number;
  variance_gbp: number;
  budget_utilisation_pct: number;
  budget_variance_pct: number;
  cpi: number;
  avg_health: number;
  total_open_risks: number;
  overdue_milestones: number;
  exception_rate_pct: number;
  avg_resource_utilization_pct: number;
  pct_projects_overallocated: number;
  named_resources_overallocated_count: number;
  avg_named_resource_load_pct: number;
  named_resources_count: number;
  avg_resource_overrun_pp: number;
};
