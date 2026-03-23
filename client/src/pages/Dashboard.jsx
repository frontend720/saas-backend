// src/pages/Dashboard.jsx
import { useQuery, useMutation } from '@apollo/client'
import { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Camera, FolderOpen, Layers, Settings, LogOut, Plus, ChevronRight, Search, Tag, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/Skeleton.jsx';
import { useToast } from '../context/ToastContext.jsx'; // used in CreateModal
import { MY_PROJECTS } from '../graphql/queries';
import { ME } from '../graphql/queries';
import { CREATE_PROJECT } from '../graphql/mutations';

const MobileHeader = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const active = (path) => pathname === path ? 'text-[#FF4500]' : 'text-[#111111] hover:text-[#FF4500] transition-colors';

  return (
    <div className="md:hidden">
      <div className="h-16 border-b border-[#111111] px-6 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#FF4500]"></div>
          <span className="text-lg font-bold tracking-tight text-[#111111] uppercase">Index</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="font-mono text-sm text-[#111111] border border-[#111111] px-3 py-1 hover:bg-[#111111] hover:text-white transition-colors"
        >
          {open ? 'CLOSE' : 'MENU'}
        </button>
      </div>

      {open && (
        <div className="border-b border-[#111111] bg-white px-6 py-4 space-y-4">
          <nav className="space-y-3 font-mono text-sm">
            <Link to="/" onClick={() => setOpen(false)} className={`flex items-center gap-3 ${active('/')}`}>
              <FolderOpen size={16} />
              [ CAPSULES ]
            </Link>
            <Link to="/settings" onClick={() => setOpen(false)} className={`flex items-center gap-3 ${active('/settings')}`}>
              <Settings size={16} />
              [ SYSTEM_PREFS ]
            </Link>
          </nav>

          {user && (
            <div className="border-t border-[#111111]/10 pt-3 font-mono text-xs text-[#111111]/60">
              {user.name} — {user.tier}
            </div>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-3 text-[#111111] hover:text-[#FF4500] transition-colors font-mono text-sm"
          >
            <LogOut size={16} />
            [ END_SESSION ]
          </button>
        </div>
      )}
    </div>
  );
};

const TIER_LIMITS = { free: 3, pro: 50, enterprise: Infinity };

const Sidebar = ({ user, onLogout, projectCount }) => {
  const { pathname } = useLocation();
  const active = (path) => pathname === path ? 'text-[#FF4500]' : 'text-[#111111] hover:text-[#FF4500] transition-colors';

  const tier = user?.tier || 'free';
  const limit = TIER_LIMITS[tier] ?? 3;
  const pct = limit === Infinity ? 0 : Math.min((projectCount / limit) * 100, 100);

  return (
  <aside className="hidden md:flex flex-col w-64 h-screen border-r border-[#111111] bg-[#F9F9F9] p-6 justify-between shrink-0">
    <div>
      <div className="flex items-center gap-2 mb-12">
        <div className="w-4 h-4 bg-[#FF4500]"></div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111] uppercase">Index</h1>
      </div>

      <nav className="space-y-4 font-mono text-sm">
        <Link to="/" className={`flex items-center gap-3 w-full text-left ${active('/')}`}>
          <FolderOpen size={18} />
          <span>[ CAPSULES ]</span>
        </Link>
        <Link to="/settings" className={`flex items-center gap-3 w-full text-left ${active('/settings')}`}>
          <Settings size={18} />
          <span>[ SYSTEM_PREFS ]</span>
        </Link>
      </nav>
    </div>

    <div className="space-y-4">
      {user && (
        <div className="border border-[#111111] p-4 bg-white">
          <p className="font-mono text-xs text-[#111111]/60 uppercase">Signed in as</p>
          <p className="font-bold text-[#111111] truncate">{user.name}</p>
          <p className="font-mono text-xs text-[#111111]/60 uppercase mt-1">Tier: {user.tier}</p>

          <div className="mt-4">
            <div className="flex justify-between font-mono text-xs uppercase text-[#111111] mb-2">
              <span>Capacity</span>
              <span>{projectCount} / {limit === Infinity ? '∞' : limit}</span>
            </div>
            <div className="w-full h-2 bg-[#F9F9F9] border border-[#111111]">
              <div className="h-full bg-[#FF4500] transition-all" style={{ width: `${pct}%` }} />
            </div>
            {tier === 'free' && (
              <Link
                to="/settings"
                className="mt-3 block w-full py-2 text-center bg-[#111111] text-[#F9F9F9] font-mono text-xs uppercase hover:bg-[#FF4500] transition-colors"
              >
                Expand Storage
              </Link>
            )}
          </div>
        </div>
      )}

      <button
        onClick={onLogout}
        className="flex items-center gap-3 text-[#111111] hover:text-[#FF4500] transition-colors w-full text-left font-mono text-sm"
      >
        <LogOut size={18} />
        <span>[ END_SESSION ]</span>
      </button>
    </div>
  </aside>
  );
};

const CapsuleCard = ({ project }) => (
  <Link to={`/project/${project.id}`} className="group border border-[#111111] bg-white cursor-pointer hover:border-[#FF4500] transition-colors flex flex-col h-64">
    <div className="flex-1 border-b border-[#111111] p-4 flex items-center justify-center bg-[#F9F9F9] group-hover:bg-white transition-colors relative overflow-hidden">
      <Layers className="text-[#111111] opacity-20" size={48} />
      <div className="absolute inset-0 bg-[#FF4500]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="font-mono text-xs text-[#FF4500] bg-white border border-[#FF4500] px-3 py-1 flex items-center gap-1">
          OPEN_CANVAS <ChevronRight size={14} />
        </span>
      </div>
    </div>

    <div className="p-4 flex flex-col gap-1">
      <h3 className="font-bold text-[#111111] truncate uppercase">{project.name}</h3>
      <div className="flex justify-between font-mono text-xs text-[#111111]/70 mt-2">
        <span>ASSETS: {String(project.assetCount || 0).padStart(2, '0')}</span>
        <span className="uppercase">{project.status}</span>
      </div>
    </div>
  </Link>
);

const CreateModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createProject, { loading }] = useMutation(CREATE_PROJECT, {
    refetchQueries: [{ query: MY_PROJECTS }],
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject({ variables: { name, description } });
      setName('');
      setDescription('');
      onClose();
      toast({ message: 'Capsule initialized.' });
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-md border border-[#111111] bg-white p-8">
        <h2 className="text-xl font-bold text-[#111111] uppercase mb-6">Init_Capsule</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-xs uppercase text-[#111111] mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-[#111111] px-4 py-3 bg-[#F9F9F9] font-mono text-sm focus:outline-none focus:border-[#FF4500] transition-colors"
              placeholder="CAPSULE_NAME"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-[#111111] mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-[#111111] px-4 py-3 bg-[#F9F9F9] font-mono text-sm focus:outline-none focus:border-[#FF4500] transition-colors resize-none"
              placeholder="Optional description..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#111111] font-bold uppercase text-sm hover:bg-[#F9F9F9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#FF4500] text-white font-bold uppercase text-sm border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-y-1 active:translate-x-1 hover:bg-[#111111] transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sort, setSort] = useState('newest');

  const { data: meData } = useQuery(ME);
  const { data: projectsData, loading, error } = useQuery(MY_PROJECTS);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allProjects = useMemo(() => projectsData?.myProjects || [], [projectsData]);
  const user = meData?.me;

  const allTags = useMemo(() => {
    const tags = new Set();
    allProjects.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return [...tags];
  }, [allProjects]);

  const projects = useMemo(() => {
    let list = [...allProjects];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (tagFilter) list = list.filter(p => p.tags?.includes(tagFilter));
    if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [allProjects, search, tagFilter, sort]);

  return (
    <div className="flex h-screen w-full bg-[#F9F9F9] font-sans selection:bg-[#FF4500] selection:text-white">
      <Sidebar user={user} onLogout={handleLogout} projectCount={allProjects.length} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader user={user} onLogout={handleLogout} />
        <header className="h-20 border-b border-[#111111] px-6 lg:px-12 flex items-center justify-between bg-white shrink-0">
          <div className="font-mono text-sm text-[#111111]">
            <span className="text-[#FF4500]">SYSTEM</span> // CAPSULES
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#FF4500] text-white px-5 py-2.5 font-bold hover:bg-[#111111] transition-colors shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-y-1 active:translate-x-1 border border-[#111111]"
          >
            <Plus size={18} />
            <span className="uppercase text-sm tracking-wide">Init_Capsule</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-[#111111] uppercase tracking-tighter mb-2">Active Capsules</h2>
            <p className="font-mono text-sm text-[#111111]/60 mb-6">
              {allProjects.length > 0
                ? `${String(projects.length).padStart(2, '0')} CAPSULES INITIALIZED.`
                : 'NO CAPSULES INITIALIZED.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#111111]/40" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH CAPSULES..."
                  className="w-full border border-[#111111] pl-9 pr-4 py-2.5 bg-white font-mono text-xs focus:outline-none focus:border-[#FF4500] transition-colors uppercase placeholder:text-[#111111]/30"
                />
              </div>

              {allTags.length > 0 && (
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#111111]/40" />
                  <select
                    value={tagFilter}
                    onChange={e => setTagFilter(e.target.value)}
                    className="border border-[#111111] pl-9 pr-8 py-2.5 bg-white font-mono text-xs focus:outline-none focus:border-[#FF4500] transition-colors uppercase appearance-none cursor-pointer"
                  >
                    <option value="">ALL TAGS</option>
                    {allTags.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
              )}

              <div className="relative">
                <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#111111]/40" />
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="border border-[#111111] pl-9 pr-8 py-2.5 bg-white font-mono text-xs focus:outline-none focus:border-[#FF4500] transition-colors uppercase appearance-none cursor-pointer"
                >
                  <option value="newest">NEWEST</option>
                  <option value="oldest">OLDEST</option>
                  <option value="name">NAME A–Z</option>
                </select>
              </div>
            </div>
          </div>

          {loading && <DashboardSkeleton />}

          {error && (
            <div className="border border-[#FF4500] bg-[#FF4500]/5 p-4 font-mono text-xs text-[#FF4500]">
              Failed to load capsules: {error.message}
            </div>
          )}

          {!loading && !error && (
            <>
              {projects.length === 0 && allProjects.length > 0 ? (
                <p className="font-mono text-sm text-[#111111]/40">No capsules match your filters.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <CapsuleCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <CreateModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
