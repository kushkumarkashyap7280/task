

🔗 Live URL: https://task-codevector.vercel.app/
📁 GitHub: https://github.com/kushkumarkashyap7280/task
Conversation with Claude AI :  https://claude.ai/share/ab7544df-defd-41dd-ab0f-511684b5a1e3

── What I chose and why ──

Stack: Next.js (App Router) + Prisma + PostgreSQL (Supabase) + TanStack Query

For the database I chose PostgreSQL over MongoDB because the data is relational — products belong to categories, and I needed foreign key integrity. I chose it over MySQL for JSONB support, Row-Level Security, and better handling of NUMERIC types for prices (FLOAT loses precision on money values).

The core engineering decision was cursor-based pagination over offset. Offset pagination has a fundamental flaw with live data — if 3 products are inserted while a user is on page 2, the offset shifts and they see duplicates or miss rows entirely. Cursor pagination anchors to a specific row using (createdAt, id) as a composite cursor, so new inserts above the cursor are completely invisible to the ongoing browse session. I verified this manually by inserting products in one tab while paginating in another.

For the seed script I used PostgreSQL's generate_series() to insert 200,000 rows in a single query (~3-4 seconds) instead of looping in JS which would have taken 10-30 minutes.

I added a compound index on (categoryId, createdAt DESC, id DESC) and a second on (createdAt DESC, id DESC) for unfiltered queries — so pagination stays O(log n) at any depth regardless of dataset size.

Debounced search (450ms) prevents hammering the DB on every keystroke across 200k rows. TanStack Query's queryKey includes all active filters so any filter/sort change automatically resets the cursor and starts from page 1 — no manual reset logic needed.


── What I'd improve with more time ──

- Full-text search using PostgreSQL's TSVECTOR instead of ILIKE contains — much faster at scale
- Support UUIDv7 as primary key for distributed-safe non-guessable IDs
- Add a /api/categories endpoint instead of hardcoding category options in the frontend
- Rate limiting on the API route
- Return total count using prisma.$transaction([findMany, count]) so the UI can show "Showing X of 200,000"


── How I used AI ──

I used Claude throughout. It helped me understand cursor pagination deeply — specifically the (createdAt, id) composite cursor pattern and why the left-most prefix rule matters for compound indexes. It explained the generate_series approach for seeding which I hadn't used before.

Things I caught and corrected: Claude's initial seed script used (i % 5) + 1 assuming category IDs would be 1-5 sequentially — I questioned this and we fixed it to fetch real IDs from the DB first and pass them as a typed array with ::int casts (Prisma was passing them as text which threw a type mismatch error in Postgres).

As a bonus,  my full AI conversation as requested — happy to share the link if you'd like to see the entire working process.


Thank you for putting together a task that actually tests engineering thinking rather than just code output. I genuinely enjoyed working through it.

Looking forward to the next round.

Kush Kumar
GitHub: github.com/kushkumarkashyap7280
Portfolio: kushkumar.me

