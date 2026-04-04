export type Prayer = {
  id: string;
  campaign_id: string;
  name: string;
  message: string;
  target_name: string;
  amen_count: number;
  share_count?: number;
  created_at?: string;
};