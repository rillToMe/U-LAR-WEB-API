export interface RecentStudent {
  id: number;
  nim: string;
  name: string;
  isActive: boolean;
  createAt: string;
  lastLoginAt: string | null;
}

export interface AdminDashboard {
  totalStudents: number;
  activeStudent: number;
  inactiveStudents: number;
  studentWhoHaveLoggedIn: number;
  recentStudents: RecentStudent[];
}
