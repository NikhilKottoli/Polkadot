import { CircleUser, Edit } from "lucide-react";
export default function TopBar() {
  return (
    <div className="h-[20px] mb-4 px-4 mt-2  flex justify-between w-full">
      <div className="flex items-center gap-2 ">
        <img className="" src="/logo.svg" />
        <p className="font-bold">Polkaflow</p>
      </div>
      <div className="flex gap-2 items-center h-full">
        <p className="text-white/70 text-sm">Online Voting Platform</p>
        <Edit size={16} />
      </div>
      <div>
        <CircleUser />
      </div>
    </div>
  );
}
