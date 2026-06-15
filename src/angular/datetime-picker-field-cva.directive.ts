import {
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Directive({
  // formControlName added so this directive activates inside [formGroup] bindings
  selector: 'albert-datetime-picker[formControl], albert-datetime-picker[ngModel], albert-datetime-picker[formControlName]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerFieldCvaDirective),
      multi: true,
    },
  ],
})
export class DateTimePickerFieldCvaDirective
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() set required(value: boolean) {
    this.setRequired(value);
  }

  @Input() set placeholder(value: string) {
    this.setPlaceholder(value);
  }

  @Input() set isEditable(value: boolean) {
    this.setEditable(value);
  }

  @Output() valueChange = new EventEmitter<string | null>();
  @Output() panelClose = new EventEmitter<void>();

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  private changeListener: ((e: Event) => void) | null = null;
  private blurListener: (() => void) | null = null;
  private panelCloseListener: (() => void) | null = null;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.setupEventListeners();
  }

  ngOnDestroy() {
    const el = this.elementRef.nativeElement;
    if (this.changeListener) {
      el.removeEventListener('albert-change', this.changeListener);
    }
    if (this.blurListener) {
      el.removeEventListener('blur', this.blurListener);
    }
    if (this.panelCloseListener) {
      el.removeEventListener('albert-panel-close', this.panelCloseListener);
    }
  }

  private setupEventListeners() {
    const el = this.elementRef.nativeElement;

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

    this.panelCloseListener = () => this.panelClose.emit();
    el.addEventListener('albert-panel-close', this.panelCloseListener);
  }

  writeValue(value: string | null) {
    if (value) {
      this.elementRef.nativeElement.setAttribute('value', value);
    } else {
      this.elementRef.nativeElement.removeAttribute('value');
    }
  }

  registerOnChange(fn: (value: string | null) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.elementRef.nativeElement.setAttribute(
      'is-editable',
      (!isDisabled).toString()
    );
  }

  private setRequired(value: boolean) {
    if (value) {
      this.elementRef.nativeElement.setAttribute('required', '');
    } else {
      this.elementRef.nativeElement.removeAttribute('required');
    }
  }

  private setPlaceholder(value: string) {
    if (value) {
      this.elementRef.nativeElement.setAttribute('placeholder', value);
    }
  }

  private setEditable(value: boolean) {
    this.elementRef.nativeElement.setAttribute('is-editable', value.toString());
  }
}
