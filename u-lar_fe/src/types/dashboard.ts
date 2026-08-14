export interface RecentStudent {
  id: number;
  nim: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminDashboard {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  studentsWhoHaveLoggedIn: number;
  recentStudents: RecentStudent[];
}
