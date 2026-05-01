import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  GraduationCap,
  Mail,
  Search,
  UserRoundCheck,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const accountSteps = [
  {
    title: 'Open Huawei Talent Online',
    body: 'Go to Huawei Talent Online and create a Uniportal account. Use an email you will keep access to, not a temporary email.',
    link: 'https://e.huawei.com/en/talent/cert/#/careerCert',
    linkLabel: 'Open Huawei Talent',
  },
  {
    title: 'Complete your profile and real-name information',
    body: 'Go to User Center / My Info and add your real name exactly as it appears on the ID you will use for the exam. Do not use nicknames.',
    link: 'https://e.huawei.com/en/talent/usercenter/#/home/myinfo',
    linkLabel: 'Open My Info',
  },
  {
    title: 'Choose one realistic HCIA track',
    body: 'Pick the track you can actually study for. Most students should ask for HCIA first, not HCIP or HCIE.',
  },
  {
    title: 'Save your account email and Huawei ID details',
    body: 'You may need to send these to the university instructor or academy coordinator so they can assign the voucher correctly.',
  },
];

const tracks = [
  {
    title: 'HCIA-Datacom',
    body: 'Best first choice for networks, communications, routing, switching, and infrastructure students.',
  },
  {
    title: 'HCIA-Cloud',
    body: 'Good if your focus is cloud, DevOps, backend, infrastructure, or Huawei Cloud services.',
  },
  {
    title: 'HCIA-AI',
    body: 'Good if you already know Python basics and have studied machine learning fundamentals.',
  },
  {
    title: 'HCIA-Security / Storage',
    body: 'Choose this only if your instructor confirms that training material and vouchers are available.',
  },
];

const askSteps = [
  'Find the Huawei ICT Academy instructor, networks/cloud lab instructor, department training coordinator, or university training center.',
  'Send the message template below. Do not only ask "is it free?" Ask for the track, requirements, voucher type, and deadline.',
  'If they reply yes, ask whether the voucher will appear inside Huawei Talent Online under My Voucher or whether they will give you a code.',
  'Ask whether you must finish training, attend a session, pass a mock exam, or submit your Huawei account email first.',
];

const afterVoucherSteps = [
  {
    title: 'Check Huawei Talent Online > User Center > My Voucher',
    body: 'If the voucher is assigned to your account, it should appear in My Voucher. Confirm the exam name, status, expiry date, and usage method.',
  },
  {
    title: 'If they give you a voucher code, keep it private',
    body: 'A voucher is used for payment. Do not post it in group chats or send it to people who are not helping with your registration.',
  },
  {
    title: 'Open the Huawei Pearson VUE page',
    body: 'Huawei written exams are scheduled through Pearson VUE. Log in from the Huawei Pearson VUE page with your verified Huawei account flow.',
    link: 'https://www.pearsonvue.com/us/en/huawei.html',
    linkLabel: 'Open Pearson VUE Huawei',
  },
  {
    title: 'Select the exact exam',
    body: 'Search for the exam your instructor told you to take. Match the track and exam code carefully. Do not schedule a different exam just because the name looks similar.',
  },
  {
    title: 'Choose test center / date / time',
    body: 'Pick an available test center and time. Leave enough time to finish studying before the voucher expires.',
  },
  {
    title: 'At payment, choose exam voucher',
    body: 'Use the voucher option during payment. If your voucher is already attached to your Huawei account, the system may show it as an available voucher/coupon.',
  },
  {
    title: 'Save the confirmation email',
    body: 'After scheduling, save the Pearson VUE confirmation email and check the appointment in your account.',
  },
];

const examDayRules = [
  'Bring valid photo ID. The name must match your Huawei Talent profile.',
  'Arrive early. Pearson VUE says candidates should arrive at least 15 minutes before the appointment.',
  'Do not bring notes, bags, phones, watches, or personal items into the testing room.',
  'If you need to reschedule or cancel, do it at least 24 hours before the exam time.',
];

