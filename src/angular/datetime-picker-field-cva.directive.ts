import {
  Directive,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Directive({
  selector: 'albert-datetime-picker[formControl], albert-datetime-picker[ngModel]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerFieldCvaDirective),
      multi: true,
    },
  ],
  standalone: true,
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

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  private changeListener: ((e: Event) => void) | null = null;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.setupEventListener();
  }

  ngOnDestroy() {
    if (this.changeListener && this.elementRef.nativeElement) {
      this.elementRef.nativeElement.removeEventListener(
        '_albert-change',
        this.changeListener
      );
    }
  }

  private setupEventListener() {
    this.changeListener = (e: Event) => {
      const customEvent = e as CustomEvent;
      const value = customEvent.detail?.value || null;
      this.onChange(value);
    };
    this.elementRef.nativeElement.addEventListener(
      '_albert-change',
      this.changeListener
    );
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
    const editable = !isDisabled;
    this.elementRef.nativeElement.setAttribute('is-editable', editable.toString());
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
