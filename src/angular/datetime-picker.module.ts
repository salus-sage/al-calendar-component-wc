import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DateTimePickerFieldCvaComponent } from './datetime-picker-field-cva.component';

@NgModule({
  declarations: [DateTimePickerFieldCvaComponent],
  imports: [CommonModule],
  exports: [DateTimePickerFieldCvaComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DateTimePickerModule {}
