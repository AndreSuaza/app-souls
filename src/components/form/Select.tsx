import { useField, ErrorMessage } from 'formik';

interface Props {
    label: string;
    name: string;
    [x:string]: any;
}

export const Select = ( { label, ...props } : Props ) => {

    const [ field ] = useField(props);

  return (
    <>
        <label htmlFor={ props.id || props.name }>{ label }</label>
        <select key={ props.id || props.name } {...field} {...props} />
        <ErrorMessage name={props.name} component="span"/>
    </>
  )
}
