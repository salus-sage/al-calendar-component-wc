var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, ElementRef, forwardRef, Input, } from '@angular/core';
import { NG_VALUE_ACCESSOR, } from '@angular/forms';
let DatePickerFieldCvaDirective = class DatePickerFieldCvaDirective {
    set required(value) {
        this.setRequired(value);
    }
    set placeholder(value) {
        this.setPlaceholder(value);
    }
    set isEditable(value) {
        this.setEditable(value);
    }
    constructor(elementRef) {
        this.elementRef = elementRef;
        this.onChange = () => { };
        this.onTouched = () => { };
        this.changeListener = null;
        this.blurListener = null;
    }
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
    }
    setupEventListeners() {
        const el = this.elementRef.nativeElement;
        this.changeListener = (e) => {
            var _a;
            const value = ((_a = e.detail) === null || _a === void 0 ? void 0 : _a.value) || null;
            this.onChange(value);
            // onTouched is NOT called here — it fires on blur so that validation
            // error messages only appear after the user leaves the field.
        };
        el.addEventListener('albert-change', this.changeListener);
        this.blurListener = () => this.onTouched();
        el.addEventListener('blur', this.blurListener);
    }
    writeValue(value) {
        if (value) {
            this.elementRef.nativeElement.setAttribute('value', value);
        }
        else {
            this.elementRef.nativeElement.removeAttribute('value');
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.elementRef.nativeElement.setAttribute('is-editable', (!isDisabled).toString());
    }
    setRequired(value) {
        if (value) {
            this.elementRef.nativeElement.setAttribute('required', '');
        }
        else {
            this.elementRef.nativeElement.removeAttribute('required');
        }
    }
    setPlaceholder(value) {
        if (value) {
            this.elementRef.nativeElement.setAttribute('placeholder', value);
        }
    }
    setEditable(value) {
        this.elementRef.nativeElement.setAttribute('is-editable', value.toString());
    }
};
__decorate([
    Input(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], DatePickerFieldCvaDirective.prototype, "required", null);
__decorate([
    Input(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], DatePickerFieldCvaDirective.prototype, "placeholder", null);
__decorate([
    Input(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], DatePickerFieldCvaDirective.prototype, "isEditable", null);
DatePickerFieldCvaDirective = __decorate([
    Directive({
        selector: 'albert-date-picker[formControl], albert-date-picker[ngModel], albert-date-picker[formControlName]',
        providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => DatePickerFieldCvaDirective),
                multi: true,
            },
        ],
    }),
    __metadata("design:paramtypes", [ElementRef])
], DatePickerFieldCvaDirective);
export { DatePickerFieldCvaDirective };
//# sourceMappingURL=date-picker-field-cva.directive.js.map