const messageTemplate = `السلام عليكم دكتور/مهندس [الاسم]،

أنا [اسمك] طالب/ـة في [الجامعة / القسم / المرحلة].

سجلت حساب على Huawei Talent Online وأريد أعرف إذا جامعتنا عدها فوچرات مجانية أو مخفضة لامتحانات Huawei Certification.

ممكن أعرف:
1. شنو الشهادات المتوفرة؟ مثل HCIA-Datacom أو HCIA-Cloud أو HCIA-AI
2. هل لازم أحضر تدريب أو أجيب mock exam score؟
3. هل الفوچر ينضاف لحسابي في Huawei Talent Online > My Voucher لو ترسلون كود؟
4. شنو آخر موعد لاستخدام الفوچر؟
5. شنو المعلومات المطلوبة مني حتى أقدم؟

معلوماتي:
Name: [Your full name exactly like ID]
University email: [email]
Huawei account email: [email]
Preferred track: [HCIA-Datacom / HCIA-Cloud / HCIA-AI]

شكرًا جزيلًا.`;

const englishTemplate = `Hello Dr./Eng. [Name],

I am [Your Name], a student at [University / Department / Stage].

I created a Huawei Talent Online account and I want to ask whether our university currently has free or discounted Huawei Certification exam vouchers.

Could you please confirm:
1. Which tracks are available? For example HCIA-Datacom, HCIA-Cloud, or HCIA-AI
2. Do I need to attend training or submit a mock exam score?
3. Will the voucher appear in Huawei Talent Online > My Voucher, or will I receive a voucher code?
4. What is the voucher expiry date?
5. What information do you need from me?

My details:
Name: [Your full name exactly like ID]
University email: [email]
Huawei account email: [email]
Preferred track: [HCIA-Datacom / HCIA-Cloud / HCIA-AI]

Thank you.`;

const sources = [
  {
    label: 'Huawei Talent Online',
    href: 'https://e.huawei.com/en/talent/',
  },
  {
    label: 'Huawei account real-name info page',
    href: 'https://e.huawei.com/en/talent/usercenter/#/home/myinfo',
  },
  {
    label: 'Huawei certification testing with Pearson VUE',
    href: 'https://www.pearsonvue.com/us/en/huawei.html',
  },
  {
    label: 'Huawei voucher information on Pearson VUE',
    href: 'https://www.pearsonvue.com/us/en/huawei/vouchers.html',
  },
];

