import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  FileQuestion,
  GraduationCap,
  Mail,
  MessageSquareText,
  Search,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const officialLinks = [
  {
    label: 'Huawei Talent Online',
    href: 'https://e.huawei.com/en/talent/',
  },
  {
    label: 'Huawei Learning and Certification',
    href: 'https://e.huawei.com/eu/solutions/services/learning-and-certification',
  },
  {
    label: 'Huawei Cloud Certifications',
    href: 'https://edu.huaweicloud.com/intl/en-us/certificationindex.html',
  },
];

const certificationTracks = [
  'Datacom and networking',
  'Cloud and cloud services',
  'AI and big data',
  'Security, storage, WLAN, and other ICT infrastructure topics',
];

const steps = [
  {
    icon: Search,
    title: 'Check whether your university has a Huawei channel',
    body: 'Start with your computer engineering, IT, networks, or communications department. Ask if the university has a Huawei ICT Academy, Huawei instructor, Huawei club, or an active training partnership.',
  },
  {
    icon: MessageSquareText,
    title: 'Ask directly about vouchers',
    body: 'Do not wait for a public announcement. Vouchers are often handled by instructors, academy coordinators, training centers, or department contacts, and the number can be limited.',
  },
  {
    icon: GraduationCap,
    title: 'Choose the right starting level',
    body: 'Most students should ask about HCIA first. Huawei certifications are structured as HCIA, HCIP, and HCIE, so HCIA is usually the realistic entry point before moving to professional or expert levels.',
  },
  {
    icon: BadgeCheck,
    title: 'Prepare before requesting the exam',
    body: 'Create a Huawei Talent Online account, study the official learning material when available, and ask whether the instructor requires training attendance, a mock exam, or proof that you are a current student.',
  },
];

const notes = [
  'Availability depends on the university, instructor, campaign, and remaining voucher quota.',
  'A voucher usually reduces or covers the exam fee, but rules can change by certification and region.',
  'Use official Huawei, university, or academy contacts. Be careful with anyone selling unofficial vouchers.',
  'Ask early. If vouchers exist, they may be distributed only during specific training periods.',
];

const messageTemplate = `Hello Dr./Eng. [Name],

I am a student at [University / Department], and I wanted to ask whether our university has access to Huawei certification exam vouchers through Huawei ICT Academy or an instructor program.

If vouchers are available, could you please guide me on the required steps, eligible certification tracks, and any training or mock exam requirements?

Thank you.`;

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs uppercase text-muted mb-3">{eyebrow}</p>
      <h2 className="text-2xl md:text-3xl font-medium">{title}</h2>
    </div>
  );
}

export default function HuaweiFreeCertificationsIraqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <article>
          <section className="section border-b border-border">
            <div className="container max-w-wide">
              <Link
                to="/opportunities"
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-12"
              >
                <ArrowLeft size={16} />
                Opportunities
              </Link>

              <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-12 lg:gap-16 items-start">
                <div className="max-w-3xl">
                  <p className="text-sm text-muted mb-5">For students in Iraq</p>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6">
                    You might be able to take Huawei certification exams for free.
                  </h1>
                  <p className="text-lg md:text-xl text-muted leading-relaxed">
                    Some Iraqi universities work with Huawei programs or instructors and may receive exam vouchers for students. These vouchers are not always advertised clearly, so the best move is simple: ask the right person at your university.
                  </p>
                </div>

                <aside className="border border-border rounded-lg p-6">
                  <p className="text-xs uppercase text-muted mb-4">Quick answer</p>
                  <div className="space-y-4 text-sm text-muted">
                    <p>
                      <span className="text-foreground">Who:</span> tech, computer engineering, IT, networks, communications, and related students.
                    </p>
                    <p>
                      <span className="text-foreground">What:</span> Huawei certification voucher access through some university or academy channels.
                    </p>
                    <p>
                      <span className="text-foreground">Catch:</span> not every university has it, and voucher quantities are usually limited.
                    </p>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Background" title="What are Huawei certifications?" />

              <div className="space-y-6 text-muted leading-relaxed">
                <p>
                  Huawei certifications are technical credentials for ICT skills. Huawei describes its certification system as covering areas across cloud, software and hardware, and infrastructure. The levels are HCIA, HCIP, and HCIE: Associate, Professional, and Expert.
                </p>
                <p>
                  For students, the useful part is that many tracks begin with HCIA. It is the entry-level credential and a practical starting point if you want something recognizable on your CV before applying for internships, trainee roles, or junior technical positions.
                </p>
              </div>

              <div className="mt-10 grid sm:grid-cols-2 gap-4">
                {certificationTracks.map((track) => (
                  <div key={track} className="border border-border rounded-lg p-5 flex gap-3">
                    <CheckCircle2 size={18} className="text-foreground mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted">{track}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Process" title="How to check if you can get a free voucher" />

              <div className="space-y-5">
                {steps.map(({ icon: Icon, title, body }, index) => (
                  <div key={title} className="border border-border rounded-lg p-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center flex-shrink-0">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-1">Step {index + 1}</p>
                        <h3 className="font-medium mb-2">{title}</h3>
                        <p className="text-sm text-muted leading-relaxed">{body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Message" title="Copy this when asking your university" />

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-5 py-4 text-sm text-muted">
                  <Mail size={16} />
                  Email or direct message template
                </div>
                <pre className="whitespace-pre-wrap p-5 text-sm leading-relaxed text-foreground/90 bg-border/20 overflow-x-auto">
                  {messageTemplate}
                </pre>
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Important" title="Things to know before you depend on it" />

              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note} className="flex gap-3 text-muted">
                    <FileQuestion size={18} className="mt-1 text-foreground flex-shrink-0" />
                    <p className="leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Sources" title="Official places to start" />

              <div className="divide-y divide-border border-y border-border">
                {officialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 py-5"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight size={18} className="text-muted group-hover:text-foreground transition-colors" />
                  </a>
                ))}
              </div>

              <p className="text-sm text-muted leading-relaxed mt-8">
                This guide is based on publicly available Huawei learning and certification information plus student-facing university voucher reports. Treat voucher access as something to verify locally, because Huawei programs and university allocations can change.
              </p>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
