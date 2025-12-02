import React, { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CustomButton } from './CustomButton';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onRangeChange: (start: Date | null, end: Date | null) => void;
}

export function DateRangePicker({ startDate, endDate, onRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [localStartDate, setLocalStartDate] = useState<Date | null>(startDate);
  const [localEndDate, setLocalEndDate] = useState<Date | null>(endDate);
  const ref = useRef<HTMLDivElement>(null);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handleDateClick = (date: Date) => {
    if (!localStartDate || (localStartDate && localEndDate)) {
      setLocalStartDate(date);
      setLocalEndDate(null);
    } else if (date < localStartDate) {
      setLocalStartDate(date);
      setLocalEndDate(localStartDate);
    } else {
      setLocalEndDate(date);
    }
  };

  const handleApply = () => {
    onRangeChange(localStartDate, localEndDate);
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalStartDate(null);
    setLocalEndDate(null);
    onRangeChange(null, null);
  };

  const isInRange = (date: Date) => {
    if (localStartDate && localEndDate) {
      return date >= localStartDate && date <= localEndDate;
    }
    if (localStartDate && hoverDate) {
      return date >= localStartDate && date <= hoverDate;
    }
    return false;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'yyyy/MM/dd')} - ${format(endDate, 'yyyy/MM/dd')}`;
    }
    return '日付範囲を選択';
  };

  return (
    <div className="relative" ref={ref}>
      <CustomButton
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-[260px] justify-start text-left bg-custom-yellow text-[#262626] hover:bg-custom-yellow/80 !text-[#262626]"
      >
        {formatDateRange()}
      </CustomButton>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 p-4 bg-white rounded-lg shadow-lg z-10">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setCurrentMonth(prev => addMonths(prev, -1))} className="text-[#262626]">&lt;</button>
            <h2 className="text-lg font-semibold text-[#262626]">{format(currentMonth, 'yyyy年 MM月', { locale: ja })}</h2>
            <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="text-[#262626]">&gt;</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['日', '月', '火', '水', '木', '金', '土'].map(day => (
              <div key={day} className="text-center font-medium text-[#262626]">
                {day}
              </div>
            ))}
            {days.map(day => (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => setHoverDate(day)}
                onMouseLeave={() => setHoverDate(null)}
                className={`p-2 rounded-full ${
                  isSameMonth(day, currentMonth)
                    ? isSameDay(day, localStartDate!) || isSameDay(day, localEndDate!)
                      ? 'bg-custom-yellow text-[#262626]'
                      : isInRange(day)
                      ? 'bg-custom-yellow/50 text-[#262626]'
                      : 'hover:bg-custom-yellow/25 text-[#262626]'
                    : 'text-gray-300'
                }`}
                disabled={!isSameMonth(day, currentMonth)}
              >
                {format(day, 'd')}
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-between">
            <CustomButton onClick={handleReset} variant="outline" size="sm">
              リセット
            </CustomButton>
            <CustomButton onClick={handleApply} size="sm">
              適用
            </CustomButton>
          </div>
        </div>
      )}
    </div>
  );
}