function StepCard({
  number,
  title,
  body,
  link,
  linkLabel,
}: {
  number: number;
  title: string;
  body: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="border border-border rounded-lg p-6">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center flex-shrink-0 text-sm">
          {number}
        </div>
        <div>
          <h3 className="font-medium mb-2">{title}</h3>
          <p className="text-sm text-muted leading-relaxed">{body}</p>
          {link && linkLabel && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm mt-4 text-foreground hover:text-muted transition-colors"
            >
              {linkLabel}
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

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
                  <p className="text-sm text-muted mb-5">Huawei certification vouchers for students in Iraq</p>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6">
                    Do this step by step to check, request, and use a Huawei exam voucher.
                  </h1>
                  <p className="text-lg md:text-xl text-muted leading-relaxed">
                    This guide is for students who heard that their university might provide Huawei certification vouchers but do not know where to start. Follow the steps in order.
                  </p>
                </div>

                <aside className="border border-border rounded-lg p-6">
                  <p className="text-xs uppercase text-muted mb-4">You need</p>
                  <div className="space-y-4 text-sm text-muted">
                    <p>
                      <span className="text-foreground">1.</span> Huawei Talent Online account
                    </p>
                    <p>
                      <span className="text-foreground">2.</span> real name matching your ID
                    </p>
                    <p>
                      <span className="text-foreground">3.</span> university contact or instructor
                    </p>
                    <p>
                      <span className="text-foreground">4.</span> voucher or voucher confirmation
                    </p>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container max-w-content">
              <SectionTitle eyebrow="First" title="Create and prepare your Huawei account" />

              <div className="space-y-5">
                {accountSteps.map((step, index) => (
                  <StepCard key={step.title} number={index + 1} {...step} />
                ))}
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Choose" title="Pick a certification track before you message anyone" />

              <div className="space-y-4">
                {tracks.map((track) => (
                  <div key={track.title} className="border border-border rounded-lg p-5">
                    <h3 className="font-medium mb-2">{track.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{track.body}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted leading-relaxed mt-8">
                If you are not sure, ask for HCIA-Datacom. It is usually the clearest starting point for computer engineering, IT, networks, and communications students.
              </p>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Then" title="Ask your university the right way" />

              <div className="space-y-4">
                {askSteps.map((step, index) => (
                  <div key={step} className="flex gap-3 text-muted">
                    <Search size={18} className="mt-1 text-foreground flex-shrink-0" />
                    <p className="leading-relaxed">
                      <span className="text-foreground">Step {index + 1}:</span> {step}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid md:grid-cols-2 gap-6">
                <TemplateBox title="Arabic message">
                  {messageTemplate}
                </TemplateBox>
                <TemplateBox title="English message">
                  {englishTemplate}
                </TemplateBox>
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="After approval" title="Use the voucher and schedule the exam" />

              <div className="space-y-5">
                {afterVoucherSteps.map((step, index) => (
                  <StepCard key={step.title} number={index + 1} {...step} />
                ))}
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Exam day" title="Do not lose the voucher because of avoidable mistakes" />

              <div className="space-y-4">
                {examDayRules.map((rule) => (
                  <div key={rule} className="flex gap-3 text-muted">
                    <ClipboardCheck size={18} className="mt-1 text-foreground flex-shrink-0" />
                    <p className="leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="If stuck" title="What to do when something goes wrong" />

              <div className="grid md:grid-cols-2 gap-5">
                <div className="border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <UserRoundCheck size={18} />
                    <h3 className="font-medium">Voucher does not appear</h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    Send your Huawei account email to the instructor and ask whether the voucher is assigned to your account, sent as a code, or still pending.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CalendarClock size={18} />
                    <h3 className="font-medium">No exam date available</h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    Ask Pearson VUE or the instructor whether another test center, later date, or exam window is available before the voucher expires.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CircleAlert size={18} />
                    <h3 className="font-medium">Name does not match ID</h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    Fix your Huawei profile before scheduling. Pearson VUE warns that mismatched ID information can stop you from taking the exam.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <GraduationCap size={18} />
                    <h3 className="font-medium">University says no</h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    Ask whether there is a next training round, Huawei ICT Competition group, another department coordinator, or a waiting list.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="section border-t border-border">
            <div className="container max-w-content">
              <SectionTitle eyebrow="Checklist" title="Before you finish" />

              <div className="space-y-4">
                {[
                  'Huawei Talent account created',
                  'Real name matches official ID',
                  'University/instructor contacted',
                  'Voucher status or code confirmed',
                  'Exam track and exam code confirmed',
                  'Pearson VUE appointment saved',
                  'ID and exam rules checked before exam day',
                ].map((item) => (
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
              <SectionTitle eyebrow="Sources" title="Official links used for this guide" />

              <div className="divide-y divide-border border-y border-border">
                {sources.map((source) => (
                  <a
                    key={source.href}
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 py-5"
                  >
                    <span>{source.label}</span>
                    <ArrowUpRight size={18} className="text-muted group-hover:text-foreground transition-colors" />
                  </a>
                ))}
              </div>

              <p className="text-sm text-muted leading-relaxed mt-8">
                Voucher availability is controlled by Huawei programs, partners, or university channels. This guide helps you follow the correct process; it does not guarantee that every university has free vouchers.
              </p>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
