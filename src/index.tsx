import { createContext, createMemo, JSXElement, useContext } from "solid-js";
import { createStore, Store } from "solid-js/store";
import * as Yup from "yup";
import { ObjectShape } from "yup/lib/object";

export namespace FormType {
  export type Touched<T> = { [Key in keyof T]: boolean };
  export type Errors<T> = { [Key in keyof T]: string };
  export type ValidationSchema<T> = Partial<{ [Key in keyof T]: Yup.AnySchema }>;

  export interface Context<ValuesType = object> {
    initialValues: ValuesType;
    values: ValuesType;
    touched: Touched<ValuesType>;
    errors: Errors<ValuesType>;
    isSubmitting: boolean;
    isValid: boolean;
    setValue: <Field extends keyof ValuesType>(
      field: Field,
      value: ValuesType[Field]
    ) => void;
    setValues: (value: Partial<ValuesType>) => void;
    handleChange: (e: Event) => void;
    handleBlur: (e: Event) => void;
    formHandler: (element: HTMLElement) => void;
  }

  export type Props<ValuesType = object> = {
    initialValues: ValuesType;
    onSubmit?: (form: Store<FormType.Context<ValuesType>>) => Promise<void>;
    validation?: FormType.ValidationSchema<ValuesType>;
  } & {
    children?:
      | JSXElement
      | ((form: Store<FormType.Context<ValuesType>>) => JSXElement);
  };
}

const FormContext = createContext({} as FormType.Context);

export function Form<ValuesType extends object>(
  props: FormType.Props<ValuesType>
) {
  const touched = Object.keys(props.initialValues).reduce(
    (t, f) => ({ ...t, [f]: false }),
    {} as FormType.Touched<ValuesType>
  );
  const errors = Object.keys(props.initialValues).reduce(
    (e, f) => ({ ...e, [f]: "" }),
    {} as FormType.Errors<ValuesType>
  );

  const setValue: FormType.Context["setValue"] = (field: any, value) => {
    setForm("values", field, value);
  };
  const setValues: FormType.Context["setValues"] = (values) => {
    setForm("values", values);
  };

  const validateForm = async (
    form: Store<FormType.Context<ValuesType>>
  ): Promise<FormType.Errors<ValuesType>> => {
    if (!props.validation) return {} as { [Key in keyof ValuesType]: string };

    const schema = Yup.object().shape(props.validation as ObjectShape);

    return schema
      .validate(form.values, { abortEarly: false })
      .then(() => {
        setForm("isValid", true);
        return {} as FormType.Errors<ValuesType>;
      })
      .catch((errors: Yup.ValidationError) => {
        setForm("isValid", false);
        return errors.inner
          .filter((ve) => !!ve.path)
          .reduce(
            (e, ve) => ({ ...e, [ve.path!]: ve.message }),
            {} as FormType.Errors<ValuesType>
          );
      });
  };

  const validateField = async (
    field: keyof ValuesType,
    value: any
  ): Promise<string> => {
    if (!props.validation?.[field]) return "";

    const schema = Yup.object().shape(props.validation as ObjectShape);

    return schema
      .validateAt(field as string, { [field]: value })
      .then(() => {
        return "";
      })
      .catch((error: Yup.ValidationError) => {
        return error.message || "";
      });
  };

  const handleChange: FormType.Context["handleChange"] = async (e) => {
    const target: any = e.target || e.currentTarget;
    if (typeof target.name == "undefined") {
      console.error("Event target does not have an name property", e);
      return;
    }

    const field = target.name;
    const value = target.value;
    setForm("values", field, value);
    setForm("touched", field, true);
    setForm("errors", field, await validateField(field, value));
  };

  const handleBlur: FormType.Context["handleBlur"] = handleChange;

  const formHandler: FormType.Context["formHandler"] = (element) => {
    element.oninput = handleChange;
    element.onblur = handleBlur;
  };

  const [form, setForm] = createStore<FormType.Context<ValuesType>>({
    initialValues: props.initialValues,
    values: props.initialValues,
    touched,
    errors,
    isSubmitting: false,
    isValid: false,
    setValue,
    setValues,
    handleChange,
    handleBlur,
    formHandler,
  });

  const onSubmit = async (e: Event) => {
    e.preventDefault();

    const newForm = { ...form };
    newForm.isSubmitting = true;
    newForm.touched = Object.keys(props.initialValues).reduce(
      (t, f) => ({ ...t, [f]: true }),
      {} as any
    );

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
    <form onSubmit={onSubmit as any}>
      <FormContext.Provider value={form}>
        {typeof props.children == "function"
          ? props.children(form)
          : props.children}
      </FormContext.Provider>
    </form>
  );
}

export function useField(name: string) {
  const form = useContext(FormContext) as any;

  const value = createMemo<any>(() => form.values[name]);
  const touched = createMemo<boolean>(() => form.touched[name]);
  const error = createMemo<string>(() =>
    touched() && form.errors[name] ? form.errors[name] : ""
  );

  return { field: { value, touched, error }, form };
}
