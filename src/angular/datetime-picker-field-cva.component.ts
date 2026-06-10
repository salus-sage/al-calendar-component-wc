import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'albert-datetime-picker-cva',
  template: '<albert-datetime-picker #picker></albert-datetime-picker>',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerFieldCvaComponent),
      multi: true,
    },
  ],
})
export class DateTimePickerFieldCvaComponent
  implements ControlValueAccessor, AfterViewInit, OnDestroy
{
  @ViewChild('picker', { static: false }) pickerRef!: ElementRef;

  @Input() required = false;
  @Input() placeholder = 'Select a date and time';
  @Input() isEditable = true;

  @Output() valueChange = new EventEmitter<string | null>();

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  private changeListener: ((e: Event) => void) | null = null;
  private blurListener: (() => void) | null = null;

  // Angular forms calls writeValue() before ngAfterViewInit when pickerRef is
  // still null (static: false ViewChild). Buffer it and flush after the view init.
  private pendingValue: string | null | undefined = undefined;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.applyInputs();
    this.setupEventListeners();
    if (this.pendingValue !== undefined) {
      this.applyValue(this.pendingValue);
    }
  }

  ngOnDestroy() {
    if (this.pickerRef) {
      const el = this.pickerRef.nativeElement;
      if (this.changeListener) {
        el.removeEventListener('albert-change', this.changeListener);
      }
      if (this.blurListener) {
        el.removeEventListener('blur', this.blurListener);
      }
    }
  }

  private setupEventListeners() {
    const el = this.pickerRef.nativeElement;

    this.changeListener = (e: Event) => {
      const value = (e as CustomEvent).detail?.value || null;
      this.onChange(value);
      this.valueChange.emit(value);
      // onTouched is NOT called here — it fires on blur so that validation
      // error messages only appear after the user leaves the field.
    };
    el.addEventListener('albert-change', this.changeListener);

    this.blurListener = () => this.onTouched();
    el.addEventListener('blur', this.blurListener);
  }

  writeValue(value: string | null) {
    if (this.pickerRef) {
      this.applyValue(value);
    } else {
      // pickerRef not yet available (called before ngAfterViewInit); buffer and
      // apply once the view has been initialised.
      this.pendingValue = value;
    }
  }

  registerOnChange(fn: (value: string | null) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    if (this.pickerRef) {
      this.pickerRef.nativeElement.setAttribute(
        'is-editable',
        (!isDisabled).toString()
      );
    }
  }

  private applyValue(value: string | null) {
    const el = this.pickerRef.nativeElement;
    if (value) {
      el.setAttribute('value', value);
    } else {
      el.removeAttribute('value');
    }
  }

  private applyInputs() {
    if (!this.pickerRef) return;
    const el = this.pickerRef.nativeElement;
    if (this.required) {
      el.setAttribute('required', '');
    }
    if (this.placeholder) {
      el.setAttribute('placeholder', this.placeholder);
    }
    el.setAttribute('is-editable', this.isEditable.toString());
  }
}
