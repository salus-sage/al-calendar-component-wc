import { ElementRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
export declare class DatePickerFieldCvaDirective implements ControlValueAccessor, OnInit, OnDestroy {
    private elementRef;
    set required(value: boolean);
    set placeholder(value: string);
    set isEditable(value: boolean);
    set minDate(value: string | null);
    set maxDate(value: string | null);
    set validationMessage(value: string | null);
    valueChange: EventEmitter<string | null>;
    private onChange;
    private onTouched;
    private changeListener;
    private blurListener;
    constructor(elementRef: ElementRef<HTMLElement>);
    ngOnInit(): void;
    ngOnDestroy(): void;
    private setupEventListeners;
    writeValue(value: string | null): void;
    registerOnChange(fn: (value: string | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    private setRequired;
    private setPlaceholder;
    private setEditable;
}
//# sourceMappingURL=date-picker-field-cva.directive.d.ts.map