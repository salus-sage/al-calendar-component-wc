import {
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
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
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @ViewChild('picker', { static: false }) pickerRef!: ElementRef;

  @Input() required = false;
  @Input() placeholder = 'Select a date and time';
  @Input() isEditable = true;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  private changeListener: ((e: Event) => void) | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {}

  ngOnDestroy() {
    if (this.changeListener && this.pickerRef) {
      this.pickerRef.nativeElement.removeEventListener(
        '_albert-change',
        this.changeListener
      );
    }
  }

  private setupEventListener() {
    const pickerEl = this.pickerRef.nativeElement;
    this.changeListener = (e: Event) => {
      const customEvent = e as CustomEvent;
      const value = customEvent.detail?.value || null;
      this.onChange(value);
    };
    pickerEl.addEventListener('_albert-change', this.changeListener);
  }

  writeValue(value: string | null) {
    if (this.pickerRef) {
      const pickerEl = this.pickerRef.nativeElement;
      if (value) {
        pickerEl.setAttribute('value', value);
      } else {
        pickerEl.removeAttribute('value');
      }
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
      const pickerEl = this.pickerRef.nativeElement;
      const editable = !isDisabled;
      pickerEl.setAttribute('is-editable', editable.toString());
    }
  }

  ngAfterViewInit() {
    this.applyInputs();
    this.setupEventListener();
  }

  private applyInputs() {
    if (!this.pickerRef) return;
    const pickerEl = this.pickerRef.nativeElement;
    if (this.required) {
      pickerEl.setAttribute('required', '');
    }
    if (this.placeholder) {
      pickerEl.setAttribute('placeholder', this.placeholder);
    }
    pickerEl.setAttribute('is-editable', this.isEditable.toString());
  }
}
