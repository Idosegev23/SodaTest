-- 🚨 כפתור חירום - כיבוי RLS מיידי
-- העתק והדבק את כל הקוד הזה ב-Supabase SQL Editor
-- האתר יחזור לעבוד מיד!

-- כיבוי RLS על כל הטבלאות
ALTER TABLE public.artworks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.like_rate_limit DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_winners DISABLE ROW LEVEL SECURITY;

-- הודעה
SELECT 'RLS DISABLED - האתר חזר לפעול רגיל' as status;


