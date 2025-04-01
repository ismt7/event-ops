import Link from "next/link";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="text-white text-lg font-bold">Event Ops</div>
          <div>
            <Link
              href="/"
              className="text-white hover:bg-white hover:text-blue-500 px-3 py-2 rounded transition"
            >
              ホーム
            </Link>
            <Link
              href="/event-report"
              className="text-white hover:bg-white hover:text-blue-500 px-3 py-2 rounded transition"
            >
              レポート
            </Link>
            <Link
              href="/settings"
              className="text-white hover:bg-white hover:text-blue-500 px-3 py-2 rounded transition"
            >
              設定
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
