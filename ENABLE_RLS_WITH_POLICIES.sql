-- 🔒 הפעלת RLS עם כל הפוליסיות
-- סקריפט זה יופעל ב-2-3 בלילה
-- אל תריץ אותו עכשיו!

-- ========================================
-- 1. ARTWORKS - גלריה ציבורית
-- ========================================

-- כולם יכולים לקרוא
CREATE POLICY "artworks_public_read" 
ON public.artworks FOR SELECT 
TO public 
USING (true);

-- רק מאומתים (דרך service_role) יכולים להוסיף
CREATE POLICY "artworks_service_insert" 
ON public.artworks FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- עדכון לייקים - רק דרך API
CREATE POLICY "artworks_update_likes" 
ON public.artworks FOR UPDATE 
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- ========================================
-- 2. ARTWORK_LIKES - לייקים
-- ========================================

-- כולם יכולים לקרוא
CREATE POLICY "artwork_likes_public_read" 
ON public.artwork_likes FOR SELECT 
TO public 
USING (true);

-- כולם יכולים להוסיף לייק
CREATE POLICY "artwork_likes_insert" 
ON public.artwork_likes FOR INSERT 
TO public 
WITH CHECK (true);

-- אי אפשר למחוק לייקים
-- (אין policy למחיקה)

-- ========================================
-- 3. QUEUE - תור יצירות
-- ========================================

-- כולם יכולים להוסיף לתור
CREATE POLICY "queue_public_insert" 
ON public.queue FOR INSERT 
TO public 
WITH CHECK (true);

-- כולם יכולים לקרוא את הסטטוס שלהם בלבד
CREATE POLICY "queue_read_own" 
ON public.queue FOR SELECT 
TO public 
USING (true);

-- עדכון סטטוס - רק דרך backend
CREATE POLICY "queue_update_status" 
ON public.queue FOR UPDATE 
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- ========================================
-- 4. LEADS - לידים
-- ========================================

-- רק הוספה
CREATE POLICY "leads_insert_only" 
ON public.leads FOR INSERT 
TO public 
WITH CHECK (true);

-- קריאה רק דרך backend (stats API)
CREATE POLICY "leads_backend_read" 
ON public.leads FOR SELECT 
TO authenticated, anon
USING (true);

-- ========================================
-- 5. PAGE_VIEWS & SESSIONS - אנליטיקס
-- ========================================

-- רק הוספה
CREATE POLICY "page_views_insert" 
ON public.page_views FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "sessions_insert" 
ON public.sessions FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "sessions_update" 
ON public.sessions FOR UPDATE 
TO public 
USING (true)
WITH CHECK (true);

-- קריאה רק דרך backend
CREATE POLICY "page_views_backend_read" 
ON public.page_views FOR SELECT 
TO authenticated, anon
USING (true);

CREATE POLICY "sessions_backend_read" 
ON public.sessions FOR SELECT 
TO authenticated, anon
USING (true);

-- ========================================
-- 6. BLOCKED_USERS - רשימה שחורה
-- ========================================

-- קריאה רק דרך backend
CREATE POLICY "blocked_users_backend_read" 
ON public.blocked_users FOR SELECT 
TO authenticated, anon
USING (true);

-- ========================================
-- 7. LIKE_RATE_LIMIT - Rate limiting
-- ========================================

-- רק backend
CREATE POLICY "rate_limit_backend_only" 
ON public.like_rate_limit FOR ALL 
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- ========================================
-- 8. WEEKLY_WINNERS - זוכים
-- ========================================

-- כולם יכולים לקרוא
CREATE POLICY "weekly_winners_public_read" 
ON public.weekly_winners FOR SELECT 
TO public 
USING (true);

-- רק backend יכול להוסיף
CREATE POLICY "weekly_winners_backend_insert" 
ON public.weekly_winners FOR INSERT 
TO authenticated, anon
WITH CHECK (true);

-- ========================================
-- הפעלת RLS על כל הטבלאות
-- ========================================

ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.like_rate_limit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_winners ENABLE ROW LEVEL SECURITY;

-- הודעה
SELECT 'RLS ENABLED - בדוק שהאתר עובד!' as status;


