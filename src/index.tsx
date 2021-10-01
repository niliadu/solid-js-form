import {
  Accessor,
  createContext,
  createMemo,
  JSXElement,
  useContext,
} from "solid-js";
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
    setValue: <Field extends keyof ValuesType>(
      field: Field,
      value: ValuesType[Field]
    ) => void;
    setError: (field: keyof ValuesType, error: string) => void;
    setValues: (values: Partial<ValuesType>) => void;
    setTouched:
      | ((field: keyof ValuesType, touched: boolean) => void)
      | ((touched: Partial<Touched<ValuesType>>) => void);
    setErrors: (errors: Partial<Errors<ValuesType>>) => void;
    handleChange: (e: Event) => void;
    handleBlur: (e: Event) => void;
    formHandler: (element: HTMLElement) => void;
  }

  export type Props<ValuesType extends object = any> = {
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

  const required = Object.keys(props.initialValues).reduce((e, f) => {
    let isRequired = false;
    const validationFields = Yup.object()
      .shape(props.validation as ObjectShape)
      .describe().fields;
    if (Object.keys(validationFields || {}).length) {
      const field = validationFields[f] as any;
      isRequired = !!field?.tests.find(({ name }: any) => name === "required");
    }
    return { ...e, [f]: isRequired };
  }, {} as FormType.Required<ValuesType>);

  const setValue: FormType.Context<ValuesType>["setValue"] = (
    field: any,
    value
  ) => {
    setForm("values", field, value);
  };
  const setValues: FormType.Context<ValuesType>["setValues"] = (values) => {
    setForm("values", (v) => ({ ...v, ...values }));
  };

  const setError: FormType.Context<ValuesType>["setError"] = (
    field: any,
    error
  ) => {
    setForm("errors", field, error);
  };
  const setErrors: FormType.Context["setErrors"] = (errors) => {
    setForm("errors", (e: any) => ({ ...e, ...errors }));
  };

  const setTouched: FormType.Context<ValuesType>["setTouched"] = (
    ...args: any[]
  ) => {
    if (typeof args[0] == "string") {
      const field = args[0] as keyof ValuesType;
      const touched = !!args[1] || false;
      setForm("touched", field, touched);
    } else {
      const touched = (args[0] || {}) as Partial<FormType.Touched<ValuesType>>;
      setForm("touched", (t: any) => ({ ...t, ...touched }));
    }
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
      <FormContext.Provider value={form as any}>
        {typeof props.children == "function"
          ? props.children(form)
          : props.children}
      </FormContext.Provider>
    </form>
  );
}

export function useField<ValuesType extends object = any>(
  name: keyof ValuesType
): FormType.FieldHook<ValuesType> {
  const form = useContext<FormType.Context<ValuesType>>(FormContext as any);

  const value = createMemo<ValuesType[typeof name]>(() => form.values[name]);
  const touched = createMemo<boolean>(() => form.touched[name]);
  const error = createMemo<string>(() =>
    touched() && form.errors[name] ? form.errors[name] : ""
  );
  const required = createMemo<boolean>(() => form.required[name]);

  return { field: { value, touched, error, required }, form };
}
