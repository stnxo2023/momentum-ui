import "@/components/date-range-picker/DateRangePicker";
import { now } from "@/utils/dateUtils";
import { Args } from "@storybook/web-components";
import { html } from "lit-html";
import { DatePicker as DP } from "../datepicker/DatePicker"; // Keep type import as a relative path
import "../theme/Theme";

export default {
  title: "Components/Date Range Picker",
  component: "md-date-range-picker",
  argTypes: {
    shouldCloseOnSelect: { control: "boolean" },
    weekStart: { control: { type: "select", options: DP.weekStartDays }, defaultValue: "" },
    locale: { control: "text", defaultValue: "en-US" },
    disabled: { control: "boolean" },
    minDate: { control: "text", defaultValue: now().minus({ day: 5 }).toISODate() },
    maxDate: { control: "text", defaultValue: now().plus({ day: 30 }).toISODate() },
    value: { control: "text", defaultValue: now().toISODate() },
    startDate: { control: "text", defaultValue: now().toISODate() },
    endDate: { control: "text", defaultValue: now().toISODate() }
  },
  parameters: {
    a11y: {
      element: "md-date-range-picker"
    }
  }
};

export const DateRangePicker = (args: Args) => {
  return html`
    <md-date-range-picker
      ?disabled=${args.disabled}
      ?should-close-on-select=${args.shouldCloseOnSelect}
      value=${args.value}
      weekStart=${args.weekStart}
      locale=${args.locale}
      minDate=${args.minDate}
      maxDate=${args.maxDate}
      start-date=${args.startDate}
      end-date=${args.endDate}
    >
    </md-date-range-picker>
  `;
};
