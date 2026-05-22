// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function ProtectedRoute({ allowedRoles }) {
//   const { user, loading } = useAuth(); // Assuming your AuthContext stores the logged-in user object

//   // 1. Wait for the authentication state to load (prevents accidental redirects)
//   if (loading) {
//     return <div>Loading authentication...</div>; 
//   }

//   // 2. If not logged in at all, kick them back to login page
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // 3. If a specific role is required, but they don't have it, redirect them to unauthorized/portal page
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/staff-portal" replace />;
//   }

//   // 4. Everything looks good! Render the child route component
//   return <Outlet />;
// }