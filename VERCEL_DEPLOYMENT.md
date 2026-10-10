# Vercel setup

Import this repository into Vercel. Use the Other framework preset; the root
`vercel.json` defines the install command, web build, output, and API handler.
Use Node.js 22. Deploy from the project root.

Before deploying, verify the production export locally with
`npx expo export --platform web --max-workers 1`. Close unused applications if
available memory is low. A successful TypeScript check alone does not confirm
that the production export or Vercel runtime works.

Set these variables in the Vercel project before building:

- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_KEY (publishable/anon key)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY
- COMPOSIO_API_KEY
- BROWSERBASE_API_KEY
- BROWSERBASE_PROJECT_ID

Keep private keys server-side. Do not give them an EXPO_PUBLIC_ prefix.
The web app calls its own `/api` routes, so no API URL is needed for web.

In Supabase Authentication > URL Configuration, add the deployed site's exact
`https://YOUR_DOMAIN/auth/callback` URL. Set Site URL to the deployed site's URL
for web defaults. Retain the mobile `museaiclone://auth/callback` and local Expo
redirect entries. Google Cloud's authorized redirect stays the Supabase
`https://rqqmbyjdyyjbvhdoctup.supabase.co/auth/v1/callback` endpoint.

For an installed mobile app, set EXPO_PUBLIC_API_URL to the deployment origin
(e.g. https://YOUR_DOMAIN) in EAS, then rebuild. With that variable empty, Expo
Go still uses its local development server. Native Google sign-in is unchanged.

Validate Google login, chat streaming, tool connections, and browser actions in
a Vercel preview. Browser actions need the Stagehand package assets included in
the function. Long agent runs are limited by the Vercel plan's function duration;
the configured maximum is 300 seconds. Scheduled tasks continue to use the
Supabase agent-run function and its separately configured secrets.

EAS Build only produces the mobile binary; it does not run this backend.

The web build script is named `build:web` deliberately: Vercel's Node function
builder also runs `vercel-build` scripts, which would export Expo a second time
and risk different JavaScript filenames between the HTML and static files.
The routing configuration serves existing static files before the Expo handler.
