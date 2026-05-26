import { LogIn, Coffee, Play, LogOut } from "lucide-react";
import ActionButton from "./ActionButton";

export default function AttendanceTracking({
  userStatus,
  isCheckedIn,
  isOnBreak,
  handleCheckIn,
  handleBreak,
  handleResume,
  handleCheckOut,
}) {
  const isCheckedOut = userStatus === "CHECKED_OUT";
  const hasCheckedInToday = isCheckedIn || isCheckedOut;
  
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Attendance Tracking
          </h3>
          <p className="text-sm text-slate-500">
            Track your attendance with just one click
          </p>
        </div>
        {userStatus === "LATE" && (
          <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            Late Check-In
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ActionButton
          icon={<LogIn className="w-6 h-6" />}
          label="Check In"
          subtitle="Start Your Day"
          color="green"
          onClick={handleCheckIn}
          disabled={hasCheckedInToday}
        />
        <ActionButton
          icon={<Coffee className="w-6 h-6" />}
          label="Break"
          subtitle="Take a Break"
          color="orange"
          onClick={handleBreak}
          disabled={!isCheckedIn || isOnBreak}
        />
        <ActionButton
          icon={<Play className="w-6 h-6" />}
          label="Resume"
          subtitle="Back to Work"
          color="blue"
          onClick={handleResume}
          disabled={!isOnBreak}
        />
        <ActionButton
          icon={<LogOut className="w-6 h-6" />}
          label="Check Out"
          subtitle="End Your Day"
          color="red"
          onClick={handleCheckOut}
          disabled={!isCheckedIn || isCheckedOut}
        />
      </div>
    </div>
  );
}
