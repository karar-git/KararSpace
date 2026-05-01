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
    href: 'https://e.huawei.com/se/solutions/services/learning-and-certification',
  },
  {
    label: 'Huawei ICT Technical Training',
    href: 'https://e.huawei.com/en/solutions/services/learning-and-certification/technical-talent',
  },
  {
    label: 'Huawei Cloud Certifications',
    href: 'https://edu.huaweicloud.com/intl/en-us/certificationindex.html',
  },
];

const quickChecks = [
  'Search your university website and Facebook pages for "Huawei ICT Academy", "Huawei instructor", "Huawei competition", or "HCIA".',
  'Ask your department secretary, network lab supervisor, or continuing education/training center if there is a Huawei academy coordinator.',
  'Message students who joined Huawei ICT Competition from your university. They usually know the instructor or group chat.',
  'Check whether the voucher is for a specific track, date, or training campaign before you start studying.',
];

const contactTargets = [
  'Computer engineering / IT / communications department',
  'Networks, cloud, or cybersecurity lab instructors',
  'University training center or continuing education unit',
  'Huawei ICT Academy instructor, if your university has one',
  'Students who joined Huawei ICT Competition or previous HCIA training',
];

const certificationChoices = [
  {
    title: 'HCIA-Datacom',
    body: 'Good starting point if you study networks, communications, infrastructure, or want a practical base for routing and switching concepts.',
  },
  {
    title: 'HCIA-Cloud / Cloud Service',
    body: 'Useful if you are aiming at cloud, DevOps, infrastructure, or backend work and your university offers cloud training.',
  },
  {
    title: 'HCIA-AI',
    body: 'Useful if you already study Python, machine learning basics, and want a credential that matches AI-related coursework.',
  },
  {
    title: 'HCIA-Security or Storage',
    body: 'Pick these only if the instructor confirms material, labs, and voucher availability. Do not choose a track just because it sounds impressive.',
  },
];

const steps = [
  {
    icon: Search,
    title: 'Find the real contact person',
    body: 'Do not ask only in public student groups. Find the instructor, academy coordinator, lab supervisor, or training center that handles Huawei activities.',
  },
  {
    icon: MessageSquareText,
    title: 'Ask about voucher rules, not just "is it free?"',
    body: 'Ask which tracks are available, how many vouchers exist, whether you must attend training, whether a mock exam is required, and the expected exam window.',
  },
  {
    icon: GraduationCap,
    title: 'Start with HCIA unless told otherwise',
    body: 'Huawei certification levels are HCIA, HCIP, and HCIE. For most students, HCIA is the realistic first step. HCIP and HCIE are harder and usually need stronger background.',
  },
  {
    icon: BadgeCheck,
    title: 'Prepare proof before asking for the final voucher',
    body: 'Have your university email or ID, Huawei Talent account, chosen track, training attendance proof if required, and any mock exam score the instructor asks for.',
  },
];

const questions = [
  'Does our university currently have Huawei ICT Academy access or a Huawei instructor?',
  'Are certification exam vouchers available this semester?',
  'Which certifications are covered: HCIA-Datacom, HCIA-AI, HCIA-Cloud, Security, or something else?',
  'Is the voucher fully free, discounted, or only for students who complete training?',
  'Is there a deadline, mock exam requirement, or limited number of seats?',
  'Which account/email should I use for Huawei Talent Online registration?',
];

const prepareItems = [
  'University ID or proof that you are currently a student',
  'Huawei Talent Online account using an email you can keep access to',
  'Selected certification track and exam code, if the instructor gives one',
  'Training attendance or mock exam score, if required',
  'A realistic study plan before the voucher expires',
];

const redFlags = [
  'Someone asks you to buy a "guaranteed" voucher from a personal account.',
  'The voucher source is not a university, Huawei instructor, Huawei Academy, or official training partner.',
  'They cannot tell you the certification track, exam process, or expiry date.',
  'They ask for your account password instead of telling you how to register yourself.',
];

const englishTemplate = `Hello Dr./Eng. [Name],

I am a student at [University / Department]. I wanted to ask whether our university currently has access to Huawei certification exam vouchers through Huawei ICT Academy, Huawei instructors, or any active training campaign.

If vouchers are available, could you please tell me:
- which certification tracks are included
- whether training or a mock exam is required
- how to register correctly
- the deadline or exam window

Thank you.`;

const arabicTemplate = `السلام عليكم دكتور/مهندس [الاسم]،

أنا طالب/ـة في [الجامعة / القسم]. حبيت أسأل إذا جامعتنا عدها حاليًا فوچرات امتحانات Huawei عن طريق Huawei ICT Academy أو مدربين Huawei أو أي تدريب مفتوح للطلبة.

إذا الفوچرات متوفرة، ممكن أعرف:
- شنو الشهادات المشمولة؟
- هل لازم أحضر تدريب أو أمتحن mock exam؟
- شلون أسجل بالطريقة الصحيحة؟
- شنو آخر موعد أو فترة الامتحان؟

شكرًا جزيلًا.`;

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs uppercase text-muted mb-3">{eyebrow}</p>
      <h2 className="text-2xl md:text-3xl font-medium">{title}</h2>
    </div>
  );
}

