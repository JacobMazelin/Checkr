  "use client";
  
  import React, { useState, useEffect } from 'react';
  import { 
    Calendar, 
    Mail, 
    User, 
    Settings, 
    LogOut, 
    CheckCircle, 
    AlertCircle, 
    ChevronRight, 
    Clock, 
    MapPin, 
    Menu,
    X,
    LayoutDashboard,
    RefreshCw,
    Shield,
    Zap
  } from 'lucide-react';

  // --- Mock Data ---

  const MOCK_USER = {
    name: "Alex Taylor",
    email: "alex.taylor@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    memberSince: "Jan 2024"
  };

  const MOCK_EVENTS = [
    {
      id: 1,
      title: "Product Design Review",
      time: "10:00 AM - 11:00 AM",
      location: "Google Meet",
      type: "work",
      attendees: 4
    },
    {
      id: 2,
      title: "Lunch with Sarah",
      time: "12:30 PM - 1:30 PM",
      location: "Blue Bottle Coffee",
      type: "personal",
      attendees: 1
    },
    {
      id: 3,
      title: "Q3 Planning Sync",
      time: "3:00 PM - 4:30 PM",
      location: "Conference Room B",
      type: "work",
      attendees: 8
    },
    {
      id: 4,
      title: "Gym Session",
      time: "6:00 PM - 7:00 PM",
      location: "Equinox",
      type: "personal",
      attendees: 0
    }
  ];

  // --- Components ---

  const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }: any) => {
    const baseStyle = "flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200",
      google: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm",
      danger: "bg-red-50 text-red-600 hover:bg-red-100",
      ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
      outline: "border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
    };

    return (
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
      >
        {Icon && <Icon className="w-5 h-5 mr-2" />}
        {children}
      </button>
    );
  };

  const Card = ({ children, className = '' }: any) => (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );

  const Badge = ({ children, type = 'success' }: any) => {
    const styles = {
      success: "bg-green-100 text-green-700",
      warning: "bg-amber-100 text-amber-700",
      blue: "bg-blue-100 text-blue-700",
      gray: "bg-gray-100 text-gray-600"
    };
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[type as keyof typeof styles]}`}>
        {children}
      </span>
    );
  };

  // --- Main Application ---

  export default function Home() {
    const [authState, setAuthState] = useState<'guest' | 'loading' | 'authenticated'>('guest');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [calendarConnected, setCalendarConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [events, setEvents] = useState<any[]>([]);

    // Simulate Login
    const handleLogin = () => {
      setAuthState('loading');
      setTimeout(() => {
        setAuthState('authenticated');
      }, 1500);
    };

    // Simulate Calendar Connection
    const handleConnectCalendar = () => {
      setIsSyncing(true);
      setTimeout(() => {
        setCalendarConnected(true);
        setEvents(MOCK_EVENTS);
        setIsSyncing(false);
      }, 2000);
    };

    // Simulate Logout
    const handleLogout = () => {
      setAuthState('guest');
      setCalendarConnected(false);
      setEvents([]);
      setActiveTab('dashboard');
    };

    // Render Login Screen
    if (authState === 'guest' || authState === 'loading') {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              
              <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
                Sign up
              </h1>
              <p className="text-center text-gray-500 mb-8">
               Let's get your schedule and emailed synced with your Google account.
              </p>

              {authState === 'loading' ? (
                <div className="flex flex-col items-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500 font-medium">Authenticating with Google...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center px-4 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white group"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium group-hover:text-gray-900">Sign in with Google</span>
                  </button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Secure & Private</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-6 text-gray-400">
                    <Shield className="w-5 h-5" />
                    <Zap className="w-5 h-5" />
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>
            <p className="text-center mt-6 text-sm text-gray-400">
              Made with ❤️ by Anmol & Jacob.
            </p>
          </div>
        </div>
      );
    }

    // --- Authenticated Layout ---

    const NavItem = ({ id, icon: Icon, label }: any) => (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex flex-col md:flex-row items-center md:space-x-3 p-2 md:px-4 md:py-3 rounded-xl transition-all ${
          activeTab === id 
            ? 'text-blue-600 md:bg-blue-50' 
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Icon className={`w-6 h-6 mb-1 md:mb-0 ${activeTab === id ? 'stroke-2' : 'stroke-1.5'}`} />
        <span className={`text-xs md:text-sm font-medium ${activeTab === id ? 'font-semibold' : ''}`}>{label}</span>
      </button>
    );

    return (
      <div className="min-h-screen bg-gray-50 md:flex">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-20">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Dash</span>
            </div>
            
            <nav className="space-y-2">
              <NavItem id="dashboard" icon={LayoutDashboard} label="Overview" />
              <NavItem id="calendar" icon={Calendar} label="Calendar" />
              <NavItem id="settings" icon={Settings} label="Settings" />
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <img src={MOCK_USER.avatar} alt="User" className="w-10 h-10 rounded-full bg-gray-100" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{MOCK_USER.name}</p>
                <p className="text-xs text-gray-500 truncate">Free Plan</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-0">
          
          {/* Mobile Header */}
          <header className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Dash</span>
            </div>
            <img src={MOCK_USER.avatar} alt="User" className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200" />
          </header>

          <div className="p-4 md:p-8 max-w-5xl mx-auto">
            
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hello, Alex! 👋</h2>
                    <p className="text-gray-500">Here's what's happening today.</p>
                  </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="flex flex-col justify-between h-full bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <Badge type="blue" className="bg-white/20 text-white border-0">Connected</Badge>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm mb-1">Google Account</p>
                      <p className="text-lg font-semibold truncate">{MOCK_USER.email}</p>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg ${calendarConnected ? 'bg-green-100' : 'bg-orange-100'}`}>
                        <Calendar className={`w-6 h-6 ${calendarConnected ? 'text-green-600' : 'text-orange-600'}`} />
                      </div>
                      <Badge type={calendarConnected ? 'success' : 'warning'}>
                        {calendarConnected ? 'Active' : 'Setup Required'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Calendar Integration</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {calendarConnected ? `${events.length} Events Today` : 'Not Connected'}
                      </p>
                    </div>
                  </Card>

                  <Card className="md:col-span-2 lg:col-span-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Productivity Score</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-gray-900">92%</p>
                        <p className="text-green-600 text-sm font-medium mb-1.5 flex items-center">
                          <span className="inline-block transform rotate-180 text-[10px] mr-1">▼</span> 
                          +4%
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Quick Action / Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-gray-900 text-lg">Upcoming</h3>
                    
                    {calendarConnected ? (
                      <div className="space-y-3">
                        {events.slice(0, 2).map(event => (
                          <div key={event.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 flex flex-col items-center justify-center bg-blue-50 rounded-lg py-2">
                              <span className="text-xs font-bold text-blue-600 uppercase">Today</span>
                              <span className="text-sm font-bold text-gray-900">{event.time.split(' ')[0]}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{event.title}</h4>
                              <div className="flex items-center text-gray-500 text-sm mt-1 gap-3">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button 
                          onClick={() => setActiveTab('calendar')}
                          className="w-full py-3 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          View all events
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl p-8 border border-gray-200 border-dashed text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Connect your Calendar</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                          Sync your Google Calendar to see your upcoming meetings and manage your schedule directly from here.
                        </p>
                        <Button onClick={handleConnectCalendar} disabled={isSyncing} className="w-full sm:w-auto">
                          {isSyncing ? 'Connecting...' : 'Connect Calendar'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 h-fit">
                    <h3 className="font-bold text-gray-900 mb-4">System Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900">API Status</span>
                        </div>
                        <span className="text-green-700 text-sm font-bold">Online</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900">Auth Token</span>
                        </div>
                        <span className="text-gray-700 text-sm font-bold">Valid</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
                  {calendarConnected && (
                    <Button variant="ghost" onClick={handleConnectCalendar} className="!p-2">
                      <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                </div>

                {!calendarConnected ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center px-4">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/2693/2693507.png" 
                      alt="Calendar Illustration" 
                      className="w-32 h-32 mb-6 opacity-80"
                    />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Calendar Connected</h3>
                    <p className="text-gray-500 mb-8 max-w-md">
                      Connect your Google Calendar to view your agenda, join meetings, and manage your time effectively.
                    </p>
                    <Button 
                      onClick={handleConnectCalendar} 
                      disabled={isSyncing}
                      className="min-w-[200px]"
                    >
                      {isSyncing ? (
                        <span className="flex items-center">
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          Syncing...
                        </span>
                      ) : (
                        'Sync Google Calendar'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                        <div key={day} className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${i === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-500 border border-gray-100'}`}>
                          <span className="text-xs font-medium mb-1">{day}</span>
                          <span className="text-xl font-bold">{14 + i}</span>
                          {i === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full mt-1"></div>}
                        </div>
                      ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Today's Schedule</h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {events.map((event) => (
                          <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-4">
                            <div className="flex flex-col items-end w-20 pt-1">
                              <span className="text-sm font-bold text-gray-900">{event.time.split(' - ')[0]}</span>
                              <span className="text-xs text-gray-400">{event.time.split(' - ')[1]}</span>
                            </div>
                            <div className={`w-1 rounded-full ${event.type === 'work' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                            <div className="flex-1 pb-2">
                              <h4 className="font-semibold text-gray-900">{event.title}</h4>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {event.location}
                                </span>
                                {event.attendees > 0 && (
                                  <span className="flex items-center text-xs text-gray-500">
                                    <User className="w-3 h-3 mr-1" />
                                    {event.attendees} others
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                
                <Card>
                  <div className="flex items-center space-x-4 mb-6">
                    <img src={MOCK_USER.avatar} alt="Profile" className="w-16 h-16 rounded-full bg-gray-100" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{MOCK_USER.name}</h3>
                      <p className="text-gray-500">{MOCK_USER.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Google Account</p>
                          <p className="text-xs text-gray-500">Connected as {MOCK_USER.email}</p>
                        </div>
                      </div>
                      <Badge type="success">Active</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Calendar className={`w-5 h-5 ${calendarConnected ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Calendar Sync</p>
                          <p className="text-xs text-gray-500">
                            {calendarConnected ? 'Syncing automatically' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      {calendarConnected ? (
                        <button 
                          onClick={() => setCalendarConnected(false)}
                          className="text-sm text-red-600 font-medium hover:text-red-700"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button 
                          onClick={handleConnectCalendar}
                          className="text-sm text-blue-600 font-medium hover:text-blue-700"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </Card>

                <div className="pt-4">
                  <Button variant="danger" onClick={handleLogout} className="w-full md:w-auto" icon={LogOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe z-30 px-6 py-2">
          <div className="flex justify-between items-center">
            <NavItem id="dashboard" icon={LayoutDashboard} label="Home" />
            <NavItem id="calendar" icon={Calendar} label="Calendar" />
            <NavItem id="settings" icon={Settings} label="Settings" />
          </div>
        </div>

      </div>
    );
  }