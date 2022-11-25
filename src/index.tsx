import { Accessor, createContext, createMemo, JSX, JSXElement, useContext } from "solid-js";
import { createStore, Store } from "solid-js/store";
import * as Yup from "yup";
import { ObjectShape } from "yup/lib/object";

export namespace FormType {
  export type Touched<T extends object = any> = { [Key in keyof T]: boolean };
  export type Errors<T extends object = any> = { [Key in keyof T]: string };
  export type Required<T extends object = any> = { [Key in keyof T]: boolean };
  export type ValidationSchema<T extends object = any> = Partial<{
    [Key in keyof T]: Yup.AnySchema;
  }>;

  export type FieldHook<ValuesType extends object = any> = {
    field: FieldAccessor<ValuesType>;
    form: Context<ValuesType>;
  };

  export type FieldAccessor<ValuesType extends object = any> = {
    value: Accessor<ValuesType[keyof ValuesType]>;
    touched: Accessor<boolean>;
    error: Accessor<string>;
    required: Accessor<boolean>;
  };

  export interface Context<ValuesType extends object = any> {
    initialValues: ValuesType;
    values: ValuesType;
    touched: Touched<ValuesType>;
    errors: Errors<ValuesType>;
    required: Required<ValuesType>;
    isSubmitting: boolean;
    isValid: boolean;
    /** Will set the value of the refered field */
    setValue: <Field extends keyof ValuesType>(field: Field, value: ValuesType[Field]) => void;
    /** Will set the error message of the refered field */
    setError: (field: keyof ValuesType, error: string) => void;
    /** Will set the value of the fields contained in the object provided */
    setValues: (values: Partial<ValuesType>) => void;
    /**
     * Will set the touched state of a single field when the field name is provided as first paramter.
     * If the fisrt paramter is an object it will set the touched state of the fields listed in the object.
     */
    setTouched:
      | ((field: keyof ValuesType, touched: boolean) => void)
      | ((touched: Partial<Touched<ValuesType>>) => void);
    /** Will set the error message of the fields listed in the object. */
    setErrors: (errors: Partial<Errors<ValuesType>>) => void;
    /** Change event handler that can be passed to any input event listener so the form state will be handled only when that event is triggered */
    handleChange: (e: Event) => void;
    /** Blur event handler that can be passed to any input event listener so the form state will be handled only when that event is triggered */
    handleBlur: (e: Event) => void;
    /**
     * Solid Directive that simplifies the form event handling.
     * #NOTE: The formHandler is not recognized by JSX TypeScript and so far requires the use of //@ts-ignore */
    formHandler: (element: HTMLElement) => void;
  }

  export type Props<ValuesType extends object = any> = {
    initialValues: ValuesType;
    onSubmit?: (form: Store<FormType.Context<ValuesType>>) => Promise<void>;
    validation?: FormType.ValidationSchema<ValuesType>;
  } & {
    children?: JSXElement | ((form: Store<FormType.Context<ValuesType>>) => JSXElement);
  } & JSX.FormHTMLAttributes<HTMLFormElement>;
}

const FormContext = createContext({} as FormType.Context);

