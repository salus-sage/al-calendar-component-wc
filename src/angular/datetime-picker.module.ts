import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DateTimePickerFieldCvaComponent } from './datetime-picker-field-cva.component';
import { DateTimePickerFieldCvaDirective } from './datetime-picker-field-cva.directive';

@NgModule({
  declarations: [DateTimePickerFieldCvaComponent, DateTimePickerFieldCvaDirective],
  imports: [CommonModule],
  exports: [DateTimePickerFieldCvaComponent, DateTimePickerFieldCvaDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DateTimePickerModule {}
