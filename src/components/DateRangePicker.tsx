import { CalendarIcon } from "@heroicons/react/24/outline"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { DateRange, DayPicker } from "react-day-picker"
import { useState, useRef, useEffect } from "react"

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
  placeholder?: string
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Tarih Aralığı Seçin"
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "d MMMM yyyy", { locale: tr })} -{" "}
                {format(value.to, "d MMMM yyyy", { locale: tr })}
              </>
            ) : (
              format(value.from, "d MMMM yyyy", { locale: tr })
            )
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 rounded-md border bg-white p-4 shadow-md">
          <DayPicker
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            locale={tr}
            numberOfMonths={2}
            showOutsideDays={false}
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
              day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
              day_range_end: "day-range-end",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
          />
        </div>
      )}
    </div>
  )
} 