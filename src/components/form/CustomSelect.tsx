import { FieldProps } from "formik";
import Select, { ActionMeta, MultiValue, PropsValue, SingleValue } from "react-select";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps extends FieldProps {
  options: Option[];
  isMulti?: boolean;
  className?: string;
  placeholder?: string;
}

export const CustomSelect = ({
  className,
  placeholder,
  field,
  form,
  options,
  isMulti = false
}: CustomSelectProps) => {

//   const onChange = (
//   newValue: MultiValue<Option> | SingleValue<Option>,
//   actionMeta: ActionMeta<Option>
// ) => {
//   if (!newValue) return; // Manejar el caso en que sea null

//   form.setFieldValue(
//     field.name,
//     Array.isArray(newValue)
//       ? newValue.map((item) => item.value) // Manejo de múltiple selección
//       : newValue.value // Manejo de selección única
//   );
// };

  const onChange = (option:  MultiValue<Option> | SingleValue<Option> , actionMeta: ActionMeta<Option>) => {
    form.setFieldValue(
      field.name,
      isMulti
        ? (option as Option[]).map((item: Option) => item.value)
        : (option as Option).value
    );
  };

  const getValue = () => {
    if (options) {
      return isMulti
        ? options.filter((option: Option) => field?.value?.indexOf(option.value) >= 0)
        : options.find((option: Option) => option.value === field.value);
    } else {
      return  [];
    }
  };

  return (
    <Select
      className={className}
      name={field.name}
      value={getValue()}
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      isMulti={isMulti}
      defaultValue={[]}
    />
  );
};

export default CustomSelect;
