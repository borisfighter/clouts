import { Satellite, BarChart3, Bot, Search, ShoppingBag, Newspaper } from 'lucide-react'

const features = [
  {
    icon: Satellite,
    title: 'Answer Engine Insights',
    description: 'See exactly how ChatGPT, Perplexity, Gemini, and others describe your brand across thousands of queries in real time.',
  },
  {
    icon: BarChart3,
    title: 'Prompt Volume Intelligence',
    description: 'Discover what millions of people are asking AI engines every day. Align your content strategy with actual demand signals.',
  },
  {
    icon: Bot,
    title: 'Marketing Agents',
    description: 'Deploy autonomous AI agents that research, write, and optimize content to improve your brand\'s position in LLM answers.',
  },
  {
    icon: Search,
    title: 'Agent Analytics',
    description: 'Track how AI bots crawl and interpret your website. Understand what signals drive citations across every major engine.',
  },
  {
    icon: ShoppingBag,
    title: 'Shopping Intelligence',
    description: 'Monitor how AI shopping assistants recommend your products versus competitors — and optimize to win the cart.',
  },
  {
    icon: Newspaper,
    title: 'PR & Brand Signals',
    description: 'Shape the narrative AI engines repeat about your brand. Monitor sentiment, spot risks, and amplify positive coverage.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="platform" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-4 text-xs font-bold uppercase tracking-widest text-violet-400">
        Platform — AI Visibility
      </div>
      <h2 className="mb-4 max-w-xl text-4xl font-black leading-tight tracking-tight text-white lg:text-5xl">
        Everything your brand needs to win in AI search
      </h2>
      <p className="mb-16 max-w-xl text-lg leading-relaxed text-white/40">
        Monitor how every major AI engine talks about your brand, track prompt volumes,
        and optimize your content to get cited — not skipped.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-all hover:border-white/[0.14] hover:-translate-y-1"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
              <Icon size={18} className="text-violet-400" />
            </div>
            <h3 className="mb-2 text-sm font-bold text-white">{title}</h3>
            <p className="text-sm leading-relaxed text-white/40">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
