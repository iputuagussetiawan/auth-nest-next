import { Briefcase, CalendarClock, FileUser, ShieldCheck, TrendingUp, Wallet } from 'lucide-react'

// Core modules shown on the landing page. Shared by the Core modules and
// Workflow sections so badges and highlights stay in sync.
export const features = [
    {
        icon: FileUser,
        title: 'Employee Records',
        desc: 'Store employee profiles, contracts, documents, and organizational data in one secure workspace.',
        color: 'bg-blue-500/10 text-blue-500',
    },
    {
        icon: CalendarClock,
        title: 'Attendance & Leave',
        desc: 'Track attendance, shift schedules, time-off balances, and approval workflows without spreadsheets.',
        color: 'bg-violet-500/10 text-violet-500',
        highlighted: true,
    },
    {
        icon: Wallet,
        title: 'Payroll Readiness',
        desc: 'Keep compensation, deductions, and HR records aligned so payroll preparation is faster and cleaner.',
        color: 'bg-emerald-500/10 text-emerald-500',
        upcoming: true,
    },
    {
        icon: Briefcase,
        title: 'Recruitment Pipeline',
        desc: 'Manage job openings, candidate stages, interview coordination, and hiring decisions in one flow.',
        color: 'bg-orange-500/10 text-orange-500',
        upcoming: true,
    },
    {
        icon: TrendingUp,
        title: 'Performance Insights',
        desc: 'Monitor headcount, engagement, productivity, and team growth with clear HR analytics.',
        color: 'bg-pink-500/10 text-pink-500',
        upcoming: true,
    },
    {
        icon: ShieldCheck,
        title: 'Access & Compliance',
        desc: 'Protect sensitive HR data with role-based permissions, audit-friendly workflows, and admin controls.',
        color: 'bg-cyan-500/10 text-cyan-500',
        upcoming: true,
    },
]
