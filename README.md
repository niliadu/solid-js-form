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
import { useField, Form } from "solid-js";
import * as Yup from 'yup';

const Input: Component<{name:string, label:string}> = (props) => {
  const {field, form} = useField(props.name);
  const formHandler = form.formHandler;
  
  return (
    <>
      <label>{props.label}</label>
      <input
        value={field.value()}
        use:formHandler
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
import { Form } from "solid-js";
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
            <input value={form.values.username} use:formHandler />
            <span>{usernameError()}</span>
            <br />
            <label>Passowrd</label>
            <input value={form.values.password} use:formHandler />
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

## License
[MIT](https://choosealicense.com/licenses/mit/)