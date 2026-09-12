import Clock from "../components/Clock";
import Notification from "../components/Notification";
import Sidebar from "../components/Sidebar";
import RadioPlayer from "../components/RadioPlayer";

export default function Home() {
  return (
    <main className="relative">
      <Clock />
      <Sidebar />
      <RadioPlayer />
      <Notification />
    </main>
  );
}
