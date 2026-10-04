// Types for ViceVerse Club Member Portal
// Team 4 – Club Member Portal
// Team Lead: Puttashankar Prasad

export interface Team {
  id: string;
  team_id: string; // e.g. IDN26-042
  team_name: string;
  domain: string;
  qr_token: string;
  payment_status: 'pending' | 'approved' | 'rejected';
  members: Member[];
  created_at: string;
}

export interface Member {
  id: string;
  team_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'leader' | 'member';
  registration_status: boolean;
  registration_by?: string;
  registration_at?: string;
  goodies_status: boolean;
  goodies_by?: string;
  goodies_at?: string;
  lunch_status: boolean;
  lunch_by?: string;
  lunch_at?: string;
  snacks_status: boolean;
  snacks_by?: string;
  snacks_at?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface AuditLog {
  id: string;
  performed_by: string;
  team_id: string;
  member_id: string;
  member_name: string;
  activity: 'registration' | 'goodies' | 'lunch' | 'snacks';
  action: 'marked_complete';
  timestamp: string;
}

export interface OperationStats {
  total_teams: number;
  teams_registered: number;
  total_members: number;
  members_registered: number;
  goodies_distributed: number;
  lunch_distributed: number;
  snacks_distributed: number;
}

export type ActivityType = 'registration' | 'goodies' | 'lunch' | 'snacks';

export interface ClubMemberUser {
  id: string;
  email: string;
  role: 'club_member';
  name: string;
}
