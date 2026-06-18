import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service | Clouts', description: 'Clouts Terms of Service' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#08090A] text-white">
      <nav className="flex h-16 items-center justify-between border-b border-white/[0.07] px-8">
        <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
        <Link href="/auth/login" className="text-sm text-white/50 hover:text-white">Log in</Link>
      </nav>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-black mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: June 2026</p>
        <div className="prose prose-invert prose-sm max-w-none space-y-8">
          {[
            { title: '1. Acceptance of Terms', body: 'By accessing or using Clouts ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.' },
            { title: '2. Description of Service', body: 'Clouts provides AI visibility monitoring, brand mention tracking across AI engines, content clipping, and related marketing analytics tools. The Service is provided "as is" and we reserve the right to modify or discontinue it at any time.' },
            { title: '3. User Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.' },
            { title: '4. Acceptable Use', body: 'You agree not to use the Service to: violate any laws or regulations; infringe on intellectual property rights; transmit malicious code; attempt to gain unauthorized access to any systems; or use the Service in a way that could damage, disable, or impair it.' },
            { title: '5. Payment and Billing', body: 'Paid plans are billed monthly or annually in advance. All payments are non-refundable except as required by law. We reserve the right to change pricing with 30 days notice.' },
            { title: '6. Data and Privacy', body: 'Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to the collection and use of data as described therein.' },
            { title: '7. Intellectual Property', body: 'The Service and its original content, features, and functionality are owned by Clouts and are protected by international copyright, trademark, and other intellectual property laws.' },
            { title: '8. Limitation of Liability', body: 'To the maximum extent permitted by law, Clouts shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.' },
            { title: '9. Changes to Terms', body: 'We reserve the right to modify these terms at any time. We will notify users of significant changes via email or a prominent notice on the Service.' },
            { title: '10. Contact', body: 'For questions about these Terms, please contact us at hello@clouts.com.' },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
              <p className="text-white/60 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
