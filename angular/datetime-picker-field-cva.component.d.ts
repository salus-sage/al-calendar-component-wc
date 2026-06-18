import { AfterViewInit, ElementRef, EventEmitter, OnDestroy } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
export declare class DateTimePickerFieldCvaComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
    private elementRef;
    pickerRef: ElementRef;
    required: boolean;
    placeholder: string;
    isEditable: boolean;
    minDate: string | null;
    maxDate: string | null;
    validationMessage: string | null;
    valueChange: EventEmitter<string | null>;
    private onChange;
    private onTouched;
    private changeListener;
    private blurListener;
    private pendingValue;
    constructor(elementRef: ElementRef);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private setupEventListeners;
    writeValue(value: string | null): void;
    registerOnChange(fn: (value: string | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    private applyValue;
    private applyInputs;
}
//# sourceMappingURL=datetime-picker-field-cva.component.d.ts.map