export function Form<ValuesType extends object>(props: FormType.Props<ValuesType>) {
  const { initialValues, validation, ...attrs } = props;
  const touched = Object.keys(initialValues).reduce(
    (t, f) => ({ ...t, [f]: false }),
    {} as FormType.Touched<ValuesType>
  );
  const errors = Object.keys(initialValues).reduce(
    (e, f) => ({ ...e, [f]: "" }),
    {} as FormType.Errors<ValuesType>
  );

  const required = Object.keys(initialValues).reduce((r, f) => {
    let isRequired = false;
    const validationFields = Yup.object()
      .shape(validation || {})
      .describe().fields;
    if (Object.keys(validationFields).length) {
      const field = validationFields[f] as any;
      isRequired = !!field?.tests.find(({ name }: any) => name === "required");
    }
    return { ...r, [f]: isRequired };
  }, {} as FormType.Required<ValuesType>);

  const setValue: FormType.Context<ValuesType>["setValue"] = (field: any, value: any) => {
    setForm("values", field, value);
  };
  const setValues: FormType.Context<ValuesType>["setValues"] = (values) => {
    setForm("values", (v) => ({ ...v, ...values }));
  };

  const setError: FormType.Context<ValuesType>["setError"] = (field: any, error: any) => {
    setForm("errors", field, error);
  };
  const setErrors: FormType.Context["setErrors"] = (errors) => {
    setForm("errors", (e: any) => ({ ...e, ...errors }));
  };

  const setTouched: FormType.Context<ValuesType>["setTouched"] = (...args: any[]) => {
    if (typeof args[0] == "string") {
      const field = args[0] as keyof ValuesType;
      const touched = !!args[1] || false;
      setForm("touched", field, touched as any);
    } else {
      const touched = (args[0] || {}) as Partial<FormType.Touched<ValuesType>>;
      setForm("touched", (t: any) => ({ ...t, ...touched }));
    }
  };

  const validateForm = async (
    form: Store<FormType.Context<ValuesType>>
  ): Promise<FormType.Errors<ValuesType>> => {
    if (!validation) return {} as { [Key in keyof ValuesType]: string };

    return Yup.object()
      .shape(validation as ObjectShape)
      .validate(form.values, { abortEarly: false })
      .then(() => {
        setForm("isValid", true);
        return {} as FormType.Errors<ValuesType>;
      })
      .catch((errors: Yup.ValidationError) => {
        setForm("isValid", false);
        return errors.inner
          .filter((ve) => !!ve.path)
          .reduce((e, ve) => ({ ...e, [ve.path!]: ve.message }), {} as FormType.Errors<ValuesType>);
      });
  };

  const handleChange: FormType.Context["handleChange"] = async (e) => {
    const target = e.target || e.currentTarget || ({} as any);
    if (typeof target.name == "undefined") {
      console.error("Event target does not have an name property", e);
      return;
    }
    const field = target.name;
    const value = target.value;
    const newForm = { ...form };
    newForm.values = { ...form.values, [field]: value };
    newForm.touched = { ...form.touched, [field]: true };
    newForm.errors = (await validateForm(newForm)) as any;
    setForm((f) => ({ ...f, ...newForm }));
  };

  const handleBlur: FormType.Context["handleBlur"] = handleChange;

  const formHandler: FormType.Context["formHandler"] = (element) => {
    element.oninput = handleChange;
    element.onblur = handleBlur;
  };

  const [form, setForm] = createStore<FormType.Context<ValuesType>>({
    initialValues: initialValues,
    values: initialValues,
    touched,
    errors,
    required,
    isSubmitting: false,
    isValid: false,
    setValue,
    setError,
    setValues,
    setErrors,
    setTouched,
    handleChange,
    handleBlur,
    formHandler,
  });

  const onSubmit = async (e: Event) => {
    e.preventDefault();

    const newForm = { ...form };
    newForm.isSubmitting = true;
    newForm.touched = Object.keys(initialValues).reduce((t, f) => ({ ...t, [f]: true }), {} as any);

    newForm.errors = (await validateForm(newForm)) as any;
    newForm.isValid = !Object.keys(newForm.errors).filter(
      (field) => !!newForm.errors[field as keyof ValuesType]
    ).length;

    setForm((f) => ({ ...f, ...newForm }));

    if (form.isValid) {
      await props.onSubmit?.(newForm);
    }

    setForm("isSubmitting", false);
  };

  return (
    <form {...attrs} onSubmit={onSubmit as any}>
      <FormContext.Provider value={form as any}>
        {typeof props.children == "function" ? props.children(form) : props.children}
      </FormContext.Provider>
    </form>
  );
}

/**
 * Custom hook that will expose the Form API and some Solid.JS Accessors to some field states.
 */
export function useField<ValuesType extends object = any>(
  name: keyof ValuesType
): FormType.FieldHook<ValuesType> {
  const form = useContext<FormType.Context<ValuesType>>(FormContext as any);

  const value = createMemo<ValuesType[typeof name]>(() => form.values[name]);
  const touched = createMemo<boolean>(() => form.touched[name]);
  const error = createMemo<string>(() => (touched() && form.errors[name] ? form.errors[name] : ""));
  const required = createMemo<boolean>(() => form.required[name]);

  return { field: { value, touched, error, required }, form };
}
