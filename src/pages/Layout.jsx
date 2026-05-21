import { useNavigate, useLocation, Outlet } from "react-router-dom";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", icon: "📊", path: "/dashboard" },
    { label: "Inventory Transactions", icon: "📦", path: "/transactions" },
    { label: "Analytics (Intelligence)", icon: "📈", path: "/analytics" },
    { label: "Alerts", icon: "🔔", path: "/alerts" },
    { label: "Reports", icon: "📄", path: "/reports" },
    { label: "Settings", icon: "⚙️", path: "/settings" },
  ];

  const handleNavClick = (item) => {
    navigate(item.path);
  };

  return (
    <div className="flex min-h-screen bg-slate-300">

      {/* Sidebar */}
      <aside className="w-72 bg-slate-800 text-white flex flex-col py-8 px-5 fixed top-0 left-0 h-screen overflow-y-auto">

        {/* Logo */}
        <div className="mb-12 px-4 text-2xl font-bold tracking-wide text-white">
          MyApp
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-indigo-500 text-white"
                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Page Content */}
      <div className="flex-1 ml-72 bg-slate-300">
        <Outlet />
      </div>

    </div>
  );
}

export default Layout;