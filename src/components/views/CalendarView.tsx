import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

interface CalendarViewProps {
  todos: any[];
  handleOpenForm: (todo?: any) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ todos, handleOpenForm }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<any[]>([]);
  const [countryCode, setCountryCode] = useState('ID');
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        if (countryCode === 'ID') {
          const res = await axios.get(`https://libur.deno.dev/api?year=${year}`);
          // Map to standard format used by Nager Date to keep rendering simple
          const mappedHolidays = res.data.map((h: any) => ({
            date: h.date,
            localName: h.name,
            name: h.name,
            isNationalHoliday: h.is_national_holiday
          }));
          setHolidays(mappedHolidays);
        } else {
          const res = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
          setHolidays(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch holidays:', err);
      }
    };
    fetchHolidays();
  }, [year, countryCode]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [year, month, daysInMonth, startDay]);

  const handleDayClick = (date: Date) => {
    handleOpenForm();
  };

  const getTasksForDate = (date: Date) => {
    return todos.filter(t => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline);
      return d.getFullYear() === date.getFullYear() && 
             d.getMonth() === date.getMonth() && 
             d.getDate() === date.getDate();
    });
  };

  const getHolidayForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return holidays.find(h => h.date === dateStr);
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-[#181818] border border-[#2a2a2a] p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="material-symbols-outlined text-[#8a8a8a] hover:text-white transition-colors">chevron_left</button>
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest">{monthName}</h2>
          <button onClick={nextMonth} className="material-symbols-outlined text-[#8a8a8a] hover:text-white transition-colors">chevron_right</button>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8a8a8a] font-mono uppercase tracking-widest">Holidays</span>
          <select 
            value={countryCode} 
            onChange={e => setCountryCode(e.target.value)}
            className="bg-[#131313] border border-[#2a2a2a] text-white text-xs px-3 py-1 outline-none"
          >
            <option value="ID">Indonesia (ID)</option>
            <option value="US">United States (US)</option>
            <option value="GB">United Kingdom (GB)</option>
            <option value="JP">Japan (JP)</option>
            <option value="AU">Australia (AU)</option>
            <option value="SG">Singapore (SG)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#2a2a2a] border border-[#2a2a2a]">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => (
          <div key={day} className={`bg-[#181818] text-center py-3 text-[10px] uppercase font-mono tracking-widest ${i === 0 ? 'text-red-500/70' : 'text-[#8a8a8a]'}`}>
            {day}
          </div>
        ))}
        
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="bg-[#181818] min-h-[120px]"></div>;
          }
          
          const isToday = new Date().toDateString() === date.toDateString();
          const dayTasks = getTasksForDate(date);
          const holiday = getHolidayForDate(date);
          const isSunday = date.getDay() === 0;
          
          // Tanggal merah = Hari Minggu ATAU Hari Libur Nasional (bukan sekadar cuti bersama)
          // Jika isNationalHoliday bernilai false (seperti cuti bersama), tanggal tetap hitam.
          const isRedDate = isSunday || (holiday && holiday.isNationalHoliday !== false);
          
          let dateBadgeStyle = 'text-[#8a8a8a]';
          if (isToday && isRedDate) {
            dateBadgeStyle = 'bg-red-600 text-white px-2 font-bold';
          } else if (isToday) {
            dateBadgeStyle = 'bg-white text-black px-2 font-bold';
          } else if (isRedDate) {
            dateBadgeStyle = 'text-red-500 font-bold';
          }
          
          return (
            <div 
              key={date.toISOString()} 
              onClick={() => handleDayClick(date)}
              className="bg-[#181818] min-h-[120px] p-2 hover:bg-[#1f1f1f] transition-colors cursor-pointer flex flex-col relative group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-mono ${dateBadgeStyle}`}>
                  {date.getDate()}
                </span>
              </div>
              
              {holiday && (
                <div className="mb-2 px-1 py-0.5 bg-red-900/30 border border-red-500/20 text-[9px] text-red-400 font-mono truncate" title={holiday.localName || holiday.name}>
                  {holiday.localName || holiday.name}
                </div>
              )}
              
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[60px] no-scrollbar">
                {dayTasks.map(task => (
                  <div key={task.id} className={`text-[10px] truncate px-1.5 py-0.5 ${task.status === 'done' ? 'text-[#6b6b6b] line-through' : 'bg-[#2a2a2a] text-[#e5e2e1]'}`} title={task.title}>
                    {task.title}
                  </div>
                ))}
              </div>
              
              <div className="absolute inset-0 border border-transparent group-hover:border-[#3a3a3a] pointer-events-none"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
