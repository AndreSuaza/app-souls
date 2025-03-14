import { useField, ErrorMessage, Field } from 'formik';
import CustomSelect from './CustomSelect';

interface Props {
    name?: string;
    placeholder?: string;
    options: { label: string | number; value: string | number}[] ;
    multi?: boolean;
}

export const MultiSelect = ( { ...props } : Props ) => {

    const [ field ] = useField(props);

  return (
    <>
        <Field {...field} {...props} component={CustomSelect} isMulti={props.multi}/>
        {/* <ErrorMessage name={props.name} component="span"/> */}
    </>
  )
}
