import { elementUpdated, fixture, fixtureCleanup, html, oneEvent } from "@open-wc/testing-helpers";
import { querySelectorAllDeep, querySelectorDeep } from "query-selector-shadow-dom";
import "./Input";
import { Input } from "./Input";

describe("Input Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
    fixtureCleanup();
  });

  test("should render input", async () => {
    const element = await fixture(html`<md-input name="default" label="Default" containerSize="small-12"></md-input>`);
    expect(element).toBeDefined();
  });

  test("setting helpText property should render helpText component", async () => {
    const element = await fixture<Input.ELEMENT>(
      html`<md-input name="default" label="Default" containerSize="small-12" helpText="Help Text for Input"></md-input>`
    );
    expect(element.helpText).toMatch("Help Text for Input");

    const helpTextElement = element.shadowRoot!.querySelector("md-help-text");
    expect(helpTextElement).not.toBeNull();
    expect(helpTextElement!.message).toMatch("Help Text for Input");
  });

  test("should render nothing if helpText property is not setted", async () => {
    const element = await fixture<Input.ELEMENT>(
      html`<md-input name="default" label="Default" containerSize="small-12"></md-input>`
    );

    const helpTextElement = element.shadowRoot!.querySelector("md-help-text");
    expect(helpTextElement).toBeNull();
  });

  test("setting label property should render Label component", async () => {
    const element = await fixture<Input.ELEMENT>(
      html`<md-input name="default" label="Default" containerSize="small-12"></md-input>`
    );

    expect(element.label).toEqual("Default");

    const labelElement = element.shadowRoot!.querySelector("md-label");
    expect(labelElement).not.toBeNull();
    expect(labelElement!.label).toEqual("Default");
  });

  test("should handle label click event", async () => {
    const element = await fixture<Input.ELEMENT>(
      html`<md-input
        name="default"
        label="Default"
        containerSize="small-12"
        secondaryLabel="Secondary Label"
      ></md-input>`
    );

    const spyLabelHandler = jest.spyOn(Input.ELEMENT.prototype, "handleLabelClick");

    const labelElement = element.shadowRoot!.querySelector("md-label");
    labelElement!.handleClick();

    expect(spyLabelHandler).toHaveBeenCalled();
    expect(element.shadowRoot!.activeElement).toEqual(element.input);
  });

  test("should shifts focus away from the input", async () => {
    const element = await fixture<Input.ELEMENT>(
      html`<md-input
        name="default"
        label="Default"
        containerSize="small-12"
        secondaryLabel="Secondary Label"
      ></md-input>`
    );

    const spyOutsideHandler = jest.spyOn(Input.ELEMENT.prototype, "handleOutsideClick");

    const label = element.shadowRoot!.querySelector("md-label");
    const labelElement = label!.shadowRoot!.querySelector("label");
    const event = new MouseEvent("click");
    labelElement!.dispatchEvent(event);

    expect(element.shadowRoot!.activeElement).toEqual(element.input);
    const eventListener = (event: MouseEvent) => {
      element.handleOutsideClick(event);
    };

    document.addEventListener("click", eventListener);
    document.dispatchEvent(event);
    expect(spyOutsideHandler).toHaveBeenCalled();
    expect(element.shadowRoot!.activeElement).not.toEqual(element.input);
  });

  test("should handle keyDown event", async () => {
    const element = await fixture<Input.ELEMENT>(html`<md-input label="Default" containerSize="small-12"></md-input>`);
    const spyKeyDownHandler = jest.spyOn(Input.ELEMENT.prototype, "handleKeyDown");

    const event = new KeyboardEvent("keydown");

    element.input.dispatchEvent(event);
    expect(spyKeyDownHandler).toHaveBeenCalled();

    const keydownPromise = oneEvent(element, "input-keydown");
    element.handleKeyDown(event);
    const { detail } = await keydownPromise;
    expect(detail).toBeDefined();
    expect(detail.srcEvent).toEqual(event);
  });

  test("should handle focus event", async () => {
    const element = await fixture<Input.ELEMENT>(html`<md-input label="Default" containerSize="small-12"></md-input>`);
    const spyFocusHandler = jest.spyOn(Input.ELEMENT.prototype, "handleFocus");

    const event = new FocusEvent("focus");

    element.input.dispatchEvent(event);
    expect(spyFocusHandler).toHaveBeenCalled();

    const inputFocusPromise = oneEvent(element, "input-focus");
    element.handleFocus(event);

    const { detail } = await inputFocusPromise;
    expect(detail).toBeDefined();
    expect(detail.srcEvent).toEqual(event);
  });

  test("should handle mouseDown event", async () => {
    const element = await fixture<Input.ELEMENT>(html`<md-input label="Default" containerSize="small-12"></md-input>`);
    const spyMouseDownHandler = jest.spyOn(Input.ELEMENT.prototype, "handleMouseDown");

    const event = new MouseEvent("mousedown");

    element.input.dispatchEvent(event);
    expect(spyMouseDownHandler).toHaveBeenCalled();

    const mouseDownPromise = oneEvent(element, "input-mousedown");
    element.handleMouseDown(event);

    const { detail } = await mouseDownPromise;
    expect(detail).toBeDefined();
    expect(detail.srcEvent).toEqual(event);
  });

  test("should handle input event", async () => {
    const element = await fixture<Input.ELEMENT>(html`<md-input label="Default" containerSize="small-12"></md-input>`);

    const mockInputHandler = jest.fn().mockImplementation((event: Event) => {
      event.stopPropagation();
      element.dispatchEvent(
        new CustomEvent("input-change", {
          bubbles: true,
          composed: true,
          detail: {
            srcEvent: event
          }
        })
      );
    });

    element.handleChange = mockInputHandler;

    const event = new InputEvent("input");

    element.input.dispatchEvent(event);
    expect(mockInputHandler).toHaveBeenCalled();

    const inputChangePromise = oneEvent(element, "input-change");
    element.handleChange(event);

    const { detail } = await inputChangePromise;
    expect(detail).toBeDefined();
    expect(detail.srcEvent).toEqual(event);
  });

  test("should handle blur event", async () => {
    const element = await fixture<Input.ELEMENT>(html`<md-input label="Default" containerSize="small-12"></md-input>`);
    const spyBlurHandler = jest.spyOn(Input.ELEMENT.prototype, "handleBlur");

    const event = new FocusEvent("blur");

    element.input.dispatchEvent(event);
    expect(spyBlurHandler).toHaveBeenCalled();

    const blurPromise = oneEvent(element, "input-blur");
    element.handleBlur(event);

    const { detail } = await blurPromise;
    expect(detail).toBeDefined();
    expect(detail.srcEvent).toEqual(event);

    element.input.focus();
    const eventListener = (event: MouseEvent) => {
      element.handleOutsideClick(event);
    };

    document.addEventListener("click", eventListener);
    document.dispatchEvent(new MouseEvent("click"));

    expect(element.shadowRoot!.activeElement).not.toEqual(element.input);
    expect(spyBlurHandler).toHaveBeenCalled();
  });

  test("should render nothing if no label provided", async () => {
    const element = await fixture<Input.ELEMENT>(
      html` <md-input value="text" containerSize="small-12" placeholder="Enter Text" clear></md-input>`
    );
    expect(element.shadowRoot!.querySelector("md-label")).toBeNull();
  });
  test("should render search icon if searchable", async () => {
    const element = await fixture<Input.ELEMENT>(
      html` <md-input value="text" containerSize="small-12" placeholder="Enter Text" searchable></md-input>`
    );

    expect(element.shadowRoot!.querySelector("md-icon")!.name).toMatch("search-bold");
  });
  test("should render icon if provided in slot", async () => {
    await fixture<Input.ELEMENT>(
      html`<md-input
        label="Aux Content"
        htmlId="inputLeft"
        containerSize="small-12"
        placeholder="Enter Text"
        auxiliaryContentPosition="before"
      >
        <md-icon name="email-active_16"></md-icon>
      </md-input>`
    );
    const iconElement = querySelectorDeep("md-icon");
    expect(iconElement).not.toBeNull();
  });

  test("should render input-section slot on right side", async () => {
    await fixture<Input.ELEMENT>(
      html` <md-input label="Right Icon" containerSize="small-12" placeholder="Enter Text">
        <md-icon slot="input-section-right" name="accessibility_16"></md-icon>
      </md-input>`
    );

    const iconElement = querySelectorDeep("md-icon");

    expect(iconElement).not.toBeNull();
    expect(iconElement.name).toEqual("accessibility_16");
  });

  test("should not render clear button if input disabled", async () => {
    const element = await fixture<Input.ELEMENT>(
      ` <md-input label="Clear" value="text" containerSize="small-12" placeholder="Enter Text" clear disabled></md-input>`
    );

    const iconElement = querySelectorDeep("md-icon[name='clear-active_16']");
    expect(element.disabled).toBeTruthy();
    expect(iconElement).toBeNull();
  });

  test("should display success message", async () => {
    const messageArr: Input.Message = {
      message: "This is where the success message would be.",
      type: "success"
    };

    const messagesSpy = jest.spyOn(Input.ELEMENT.prototype, "messages", "get");

    await fixture<Input.ELEMENT>(html`
      <md-input
        label="Warning"
        htmlId="inputWarning"
        containerSize="small-12"
        .messageArr=${[messageArr]}
        value="Warning Text"
        placeholder="Enter Text"
      ></md-input>
    `);

    const inputMessageElement = querySelectorAllDeep("md-help-text");
    expect(messagesSpy).toHaveReturnedWith(["This is where the success message would be."]);
    expect(inputMessageElement.length).toBeGreaterThan(0);
  });

  test("should display error message", async () => {
    const messageArr: Input.Message = {
      message: "This is where the error message would be.",
      type: "error"
    };

    const messagesSpy = jest.spyOn(Input.ELEMENT.prototype, "messages", "get");

    await fixture<Input.ELEMENT>(html`
      <md-input
        label="Error"
        htmlId="inputError"
        containerSize="small-12"
        .messageArr=${[messageArr]}
        value="Error Text"
        placeholder="Enter Text"
      ></md-input>
    `);

    const inputMessageElement = querySelectorAllDeep("md-help-text");
    expect(messagesSpy).toHaveReturnedWith(["This is where the error message would be."]);
    expect(inputMessageElement.length).toBeGreaterThan(0);
  });

  test("should render multiline", async () => {
    const element = await fixture<Input.ELEMENT>(
      `<md-input label="Multiline" containerSize="small-12" multiline></md-input>`
    );

    expect(element.multiline).toBeTruthy();
  });

  test("should dispatch change event", async () => {
    const element = await fixture<Input.ELEMENT>(html`<md-input name="Default Input" label="Change Input"></md-input>`);

    element.value = "inputText";

    await elementUpdated(element);

    const event: Partial<InputEvent> = {
      type: "change",
      target: element
    };

    const eventListener = jest.fn();
    element.addEventListener("input-change", eventListener);

    element.handleChange(event as Event);
    const detail = eventListener.mock.calls[0][0].detail;
    expect(detail).toBeDefined();
    expect(detail.value).toEqual("inputText");

    element.removeEventListener("input-change", eventListener);
  });

  test("should dispatch change event with clear state", async () => {
    const element = await fixture<Input.ELEMENT>(
      html`<md-input name="Default Input" label="Change Input" clear></md-input>`
    );

    element.value = "inputText";

    await elementUpdated(element);

    const event: Partial<KeyboardEvent> = {
      type: "keydown",
      target: element,
      code: "Space",
      stopPropagation: jest.fn(),
      preventDefault: jest.fn()
    };

    const eventListener = jest.fn();
    element.addEventListener("input-change", eventListener);

    element.handleClear(event as KeyboardEvent);

    const detail = eventListener.mock.calls[0][0].detail;
    expect(detail).toBeDefined();
    expect(detail.value).toEqual("inputText");

    element.removeEventListener("input-change", eventListener);
  });

  test("Should not show cancel button if input is readOnly", async () => {
    const element = await fixture<Input.ELEMENT>(
      html`<md-input label="Multiline" containerSize="small-12" ?readonly=${true}></md-input>`
    );
    const rightTemplate = element.shadowRoot!.querySelector(".md-input__after")?.querySelector("md-button");
    expect(rightTemplate).toBeNull();
  });

  test("Should propogate tab key event", async () => {
    //Test case to ensure issue where the clear button became a focus trap does not reoccur
    const el = await fixture(html` <md-input clear value="test value"></md-input> `);

    const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
    const clearButton = el.shadowRoot!.querySelector(".md-input__icon-clear") as HTMLElement;

    // Focus the input and then the clear button
    input.focus();
    clearButton.focus();

    // Simulate Tab key press
    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true
    });
    clearButton.dispatchEvent(tabEvent);

    // Check if the event was propagated and focus moved to the next element
    expect(document.activeElement).not.toBe(clearButton);
  });

  test("Clicking clear button should not propogate", async () => {
    //The focus trap bug was caused by not wanting to propogate the click event
    //Test that this still works
    const el = await fixture(html` <md-input clear value="test value"></md-input> `);

    const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
    const clearButton = el.shadowRoot!.querySelector(".md-input__icon-clear") as HTMLElement;

    // Focus the input and then the clear button
    input.focus();
    clearButton.focus();

    // Simulate Click event
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true
    });
    clearButton.dispatchEvent(clickEvent);

    // Check if the event was propagated and focus moved to the next element
    expect(document.activeElement).not.toBe(clearButton);
  });
});
