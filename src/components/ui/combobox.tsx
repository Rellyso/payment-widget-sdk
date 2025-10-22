"use client";

import { ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { useEffect, useId, useState } from "react";
import type { MapOptions } from "@/types";
import { cn } from "@/lib/utils";
import { useTheme } from "../theme-provider";

const EMPTY_MESSAGE = "Nenhum resultado encontrado ):";

type ComboboxProps = {
  label: string;
  placeholder: string;
  options: MapOptions;
  searchPlaceholder: string
  onChange?: (value: string | number) => void;
  value?: string | number
  preserveValueType?: boolean
};

export function Combobox({ label, placeholder, options, searchPlaceholder, onChange, value, preserveValueType = false, }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | undefined>(
    value ? String(value) : undefined,
  )
  const [search, setSearch] = useState('')
  const theme = useTheme();
  const comboboxId = useId();

  const optionsArray = Array.from(options.values())
  const filteredOptions = optionsArray.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  )
  const displayValue =
    optionsArray.find((option) => String(option.value) === String(value))
      ?.label || ''

  const handleValueChange = (newValue?: string) => {
    setInternalValue(newValue)
    if (onChange) {
      if (preserveValueType) {
        const originalOption = optionsArray.find(
          (opt) => String(opt.value) === newValue,
        )
        onChange(originalOption ? originalOption.value : (newValue ?? ''))
      } else {
        onChange(newValue ?? '')
      }
    }
  }

  const handleOptionSelect = (currentLabel: string) => {
    const selectedOption = optionsArray.find(
      (option) => option.label.trim() === currentLabel.trim(),
    )

    if (selectedOption) {
      handleValueChange(String(selectedOption.value))
    }
    setOpen(false)
  }

  useEffect(() => {
    setInternalValue(value !== undefined ? String(value) : undefined)
  }, [value])

  return (
    <div className="flex flex-col">
      <label className="text-black-002 text-sm" htmlFor={comboboxId}>
        {label}
      </label>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          asChild
          aria-checked={internalValue ? 'true' : 'false'}
          className="group peer relative flex max-h-[54px] w-full cursor-pointer items-center justify-between rounded-[10px] border border-white-003 bg-white p-4 outline-none"
          style={{
            borderRadius: theme.borderRadius,
          }}
        >
          <button
            className="overflow-hidden text-ellipsis whitespace-nowrap"
            type="button"
          >
            <span className={displayValue ? "text-black-001" : "text-black-002"}>
              {displayValue ? displayValue : placeholder}
            </span>
            <ChevronDown
              className={cn("transition-transform text-black-002", { "rotate-180": open })}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popper-anchor-width)] overflow-auto rounded-b-lg bg-white p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
            <CommandList onWheel={(e) => e.stopPropagation()}>
              <CommandEmpty>{EMPTY_MESSAGE}</CommandEmpty>
              <CommandGroup>
                <div className='flex flex-col gap-1'>
                  {filteredOptions.map((opt) => {
                    return (
                      <div key={`${opt.value}-${opt.id}`}>
                        <CommandItem value={String(opt.label.trim())} onSelect={handleOptionSelect} className="text-base text-black-001 bg-white-002 hover:bg-primary hover:text-white data-[selected=true]:bg-primary data-[selected=true]:text-white cursor-pointer rounded-lg">
                          {opt.label}
                          <div className='ml-auto flex items-center gap-2'>
                            {opt.extraLabel && (
                              <span className='ml-auto text-xs text-gray-400'>
                                {opt.extraLabel}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      </div>
                    )
                  })}
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
