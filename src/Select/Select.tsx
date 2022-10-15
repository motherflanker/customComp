import styles from './select.module.css'
import {useEffect, useRef, useState} from "react";

export type SelectOption = {
    label: string
    value: string | number
}

type SelectProps = {
    options: SelectOption[]
} & (SingleSelectProps | MultipleSelectProps)

type SingleSelectProps = {
    multiple?: false
    onChange: (value: SelectOption | undefined) => void
    value?: SelectOption
}

type MultipleSelectProps = {
    multiple: true
    onChange: (value: SelectOption[]) => void
    value: SelectOption[]
}

export const Select = ({multiple, value, onChange, options}: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(0)

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target != containerRef.current) return
            switch (e.code) {
                case 'Enter':
                case 'Space':
                    setIsOpen(prev => !prev)
                    if (isOpen) select(options[highlightedIndex])
                    break
                case 'ArrowUp':
                case 'ArrowDown': {
                    if (!isOpen) {
                        setIsOpen(true)
                        break
                    }
                    const newValue = highlightedIndex + (e.code === 'ArrowDown' ? 1 : -1)
                    if (newValue >= 0 && newValue < options.length) {
                        setHighlightedIndex(newValue)
                    }
                    break
                }
                case 'Escape':
                    setIsOpen(false)
                    break
            }
        }
        containerRef.current?.addEventListener("keydown", handler)

        return () => containerRef.current?.removeEventListener("keydown", handler)
    }, [isOpen, highlightedIndex, options])

    useEffect(() => {
        if (isOpen) setHighlightedIndex(0)
    }, [isOpen])

    const clear = () => {
        multiple ? onChange([]) : onChange(undefined)
    }
    const select = (option: SelectOption) => {
        if (multiple) {
            if (value.includes(option)) {
                onChange(value.filter(opt => opt !== option))
            } else {
                onChange([...value, option])
            }
        } else {
            if (option !== value) onChange(option)
        }
    }
    const isOptionSelected = (option: SelectOption) => {
        return multiple ? value.includes(option) : option === value
    }
    return (
        <div
            ref={containerRef}
            onClick={() => setIsOpen(prev => !prev)}
            tabIndex={0}
            className={styles.container}
            onBlur={() => setIsOpen(false)}
        >
            <span className={styles.value}>{multiple ? value.map(v => (
                <button className={styles['option-card']} key={v.value} onClick={e => {
                    e.stopPropagation()
                    select(v)
                }}>{v.label}
                    <span className={styles['remove-btn']}>&times;</span>
                </button>
            )) : value?.label}</span>
            <button onClick={e => {
                e.stopPropagation()
                clear()
            }} className={styles['clear-btn']}>&times;</button>
            <div className={styles.divider}></div>
            <div className={styles.caret}></div>
            <ul className={`${styles.options} ${isOpen ? styles.show : ''}`}>
                {options.map((option, index) => (
                    <li onClick={e => {
                        e.stopPropagation()
                        select(option)
                        setIsOpen(false)
                    }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        key={option.value}
                        className={`${styles.option} 
                        ${isOptionSelected(option) ? styles.selected : ''}
                        ${index === highlightedIndex ? styles.highlighted : ''}`}>
                        {option.label}
                    </li>
                ))}
            </ul>
        </div>
    )
}
