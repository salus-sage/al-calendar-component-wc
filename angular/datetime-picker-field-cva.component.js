var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild, } from '@angular/core';
import { NG_VALUE_ACCESSOR, } from '@angular/forms';
let DateTimePickerFieldCvaComponent = class DateTimePickerFieldCvaComponent {
    constructor(elementRef) {
        this.elementRef = elementRef;
        this.required = false;
        this.placeholder = 'Select a date and time';
        this.isEditable = true;
        this.minDate = null;
        this.maxDate = null;
        this.validationMessage = null;
        this.valueChange = new EventEmitter();
        this.onChange = () => { };
        this.onTouched = () => { };
        this.changeListener = null;
        this.blurListener = null;
        // Angular forms calls writeValue() before ngAfterViewInit when pickerRef is
        // still null (static: false ViewChild). Buffer it and flush after the view init.
        this.pendingValue = undefined;
    }
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
    setupEventListeners() {
        const el = this.pickerRef.nativeElement;
        this.changeListener = (e) => {
            var _a;
            const value = ((_a = e.detail) === null || _a === void 0 ? void 0 : _a.value) || null;
            this.onChange(value);
            this.valueChange.emit(value);
            // onTouched is NOT called here — it fires on blur so that validation
            // error messages only appear after the user leaves the field.
        };
        el.addEventListener('albert-change', this.changeListener);
        this.blurListener = () => this.onTouched();
        el.addEventListener('blur', this.blurListener);
    }
    writeValue(value) {
        if (this.pickerRef) {
            this.applyValue(value);
        }
        else {
            // pickerRef not yet available (called before ngAfterViewInit); buffer and
            // apply once the view has been initialised.
            this.pendingValue = value;
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        if (this.pickerRef) {
            this.pickerRef.nativeElement.setAttribute('is-editable', (!isDisabled).toString());
        }
    }
    applyValue(value) {
        const el = this.pickerRef.nativeElement;
        if (value) {
            el.setAttribute('value', value);
        }
        else {
            el.removeAttribute('value');
        }
    }
    applyInputs() {
        if (!this.pickerRef)
            return;
        const el = this.pickerRef.nativeElement;
        if (this.required) {
            el.setAttribute('required', '');
        }
        if (this.placeholder) {
            el.setAttribute('placeholder', this.placeholder);
        }
        el.setAttribute('is-editable', this.isEditable.toString());
        if (this.minDate) {
            el.setAttribute('min-date', this.minDate);
        }
        else {
            el.removeAttribute('min-date');
        }
        if (this.maxDate) {
            el.setAttribute('max-date', this.maxDate);
        }
        else {
            el.removeAttribute('max-date');
        }
        if (this.validationMessage) {
            el.setAttribute('validation-message', this.validationMessage);
        }
        else {
            el.removeAttribute('validation-message');
        }
    }
};
__decorate([
    ViewChild('picker', { static: false }),
    __metadata("design:type", ElementRef)
], DateTimePickerFieldCvaComponent.prototype, "pickerRef", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], DateTimePickerFieldCvaComponent.prototype, "required", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], DateTimePickerFieldCvaComponent.prototype, "placeholder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], DateTimePickerFieldCvaComponent.prototype, "isEditable", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], DateTimePickerFieldCvaComponent.prototype, "minDate", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], DateTimePickerFieldCvaComponent.prototype, "maxDate", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], DateTimePickerFieldCvaComponent.prototype, "validationMessage", void 0);
__decorate([
    Output(),
    __metadata("design:type", Object)
], DateTimePickerFieldCvaComponent.prototype, "valueChange", void 0);
DateTimePickerFieldCvaComponent = __decorate([
    Component({
        selector: 'albert-datetime-picker-cva',
        template: '<albert-datetime-picker #picker></albert-datetime-picker>',
        providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => DateTimePickerFieldCvaComponent),
                multi: true,
            },
        ],
    }),
    __metadata("design:paramtypes", [ElementRef])
], DateTimePickerFieldCvaComponent);
export { DateTimePickerFieldCvaComponent };
//# sourceMappingURL=datetime-picker-field-cva.component.js.map