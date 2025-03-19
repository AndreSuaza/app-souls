import { logout } from "@/actions";

export default function NewAccountPage() {
  return (
    <div className="min-h-screen bg-gray-500">
      <h1>New Account</h1>
      <button onClick={logout}>
        logout
      </button>
    </div>
  );
}
