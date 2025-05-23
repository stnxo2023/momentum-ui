/**
 * Copyright (c) Cisco Systems, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import "@/components/datepicker/datepicker-month/DatePickerMonth";
import "@/components/icon/Icon";
import { customElementWithCheck } from "@/mixins/CustomElementCheck";
import {
  addDays,
  addMonths,
  getLocaleData,
  getStartOfWeek,
  getWeekdayNameShortInLocale,
  getWeekdayNameVeryShortInLocale,
  localizeDate,
  now,
  shouldNextMonthDisable,
  shouldPrevMonthDisable,
  subtractMonths
} from "@/utils/dateUtils";
import reset from "@/wc_scss/reset.scss";
import { LitElement, PropertyValues, TemplateResult, html, internalProperty, property } from "lit-element";
import { DateTime } from "luxon";
import { DatePickerProps, DayFilters } from "../../../utils/dateUtils"; // Keep type import as a relative path
import styles from "../scss/module.scss";

export namespace DatePickerCalendar {
  @customElementWithCheck("md-datepicker-calendar")
  export class ELEMENT extends LitElement {
    @property({ attribute: false }) monthFormat = "MMMM yyyy";
    @property({ attribute: false }) filterParams: DayFilters | undefined = undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    @property({ attribute: false }) handleMonthChange: Function | undefined = undefined;
    @property({ attribute: false }) datePickerProps: DatePickerProps | undefined = undefined;
    @property({ type: Boolean, reflect: true, attribute: "short-day" }) shortDay = false;

    @internalProperty() viewAnchorDate: DateTime = now();
    @internalProperty()
    private localeMonth: string | undefined = undefined;

    connectedCallback() {
      super.connectedCallback();
      this.viewAnchorDate = this.datePickerProps?.focused || this.datePickerProps?.selected || now();
      this.localeMonth = localizeDate(this.viewAnchorDate, this.datePickerProps?.locale || "en").toFormat(
        this.monthFormat
      );
    }

    updated(changedProperties: PropertyValues) {
      super.updated(changedProperties);
      if (changedProperties.has("datePickerProps")) {
        if (this.datePickerProps?.selected.invalidReason === null) {
          this.viewAnchorDate = this.datePickerProps.selected || now();
        }
        this.localeMonth = (
          this.datePickerProps?.locale
            ? localizeDate(this.viewAnchorDate, this.datePickerProps?.locale)
            : this.viewAnchorDate
        ).toFormat(this.monthFormat);
      }
      if (changedProperties.has("viewAnchorDate")) {
        this.localeMonth = (
          this.datePickerProps?.locale
            ? localizeDate(this.viewAnchorDate, this.datePickerProps?.locale)
            : this.viewAnchorDate
        ).toFormat(this.monthFormat);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    setDate = (date: DateTime, cb?: Function) => {
      this.viewAnchorDate = date;
      cb?.();
    };

    increaseMonth = (event: MouseEvent) => {
      const { handleMonthChange } = this;
      const { viewAnchorDate: date } = this;
      this.setDate(addMonths(date, 1), () => handleMonthChange && handleMonthChange(event, this.viewAnchorDate));
    };

    decreaseMonth = (event: MouseEvent) => {
      const { handleMonthChange } = this;
      const { viewAnchorDate: date } = this;
      this.setDate(subtractMonths(date, 1), () => handleMonthChange && handleMonthChange(event, this.viewAnchorDate));
    };

    renderMonthName = () => {
      return html` <div class="md-datepicker__navigation--current-month" aria-live="polite">${this.localeMonth}</div> `;
    };

    renderPreviousMonthButton = () => {
      const allPrevDaysDisabled =
        this.filterParams?.minDate && shouldPrevMonthDisable(this.viewAnchorDate, this.filterParams?.minDate);
      return html`
        <md-button
          variant="ghost"
          circle
          size="28"
          aria-controls="Datepicker-Calendar"
          aria-label=${`previous month`}
          title=${`previous month`}
          ?disabled=${allPrevDaysDisabled}
          @click=${!allPrevDaysDisabled && this.decreaseMonth}
          tabindex="-1"
        >
          <md-icon name="arrow-left-bold" size="16" iconSet="momentumDesign"></md-icon>
        </md-button>
      `;
    };
    renderNextMonthButton = () => {
      const allNextDaysDisabled =
        this.filterParams?.maxDate && shouldNextMonthDisable(this.viewAnchorDate, this.filterParams?.maxDate);
      return html`
        <md-button
          variant="ghost"
          circle
          size="28"
          aria-controls="Datepicker-Calendar"
          aria-label=${`next month`}
          title=${`next month`}
          ?disabled=${allNextDaysDisabled}
          @click=${!allNextDaysDisabled && this.increaseMonth}
          tabindex="-1"
          ><md-icon name="arrow-right-bold" size="16" iconSet="momentumDesign"></md-icon>
        </md-button>
      `;
    };

    private getWeekDayName(localeData: string | null, day: DateTime) {
      return this.shortDay
        ? getWeekdayNameShortInLocale(localeData, day)
        : getWeekdayNameVeryShortInLocale(localeData, day);
    }

    header = () => {
      const startOfWeek = getStartOfWeek(this.viewAnchorDate, this.datePickerProps?.weekStart);
      const dayNames: TemplateResult[] = [];
      return dayNames.concat(
        [0, 1, 2, 3, 4, 5, 6].map((offset) => {
          const day = addDays(localizeDate(startOfWeek, this.datePickerProps?.locale || "en"), offset);
          const localeData = getLocaleData(day);
          const weekDayName = this.getWeekDayName(localeData, day);
          return html` <div class="md-datepicker__day--name">${weekDayName}</div> `;
        })
      );
    };

    renderMonth = () => {
      return html`
        <div class="md-datepicker__month-container">
          <div class="md-datepicker__header">
            <div class="md-datepicker__navigation">
              ${this.renderMonthName()}
              <div class="md-datepicker__navigation--buttons">
                ${this.renderPreviousMonthButton()} ${this.renderNextMonthButton()}
              </div>
            </div>
            <div class="md-datepicker__day--names">${this.header()}</div>
          </div>
          <md-datepicker-month
            .day=${this.viewAnchorDate}
            .filterParams=${this.filterParams}
            .datePickerProps=${this.datePickerProps}
          ></md-datepicker-month>
        </div>
      `;
    };

    static get styles() {
      return [reset, styles];
    }

    render() {
      return html`
        <div class="md-datepicker__calendar" id="Datepicker-Calendar">${this.viewAnchorDate && this.renderMonth()}</div>
      `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "md-datepicker-calendar": DatePickerCalendar.ELEMENT;
  }
}
