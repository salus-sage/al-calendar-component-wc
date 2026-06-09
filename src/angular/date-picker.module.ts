import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePickerFieldCvaDirective } from './date-picker-field-cva.directive';

@NgModule({
  declarations: [DatePickerFieldCvaDirective],
  imports: [CommonModule],
  exports: [DatePickerFieldCvaDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DatePickerModule {}
