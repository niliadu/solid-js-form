# solid-js-form

Form library for [Solid.JS](https://www.solidjs.com/) that uses [yup](https://github.com/jquense/yup) as the validation schema

## Installation

```bash
npm install solid-js-form
```

## Usage

```js
import { Component } from "solid-js";
import { render } from "solid-js/web";
import { useField, Form } from "solid-js-form";
import * as Yup from 'yup';

const Input: Component<{name:string, label:string}> = (props) => {
  const {field, form} = useField(props.name);
  const formHandler = form.formHandler;
  
  return (
    <>
      <label for={props.name}>
        {props.label}
        {field.required() ? " *" : ""}
      </label>
      <input
        name={props.name}
        value={field.value()}
        //@ts-ignore
        use:formHandler //still need to properly type the handler
      />
      <span>{field.error()}</span>
    </>
  );
};

const App:Component=()=>{
    return (
        <Form
          initialValues={{ username: "", password: "" }}
          validation={{
            username: Yup.string().required(),
            password: Yup.string().required(),
          }}
          onSubmit={async (form) => {console.log(form.values)}}
        >
              <Input name="username" label="Username"  />
              <Input name="password" label="Password"  />
              <button type="submit">Submit</button>
        </Form>
      );
}

render(() => <App />, document.getElementById("root"));
```
Alternative

```js
import { Component, createMemo } from "solid-js";
import { render } from "solid-js/web";
import { Form } from "solid-js-form";
import * as Yup from "yup";

const App: Component = () => {
  return (
    <Form
      initialValues={{ username: "", password: "" }}
      validation={{
        username: Yup.string().required(),
        password: Yup.string().required(),
      }}
      onSubmit={async (form) => {
        console.log(form.values);
      }}
    >
      {(form) => {
        const formHandler = form.formHandler;
        const usernameError = createMemo(() =>
          form.errors.username && form.touched.username
            ? form.errors.username
            : ""
        );
        const passwordError = createMemo(() =>
          form.errors.password && form.touched.password
            ? form.errors.password
            : ""
        );
        return (
          <>
            <label>Username</label>
            <input 
                value={form.values.username}
                //@ts-ignore
                use:formHandler
            />
            <span>{usernameError()}</span>
            <br />
            <label>Passowrd</label>
            <input 
                value={form.values.password}
                //@ts-ignore
                use:formHandler 
            />
            <span>{passwordError()}</span>
            <br />
            <button type="submit">Submit</button>
          </>
        );
      }}
    </Form>
  );
};

render(() => <App />, document.getElementById("root"));
```
## Api Reference
- [useField](#useField)
- [setValue](#setValue)
- [setError](#setError)
- [setValues](#setValues)
- [setErrors](#setErrors)
- [setTouched](#setTouched)
- [handleChange](#handleChange)
- [handleBlur](#handleBlur)
- [formHandler](#formHandler)

### useField
`useField<ValuesType = any>(name: keyof  ValuesType): FormType.FieldHook<ValuesType>`
Custom hook that will expose the Form API and some Solid.JS Accessors to some field states.

### setValue
`<Field extends keyof ValuesType>(field: Field, value: ValuesType[Field]) => void`
Will set the value of the refered field

### setError
`(field: keyof ValuesType, error: string) => void`
Will set the error message of the refered field

### setValues
`(values: Partial<ValuesType>) => void`
Will set the value of the fields contained in the object provided

### setErrors
`(errors: Partial<Errors<ValuesType>>) => void`
Will set the error message of the fields listed in the object.

### setTouched
`((field: keyof ValuesType, touched: boolean) => void) | ((touched: Partial<Touched<ValuesType>>) => void)`
Will set the touched state of a single field when the field name is provided as first paramter. If the fisrt paramter is an object it will set the touched state of the fields listed in the object.

### handleChange
`(e: Event) => void`
Change event handler that can be passed to any input event listener so the form state will be handled only when that event is triggered

### handleBlur
`(e: Event) => void`
Blur event handler that can be passed to any input event listener so the form state will be handled only when that event is triggered

### formHandler
`(element: HTMLElement) => void`
Solid Directive that simplifies the form event handling.
#NOTE: The formHandler is not recognized by JSX TypeScript and so dar requires the use of //@ts-ignore


## License
[MIT](https://choosealicense.com/licenses/mit/)
