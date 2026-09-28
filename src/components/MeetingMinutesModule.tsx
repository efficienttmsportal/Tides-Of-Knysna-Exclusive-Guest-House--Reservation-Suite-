import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Mail, 
  Plus, 
  Calendar, 
  Users, 
  CheckSquare, 
  Trash2, 
  Edit, 
  X, 
  Check, 
  ShieldCheck, 
  Building2 
} from 'lucide-react';
import { CompanyInfoData } from './CompanyInfoModule';

export interface MeetingMinuteItem {
  id: string;
  title: string;
  date: string;
  location: string;
  chairperson: string;
  attendees: string[];
  agenda: string[];
  discussionNotes: string;
  actionItems: {
    task: string;
    assignee: string;
    dueDate: string;
    completed: boolean;
  }[];
  decisions: string[];
}

interface MeetingMinutesModuleProps {
  companyInfo: CompanyInfoData;
}

export const MeetingMinutesModule: React.FC<MeetingMinutesModuleProps> = ({ companyInfo }) => {
  const [meetings, setMeetings] = useState<MeetingMinuteItem[]>([
    {
      id: 'met-001',
      title: 'Q3 Executive Operations & Guest Experience Review',
      date: '2026-09-24',
      location: 'Executive Boardroom & Garden Terrace',
      chairperson: 'Eleanor Sterling (General Manager)',
      attendees: ['Eleanor Sterling', 'Maria Cloete (Housekeeping Lead)', 'Liam Vance (F&B Director)', 'Dr. Jonathan Sterling (Director)'],
      agenda: [
        'Review of Q3 occupancy rates and 5-star accreditation standards',
        'Staff shift rotation schedules and housekeeping efficiency',
        'New seasonal specials and digital marketing promotion rollout',
        'Inventory audit and linen replacement procurement'
      ],
      discussionNotes: 'The team reviewed overall occupancy holding steady at 88%. Housekeeping reported zero lint defects in 600TC Egyptian cotton stock. Marketing presented the new seasonal promotion flyers and email signature campaigns.',
      actionItems: [
        { task: 'Finalize summer guest welcome gift baskets', assignee: 'Liam Vance', dueDate: '2026-10-01', completed: true },
        { task: 'Complete quarterly linen count audit in inventory', assignee: 'Maria Cloete', dueDate: '2026-10-05', completed: false },
        { task: 'Update QR station links in Garden Terrace suites', assignee: 'Eleanor Sterling', dueDate: '2026-10-10', completed: false }
      ],
      decisions: [
        'Approved budget for upgrading suite outdoor lounging furniture.',
        'Adopted new digital guest satisfaction survey system in the Guest Portal.'
      ]
    },
    {
      id: 'met-002',
      title: 'Monthly Safety & Hospitality Protocol Briefing',
      date: '2026-09-10',
      location: 'Conference Lounge',
      chairperson: 'Maria Cloete',
      attendees: ['Maria Cloete', 'All Front Desk & Housekeeping Staff'],
      agenda: [
        'Fire safety compliance and emergency exit routes',
        'Guest confidentiality and data security protocols',
        'Eco-friendly laundry detergent transition'
      ],
      discussionNotes: 'All staff briefed on updated fire safety drills. Guest address book data privacy reaffirmed in compliance with tourism standards.',
      actionItems: [
        { task: 'Conduct fire extinguisher inspection in main corridor', assignee: 'Maintenance Team', dueDate: '2026-09-15', completed: true }
      ],
      decisions: [
        'Switch entirely to organic fynbos botanical guest amenities.'
      ]
    }
  ]);

  const [activeMeeting, setActiveMeeting] = useState<MeetingMinuteItem | null>(meetings[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editMeeting, setEditMeeting] = useState<MeetingMinuteItem | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMeeting) return;
    if (meetings.some(m => m.id === editMeeting.id)) {
      setMeetings(meetings.map(m => m.id === editMeeting.id ? editMeeting : m));
    } else {
      setMeetings([editMeeting, ...meetings]);
    }
    setActiveMeeting(editMeeting);
    setEditMeeting(null);
  };

  return (
    <div className="space-y-6 pb-12 font-['Arial',sans-serif]">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Executive Meeting Minutes & Governance Records</h2>
          </div>
          <p className="text-xs text-slate-500">
            Official boardroom minutes, attendee tracking, discussion notes, and actionable resolutions. Fully formatted for laser/inkjet printer hard copies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-300 shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print Meeting Minutes
          </button>
          <button
            onClick={() => {
              setEditMeeting({
                id: `met-${Date.now()}`,
                title: 'New Executive Meeting',
                date: new Date().toISOString().split('T')[0],
                location: 'Executive Boardroom',
                chairperson: companyInfo.salesPerson,
                attendees: [companyInfo.salesPerson, 'Head of Housekeeping', 'F&B Manager'],
                agenda: ['General Operations', 'Financial Performance', 'Guest Satisfaction'],
                discussionNotes: 'Discussion notes go here...',
                actionItems: [{ task: 'Review monthly KPIs', assignee: 'General Manager', dueDate: new Date().toISOString().split('T')[0], completed: false }],
                decisions: ['Meeting convened successfully.']
              });
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" /> New Meeting Minutes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting List Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 lg:col-span-1">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider px-2">Archived Meetings</h3>
          <div className="space-y-2">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => setActiveMeeting(meeting)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col space-y-1.5 ${
                  activeMeeting?.id === meeting.id
                    ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{meeting.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{meeting.date}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Users className="w-3 h-3" />
                  <span>{meeting.attendees.length} Attendees</span>
                  <span>•</span>
                  <span>{meeting.actionItems.filter(a => a.completed).length}/{meeting.actionItems.length} Actions</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Meeting Document View */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 lg:col-span-2 print:border-none print:shadow-none">
          {activeMeeting ? (
            <div className="space-y-6">
              {/* Document Header */}
              <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    <Building2 className="w-3.5 h-3.5" /> {companyInfo.name} • Official Minutes
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{activeMeeting.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {activeMeeting.date}</span>
                    <span>📍 {activeMeeting.location}</span>
                    <span>👤 Chair: {activeMeeting.chairperson}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditMeeting(activeMeeting)}
                    className="p-2 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl transition"
                    title="Edit Minutes"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this meeting record?')) {
                        setMeetings(meetings.filter(m => m.id !== activeMeeting.id));
                        setActiveMeeting(meetings.find(m => m.id !== activeMeeting.id) || null);
                      }
                    }}
                    className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl transition"
                    title="Delete Meeting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Attendees */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">Attendees Present</h4>
                <div className="flex flex-wrap gap-2">
                  {activeMeeting.attendees.map((attendee, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                      {attendee}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agenda */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">Meeting Agenda</h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {activeMeeting.agenda.map((item, idx) => (
                    <li key={idx} className="py-0.5">{item}</li>
                  ))}
                </ol>
              </div>

              {/* Discussion Notes */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">Discussion Notes</h4>
                <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {activeMeeting.discussionNotes}
                </div>
              </div>

              {/* Decisions Made */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">Key Decisions & Resolutions</h4>
                <ul className="space-y-2">
                  {activeMeeting.decisions.map((decision, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Items */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">Action Items & Deliverables</h4>
                <div className="space-y-2">
                  {activeMeeting.actionItems.map((action, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={action.completed}
                          onChange={() => {
                            const updated = { ...activeMeeting };
                            updated.actionItems[idx].completed = !updated.actionItems[idx].completed;
                            setActiveMeeting(updated);
                            setMeetings(meetings.map(m => m.id === updated.id ? updated : m));
                          }}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                        <span className={action.completed ? 'line-through text-slate-400' : 'text-slate-900 font-medium'}>
                          {action.task}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Assignee: <strong className="text-slate-800">{action.assignee}</strong></span>
                        <span>Due: <strong className="text-slate-800">{action.dueDate}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">Select a meeting from the sidebar to view minutes.</div>
          )}
        </div>
      </div>

      {/* Edit / Add Meeting Modal */}
      {editMeeting && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveMeeting} className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Meeting Minutes</h3>
              <button type="button" onClick={() => setEditMeeting(null)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={editMeeting.title}
                  onChange={(e) => setEditMeeting({ ...editMeeting, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editMeeting.date}
                    onChange={(e) => setEditMeeting({ ...editMeeting, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chairperson</label>
                  <input
                    type="text"
                    required
                    value={editMeeting.chairperson}
                    onChange={(e) => setEditMeeting({ ...editMeeting, chairperson: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discussion Notes</label>
                <textarea
                  rows={4}
                  value={editMeeting.discussionNotes}
                  onChange={(e) => setEditMeeting({ ...editMeeting, discussionNotes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setEditMeeting(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs">
                Save Minutes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
