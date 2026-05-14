export type Plan = "free" | "pro" | "team";
export type Language = "en" | "fr" | "ar";
export type Template = "executive" | "modern" | "classic" | "creative";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  usage_count: number;
  usage_reset_at: string;
  created_at: string;
  // Stripe
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus | null;
  current_period_end: string | null;
  price_id: string | null;
}

export function isPremium(profile: Pick<Profile, "plan" | "subscription_status" | "current_period_end"> | null | undefined): boolean {
  if (!profile) return false;
  if (profile.plan === "pro" || profile.plan === "team") return true;
  if (
    profile.subscription_status === "active" ||
    profile.subscription_status === "trialing"
  ) {
    if (profile.current_period_end) {
      return new Date(profile.current_period_end) > new Date();
    }
    return true;
  }
  return false;
}

export interface Resume {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  job_title: string;
  job_description: string | null;
  skills: string | null;
  experience: string | null;
  education: string | null;
  photo: string | null;
  language: Language;
  template: Template;
  resume: string;
  cover_letter: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      resumes: {
        Row: Resume;
        Insert: Omit<Resume, "id" | "created_at"> & { id?: string };
        Update: Partial<Resume>;
      };
    };
  };
}
