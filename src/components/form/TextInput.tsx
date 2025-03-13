import { useField, ErrorMessage } from 'formik';

interface Props {
    name: string;
    type?: 'text' | 'email' | 'password';
    placeholder?: string;
    // @ts-ignore
    [x:string]: any;
}

export const TextInput = ( { ...props } : Props ) => {

    const [ field ] = useField(props);

  return (
    <>
        { props.label && <label htmlFor={ props.id || props.name }>{ props.label }</label> }
        <input type="text" {...field} {...props}/>
        <ErrorMessage name={props.name} component="span"/>
    </>
  )
}
