import React, { useState, useEffect } from 'react';
import { User, UserRole, Assignment, Submission } from './types.ts';
import { Users as UsersIcon } from 'lucide-react';
import { MOCK_USERS, MOCK_ASSIGNMENTS } from './constants.tsx';
import Layout from './components/Layout.tsx';
import Chatbot from './components/Chatbot.tsx';
import StudentDashboard from './views/StudentDashboard.tsx';
import ProfessorDashboard from './views/ProfessorDashboard.tsx';
import HodDashboard from './views/HodDashboard.tsx';
import AdminDashboard from './views/AdminDashboard.tsx';
import SignIn from './components/SignIn.tsx';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Simulation of loading data
  useEffect(() => {
    const savedSubs = localStorage.getItem('edu_submissions');
    if (savedSubs) setSubmissions(JSON.parse(savedSubs));
    
    const savedAsgs = localStorage.getItem('edu_assignments');
    if (savedAsgs) setAssignments(JSON.parse(savedAsgs));
  }, []);

  useEffect(() => {
    localStorage.setItem('edu_submissions', JSON.stringify(submissions));
    localStorage.setItem('edu_assignments', JSON.stringify(assignments));
  }, [submissions, assignments]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddSubmission = (sub: Submission) => {
    setSubmissions(prev => [sub, ...prev]);
  };

  const handleAddAssignment = (asg: Assignment) => {
    setAssignments(prev => [asg, ...prev]);
    setActiveView('dashboard'); // Redirect to dashboard after creation
  };

  if (!currentUser) {
    return <SignIn users={MOCK_USERS} onSignIn={handleLogin} />;
  }

  const getChatContext = () => {
    const userSubs = submissions.filter(s => s.studentId === currentUser.id);
    return `User is ${currentUser.name} (${currentUser.role}). 
      Current stats: ${userSubs.length} submissions. 
      Active assignments: ${assignments.map(a => a.title).join(', ')}.`;
  };

  return (
    <Layout 
      user={currentUser} 
      activeView={activeView} 
      setActiveView={setActiveView}
      onLogout={handleLogout}
    >
      {activeView === 'chat' ? (
        <Chatbot user={currentUser} context={getChatContext()} />
      ) : currentUser.role === UserRole.STUDENT ? (
        <StudentDashboard 
          user={currentUser} 
          assignments={assignments} 
          submissions={submissions.filter(s => s.studentId === currentUser.id)}
          onAddSubmission={handleAddSubmission}
          activeTab={activeView}
        />
      ) : currentUser.role === UserRole.PROFESSOR ? (
        <ProfessorDashboard 
          user={currentUser} 
          allUsers={MOCK_USERS}
          assignments={assignments} 
          submissions={submissions}
          activeTab={activeView}
          onAddAssignment={handleAddAssignment}
        />
      ) : currentUser.role === UserRole.HOD ? (
        <HodDashboard 
          user={currentUser}
          assignments={assignments}
          submissions={submissions}
        />
      ) : currentUser.role === UserRole.ADMIN ? (
        <AdminDashboard
          user={currentUser}
          allUsers={MOCK_USERS}
          assignments={assignments}
          submissions={submissions}
          activeTab={activeView}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          {/* fallback should not normally be reached since all roles are covered */}
          <UsersIcon size={64} className="text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Administrator Console</h2>
          <p className="text-slate-500 max-w-md">System-wide configuration portal.</p>
        </div>
      )}
    </Layout>
  );
};

export default App;