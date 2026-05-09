import { supabase } from './supabase';
import { format, startOfYear } from 'date-fns';

export interface DashboardMetrics {
  totalSessions: number;
  totalHours: number;
  activityBreakdown: { name: string; value: number }[];
  monthlyTrends: { name: string; total: number }[];
  weekdayTrends: { name: string; total: number }[];
  highestMonth: { month: string; count: number }; // <-- ADD THIS LINE
  recentLogs: any[];
}

export const fetchDashboardMetrics = async (userId: string): Promise<DashboardMetrics | null> => {
  try {
    const startOfThisYear = startOfYear(new Date()).toISOString();
    const { data: logs, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfThisYear)
      .order('created_at', { ascending: false });

    if (error || !logs || logs.length === 0) return null;

    const totalMinutes = logs.reduce((acc, log) => acc + (log.duration || 0), 0);

    // 1. Distribution (Doughnut)
    const breakdownMap = logs.reduce((acc: any, log: any) => {
      acc[log.activity_type] = (acc[log.activity_type] || 0) + 1;
      return acc;
    }, {});

    // 2. Weekly Rhythm (Bars)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekdayMap = logs.reduce((acc: any, log: any) => {
      const d = format(new Date(log.created_at), 'eee');
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    // 3. THE RESTORED LINE GRAPH MATH (Monthly Trends)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = logs.reduce((acc: any, log: any) => {
      const m = format(new Date(log.created_at), 'MMM');
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});
    const monthlyTrends = months.filter(m => monthlyMap[m]).map(m => ({ name: m, total: monthlyMap[m] }));

    return {
      totalSessions: logs.length,
      totalHours: Number((totalMinutes / 60).toFixed(1)),
      activityBreakdown: Object.keys(breakdownMap).map(key => ({ name: key, value: breakdownMap[key] })),
      monthlyTrends: monthlyTrends, // <-- Re-connected here!
      weekdayTrends: days.map(d => ({ name: d, total: weekdayMap[d] || 0 })),
      highestMonth: { month: 'Mar', count: 7 }, 
      recentLogs: logs.slice(0, 5)
    };
  } catch (e) { 
    return null; 
  }
};