export enum ModalType {
  Login = 'login',
  SignUp = 'signup',
}

export enum AuthStrategy {
  Google = 'oauth_google',
  Microsoft = 'oauth_microsoft',
  Slack = 'oauth_slack',
  Apple = 'oauth_apple',
}

export enum UserRole {
  Admin = 'admin',   // Boshliq
  Lead = 'lead',     // Bo'lim boshlig'i
  Member = 'member', // Ishchi
}

export interface Board {
  id: string;
  creator: string;
  title: string;
  created_at: string;
  background: string;
  last_edit: null;
}

export interface TaskList {
  board_id: string;
  created_at: string;
  id: string;
  position: number;
  title: string;
}

export interface TaskListFake {
  id?: string;
}

export interface Task {
  id: string;
  user_id?: string; // Creator ID
  list_id: string;
  board_id: string;
  position: number;
  title: string;
  description: string | null;
  assigned_to: string | null;
  done: boolean;
  image_url?: string;
  due_date?: string | null;
  estimated_hours?: number | null;
  created_at: string;
  users?: User;
}

export interface User {
  avatar_url: string;
  email: string;
  first_name: string;
  id: string;
  username: null;
  role?: UserRole;
  manager_id?: string | null;
}

export interface DailyLog {
  id: string;
  user_id: string;
  content: string;
  log_date: string;
  created_at: string;
  users?: User;
}

export interface Comment {
  id: string;
  card_id: string;
  user_id: string;
  text: string;
  created_at: string;
  users?: User;
}

export interface Label {
  id: string;
  board_id: string;
  title: string;
  color: string;
  created_at: string;
}

export interface CardLabel {
  card_id: string;
  label_id: string;
  labels?: Label;
}

export interface Checklist {
  id: string;
  card_id: string;
  title: string;
  created_at: string;
  checklist_items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  done: boolean;
  position: number;
  created_at: string;
}
