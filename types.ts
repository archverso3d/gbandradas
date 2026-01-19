
export interface Program {
  id: string;
  title: string;
  description: string;
  image: string;
  target: string;
}

export interface Instructor {
  name: string;
  rank: string;
  bio: string;
  image: string;
}

export interface ScheduleItem {
  time: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}
