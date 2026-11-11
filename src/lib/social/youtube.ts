const SCOPES = ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly']

export function youtubeConfigured() {
  return !!(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET)
}

export function redirectUri(origin: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || origin}/api/social/youtube/callback`
}

export function authUrl(origin: string, state: string) {
  const p = new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`
}

async function token(body: Record<string, string>) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.YOUTUBE_CLIENT_ID!, client_secret: process.env.YOUTUBE_CLIENT_SECRET!, ...body }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error_description || json.error || `Google token error ${res.status}`)
  return json as { access_token: string; refresh_token?: string }
}

export const exchangeCode = (code: string, origin: string) =>
  token({ code, grant_type: 'authorization_code', redirect_uri: redirectUri(origin) })

export const refreshAccess = async (refreshToken: string) =>
  (await token({ refresh_token: refreshToken, grant_type: 'refresh_token' })).access_token

export async function myChannel(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', { headers: { Authorization: `Bearer ${accessToken}` } })
  const json = await res.json()
  const ch = json.items?.[0]
  if (!ch) throw new Error('This Google account has no YouTube channel')
  return { id: ch.id as string, title: ch.snippet?.title as string }
}

export async function uploadVideo(accessToken: string, video: ArrayBuffer, meta: { title: string; description: string; privacy: 'public' | 'unlisted' | 'private' }) {
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': String(video.byteLength),
      'X-Upload-Content-Type': 'video/mp4',
    },
    body: JSON.stringify({
      snippet: { title: meta.title.slice(0, 100), description: meta.description.slice(0, 5000), categoryId: '22' },
      status: { privacyStatus: meta.privacy, selfDeclaredMadeForKids: false },
    }),
  })
  const location = init.headers.get('location')
  if (!init.ok || !location) {
    const j = await init.json().catch(() => ({}))
    throw new Error(j.error?.message || `YouTube upload init failed (${init.status})`)
  }
  const put = await fetch(location, { method: 'PUT', headers: { 'Content-Type': 'video/mp4' }, body: video })
  const json = await put.json().catch(() => ({}))
  if (!put.ok || !json.id) throw new Error(json.error?.message || `YouTube upload failed (${put.status})`)
  return { id: json.id as string, url: `https://youtube.com/shorts/${json.id}` }
}
