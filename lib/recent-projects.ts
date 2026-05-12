export interface RecentProject {
  id: string;
  projectName: string;
  researcher: string;
  industry: string;
  description: string;
  trlScore: number;
  selectedModules: string[];
  createdAt: number;
}

const INDEX_KEY = 'saiqiao_projects_index';
const MAX_PROJECTS = 20;

function reportKey(id: string) {
  return `saiqiao_report_${id}`;
}

function readIndex(): RecentProject[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentProject[];
  } catch {
    return [];
  }
}

export function saveProject(project: RecentProject, reportContent: object): void {
  try {
    const existing = readIndex().filter((p) => p.id !== project.id);
    const overflow = existing.slice(MAX_PROJECTS - 1);
    overflow.forEach((p) => {
      try { localStorage.removeItem(reportKey(p.id)); } catch { /* noop */ }
    });
    const newIndex = [project, ...existing].slice(0, MAX_PROJECTS);
    localStorage.setItem(INDEX_KEY, JSON.stringify(newIndex));
    localStorage.setItem(reportKey(project.id), JSON.stringify(reportContent));
  } catch { /* noop */ }
}

export function getRecentProjects(limit = 6): RecentProject[] {
  try {
    const arr = readIndex();
    return arr.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  } catch {
    return [];
  }
}

export function getProjectById(id: string): RecentProject | null {
  try {
    return readIndex().find((p) => p.id === id) ?? null;
  } catch {
    return null;
  }
}

export function getReportContent(id: string): object | null {
  try {
    const raw = localStorage.getItem(reportKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as object;
  } catch {
    return null;
  }
}

export function deleteProject(id: string): void {
  try {
    const newIndex = readIndex().filter((p) => p.id !== id);
    localStorage.setItem(INDEX_KEY, JSON.stringify(newIndex));
    localStorage.removeItem(reportKey(id));
  } catch { /* noop */ }
}
