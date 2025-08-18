import SideBar from "./components/SideBar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex items-start">
        <SideBar/>
        {children}
    </div>
  );
}