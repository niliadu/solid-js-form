/// <reference types="react" />
import { JSXElement } from "solid-js";
import { Store } from "solid-js/store";
import * as Yup from "yup";
export declare namespace FormType {
    type Touched<T> = {
        [Key in keyof T]: boolean;
    };
    type Errors<T> = {
        [Key in keyof T]: string;
    };
    interface Context<ValuesType = object> {
        initialValues: ValuesType;
        values: ValuesType;
        touched: Touched<ValuesType>;
        errors: Errors<ValuesType>;
        isSubmitting: boolean;
        isValid: boolean;
        setValue: <Field extends keyof ValuesType>(field: Field, value: ValuesType[Field]) => void;
        setValues: (value: Partial<ValuesType>) => void;
        handleChange: (e: Event) => void;
        handleBlur: (e: Event) => void;
        formHandler: (element: HTMLElement) => void;
    }
    type Props<ValuesType = object> = {
        initialValues: ValuesType;
        onSubmit?: (form: Store<FormType.Context<ValuesType>>) => Promise<void>;
        validation?: Partial<{
            [Key in keyof ValuesType]: Yup.AnySchema;
        }>;
    } & {
        children?: JSXElement | ((form: Store<FormType.Context<ValuesType>>) => JSXElement);
    };
}
export declare function Form<ValuesType extends object>(props: FormType.Props<ValuesType>): JSX.Element;
export declare function useField(name: string): {
    field: {
        value: import("solid-js").Accessor<any>;
        touched: import("solid-js").Accessor<any>;
        error: import("solid-js").Accessor<any>;
    };
    form: any;
};
//# sourceMappingURL=Form.d.ts.map