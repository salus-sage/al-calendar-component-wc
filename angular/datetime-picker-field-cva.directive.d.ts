import { ElementRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
export declare class DateTimePickerFieldCvaDirective implements ControlValueAccessor, OnInit, OnDestroy {
    private elementRef;
    set required(value: boolean);
    set placeholder(value: string);
    set isEditable(value: boolean);
    valueChange: EventEmitter<string | null>;
    panelClose: EventEmitter<void>;
    private onChange;
    private onTouched;
    private changeListener;
    private blurListener;
    private panelCloseListener;
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
//# sourceMappingURL=datetime-picker-field-cva.directive.d.ts.map