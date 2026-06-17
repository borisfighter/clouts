// Email helpers - add 'resend' package and RESEND_API_KEY env var to use

export async function sendWelcomeEmail(email: string, name: string) {
  console.log('Welcome email to', email, name)
}

export async function sendClipReadyEmail(clip: { title: string }) {
  console.log('Clip ready:', clip.title)
}