function TemplateBox({ title, children }: { title: string; children: string }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4 text-sm text-muted">
        <Mail size={16} />
        {title}
      </div>
      <pre className="whitespace-pre-wrap p-5 text-sm leading-relaxed text-foreground/90 bg-border/20 overflow-x-auto">
        {children}
      </pre>
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

              <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-12 lg:gap-16 items-start">
                <div className="max-w-3xl">
                  <p className="text-sm text-muted mb-5">For students in Iraq</p>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6">
                    How to check if your university can give you a free Huawei certification voucher.
                  </h1>
                  <p className="text-lg md:text-xl text-muted leading-relaxed">
                    This is not a magic public coupon link. In some universities, Huawei exam vouchers are distributed through ICT Academy instructors, training centers, or university campaigns. The useful part is knowing exactly who to ask and what to ask for.
                  </p>
                </div>

                <aside className="border border-border rounded-lg p-6">
                  <p className="text-xs uppercase text-muted mb-4">Short version</p>
                  <div className="space-y-4 text-sm text-muted">
                    <p>
                      <span className="text-foreground">Start with:</span> your department, networks/cloud lab, or Huawei ICT Academy instructor.
                    </p>
                    <p>
                      <span className="text-foreground">Ask for:</span> certification voucher availability, eligible tracks, requirements, and deadline.
                    </p>
                    <p>
                      <span className="text-foreground">Be careful:</span> not every university has vouchers, and availability can change.
                    </p>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Reality check" title="What this opportunity actually is" />

              <div className="space-y-6 text-muted leading-relaxed">
                <p>
                  Huawei runs learning and certification programs for ICT talent. Its certification levels are HCIA, HCIP, and HCIE, which stand for Associate, Professional, and Expert. Huawei also works with universities through ICT Academy-style programs in many countries.
                </p>
                <p>
                  When people say "Huawei certificates for free", they usually mean an exam voucher: a code or allocation that covers or reduces the exam fee. The voucher is normally controlled by an instructor, academy coordinator, university training center, or a specific campaign. That is why asking the right person matters more than searching for a random link.
                </p>
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="10-minute check" title="How to know if your university might have access" />

              <div className="space-y-4">
                {quickChecks.map((item) => (
                  <div key={item} className="flex gap-3 text-muted">
                    <CheckCircle2 size={18} className="mt-1 text-foreground flex-shrink-0" />
                    <p className="leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 border border-border rounded-lg p-6">
                <h3 className="font-medium mb-4">People worth contacting</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {contactTargets.map((target) => (
                    <div key={target} className="text-sm text-muted border border-border rounded-lg p-4">
                      {target}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Process" title="The exact process I would follow" />

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
              <SectionTitle eyebrow="Choosing" title="Which Huawei certification should you ask about?" />

              <div className="space-y-4">
                {certificationChoices.map((choice) => (
                  <div key={choice.title} className="border border-border rounded-lg p-5">
                    <h3 className="font-medium mb-2">{choice.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{choice.body}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted leading-relaxed mt-8">
                If you are unsure, ask for the track with the clearest training plan and voucher availability. A certificate you can actually study for and pass is better than a more impressive track with no material, no labs, and no exam date.
              </p>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Ask this" title="Questions that get you a useful answer" />

              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question} className="flex gap-3 text-muted">
                    <FileQuestion size={18} className="mt-1 text-foreground flex-shrink-0" />
                    <p className="leading-relaxed">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Templates" title="Copy one of these messages" />

              <div className="space-y-6">
                <TemplateBox title="English message">
                  {englishTemplate}
                </TemplateBox>
                <TemplateBox title="Arabic message">
                  {arabicTemplate}
                </TemplateBox>
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Before exam day" title="What to prepare if they say yes" />

              <div className="space-y-4">
                {prepareItems.map((item) => (
                  <div key={item} className="flex gap-3 text-muted">
                    <CheckCircle2 size={18} className="mt-1 text-foreground flex-shrink-0" />
                    <p className="leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="If the answer is no" title="What to do if your university has no vouchers" />

              <div className="space-y-6 text-muted leading-relaxed">
                <p>
                  Ask if there is a waiting list, next training round, Huawei ICT Competition contact, or another department that handles Huawei programs. Sometimes the opportunity exists but is managed outside your department.
                </p>
                <p>
                  If there is truly no voucher, you can still use Huawei Talent Online and official learning pages to study. Then watch for university announcements, Huawei ICT Competition posts, and training campaigns. Do not pay a random person just because they claim they can get you a voucher.
                </p>
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Safety" title="Red flags" />

              <div className="space-y-4">
                {redFlags.map((flag) => (
                  <div key={flag} className="flex gap-3 text-muted">
                    <FileQuestion size={18} className="mt-1 text-foreground flex-shrink-0" />
                    <p className="leading-relaxed">{flag}</p>
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
                I am not claiming every Iraqi university has free vouchers. The point of this guide is to help you verify the opportunity correctly through your university or Huawei-related training channel.
              </p>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
